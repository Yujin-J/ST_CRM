<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Web site created using refine" />
        <link rel="manifest" href="/manifest.json" />
        <title>refine authentication example</title>
        <style>
            /* 챗봇 스타일 */
            .chatbot-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
            }
            .chatbot-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 300px;
                height: 400px;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: none;
                flex-direction: column;
                z-index: 999;
            }
            .chatbot-header {
                background-color: #99bce2;
                color: white;
                padding: 10px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                text-align: center;
                font-size: 16px;
            }
            .chatbot-content {
                flex: 1;
                padding: 10px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            .chatbot-message {
                margin: 5px 0;
                padding: 10px;
                border-radius: 8px;
                max-width: 80%;
                word-wrap: break-word;
            }
            .chatbot-message.user {
                background-color: #99bce2;
                color: white;
                align-self: flex-end;
            }
            .chatbot-message.bot {
                background-color: #f1f1f1;
                color: black;
                align-self: flex-start;
            }
            .chatbot-input-container {
                display: flex;
                border-top: 1px solid #ddd;
            }
            .chatbot-input {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 0 0 0 10px;
                outline: none;
                font-size: 14px;
            }
            .chatbot-send-button {
                background-color: #99bce2;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 0 0 10px 0;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>

        <!-- 챗봇 UI -->
        <div class="chatbot-window" id="chatbotWindow">
            <div class="chatbot-header">Chatbot</div>
            <div class="chatbot-content" id="chatbotContent">
                <!-- 메시지 표시 영역 -->
            </div>
            <div class="chatbot-input-container">
                <input
                    type="text"
                    class="chatbot-input"
                    id="chatbotInput"
                    placeholder="메시지를 입력하세요..."
                />
                <button class="chatbot-send-button" id="sendButton">전송</button>
            </div>
        </div>
        <button class="chatbot-button" id="chatbotButton">💬</button>

        <script type="module" src="/src/index.tsx"></script>

        <script>
            // 챗봇 스크립트
            const chatbotButton = document.getElementById("chatbotButton");
            const chatbotWindow = document.getElementById("chatbotWindow");
            const chatbotContent = document.getElementById("chatbotContent");
            const chatbotInput = document.getElementById("chatbotInput");
            const sendButton = document.getElementById("sendButton");

            // 챗봇 창 열고 닫기
            chatbotButton.addEventListener("click", () => {
                const isChatbotOpen = chatbotWindow.style.display === "flex";
                chatbotWindow.style.display = isChatbotOpen ? "none" : "flex";
            });

            // 메시지 전송 함수
            function sendMessage() {
                const userMessage = chatbotInput.value.trim();
                if (userMessage === "") return;

                // 사용자 메시지 추가
                const userMessageElement = document.createElement("div");
                userMessageElement.classList.add("chatbot-message", "user");
                userMessageElement.textContent = userMessage;
                chatbotContent.appendChild(userMessageElement);

                // 봇 응답 추가 (예제용)
                const botMessageElement = document.createElement("div");
                botMessageElement.classList.add("chatbot-message", "bot");
                botMessageElement.textContent = "Hello," + userMessage;
                chatbotContent.appendChild(botMessageElement);

                // 스크롤 맨 아래로 이동
                chatbotContent.scrollTop = chatbotContent.scrollHeight;

                // 입력란 초기화
                chatbotInput.value = "";
            }

            // 전송 버튼 클릭 이벤트
            sendButton.addEventListener("click", sendMessage);

            // Enter 키로 전송
            chatbotInput.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                }
            });
        </script>
    </body>
</html>
