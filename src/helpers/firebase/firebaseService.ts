import { firestoreDatabase_base } from "./firebaseConfig"; // Firestore 인스턴스 가져오기
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

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

/**
 * 지정된 기간 내에 생성된 Firestore 컬렉션의 신규 문서 개수를 반환하는 함수
 * @param collectionName - Firestore 컬렉션 이름
 * @param days - 기준이 되는 최근 N일
 * @returns - 신규 문서 개수
 */
export const fetchNewUsersCount = async (collectionName: string, days: number) => {
  // 현재 시간과 7일 전 시간 계산
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Firestore Timestamp로 변환
  const pastTimestamp = Timestamp.fromDate(pastDate);

  // Firestore 쿼리 작성
  const collectionRef = collection(firestoreDatabase_base, collectionName);
  const q = query(collectionRef, where("created_at", ">=", pastTimestamp));

  // 쿼리 실행 및 결과 반환
  const querySnapshot = await getDocs(q);
  return querySnapshot.size; // 최근 7일 내 문서 수 반환
};
