import { db } from "./firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export const getEnquiries = async () => {
  const querySnapshot = await getDocs(collection(db, "enquiry"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateClassification = async (id: string, classification: string) => {
  try {
    await updateDoc(doc(db, "enquiry", id), { classification });
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    throw new Error("Failed to update Firestore document");
  }
};
