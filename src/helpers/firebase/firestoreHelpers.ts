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
