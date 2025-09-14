// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import other services if needed (storage, functions, etc.)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7ycgxRLME4Z2FER5tjNEqnlfNzC3bLu4",
  authDomain: "password-manager-free.firebaseapp.com",
  projectId: "password-manager-free",
  storageBucket: "password-manager-free.firebasestorage.app",
  messagingSenderId: "150901815504",
  appId: "1:150901815504:web:a2cf6806aff4256dd346d5",
  measurementId: "G-SP6SGGLZMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);