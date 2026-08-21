// ============================================================
// ASCEND — shared Sold/Lost collation helpers for the "Overview"
// dashboards (Regional Head, Regional Coordinator, Area Manager).
// These never show a client name — only counts, grouped by policy
// (for Sold) or reason (for Lost), for the current month and the
// current year to date.
// ============================================================
import { escapeHtml } from "./auth.js";

export function getOutcome(p) {
  if (p.outcome) return p.outcome;
  if (p.status === "Sold") return "sold";
  if (p.status === "Lost") return "lost";
  return "active";
}

/**
 * Groups prospects of the given kind ("sold" | "lost") by policySold /
 * lostReason, for the current month and current year to date.
 */
export function aggregateOutcomes(prospects, kind) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const field = kind === "sold" ? "policySold" : "lostReason";

  const monthGroups = {};
  const yearGroups = {};
  let monthTotal = 0, yearTotal = 0;

  prospects.forEach(p => {
    if (getOutcome(p) !== kind) return;
    const ts = p.closedAt || p.updatedAt;
    if (!ts) return;
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (d < yearStart) return;

    const raw = p[field];
    const label = (raw && String(raw).trim()) ? String(raw).trim() : "Not specified";

    yearGroups[label] = (yearGroups[label] || 0) + 1;
    yearTotal++;
    if (d >= monthStart) {
      monthGroups[label] = (monthGroups[label] || 0) + 1;
      monthTotal++;
    }
  });

  return { monthTotal, yearTotal, monthGroups, yearGroups };
}

/**
 * Renders the two-section (month above, year below) breakdown as HTML.
 * No client names, phone numbers, or any other identifying detail.
 */
export function renderOutcomeAggregateHtml(agg, kind) {
  const groupLabel = kind === "sold" ? "Policy" : "Reason";
  const emptyWord = kind === "sold" ? "sales" : "losses";

  const sortEntries = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

  const renderTable = (groups) => {
    const rows = sortEntries(groups);
    if (rows.length === 0) {
      return `<div class="empty-state">No ${emptyWord} recorded.</div>`;
    }
    return `<table><thead><tr><th>${groupLabel}</th><th>Count</th></tr></thead><tbody>${
      rows.map(([label, count]) => `<tr><td>${escapeHtml(label)}</td><td>${count}</td></tr>`).join("")
    }</tbody></table>`;
  };

  return `
    <div class="outcome-agg-section">
      <h4 style="margin:0 0 8px;">This month <span style="color:var(--muted,#888);font-weight:400;">(${agg.monthTotal} total)</span></h4>
      ${renderTable(agg.monthGroups)}
    </div>
    <div class="outcome-agg-section" style="margin-top:22px;">
      <h4 style="margin:0 0 8px;">This year <span style="color:var(--muted,#888);font-weight:400;">(${agg.yearTotal} total)</span></h4>
      ${renderTable(agg.yearGroups)}
    </div>
  `;
}
