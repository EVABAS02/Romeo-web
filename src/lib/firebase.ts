import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLq5jGpJGbCGP0mEhJcIE-2hR9X-Wk4-g",
  authDomain: "romeo-site.firebaseapp.com",
  projectId: "romeo-site",
  storageBucket: "romeo-site.firebasestorage.app",
  messagingSenderId: "405633061919",
  appId: "1:405633061919:web:0d6a1a8ef4dd77d6bf712a",
  measurementId: "G-PCMX0MK8VK"
};

// Évite la réinitialisation multiple lors du rechargement à chaud de Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);