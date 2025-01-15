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
            content: "안녕하세요. 저는 CRM 시스템 데이터베이스를 동작하는 AI 챗봇 비서입니다. 어떻게 도와드릴까요?",
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        },
    ]);
    const [input, setInput] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 🔹 DB 전체 내용을 문자열로 저장할 상태
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

    // 2) 컴포넌트 마운트 시, Firestore에서 전체 데이터 불러오기
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

    // 🔸 toggleChatbot
    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    // 3) OpenAI API 호출 로직
    const fetchBotResponse = async (userMessage: string): Promise<string> => {
        try {
            // (1) systemPrompt
            const systemPrompt = `
너는 CRM 시스템의 데이터베이스를 기반으로 동작하는 AI 챗봇 비서야.
데이터베이스(DB) 구조는 아래와 같고, 그 내용(전체 JSON)은 따로 제공될 거야.
사용자가 질문하면 DB에서 답변을 찾아, 반드시 JSON 형식으로 결과를 리턴해.
DB에 없는 정보는 절대 추측해서 말하지 말고, "요청하신 데이터는 현재 데이터베이스에 없습니다." 라고 답해.

---
[DB 스키마 설명]
1) interaction 컬렉션
    - contact_id, notes, classification { Classification, Sentiment_score }, date
2) contact 컬렉션
    - customer { id, name, email, phone, industry, totalRevenue, website }
3) customer 컬렉션
    - name, email, phone, address, businessType, companySize, country, industry, totalRevenue
    - salesOwner { id, totalRevenue, website }

---
[답변 형식]
1. 반드시 아래 순서로 JSON 필드를 기술할 것:
   - "intent": (interaction_search, contact_search, customer_search 중 하나)
   - "message": (문자열, 예: "입력하신 질문에 해당하는 총 2개의 데이터가 있습니다.")
   - "data": (JSON 배열 형태, 검색 결과 목록)
2. 결과가 여러 개일 경우, 
   - "message" 필드에 "입력하신 질문에 해당하는 총 n개의 데이터가 있습니다."라고 적어준다.
   - 이후 "data" 배열에 실제 결과를 나열
3. DB에 없는 정보나, DB에서 찾을 수 없는 질문 -> "요청하신 데이터는 현재 데이터베이스에 없습니다."
4. 사용 언어: 사용자가 입력한 언어를 그대로 따라갈 것.
5. 항상 정중하고 간결하게 답변할 것.
`;

            // (2) dbContext
            const dbContext = `
            [실제 DB JSON]
            ${dbData}
            `;

            // (3) userMessage
            // 이미 인자로 들어온 userMessage를 그대로 사용

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "system", content: dbContext },
                { role: "user", content: userMessage },
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
                    max_tokens: 2000,
                    temperature: 0.3,
                    top_p: 0.3,
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
        const newMessages = [
            ...messages,
            { role: "user", content: input, timestamp },
        ];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

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
