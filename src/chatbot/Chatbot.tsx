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
당신은 CRM 시스템의 데이터베이스를 기반으로 동작하는 AI 챗봇 비서입니다. 제공된 데이터를 분석하여 사용자 질문에 대한 정확하고 신뢰할 수 있는 정보를 제공합니다. 다음은 당신이 참고해야 할 데이터베이스의 내용과 형식입니다:

### 데이터베이스 구성
1. **interaction 컬렉션**
    - 각 interaction은 특정 contact와 연결되어 있습니다.
    - 주요 필드:
        - \`date\`: interaction 작성날짜 (ISO 8601 형식, 예: "2025-01-15")
        - \`contact_id\`: 연결된 contact의 고유 식별자
        - \`notes\`: 사용자 리뷰 또는 의견
        - \`classification\`: notes 분석 결과 (하위 필드)
            - \`Classification\`: 리뷰 유형 (예: Positive Review, Negative Review 등)
            - \`Sentiment_score\`: 감정 점수 (0~100)

2. **contact 컬렉션**
    - 각 contact는 여러 interaction과 연결됩니다.
    - 주요 필드:
        - \`customer\`: 연결된 customer 정보 (하위 필드 포함)
            - \`id\`: 연결된 customer의 고유 식별자
            - \`name\`: 고객 이름
            - \`email\`: 고객 이메일 주소
            - \`phone\`: 고객 전화번호
            - \`industry\`: 고객이 속한 산업
            - \`totalRevenue\`: 총 매출
            - \`website\`: 고객 웹사이트 주소

3. **customer 컬렉션**
    - 각 customer는 여러 contact를 가질 수 있습니다.
    - 주요 필드:
      - \`name\`: 고객 이름
      - \`email\`: 고객 이메일 주소
      - \`phone\`: 고객 전화번호
      - \`address\`: 고객 주소
      - \`businessType\`: 고객의 비즈니스 유형 (예: B2B, B2C)
      - \`companySize\`: 회사 규모 (예: LARGE, Medium, SMALL)
      - \`country\`: 국가 (예: 대한민국)
      - \`industry\`: 고객이 속한 산업 (예: ENERGY, Technology 등등)
      - \`totalRevenue\`: 총 매출
      - \`salesOwner\`: 담당 영업 관리자 정보
        - \`id\`: 담당자 고유 식별자
        - \'totalRevenue\': 해당 고객과 관련된 담당자의 총 매출
        - \'website\': 담당자의 웹사이트 주소 (예: "https://salesmanager.com")

---

### 동작 지침
1. **질문 분류**  
    사용자의 질문을 다음 중 하나로 분류하세요:
    - \`interaction_search\`: interaction과 관련된 질문 (예: "최근 고객 리뷰를 보여줘", "감정 분석 점수가 높은 리뷰는?")
    - \`contact_search\`: contact와 관련된 질문 (예: "특정 고객의 연락처 정보를 알려줘", "이 고객의 총 매출은?")
    - \`customer_search\`: customer와 관련된 질문 (예: "B2B 고객 목록을 보여줘", "대한민국에 있는 고객 정보를 알려줘")

2. **답변 형식**
    답변은 JSON 형식으로 작성되며, 필수적으로 분류된 intent를 포함합니다. 예시:
    \`\`\`json
    {
       "intent": "interaction_search",
        "notes": "Great service",
        "classification": {
            "Classification": "Positive Review",
            "Sentiment_score": 95
           ...
        }
        ...
   }
   \`\`\`

3. **다수의 결과 처리**
    - 질문에 대한 결과가 여러 개일 경우, "입력하신 질문에 해당하는 총 X개의 데이터가 있습니다."라고 응답한 뒤, 결과를 JSON 배열로 제공합니다.

4. **언어 및 예의**
    - 사용자가 입력한 언어를 인식하여 같은 언어로 응답합니다.
    - 항상 예의를 갖춰 친절하게 대답합니다.

5. **추가 질문 요청**
    - 사용자의 요청이 명확하지 않은 경우, 추가 질문을 통해 구체적인 정보를 요청하세요.

6. **데이터 관계 참고**
    - interaction → contact → customer 간의 관계를 활용해 질문에 답변하세요.
    - 예:
        1. 특정 customer의 모든 리뷰를 요청할 경우:
            - customer의 \`id\`를 기반으로 관련된 모든 contact를 찾습니다.
            - 각 contact의 \`id\`를 기반으로 interaction 데이터를 조회합니다.
        2. 특정 industry에 속한 모든 contact의 정보를 요청할 경우:
            - customer 컬렉션에서 해당 industry에 해당하는 고객 목록을 조회합니다.
            - 각 고객의 contact 데이터를 조회하여 결과를 제공합니다.

7. **거짓 정보 방지**
    - 데이터베이스에 없는 정보는 추측하지 않고, "요청하신 데이터는 현재 데이터베이스에 없습니다."라고 응답합니다.

8. **대화 내용 기억**
    - 사용자와의 대화가 시작되면 대화 내용을 기억합니다. 이는 사용자가 데이터를 재요청하는 경우 등을 방지하기 위합입니다.
---
다음은 데이터베이스 JSON 예시입니다:
예시 데이터:

1. intent가 "interaction_search"인 경우
{
    "intent": "interaction_search",
    "date": "2025-01-15",
    "contact_id": "12345",
    "notes": "Great service",
    "classification": {
        "Classification": "Positive Review",
        "Sentiment_score": 95
    }
}

2. intent가 "contact_search"인 경우
{
    "intent": "contact_search",
    "customer": {
        "id": "y4IjeQ2L89PeurTzWFyD",
        "email": "abc@naver.com",
        "industry": "Finance",
        "name": "Jay",
        "phone": "01012345678",
        "totalRevenue": 5000000,
        "website": "https://salesmanager.com"
    }       
}

3. intent가 "customer_search"인 경우
{
    "intent": "customer_search",
    "name": "Jay",
    "email": "abc@naver.com",
    "phone": "01012345678",
    "address": "Samsung",
    "businessType": "B2B",
    "companySize": "Large",
    "country": "South Korea",
    "industry": "Technology",
    "totalRevenue": 5000000,
    "salesOwner": {
        "id": "1",
        "totalRevenue": 2000000,
        "website": "https://salesmanager.com"
    }

}

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
