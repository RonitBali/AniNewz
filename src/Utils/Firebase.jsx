// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIOp8T_Wv8OEh4yx83mgQafzOTHeEQroU",
  authDomain: "aninewz.firebaseapp.com",
  databaseURL: "https://aninewz-default-rtdb.firebaseio.com",
  projectId: "aninewz",
  storageBucket: "aninewz.firebasestorage.app",
  messagingSenderId: "937140348636",
  appId: "1:937140348636:web:c5f71d9c6b90fc5b933619",
  measurementId: "G-RLK4NHH6LM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app)