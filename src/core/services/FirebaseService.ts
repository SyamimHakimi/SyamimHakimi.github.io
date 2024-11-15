import { initializeApp } from "firebase/app";
import {
  collection,
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyCtMbO_nLN_vPiSCrKdL72Ewts3QdsTdvE",
  authDomain: "portfolio-9e62d.firebaseapp.com",
  projectId: "portfolio-9e62d",
  storageBucket: "portfolio-9e62d.firebasestorage.app",
  messagingSenderId: "347282953990",
  appId: "1:347282953990:web:7823d80fea9ccab6587087",
  measurementId: "G-960JHBSVRY",
});

// used for the firestore refs
const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache(),
});

// here we can export reusable database references
export const servicesRef = collection(db, "services");
