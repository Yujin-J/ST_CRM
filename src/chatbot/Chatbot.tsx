import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../helpers/firebase/firebaseConfig";
import { getMultipleCollections } from "../helpers/firebase/firestoreHelpers";
import "./Chatbot.css";

type Message = {
  role: string;
  content: string;
  timestamp: string;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hello. I'm an AI chatbot assistant working with a CRM database system. How can I help you?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dbData, setDbData] = useState<string>("");

  const API_KEY = import.meta.env.VITE_AI_API_KEY;
  const API_URL = import.meta.env.VITE_AI_API_URL;

  const systemPrompt = `
You are an AI chatbot assistant that works based on a database in a CRM system. You analyze the data provided to you to provide accurate and reliable information about user questions. Here is the content and format of your database for your reference:

### Database organization.
1. **interaction collection**.
    - Each interaction is associated with a specific contact.
    - Key fields:
        - \`date, created_at\`: date of creation of the interaction
        - \`contact_id\`: unique identifier of the associated contact
        - \`notes\`: User reviews or comments
        - \`classification\`: notes analysis result (subfield)
            - \`Classification\`: Review type (e.g. Positive Review, Negative Review, etc.)
            - \`Sentiment_score\`: Sentiment score (0-100)

2. **contact collection
    - Each contact is associated with multiple interactions.
    - Key fields:
        - \`customer\`: Associated customer information (including subfields).
            - \`id\`: Unique identifier of the associated customer
            - \`name\`: Customer name
            - \`email\`: Customer email address
            - \`phone\`: Customer phone number
            - \`industry\`: The industry the customer belongs to
            - \`totalRevenue\`: total revenue
            - \`website\`: Customer website address

3. **customer collection
    - Each customer can have multiple contacts.
    - Key fields:
        - \`created_at\`: date of creation of the customer
      - \`name\`: Customer name
      - \`email\`: Customer email address
      - \`phone\`: Customer phone number
      - \`address\`: Customer address
      - \`businessType\`: Customer's business type (e.g. B2B, B2C)
      - \`companySize\`: Company size (e.g. LARGE, Medium, SMALL)
      - \`country\`: Country (e.g., South Korea)
      - \`industry\`: Industry the customer belongs to (e.g. ENERGY, Technology, etc.)
      - \`totalRevenue\`: Total revenue
      - \`salesOwner\`: Sales owner information
        - \`id\`: Rep's unique identifier
        - \`totalRevenue\`: Rep's total revenue related to this customer
        - \`website\`: rep's website address (e.g. “https://salesmanager.com”)
---]
### Instructions
1. **Categorize the question**.  
    Categorize the user's question as one of the following
    - \`interaction_search\`: questions related to interactions (e.g. “show me recent customer reviews”, “which reviews have a high sentiment score?, show me the most recent interaction data”)
    - \`contact_search\`: questions related to contact (e.g., “Give me the contact information for a specific customer”, “What is the total revenue of this customer?”)
    - \`customer_search\`: questions related to customer (e.g., “Show me a list of B2B customers”, “Give me information about a customer in South Korea, who is their most recent customer?”)

2. **Handling multiple results
    - If there are multiple results for a question, respond with “We have X total data for your question” and then answer them one by one.

3. Ask for additional questions
    - If the user's request is unclear, ask additional questions to get more specific information.

4. Note the data relationship
    - Use the relationship between interaction → contact → customer to answer the question.
    - Example:
        1. If a user requests all reviews for a specific CUSTOMER:
            - Find all related CONTACTs based on the CUSTOMER's \`ID\`.
            - Look up interaction data based on each contact's \`id\`.
        2. If you want information on all contacts in a specific industry:
            - Retrieve a list of customers in that industry from the CUSTOMER collection.
            - Retrieve each customer's CONTACT data and provide the result.

5. **Prevent false information**.
    - Rather than making assumptions about information that isn't in the database, respond with “The data you requested is not currently in the database.”

6. Find the right data for each question, then summarize and answer it. Omit fields that are security-related, such as ID fields.
  `;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadInteractionData = async () => {
      try {
        const interactions = await getMultipleCollections(["interaction", "contact", "customer"]);
        const dbString = JSON.stringify(interactions, null, 2);
        setDbData(dbString);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadInteractionData();
  }, []);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    if (!dbData) {
      console.error("DB 데이터가 비어 있습니다.");
      return "DB 데이터를 로드하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }

    try {
      const text = `
        [시스템 프롬프트]
        ${systemPrompt}

        [CRM 시스템 데이터]
        ${dbData}

        [사용자 질문]
        ${userMessage}
      `;

      const contents = [
        {
          role: "user", 
          parts: [
            {
              text,
            },
          ],
        },
      ];

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return candidate;
      } else {
        return "응답을 처리하지 못했습니다. 다시 시도해주세요.";
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "AI 응답을 처리하지 못했습니다. 오류가 발생했습니다.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessages = [
      ...messages,
      { role: "user", content: input, timestamp },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const botResponse = await fetchBotResponse(input);

    setMessages([
      ...newMessages,
      {
        role: "bot",
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <button onClick={toggleChatbot} className="chatbot-button">
        💬
      </button>

      {isOpen && (
        <>
          <div className="chatbot-overlay" onClick={toggleChatbot}></div>

          <div className="chatbot-window">
            <div className="chatbot-header">CRM AI Chatbot</div>

            <div className="chatbot-content">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chatbot-message ${
                    message.role === "user" ? "user" : "bot"
                  }`}
                >
                  {message.content}
                  <span className="timestamp">{message.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-message bot">
                  Responding...
                </div>
              )}
            </div>

            <div className="chatbot-input-container">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isLoading && sendMessage()
                }
                className="chatbot-input"
                placeholder="Enter your message..."
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                className="chatbot-send-button"
                disabled={isLoading}
              >
                {isLoading ? "Responding..." : "Send"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
