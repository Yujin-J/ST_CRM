import axios from "axios";
import Papa from "papaparse";

const AI_API_URL = import.meta.env.VITE_AI_API_URL;
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

interface CSVRow {
  "input:": string;
  "output:": string;
  [key: string]: string; // For any additional columns
}

let promptData = "";

async function loadPromptFromCSV() {
  try {
    const response = await fetch("/classify.csv"); // public 폴더에 classify.csv 파일 위치
    const csvText = await response.text();
    const parsedData = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true, // 빈 줄 건너뛰기
    });

    // input과 output을 활용해 프롬프트 구성
    promptData = parsedData.data
      .filter((row) => row["input:"] && row["output:"]) // 빈 값 제외
      .map((row) => `Input: ${row["input:"]}\n출력: ${row["output:"]}`)
      .join("\n\n");

    console.log("적용된 프롬프트 데이터:", promptData);
  } catch (error) {
    console.error("CSV 파일 로딩 실패:", error);
  }
}

export const callAIStudio = async (
  inputs: Array<{ id: string; notes: string }>,
  intent: string
): Promise<
  Array<{ id: string; Classification: string; Sentiment_score: number | null }>
> => {
  if (!promptData) {
    await loadPromptFromCSV();
  }

  try {
    // API 요청 데이터 구성
    const contents = inputs.map((input) => ({
      role: "user", // 고정된 role 값
      parts: [
        {
          text: `입력을 분류해주세요.\n다음은 입력과 그에 대응하는 출력 예시입니다:\n\n${promptData}\n\n입력값: "${input.notes}". 위의 예시 중 하나를 골라 결과값만 출력하고, 입력된 텍스트에 대한 긍정 감정 점수를 0에서 100 사이로 평가해주세요. 중립 의견은 50점으로 평가하면 됩니다.`,
        },
      ],
    }));

    console.log("Request Contents:", JSON.stringify({ contents }));

    // API 요청
    const response = await axios.post(
      `${AI_API_URL}?key=${AI_API_KEY}`,
      { contents },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // 응답 데이터를 매핑
    return inputs.map((input, index) => {
      const responseText =
        response.data.candidates[index]?.content.parts[0]?.text ||
        "No classification";

      const splitIndex = responseText.indexOf("\n\n");
      const classification =
        splitIndex !== -1
          ? responseText.substring(0, splitIndex).trim()
          : responseText;

      const sentimentScoreMatch = responseText.match(/(\d+)/);
      const sentimentScore = sentimentScoreMatch
        ? parseInt(sentimentScoreMatch[1], 10)
        : null;

      return {
        id: input.id,
        Classification: classification,
        Sentiment_score: sentimentScore,
      };
    });
  } catch (error) {
    console.error(
      "Error response data:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("AI Studio API call failed");
  }
};
