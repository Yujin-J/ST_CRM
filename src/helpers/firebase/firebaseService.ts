import { firebaseApp } from "./firebaseConfig"; // Firebase 앱 가져오기
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firestore 인스턴스 초기화
const firestoreDatabase = getFirestore(firebaseApp);

/**
 * Firestore 컬렉션의 문서 개수를 반환하는 함수
 * @param collectionName - Firestore 컬렉션 이름
 * @returns - 문서 개수
 */
export const fetchCollectionCount = async (collectionName: string): Promise<number> => {
  try {
    // Firestore에서 컬렉션 참조 생성
    const collectionRef = collection(firestoreDatabase, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.size; // 문서 개수 반환
  } catch (error) {
    console.error(`Error fetching collection count for ${collectionName}:`, error);
    throw error; // 에러 다시 던지기
  }
};
