// ============================================================
// ASCEND — shared auth & guard helpers
// ============================================================
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const ROLE_HOME = {
  admin: "admin.html",
  line_manager: "line-manager.html",
  unit_manager: "unit-manager.html",
  fa: "fa.html"
};

/**
 * Guards a page: requires a signed-in, active user whose role is in
 * allowedRoles. Redirects to index.html if not signed in, or to the
 * correct home page if signed in but wrong role. Calls onReady(userDoc)
 * once the check has passed.
 */
export function guardPage(allowedRoles, onReady) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      window.location.href = "index.html";
      return;
    }
    const profile = { uid: user.uid, ...snap.data() };

    if (profile.status === "suspended" || profile.status === "deactivated") {
      alert("Your account is " + profile.status + ". Contact your manager or admin.");
      await signOut(auth);
      window.location.href = "index.html";
      return;
    }

    if (!allowedRoles.includes(profile.role)) {
      window.location.href = ROLE_HOME[profile.role] || "index.html";
      return;
    }

    onReady(profile);
  });
}

export function roleHome(role) {
  return ROLE_HOME[role] || "index.html";
}

export function roleLabel(role) {
  return {
    admin: "System Administrator",
    line_manager: "Line Manager",
    unit_manager: "Unit Manager",
    fa: "Financial Advisor"
  }[role] || role;
}

export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

export function genToken(len = 28) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}


export function inviteUrl(token) {
  return new URL(`activate.html?token=${encodeURIComponent(token)}`, window.location.href).href;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) {}
    ta.remove();
    return ok;
  }
}

export function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function isToday(ts) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ============================================================
// ASCEND — Login
// ============================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("loginBtn");
    const formMsg = document.getElementById("formMsg");

    formMsg.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = credential.user;

      // Get the user's profile from Firestore
      const snap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!snap.exists()) {
        await signOut(auth);
        throw new Error("Your account profile was not found.");
      }

      const profile = snap.data();

      // Check account status
      if (
        profile.status === "suspended" ||
        profile.status === "deactivated"
      ) {
        await signOut(auth);
        throw new Error(
          "Your account is " + profile.status + "."
        );
      }

      // Send user to the correct dashboard
      window.location.href = ROLE_HOME[profile.role] || "index.html";

    } catch (error) {
      console.error("Login error:", error);

      formMsg.textContent =
        error.message || "Unable to log in. Please check your details.";

      loginBtn.disabled = false;
      loginBtn.textContent = "Log in";
    }
  });
}
