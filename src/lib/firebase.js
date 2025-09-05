
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  try {
    enableIndexedDbPersistence(db);
    console.log("Firestore persistence enabled.");
  } catch (err) {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn("Firestore persistence failed: multiple tabs open.");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn("Firestore persistence not available in this browser.");
    }
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

// Get Firebase services
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
