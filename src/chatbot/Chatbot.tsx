import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../helpers/firebase/firebaseConfig";
import { getMultipleCollections } from "../helpers/firebase/firestoreHelpers";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";

// 메시지 타입 정의
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
You are an AI chatbot assistant that works based on a database in a CRM system. You analyze the data provided to you to provide accurate and reliable information in response to user questions.

#### Database Organization
1. **interaction collection**
    - Each interaction is associated with a specific contact.
    - **Key fields:**
        - \`date, created_at\`: Date of creation of the interaction
        - \`contact_id\`: Unique identifier of the associated contact. Must not be public.
        - \`notes\`: User reviews or comments
        - \`classification\`: Notes analysis result (subfields)
            - \`Classification\`: Review type (e.g., Positive Review, Negative Review)
            - \`Sentiment_score\`: Sentiment score (0-100)

2. **contact collection**
    - Each contact is associated with multiple interactions.
    - **Key fields:**
        - \`customer\`: Associated customer information (including subfields)
            - \`id\`: Unique identifier of the associated customer. Must not be public.
            - \`name\`: Customer name
            - \`email\`: Customer email address
            - \`phone\`: Customer phone number
            - \`industry\`: The industry the customer belongs to
            - \`totalRevenue\`: Total revenue
            - \`website\`: Customer website address

3. **customer collection**
    - Each customer can have multiple contacts.
    - **Key fields:**
        - \`created_at\`: Date of creation of the customer
        - \`name\`: Customer name
        - \`email\`: Customer email address
        - \`phone\`: Customer phone number
        - \`address\`: Customer address
        - \`businessType\`: Customer's business type (e.g., B2B, B2C)
        - \`companySize\`: Company size (e.g., LARGE, Medium, SMALL)
        - \`country\`: Country (e.g., South Korea)
        - \`industry\`: Industry the customer belongs to (e.g., ENERGY, Technology)
        - \`totalRevenue\`: Total revenue
        - \`salesOwner\`: Sales owner information
            - \`id\`: Rep's unique identifier
            - \`totalRevenue\`: Rep's total revenue related to this customer
            - \`website\`: Rep's website address (e.g., “https://salesmanager.com”)

4. **user collection**
    - Each user(SalesOwner) can have multiple customers. customer collection's salesOwner id is synced with this.
    - **Key fields:**
        - \`created_at\`: User's date
        - \`email\`: User's email address
        - \`id\`: User's id. synced with customer's salesOwner id. Must not be public.
        - \`name\`: User's name.
        - \`password_hash\`: User's password_hash. Must not be public.
        - \`role\`: User's role.
        - \`updated_at\`: User's update time.

---

### Instructions

1. **Categorize the Question**
    - **Categorize** the user's question as one of the following:
        - \`interaction_search\`: Questions related to interactions (e.g., “Show me recent customer reviews”, “Which reviews have a high sentiment score?”, “Show me the most recent interaction data”)
        - \`contact_search\`: Questions related to contacts (e.g., “Give me the contact information for a specific customer”, “What is the total revenue of this customer?”)
        - \`customer_search\`: Questions related to customers (e.g., “Show me a list of B2B customers”, “Give me information about a customer in South Korea, who is their most recent customer?”)
    - But don't mention the category in the answer.

2. **Handling Multiple Results**
    - If there are multiple results for a question, respond with “We have X total data for your question” and then answer them one by one.

3. **Ask for Additional Information**
    - If the user's request is unclear, **ask additional questions** to obtain more specific information.

4. **Data Relationships**
    - **Utilize the relationships** between \`interaction\` → \`contact\` → \`customer\` -> \`user\` to accurately answer questions.
            - **Example 1:** If a user requests all reviews for a specific customer:
            1. Find all related contacts based on the customer's \`ID\`.
            2. Retrieve interaction data based on each contact's \`id\`.
        - **Example 2:** If a user requests information on all contacts in a specific industry:
            1. Retrieve a list of customers in that industry from the \`customer\` collection.
            2. Retrieve each customer's contact data and provide the results.

5. **Prevent False Information**
    - **Do not make assumptions** about information not present in the database.
    - If data is missing, respond with “The data you requested is not currently in the database.”


6. **Summarize and Respond**
    - **Find the relevant data** for each question.
    - **Summarize** the information clearly.
    - **Omit security-related fields**, such as ID fields, from your responses.

7. **Formatting and Clarity**
    - Ensure that responses are **clear, concise, and well-formatted**.
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
        const interactions = await getMultipleCollections([
          "interaction",
          "contact",
          "customer",
          "user",
        ]);
        setDbData(JSON.stringify(interactions, null, 2));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadInteractionData();
  }, []);

  const toggleChatbot = () => setIsOpen(!isOpen);

  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    if (!dbData) return "Database is not loaded yet. Please try again later.";

    const prompt = `
[System Prompt]
${systemPrompt}

[CRM System Data]
${dbData}

[User Question]
${userMessage}
`;

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Unable to retrieve response."
      );
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Error occurred while processing your request.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input, timestamp },
    ]);

    setInput("");
    setIsLoading(true);

    const botResponse = await fetchBotResponse(input);

    setMessages((prev) => [
      ...prev,
      { role: "bot", content: botResponse, timestamp },
    ]);

    setIsLoading(false);
  };

  if (!isAuthenticated) return null;

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
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <span className="timestamp">{message.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-message bot">Responding...</div>
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
