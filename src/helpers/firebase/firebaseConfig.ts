import {
  FirebaseAuth,
  FirestoreDatabase,
  initializeFirebase,
} from "refine-firebase";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
export const firebaseApp = initializeFirebase(firebaseConfig);

// Firebase services
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export const firebaseAuth = new FirebaseAuth();
export const firestoreDatabase = getFirestore(firebaseApp);

// Export Firestore object as "db" for consistency
export const db = firestoreDatabase;
export const firestoreDataProvider = new FirestoreDatabase();