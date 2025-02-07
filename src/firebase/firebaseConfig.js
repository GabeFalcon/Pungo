import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";

// Firebase Credentials 
const firebaseConfig = {
    apiKey: "AIzaSyC2IvlonLBRx2fWpbmSJq3CR_laltuFAi8",
    authDomain: "pungo-b1782.firebaseapp.com",
    databaseURL: "https://pungo-b1782-default-rtdb.firebaseio.com",
    projectId: "pungo-b1782",
    storageBucket: "pungo-b1782.firebasestorage.app",
    messagingSenderId: "92048073735",
    appId: "1:92048073735:web:305381a133a50bb6f5b6a2",
    measurementId: "G-GJ339KWGZB"
  };
  

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);



export { app, auth, db, collection, doc, setDoc, query, where, getDocs };
