import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2D8P_hh8iLmw_7jhTRyS0Hx2sJx7Iezg",
  authDomain: "easyaqar-2025.firebaseapp.com",
  projectId: "easyaqar-2025",
  storageBucket: "easyaqar-2025.firebasestorage.app", // ✅ صححتها
  messagingSenderId: "834900057436",
  appId: "1:834900057436:web:4d28cd090a50a29c7ab599",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
