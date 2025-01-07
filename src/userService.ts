import { collection, getDocs } from "firebase/firestore";
import { firestoreDatabase } from "./helpers/firebase/firebaseConfig";
import { User} from "./types";

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(firestoreDatabase, "users"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`,
      dealsAggregate: data.dealsAggregate || [{ sum: { value: 0 } }],
    } as User;
  });
};