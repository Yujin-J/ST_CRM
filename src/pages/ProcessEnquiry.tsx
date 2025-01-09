import React, { useEffect, useState } from "react";
import { getEnquiries, updateClassification } from "../helpers/firebase/firestoreHelpers"; // Firestore 헬퍼 함수 가져오기
import { callAIStudio } from "../helpers/api/aiStudioApi"; // AI Studio API 호출 함수 가져오기

const ProcessEnquiry = () => {
  const [isProcessing, setIsProcessing] = useState(false); // 로딩 상태 관리

  useEffect(() => {
    const processEnquiries = async () => {
      setIsProcessing(true); // 로딩 상태 시작
      try {
        const enquiries = await getEnquiries(); // Firestore에서 데이터 가져오기
        for (const enquiry of enquiries) {
          if (!enquiry.userID) {
            console.warn(`Document ${enquiry.id} has no userID field.`);
            continue;
          }
          const classification = await callAIStudio(enquiry.userID); // AI Studio 호출
          await updateClassification(enquiry.id, classification); // Firestore 업데이트
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
    <div>d
      {isProcessing ? (
        <p>Processing enquiries, please wait...</p> // 로딩 중 메시지
      ) : (
        <p>Processing complete. Check Firestore for results.</p> // 완료 메시지
      )}
    </div>
  );
};

export default ProcessEnquiry;
