// ============================================================
// ASCEND — Firebase configuration
// ------------------------------------------------------------
// 1. Go to https://console.firebase.google.com → create a project
// 2. Add a "Web app" inside that project
// 3. Copy the config object it gives you and paste it below,
//    replacing the placeholder values.
// 4. In the Firebase console, enable:
//    - Authentication → Sign-in method → Email/Password
//    - Firestore Database → Create database (production mode)
// 5. Deploy the rules in firestore.rules (Firestore → Rules tab).
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};

export const firebaseConfigured = !Object.values(firebaseConfig).some((value) => String(value).startsWith("REPLACE_WITH_"));

if (!firebaseConfigured) {
  console.warn("ASCEND: Firebase is not configured. Replace the REPLACE_WITH_* values in js/firebase-config.js before testing multi-device accounts and invitations.");
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
