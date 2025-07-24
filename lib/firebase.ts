// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Alle env variabelen zijn verplicht
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Singleton pattern (voorkomt dubbele initialisatie bij hot reload)
function createFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    console.log("🔥 Firebase app initialized");
    return app;
  }
  return getApp();
}

const app = createFirebaseApp();

export const auth: Auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});
export const firestore: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export { firestore as db };