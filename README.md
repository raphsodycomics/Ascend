# ASCEND by Heirs Life — Week 1 pilot

A working slice of the ASCEND CRM concept, scoped for a one-week test with your team:

**Admin (you) → Line Manager → Unit Manager → Financial Advisor**

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
7. Once created, go to the **Rules** tab of Firestore, delete the default contents, and paste in everything from `firestore.rules` in this project. Click **Publish**.

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
the page. You'll hit a small handful of these across Admin/Line Manager/Unit
Manager/FA views the first time each role logs in — after that they're built
permanently for everyone.

## 4. Run the pilot

1. Log in as Admin → **Invite a Line Manager** (this also creates their Line).
2. Copy the activation link it generates and send it to that person directly (WhatsApp, email — whatever you'd normally use). It works once and expires in 48 hours.
3. They open the link, set a password, and land on their Line Manager dashboard, where they invite Unit Managers the same way.
4. Unit Managers invite Financial Advisors the same way.
5. FAs capture prospects from the **Capture a prospect** tab — that's the everyday screen your team will actually live in.

Everyone only ever sees what the concept doc says they should see — an FA sees only
their own prospects, a Unit Manager sees their unit, a Line Manager sees their whole
line. This is enforced by `firestore.rules`, not just by hiding menu items, so it
holds even if someone edits a URL or opens dev tools.

## What's in this slice vs. the full concept doc

Built for week 1:
- Invitation-only accounts, one level inviting the next (Sections 27.1–27.17)
- Admin, Line Manager, Unit Manager, Financial Advisor roles
- FA quick prospect capture, pipeline stage, notes, outcome
- Green/red daily submission status for managers
- Weekly follow-up view, search, drill-down read-only visibility up the chain
- Server-enforced access control (Section 27.7)

Deliberately left out for now (see Sections 21–22 of the concept doc for the full roadmap):
- Regional Manager / Agency Manager levels — this pilot starts at Line Manager as you asked
- Manager-mediated password recovery is UI-only right now (the "Trouble logging in?" screen explains the model, but doesn't yet notify a manager) — Section 20 covers the full design when you're ready to build it
- Audit log, MFA, account transfers, email/SMS notifications, offline sync
- Export/reporting, leaderboards, commission dashboards

## A note on this being a pilot

The security rules are solid for a small trusted group of managers testing internally,
but the comments at the top of `firestore.rules` flag the one thing to revisit before a
company-wide rollout: invitation creation currently trusts the client's role check
rather than a server-side Cloud Function. Fine for a week with people you know; worth
tightening before this holds real client data at scale.

## 3.6 Local logo and invitation links

The ASCEND logo is bundled locally as `logo.png`. The pages do not download or reference an online logo image.

Invitation links are generated from the current app URL so they work correctly when the app is hosted in a subfolder such as GitHub Pages. If you open the HTML files directly from your computer using `file://`, the link can open locally on that same computer, but it cannot provide a real multi-device invitation system.

For a real pilot where a manager invites an FA on another phone/computer, the project must be hosted at a reachable HTTPS URL and connected to Firebase. The Firebase configuration in `js/firebase-config.js` is intentionally still a placeholder because it must belong to your own Firebase project.

If invitation generation shows an error, check the browser console first and confirm that the Firebase configuration has been replaced and that Email/Password Authentication and Firestore are enabled.
