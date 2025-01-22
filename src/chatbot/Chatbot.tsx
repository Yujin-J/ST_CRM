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
- You are an AI chatbot assistant that works based on a database in a CRM system. 
- You analyze data to provide accurate and reliable information.
- Follow these instructions:
  1. If data is not in the database, say so.
  2. Omit private ID fields and password hashes in your answer.
  3. Keep answers concise, well-structured, and honest.
  4. Only use the data provided; do not invent information.
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
          generationConfig:
          {
            temperature: 0.0,
            topK: 10,
            topP: 0.2,
            maxOutputTokens: 4000
          }
        }),
      });

      console.log(prompt);

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
