import axios from "axios";

const AI_API_URL = import.meta.env.VITE_AI_API_URL;
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

export const callAIStudio = async (userID: string): Promise<string> => {
  try {
    const response = await axios.post(
      `${AI_API_URL}?key=${AI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userID }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.output || "No classification";
  } catch (error) {
    console.error("Error calling AI Studio API:", error);
    throw new Error("AI Studio API call failed");
  }
};