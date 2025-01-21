import { firestoreDatabase_base } from "./firebaseConfig"; // Firestore 인스턴스 가져오기
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

/**
 * Firestore 컬렉션의 문서 개수를 반환하는 함수
 * @param collectionName - Firestore 컬렉션 이름
 * @returns - 문서 개수
 */
export const fetchCollectionCount = async (
  collectionName: string
): Promise<number> => {
  try {
    const collectionRef = collection(firestoreDatabase_base, collectionName); // Firestore 인스턴스 사용
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.size; // 문서 개수 반환
  } catch (error) {
    console.error(
      `Error fetching collection count for ${collectionName}:`,
      error
    );
    throw error;
  }
};

/**
 * 지정된 기간 내에 생성된 Firestore 컬렉션의 신규 문서 개수를 반환하는 함수
 * @param collectionName - Firestore 컬렉션 이름
 * @param days - 기준이 되는 최근 N일
 * @returns - 신규 문서 개수
 */
export const fetchNewUsersCount = async (
  collectionName: string,
  days: number
) => {
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

/**
 * Firestore 컬렉션에서 고객 데이터를 가져오고 이탈 위험도를 계산하는 함수
 * @returns - 고객 데이터와 이탈 위험도 배열
 */
export const fetchCustomerRiskData = async () => {
  try {
    const collectionRef = collection(firestoreDatabase_base, "customer"); // 고객 컬렉션 참조
    const querySnapshot = await getDocs(collectionRef);

    const customers = [];
    const now = new Date();

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // created_at 필드를 Date 객체로 변환
      const createdAt =
        data.created_at instanceof Timestamp
          ? data.created_at.toDate()
          : new Date(data.created_at);

      // 고객 생성 후 경과한 일수 계산
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 위험도 계산 로직
      let riskLevel = "Low";
      if (
        daysSinceCreation > 90 ||
        (data.totalRevenue !== undefined && data.totalRevenue < 3)
      ) {
        riskLevel = "High";
      } else if (daysSinceCreation > 60) {
        riskLevel = "Medium";
      }

      // 고객 데이터 추가
      customers.push({
        id: doc.id,
        name: data.name,
        created_at: createdAt,
        totalRevenue: data.totalRevenue || 0,
        riskLevel,
      } as never);
    });

    return customers; // 고객 데이터와 위험도 배열 반환
  } catch (error) {
    console.error("Error fetching customer risk data:", error);
    throw error;
  }
};
