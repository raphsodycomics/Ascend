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
export function guardPage(allowedRoles, onReady, idleMinutes = 20) {
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
    initIdleLogout(idleMinutes);
  });
}

// ============================================================
// Idle auto-logout — for anyone who forgets to log out on a
// shared or personal device. Resets on any activity; warns 60
// seconds before logging out so an in-progress form isn't lost
// without notice.
// ============================================================
const IDLE_WARNING_MS = 60 * 1000;
let idleTimer = null;
let idleWarnTimer = null;

function clearIdleTimers() {
  if (idleTimer) clearTimeout(idleTimer);
  if (idleWarnTimer) clearTimeout(idleWarnTimer);
  const banner = document.getElementById("idleWarningBanner");
  if (banner) banner.remove();
}

function showIdleWarning(minutes) {
  const existing = document.getElementById("idleWarningBanner");
  if (existing) existing.remove();

  const banner = document.createElement("div");
  banner.id = "idleWarningBanner";
  banner.style.cssText =
    "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);" +
    "background:#1A1A1A;color:#fff;padding:12px 16px;border-radius:10px;" +
    "font-size:13px;font-family:inherit;z-index:9999;display:flex;gap:12px;" +
    "align-items:center;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;";
  banner.innerHTML = `<span>You'll be logged out soon due to inactivity.</span>`;

  const btn = document.createElement("button");
  btn.textContent = "Stay logged in";
  btn.style.cssText =
    "background:#D91E36;color:#fff;border:none;padding:7px 14px;" +
    "border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;";
  btn.addEventListener("click", () => resetIdleTimer(minutes));
  banner.appendChild(btn);
  document.body.appendChild(banner);
}

function resetIdleTimer(minutes) {
  clearIdleTimers();
  const totalMs = minutes * 60 * 1000;
  idleWarnTimer = setTimeout(() => showIdleWarning(minutes), Math.max(totalMs - IDLE_WARNING_MS, 0));
  idleTimer = setTimeout(async () => {
    clearIdleTimers();
    await signOut(auth);
    window.location.href = "index.html";
  }, totalMs);
}

function initIdleLogout(minutes) {
  const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
  const handler = () => resetIdleTimer(minutes);
  events.forEach(evt => document.addEventListener(evt, handler, { passive: true }));
  resetIdleTimer(minutes);
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
