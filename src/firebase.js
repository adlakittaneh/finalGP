// firebase.js

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMC-gnZYfB6FQYC1nDN6Bcp9TtDaa2FD0",
  authDomain: "aqarmedia2025.firebaseapp.com",
  projectId: "aqarmedia2025",
  storageBucket: "easyaqar-2025.firebasestorage.app",
  messagingSenderId: "142731351882",
  appId: "1:142731351882:web:1dd90eac8b87925b1d93b3",
  measurementId: "G-9W0R52NZR6",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
