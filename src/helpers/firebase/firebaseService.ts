import { firestoreDatabase_base } from "./firebaseConfig"; // Firestore 인스턴스 가져오기
import { collection, getDocs } from "firebase/firestore";

/**
 * Firestore 컬렉션의 문서 개수를 반환하는 함수
 * @param collectionName - Firestore 컬렉션 이름
 * @returns - 문서 개수
 */
export const fetchCollectionCount = async (collectionName: string): Promise<number> => {
  try {
    const collectionRef = collection(firestoreDatabase_base, collectionName); // Firestore 인스턴스 사용
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.size; // 문서 개수 반환
  } catch (error) {
    console.error(`Error fetching collection count for ${collectionName}:`, error);
    throw error;
  }
};
