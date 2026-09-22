import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXHMbpDVjbwAtPDnH7x9g_XoS3H-jeCgE",
  authDomain: "ai-support-ticket-intelligence.firebaseapp.com",
  projectId: "ai-support-ticket-intelligence",
  storageBucket: "ai-support-ticket-intelligence.firebasestorage.app",
  messagingSenderId: "499758839823",
  appId: "1:499758839823:web:a4bc7a834d118d03328b7a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
