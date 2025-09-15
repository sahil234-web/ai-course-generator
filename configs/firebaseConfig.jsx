// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "course-1130b.firebaseapp.com",
  projectId: "course-1130b",
  storageBucket: "course-1130b.firebasestorage.app",
  messagingSenderId: "880028181793",
  appId: "1:880028181793:web:ab3eb56cca8a6c44ae8a60",
  measurementId: "G-G9BNPWPS98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
