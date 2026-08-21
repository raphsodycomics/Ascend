// ============================================================
// ASCEND — shared auth & guard helpers
// This file only exports helpers. It must not contain page-specific
// DOM code (e.g. wiring up #loginForm) — importing this file happens
// on every page, so any top-level code here runs everywhere too.
// ============================================================
import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export const ROLE_HOME = {
  admin: "admin.html",
  regional_head: "regional-head.html",
  regional_coordinator: "regional-coordinator.html",
  line_manager: "line-manager.html",
  unit_manager: "unit-manager.html",
  fa: "fa.html"
};

/**
 * Guards a page: requires a signed-in, active user whose role is in
 * allowedRoles. Redirects to index.html if not signed in, or to the
 * correct home page if signed in but wrong role. Calls onReady(profile)
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

    // Blocked statuses: suspended/deactivated are the manual states set
    // via "Manage" on the dashboards; archived is the same lockout, used
    // when someone loses access to their device and shouldn't be able to
    // sign back in until reactivated.
    if (profile.status === "suspended" || profile.status === "deactivated" || profile.status === "archived") {
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
    regional_head: "Regional Head",
    regional_coordinator: "Regional Coordinator",
    line_manager: "Area Manager",
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
