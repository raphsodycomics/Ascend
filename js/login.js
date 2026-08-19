// ============================================================
// ASCEND — Login page handler
// This is the ONLY place that should call signInWithEmailAndPassword.
// Imported once, by index.html only.
// ============================================================
import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { roleHome } from "./auth.js";

const form = document.getElementById("loginForm");
if (!form) {
  console.warn("login.js loaded on a page with no #loginForm — check you only include this script on index.html.");
}

if (form) {
  const msg = document.getElementById("formMsg");
  const btn = document.getElementById("loginBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "form-msg";
    btn.disabled = true;
    btn.textContent = "Logging in…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // TEMPORARY DEBUG LINE — remove once login works.
      // This prints the exact UID Firebase Auth assigned to this sign-in,
      // so it can be compared character-for-character against the
      // document ID in Firestore's users collection.
      console.log("Signed in with UID:", credential.user.uid);

      const snap = await getDoc(doc(db, "users", credential.user.uid));

      if (!snap.exists()) {
        msg.textContent = "No profile found for this account. Contact your administrator.";
        msg.className = "form-msg error";
        btn.disabled = false;
        btn.textContent = "Log in";
        return;
      }

      const profile = snap.data();
      if (profile.status === "suspended" || profile.status === "deactivated") {
        msg.textContent = "This account is " + profile.status + ". Contact your manager or admin.";
        msg.className = "form-msg error";
        btn.disabled = false;
        btn.textContent = "Log in";
        return;
      }

      window.location.href = roleHome(profile.role);
    } catch (err) {
      console.error("Login error:", err);
      msg.textContent = "Incorrect email or password.";
      msg.className = "form-msg error";
      btn.disabled = false;
      btn.textContent = "Log in";
    }
  });
}
