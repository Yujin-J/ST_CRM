import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "../helpers/firebase/firebaseConfig";
import { getInteractions, getMultipleCollections } from "../helpers/firebase/firestoreHelpers"; 
import "./Chatbot.css";

type Message = {
    role: string;
    content: string;
    timestamp: string; 
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 🔹 DB 전체 내용을 문자열로 저장할 상태 (여기서는 interaction만)
    const [dbData, setDbData] = useState<string>("");

    // OpenAI API 키 & URL (Vite 환경변수)
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const API_URL = import.meta.env.VITE_OPENAI_API_URL;

    // 1) Firebase 인증 상태 확인
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });
        return () => unsubscribe();
    }, []);

    // 2) 컴포넌트 마운트 시, Firestore에서 interaction 전체 불러오기
    useEffect(() => {
        const loadInteractionData = async () => {
            try {
                // (1) interaction 컬렉션 가져오기
                const interactions = await getMultipleCollections(["interaction", "contact", "customer"]);
                // interactions 예: [{ id: 'abc', notes: '...', classification: {...}}, ...]

                // (2) 문자열화
                const dbString = JSON.stringify(interactions, null, 2);
                setDbData(dbString);
            } catch (error) {
                console.error("Error loading interaction data:", error);
            }
        };

        loadInteractionData();
    }, []);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    // 3) OpenAI API 호출 로직
    const fetchBotResponse = async (userMessage: string): Promise<string> => {
        try {
            // system 메시지에 interaction 데이터 전부 주입
            const messages = [
                {
                    role: "system",
                    content: `
You have the following DB content (from 'interaction' collection, in JSON):
${dbData}

Use it to answer the user's queries. If no relevant info is found, say "I am not sure." 
Do not reveal the entire JSON unless asked for details.
`,
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ];

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages,
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content.trim() || "No response from AI.";
        } catch (error) {
            console.error("Error fetching AI response:", error);
            return "Error: Unable to fetch response.";
        }
    };

    // 4) 메시지 전송 로직
    const sendMessage = async () => {
        if (!input.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        // 사용자 메시지 추가
        const newMessages = [...messages, { role: "user", content: input, timestamp }];
        setMessages(newMessages);
        setInput("");

        // GPT 호출
        const botResponse = await fetchBotResponse(input);

        // 봇 메시지 추가
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
    };

    // 인증되지 않은 경우
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div>
            {/* 챗봇 버튼 */}
            <button onClick={toggleChatbot} className="chatbot-button">
                💬
            </button>

            {/* 챗봇 창 및 배경 */}
            {isOpen && (
                <>
                    <div className="chatbot-overlay" onClick={toggleChatbot}></div>

                    <div className="chatbot-window">
                        <div className="chatbot-header">Chatbot</div>
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
                        </div>
                        <div className="chatbot-input-container">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                className="chatbot-input"
                                placeholder="Enter your message..."
                            />
                            <button onClick={sendMessage} className="chatbot-send-button">
                                Send
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Chatbot;
