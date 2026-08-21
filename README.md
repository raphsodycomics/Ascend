# ASCEND by Heirs Life — Week 1 pilot

A working slice of the ASCEND CRM concept, scoped for a one-week test with your team:

**Admin (you) → Regional Head → Regional Coordinator → Area Manager → Unit Manager → Financial Advisor**

Each level invites the one below it. Nobody can sign up on their own — the login
screen only has a login form, matching the invitation-only model in the concept doc.

No backend server was written by hand — the frontend (plain HTML/CSS/JS) talks
directly to **Firebase** for authentication and data storage, since GitHub Pages
only serves static files and can't run a database on its own. This is a completely
standard, free way to get real multi-user data storage out of a static site.

## 1. Create your Firebase project (~5 minutes)

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `heirs-ascend-pilot`) → finish the wizard.
2. Inside the project, click the **`</>`** (web) icon to register a new web app. Give it any nickname. You do **not** need Firebase Hosting — you're using GitHub Pages instead.
3. Firebase will show you a `firebaseConfig` object. Copy it.
4. Open `js/firebase-config.js` in this project and paste your values in, replacing the `REPLACE_WITH_...` placeholders.
5. In the left sidebar: **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
6. In the left sidebar: **Build → Firestore Database → Create database** → start in **production mode** → pick a location close to your team.
7. Once created, go to the **Rules** tab of Firestore, delete the default contents, and paste in everything from `firestore.rules` in this project. Click **Publish**. If you ever edit `firestore.rules` in this repo afterward, remember the file on disk isn't what's protecting your data — you have to re-paste and re-Publish it here every time it changes.
8. **Authorized domains** — Authentication → Settings → **Authorized domains**. Firebase only allows sign-in and password-reset emails to work from domains on this list. `localhost` is there by default, which covers opening the app straight from your computer. Add whatever domain you'll actually be presenting from:
   - Hosting on GitHub Pages → add `yourname.github.io` (just the domain, no `https://` and no path).
   - Presenting from your laptop's screen → `localhost` already covers it, nothing to add.
   - Skipping this for a domain you're actually using is the single most common cause of "invitation link doesn't work on my phone" or "password reset email never arrives" — if either of those happens, check here first.

## 2. Create the first Admin account (that's you)

There's no signup screen on purpose — someone has to be the very first account.

1. Firebase console → **Authentication → Users → Add user**. Enter your email and a password.
2. Copy the **User UID** it generates.
3. Go to **Firestore Database → Data → Start collection** → collection ID: `users`.
4. Document ID: paste the UID you copied. Add these fields:
   - `name` (string) — your name
   - `email` (string) — the same email you used above
   - `role` (string) — `admin`
   - `status` (string) — `active`
   - `createdAt` (timestamp) — now
5. Save. You can now log in at `index.html` with that email/password — you'll land on the admin page.

## 3. Put it on GitHub

1. Create a new GitHub repository and push everything in this folder to it.
2. Repo → **Settings → Pages** → Source: deploy from branch → pick `main` and `/ (root)` → Save.
3. GitHub gives you a URL like `https://yourname.github.io/ascend/`. That's the app.

## 3.5 About index prompts (expected, not a bug)

Several dashboard queries filter on multiple fields at once (e.g. "FAs in this unit,
ordered by when they joined"). Firestore needs a composite index for those — it
doesn't ship with them pre-built. The **first time** each such query runs, open the
browser console (F12 → Console tab); Firestore will print an error with a direct
**"create it here"** link. Click it, wait about a minute while it builds, then reload
the page. You'll hit a small handful of these the first time each role logs in —
after that they're built permanently for everyone. Most dashboards avoid this
entirely by filtering with `where()` and sorting client-side instead of combining
`where()` with `orderBy()` — see the Change log below for where that fix was applied.

## 4. Run the pilot

1. Log in as Admin → **Invite a Regional Head** (this also creates their Region).
2. Copy the activation link it generates and send it to that person directly (WhatsApp, email — whatever you'd normally use). It works once and expires in 3 hours.
3. They open the link, set a password, and land on their Regional Head dashboard, where they invite Regional Coordinators the same way (each invite creates a Coordination).
4. Regional Coordinators invite Area Managers the same way (each invite creates a Line — "Area Manager" is the label used everywhere in the UI, though the underlying role is still called `line_manager`, see 4.5 below).
5. Area Managers invite Unit Managers the same way.
6. Unit Managers invite Financial Advisors the same way.
7. FAs capture prospects from the **Capture a prospect** tab — that's the everyday screen your team will actually live in.

Everyone only ever sees what the concept doc says they should see — an FA sees only
their own prospects, a Unit Manager sees their unit, an Area Manager sees their whole
Line, a Regional Coordinator sees their whole Coordination, a Regional Head sees
their whole Region. This is enforced by `firestore.rules`, not just by hiding menu
items, so it holds even if someone edits a URL or opens dev tools.

## 4.5 Note on the hierarchy naming

Internally (in Firestore field names and the `role` field on user docs) the levels
are still called `line_manager` for what the UI labels "Area Manager", and a Line
is what the UI calls the group an Area Manager runs. This is a holdover from an
earlier version of the pilot that started at that level (see "Change log" below)
— renaming the underlying field names across the whole app wasn't worth the risk
for a pilot, so the UI labels were changed instead. If you're reading the code and
see `lineId`/`line_manager`, that maps to "Area Manager" in every dashboard.

## What's in this slice vs. the full concept doc

Built for the pilot:
- Invitation-only accounts, one level inviting the next (Sections 27.1–27.17)
- Admin, Regional Head, Regional Coordinator, Area Manager, Unit Manager, Financial Advisor roles
- FA quick prospect capture, pipeline stage, notes, outcome
- Green/red daily submission status for managers
- Weekly follow-up view, search, drill-down read-only visibility up the chain
- Server-enforced access control (Section 27.7)
- Collated Sold/Lost performance views (no client detail) at Area Manager, Regional Coordinator, and Regional Head level, reachable from the sidebar under Overview
- Manage/Reactivate/Suspend/Archive account actions, and Unit/Area Manager transfer between Lines or Coordinations
- Mobile- and tablet-friendly layout (sidebar collapses to a scrollable top bar under 800px; tables scroll horizontally instead of breaking)
- A 5-minute inactivity timeout on **every** dashboard (Admin, Regional Head, Regional Coordinator, Area Manager, Unit Manager, FA): after 5 minutes with no mouse/keyboard/touch/scroll activity, an on-screen 50-second countdown appears, and the user is signed out automatically if it reaches zero — `startInactivityTimer()` in `js/auth.js`, called once from inside each page's `guardPage` callback
- Self-service password reset: the "Trouble logging in?" link on the login screen sends a real reset email via Firebase Auth (`sendPasswordResetEmail`) — no manager involvement needed, no backend of our own required

Deliberately left out for now (see Sections 21–22 of the concept doc for the full roadmap):
- Section 20's original manager-mediated password recovery design (a manager confirms identity before a reset is issued) was swapped for plain self-service reset, below — revisit if you want the manager-confirmation step back for a wider rollout
- Audit log, MFA, offline sync
- Export/reporting, leaderboards, commission dashboards
- A proper in-app cascade-delete tool for permanently removing an Area Manager/Unit/FA and their history — `firestore.rules` currently blocks hard deletes by design (`users` and `prospects` docs can never be deleted, only deactivated/archived), so removing stray/test data today means deleting the relevant documents by hand in the Firebase Console (Firestore + Authentication tabs). See "Change log" below.

## A note on this being a pilot

The security rules are solid for a small trusted group of managers testing internally,
but the comments at the top of `firestore.rules` flag the one thing to revisit before a
company-wide rollout: invitation creation currently trusts the client's role check
rather than a server-side Cloud Function. Fine for a week with people you know; worth
tightening before this holds real client data at scale.

## 3.6 Local logo and invitation links

The ASCEND logo is bundled locally as `logo.png`. The pages do not download or reference an online logo image.

Invitation links are generated from the current app URL so they work correctly when the app is hosted in a subfolder such as GitHub Pages. If you open the HTML files directly from your computer using `file://`, the link can open locally on that same computer, but it cannot provide a real multi-device invitation system.

For a real pilot where a manager invites an FA on another phone/computer, the project must be hosted at a reachable HTTPS URL and connected to Firebase. `js/firebase-config.js` in this repo is already pointed at the live pilot's Firebase project — if you're forking this for a different environment, replace those values with your own project's config first.

If invitation generation, login, or password reset shows an error, check the browser console first and confirm: the Firebase configuration is correct, Email/Password Authentication and Firestore are enabled, and the domain you're on is in the Authorized domains list (see step 8 above).

## Change log

Fixes and additions made after the initial Region → Coordination → Area → Unit → FA
restructuring:

- **Regional Coordinator & Regional Head dashboards not loading** — both had a
  Firestore query combining `where()` with `orderBy()` on a different field, which
  needs a composite index that wasn't guaranteed to exist; when missing, the query
  threw and the whole dashboard silently stayed on "Loading…" forever. Fixed by
  dropping `orderBy()` and sorting client-side instead (same pattern already used
  in `fa.html`/`unit-manager.html`), plus a `.catch()` so any future failure shows
  a real error message instead of hanging.
- **Sold/Lost moved into the sidebar** — on the Regional Coordinator and Regional
  Head dashboards, the Sold/Lost collation buttons now live in the sidebar nav,
  directly under Overview, instead of inside a separate card in the main content.
- **Admin dashboard counters** — added live counts for **Unit Managers** and
  **Financial Advisors** alongside the existing Regions/Regional Coordinators/Area
  Managers/Pending invitations counters.
- **Mobile & tablet layout** — `css/styles.css` now has three responsive tiers
  (≤1024px, ≤800px, ≤480px). The sidebar collapses to a horizontally-scrollable
  top bar on phones instead of hiding navigation entirely, tables scroll inside
  their card instead of breaking the page layout, and form inputs bump to 16px on
  mobile to stop iOS Safari's auto-zoom-on-focus.
- **Inactivity timeout, all dashboards** — after 5 minutes with no mouse/keyboard/
  touch/scroll activity, an on-screen 50-second countdown appears; if it reaches
  zero the user is signed out and redirected to the login page with an
  explanatory message. Built as a reusable `startInactivityTimer()` export in
  `js/auth.js`, wired into all six dashboards (Admin, Regional Head, Regional
  Coordinator, Area Manager, Unit Manager, FA) — worth knowing if you're
  presenting a demo and plan to linger on one screen for 5+ minutes.
- **Self-service password reset** — replaced the earlier manager-mediated
  stub with a real "Trouble logging in?" flow on the login screen, using
  Firebase Auth's `sendPasswordResetEmail`. Requires the domain you're on to
  be in Firebase's Authorized domains list (see step 8 in Section 1) or the
  email silently never sends.
- **This README** — corrected two places that had drifted from the code: the
  password reset section previously described the old manager-mediated stub,
  and the inactivity timeout was described as FA-only. Both are fixed above.
- **Removing stray/test pilot data** — `firestore.rules` deliberately blocks hard
  deletes of `users` and `prospects` docs (accounts are archived, never deleted;
  sales/loss history is permanent), and only allows deleting a Line/Unit before
  it's been claimed by its first manager. There's no in-app way to fully remove an
  already-active Area Manager/Unit/FA tree yet — do it by hand in the Firebase
  Console (Firestore tab, deleting the relevant `lines`/`units`/`users`/
  `prospects`/`invitations` docs filtered by `lineId`, then Authentication tab to
  remove the matching login accounts).
