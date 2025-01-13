import React, { useState } from "react";
import "./Chatbot.css";
type Message = {
    role: string;
    content: string;
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false); // 챗봇 창 열림 여부
    const [messages, setMessages] = useState<Message[]>([]); // 메시지 상태
    const [input, setInput] = useState(""); // 사용자 입력

    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // OpenAI API 키
    const API_URL = import.meta.env.VITE_OPENAI_API_URL; // OpenAI API URL

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
                    max_tokens: 150,
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

        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: input },
        ];

        setMessages(newMessages);
        setInput("");

        const botResponse = await fetchBotResponse(input);
        setMessages([...newMessages, { role: "bot", content: botResponse }]);
    };

    return (
        <div>
            {/* 챗봇 버튼 */}
            <button onClick={toggleChatbot} className="chatbot-button">
                💬
            </button>

            {/* 챗봇 창 */}
            {isOpen && (
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
            )}
        </div>
    );
};

export default Chatbot;
