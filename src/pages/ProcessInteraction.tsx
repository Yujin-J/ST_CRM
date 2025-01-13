import React, { useEffect, useState } from "react";
import {
  getInteractions,
  updateDbWithChatbot,
} from "../helpers/firebase/firestoreHelpers"; // Firestore 헬퍼 함수 가져오기
import { callAIStudio } from "../helpers/api/aiStudioApi"; // AI Studio API 호출 함수 가져오기

const ProcessInteraction: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false); // 로딩 상태 관리

  useEffect(() => {
    const processInteractions = async () => {
      setIsProcessing(true); // 로딩 상태 시작
      try {
        // Firestore에서 interaction 데이터 가져오기
        const interactions = await getInteractions();

        // 모든 interaction 데이터를 통합
        const notes = interactions.map((interaction) => ({
          id: interaction.id, // 각 interaction의 ID
          notes: interaction.notes, // 분류할 텍스트
        }));

        console.log(notes);

        // AI Studio API 호출하여 통합된 데이터를 처리
        const classifications = await callAIStudio(notes, "Review Classification");

        // Firestore에 각 결과 업데이트
        for (const { id, classification } of classifications) {
          await updateDbWithChatbot(id, "Review Classification", "interaction", classification);
        }

        console.log("Processing completed successfully");
      } catch (error) {
        console.error("Error processing interactions:", error);
      } finally {
        setIsProcessing(false); // 로딩 상태 종료
      }
    };

    void processInteractions(); // 비동기 함수 호출 (경고 방지)
  }, []);

  return (
    <div>
      {isProcessing ? (
        <p>Processing interactions, please wait...</p> // 로딩 중 메시지
      ) : (
        <p>Processing complete. Check Firestore for results.</p> // 완료 메시지
      )}
    </div>
  );
};

export default ProcessInteraction;