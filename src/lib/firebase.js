// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "estateflow-et5gg",
  "appId": "1:892096739715:web:31c9655c0cdd90e66f1eb6",
  "storageBucket": "estateflow-et5gg.appspot.com",
  "apiKey": "AIzaSyCYUtTLCVHqoZjkHDGLW-lXlAyxuRE5nKQ",
  "authDomain": "estateflow-et5gg.firebaseapp.com",
  "messagingSenderId": "892096739715",
  "measurementId": "G-5G598XJ4V4"
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
