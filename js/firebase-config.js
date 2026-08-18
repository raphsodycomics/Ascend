// ============================================================
// ASCEND — Firebase Configuration
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD10jFiazVBQZwO9fj2nCzx2dvtpktHIog",
  authDomain: "ascend-f612c.firebaseapp.com",
  projectId: "ascend-f612c",
  storageBucket: "ascend-f612c.firebasestorage.app",
  messagingSenderId: "70949808704",
  appId: "1:70949808704:web:700a4c4c5af03321078da5",
  measurementId: "G-SDNB0MQXVH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Cloud Firestore
const db = getFirestore(app);

export { app, auth, db };
