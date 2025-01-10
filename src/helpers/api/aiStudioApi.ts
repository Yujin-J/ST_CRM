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
                            text: `입력을 분류하면 돼.\n다음 목록들은 입력과 대응되는 출력 예시야.${promptData}
                            \n\n이제부터 주어지는 입력값에 대해 감정을 분석해서 위에 올라온 예시의 출력 중 하나를 골라서 작성하면 돼. 입력값: "${userID}"`,
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
