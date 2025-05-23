// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFudDPvBGOHuzZJ5mQhFM-TD2UgMkAl-I",
  authDomain: "boq-auth-project.firebaseapp.com",
  projectId: "boq-auth-project",
  storageBucket: "boq-auth-project.firebasestorage.app",
  messagingSenderId: "565691174531",
  appId: "1:565691174531:web:1eb43b2734791cd99d15b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };