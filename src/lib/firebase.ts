
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC2oCiZp9TTeF30GvaYu3fwpV0iLf8PfLY",
  authDomain: "peppy-strategy-685.firebaseapp.com",
  projectId: "peppy-strategy-685",
  storageBucket: "peppy-strategy-685.appspot.com",
  messagingSenderId: "978780666051",
  appId: "1:978780666051:web:0e547933d89f8bc0570a76",
  measurementId: "G-WY5B4QWGHL",
  databaseURL: "https://peppy-strategy-685-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, auth, db, rtdb };
