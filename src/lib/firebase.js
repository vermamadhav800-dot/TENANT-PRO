// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "...",
  authDomain: "estateflow-et5gg.firebaseapp.com",
  projectId: "estateflow-et5gg",
  storageBucket: "estateflow-et5gg.appspot.com",
  messagingSenderId: "952285514860",
  appId: "1:952285514860:web:9c52b75a8915b2e95a98d3",
  measurementId: "G-5G598XJ4V4"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}


// Get Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
