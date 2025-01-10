import { firestoreDataProvider } from "./firebaseConfig";

// Firestore에서 enquiry 데이터를 가져오는 함수
export const getEnquiries = async () => {
  try {
    // Fix: Change collection path from "collection/enquiry" to just "enquiry"
    const enquiries = await firestoreDataProvider.getList({
      resource: "enquiry",
    });

    return enquiries.data;
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    throw error;
  }
};

// 사용을 줄여나가야 할 것입니다. 현재는 견본으로 남겨둡니다.
export const updateClassification = async (
  id: string,
  classification: string
) => {
  try {
    await firestoreDataProvider.updateData({
      resource: "enquiry",
      id,
      variables: { classification },
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