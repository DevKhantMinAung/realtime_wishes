// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCOuz_qz5WqnbQFXYGrn21X2MbvWrIK-7A",
  authDomain: "staff-party-wishes.firebaseapp.com",
  databaseURL: "https://staff-party-wishes-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "staff-party-wishes",
  storageBucket: "staff-party-wishes.firebasestorage.app",
  messagingSenderId: "1008223360731",
  appId: "1:1008223360731:web:f90ee12a02726368b91efe"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);