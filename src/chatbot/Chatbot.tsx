import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Firebase 인증 상태 확인
import { auth } from "../helpers/firebase/firebaseConfig"; // Firebase 설정 import
import "./Chatbot.css";

type Message = {
    role: string;
    content: string;
    timestamp: string; // 타임스탬프 추가
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false); // 챗봇 창 열림 여부
    const [messages, setMessages] = useState<Message[]>([]); // 메시지 상태
    const [input, setInput] = useState(""); // 사용자 입력
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 상태

    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // OpenAI API 키
    const API_URL = import.meta.env.VITE_OPENAI_API_URL; // OpenAI API URL

    // Firebase 인증 상태 확인
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user); // 사용자 인증 상태 설정
        });
        return () => unsubscribe(); // 컴포넌트 언마운트 시 listener 해제
    }, []);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const fetchBotResponse = async (userMessage: string): Promise<string> => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [{ role: "user", content: userMessage }],
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

    const sendMessage = async () => {
        if (!input.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // 타임스탬프 생성

        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: input, timestamp },
        ];

        setMessages(newMessages);
        setInput("");

        const botResponse = await fetchBotResponse(input);
        setMessages([...newMessages, { role: "bot", content: botResponse, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    };

    // 로그인 상태가 아닌 경우 버튼과 창을 렌더링하지 않음
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
                    {/* 반투명 배경 */}
                    <div
                        className="chatbot-overlay"
                        onClick={toggleChatbot} // 배경 클릭 시 창 닫힘
                    ></div>

                    {/* 챗봇 창 */}
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
