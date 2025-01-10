import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Firestore에서 enquiry 데이터를 가져오는 함수
export const getEnquiries = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "enquiry")); // db와 컬렉션 이름 전달
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    throw error; // 호출한 쪽에서 처리하도록 예외 던지기
  }
};

// Firestore에서 특정 문서의 classification을 업데이트하는 함수
export const updateClassification = async (id: string, classification: string) => {
  try {
    await updateDoc(doc(db, "enquiry", id), { classification }); // 특정 문서 업데이트
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    throw new Error("Failed to update Firestore document");
  }
};