// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const auth = getAuth(app);
export const db = getFirestore(app);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1tEjRtn82qOhc_6B4iV32xvPjjmieDBY",
  authDomain: "ethara-vault.firebaseapp.com",
  projectId: "ethara-vault",
  storageBucket: "ethara-vault.firebasestorage.app",
  messagingSenderId: "3558895990",
  appId: "1:3558895990:web:573aa3333bc5e9737b4a57",
  measurementId: "G-LMZ2VJ7PRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);