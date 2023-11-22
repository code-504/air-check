// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB01eO4Mfgi6kTViqMpkHooACa-jDcikQs",
  authDomain: "air-check-ad25b.firebaseapp.com",
  projectId: "air-check-ad25b",
  storageBucket: "air-check-ad25b.appspot.com",
  messagingSenderId: "559173026735",
  appId: "1:559173026735:web:9578acfd9f9dbdaf0aa55a",
  measurementId: "G-R1BTDN9HPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);