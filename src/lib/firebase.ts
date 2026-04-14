import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

// Firebase client config — public API keys, safe to commit.
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyCtMbO_nLN_vPiSCrKdL72Ewts3QdsTdvE",
  authDomain: "portfolio-9e62d.firebaseapp.com",
  projectId: "portfolio-9e62d",
  storageBucket: "portfolio-9e62d.firebasestorage.app",
  messagingSenderId: "347282953990",
  appId: "1:347282953990:web:7823d80fea9ccab6587087",
};

// Prevent duplicate app initialisation when hot-reloading in development.
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// The site only performs read-only document and collection fetches, so the
// lighter Firestore client keeps the shared island bundle smaller.
export const db = getFirestore(app);
