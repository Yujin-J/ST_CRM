import axios from "axios";
import Papa from "papaparse";

const AI_API_URL = import.meta.env.VITE_AI_API_URL;
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

let promptData = "";

async function loadPromptFromCSV() {
    try {
        const response = await fetch("/classify.csv"); // public 폴더에 classify.csv 파일 위치
        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true  // 빈 줄 건너뛰기
        });

        // input과 output을 활용해 프롬프트 구성
        promptData = parsedData.data
            .filter(row => row["input:"] && row["output:"])  // 빈 값 제외
            .map(row => `Input: ${row["input:"]}\n출력: ${row["output:"]}`)
            .join("\n\n");

        console.log("적용된 프롬프트 데이터:", promptData);
    } catch (error) {
        console.error("CSV 파일 로딩 실패:", error);
    }
}

export const callAIStudio = async (userID: string): Promise<string> => {
    if (!promptData) {
        await loadPromptFromCSV();
    }

    try {
        const response = await axios.post(
            `${AI_API_URL}?key=${AI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [{
                            text: `입력을 분류해주세요.\n다음은 입력과 그에 대응하는 출력 예시입니다:\n\n${promptData}
                            \n\n입력값: "${userID}". 위의 예시 중 하나를 골라 결과값만 출력해서 답변해주세요.`,
                        }],
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(response.data.candidates[0].content.parts[0].text);

        return (
            response.data.candidates[0].content.parts[0].text || "No classification"
        );
    } catch (error) {
        console.error("Error calling AI Studio API:", error);
        throw new Error("AI Studio API call failed");
    }
};
