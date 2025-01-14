import { firestoreDataProvider } from "./firebaseConfig";

interface DocumentData {
  // Firestore 문서 구조에 맞춰 타입을 정의해도 되고, 
  // 일단 any로 지정해도 됩니다.
  [key: string]: any;
}

/**
 * 여러 DB(컬렉션)에서 데이터를 불러오는 함수
 * 
 * @param resources ['interaction', 'customer', ...] 등 
 *        가져오고 싶은 컬렉션(혹은 resource) 이름들의 배열
 * @returns 2차원 배열: ex) [[{...}, {...}], [{...}, ...], ...]
 */
export const getMultipleCollections = async (
  resources: string[]
): Promise<DocumentData[][]> => {
  try {
    // Promise.all로 동시에 여러 컬렉션을 읽어옴
    const results = await Promise.all(
      resources.map(async (resourceName) => {
        const { data } = await firestoreDataProvider.getList({
          resource: resourceName,
        });
        return data; // 단일 컬렉션의 문서 배열 반환
      })
    );

    // 결과: [[컬렉션1의 문서들], [컬렉션2의 문서들], ...]
    return results;
  } catch (error) {
    console.error("Error fetching multiple collections:", error);
    throw error;
  }
};

// Firestore에서 interaction 데이터를 가져오는 함수
export const getInteractions = async () => {
  try {
    // Fix: Change collection path from "collection/interaction" to just "interaction"
    const interactions = await firestoreDataProvider.getList({
      resource: "interaction",
    });

    return interactions.data;
  } catch (error) {
    console.error("Error fetching interactions:", error);
    throw error;
  }
};

// 사용을 점차 줄여나가 봅시다. 현재는 견본으로 남겨둡니다.
export const updateEmotion = async (
  id: string,
  emotion: string
) => {
  try {
    await firestoreDataProvider.updateData({
      resource: "interaction",
      id,
      variables: { emotion },
    });
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    throw new Error("Failed to update Firestore document");
  }
};

export const updateDbWithChatbot = async (
  id: string,
  intent: string,
  db: string,
  classification: object
) => {
  try {
    await firestoreDataProvider.updateData({
      resource: db,
      id,
      variables: { classification },
    });
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    throw new Error("Failed to update Firestore document");
  }
};