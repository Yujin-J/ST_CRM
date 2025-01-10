import React, { useEffect, useState } from "react";
import {
  getEnquiries,
  updateClassification,
  updateDbWithChatbot,
} from "../helpers/firebase/firestoreHelpers"; // Firestore 헬퍼 함수 가져오기
import { callAIStudio } from "../helpers/api/aiStudioApi"; // AI Studio API 호출 함수 가져오기

const ProcessEnquiry: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false); // 로딩 상태 관리

  useEffect(() => {
    const processEnquiries = async () => {
      setIsProcessing(true); // 로딩 상태 시작
      try {
        // Firestore에서 enquiry 데이터 가져오기
        const enquiries = await getEnquiries();

        // 데이터 처리
        for (const enquiry of enquiries) {
          // AI Studio API 호출하여 감정 분류 수행
          const classification = await callAIStudio(enquiry.enquiry, "Review Classfication");
          console.log(classification);

          // Firestore에 classification 필드 저장
          await updateDbWithChatbot(enquiry.id, "Review Classfication", "enquiry", classification);
        }

        console.log("Processing completed successfully");
      } catch (error) {
        console.error("Error processing enquiries:", error);
      } finally {
        setIsProcessing(false); // 로딩 상태 종료
      }
    };

    void processEnquiries(); // 비동기 함수 호출 (경고 방지)
  }, []);

  return (
    <div>
      {isProcessing ? (
        <p>Processing enquiries, please wait...</p> // 로딩 중 메시지
      ) : (
        <p>Processing complete. Check Firestore for results.</p> // 완료 메시지
      )}
    </div>
  );
};

export default ProcessEnquiry;
