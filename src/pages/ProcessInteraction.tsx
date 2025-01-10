import React, { useEffect, useState } from "react";
import {
  getInteractions,
  updateEmotion,
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

        // 데이터 처리
        for (const interaction of interactions) {
          // AI Studio API 호출하여 감정 분류 수행
          const classification = await callAIStudio(interaction.notes);

          // Firestore에 Emotion 필드 저장
          await updateEmotion(interaction.id, classification);
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
