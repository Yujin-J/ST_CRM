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

  // Google AI Studio API 키 및 URL
  const API_KEY = import.meta.env.VITE_AI_API_KEY;
  const API_URL = import.meta.env.VITE_AI_API_URL;

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

  // ▼▼▼ 수정된 부분 ▼▼▼
  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    if (!dbData) {
      console.error("DB 데이터가 비어 있습니다.");
      return "DB 데이터를 로드하지 못했습니다. 잠시 후 다시 시도해주세요.";
    }

    try {
      // 실제로는 promptData처럼 CSV나 DB 데이터를 참고해서
      // 추가 프롬프트를 구성할 수도 있습니다.
      const text = `
        [CRM 시스템 데이터]
        ${dbData}

        [사용자 질문]
        ${userMessage}

        DB에서 답변을 찾아 JSON 형식으로 알려줘.
        DB에서 요청하신 데이터를 검색해 JSON 형식으로 답변해. 
        질문 유형에 따라 "intent" 필드를 추가하고, 다음 값 중 하나를 지정해:
        - "interaction_search": interaction에 관한 질문일 경우
        - "customer_search": customer에 관한 질문일 경우
        - "contact_search": contact에 관한 질문일 경우
        답변은 각 컬렉션의 필드, 값만 포함하도록해.
        없으면 "요청하신 데이터는 현재 데이터베이스에 없습니다."라고 답변해.
      `;

      // callAIStudio 코드와 동일하게 "contents" 구조로 요청
      const contents = [
        {
          role: "user", 
          parts: [
            {
              text, // 위에서 만든 text
            },
          ],
        },
      ];

      // temperature, max_output_tokens, top_p 등을
      // 한번에 넘기는 경우도 있고,
      // parameters라는 필드를 따로 요구하는 모델도 있습니다.
      // 아래는 가장 단순히 contents만 넘기는 예시:
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

      // 응답 또한 callAIStudio와 동일하게 `data.candidates[...]`로 처리
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
  // ▲▲▲ 수정된 부분 ▲▲▲

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
