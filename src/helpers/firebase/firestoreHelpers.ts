import { firestoreDataProvider } from "./firebaseConfig";

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