# Security

JobPilot is self-hosted: there is no central server, no telemetry, and no third party
in the data path. Security therefore comes down to three things you control.

## 1 · What is secret vs. what is not

| Item | Secret? | Notes |
|---|---|---|
| Firebase **web config** (`VITE_FIREBASE_*` in `app/.env`) | **No** | These values identify your project to Google; they ship in every Firebase web app's bundle. Your data is protected by the security rules, not by hiding these. |
| **Firestore security rules** (`app/firestore.rules`) | No | **This is the wall.** They lock every read/write to your signed-in account. Deploy them (SETUP step 5) before putting anything real in the database. |
| **Service-account key** (`mcp-server/service-account.json`) | **YES, critical** | Full admin access to your Firebase project, bypassing all rules. Gitignored. Never commit it, never paste it, never share it. |
| Your password / `VITE_ALLOWED_EMAIL` | password yes / email no | The email also appears in the rules; that's by design. |
| Generated agent files (`PROFILE.md`, `base_cv.md`, `screening_answers.md`, …) | **Personal** | Your CV facts and contact details. All gitignored so a public fork of your copy can't leak them. |

**If the service-account key ever leaks:** Google Cloud console → IAM & Admin →
Service Accounts → the Firebase Admin SDK account → **Keys** → delete the key, then
generate a fresh one for the MCP server. Do this immediately; treat it like a leaked
root password.

## 2 · The single-user model (three layers)

1. **Firestore rules**: only requests authenticated as your email can read/write.
   This is the enforcement layer.
2. **Firebase Auth**: one user exists; email/password with Google's lockouts.
3. **Client check** (`VITE_ALLOWED_EMAIL`): convenience only; signs out any other
   account immediately. Not a security boundary on its own.

There is deliberately no multi-user mode: one deployment = one person's job search.

## 3 · The agent safety model

- **Approval gates.** Agents cannot submit an application, send a connection note, or
  send any message without a pending item being explicitly approved by you in the
  dashboard. This is enforced by the agents' instruction files AND by the pipeline's
  status transitions.
- **Honesty tiers.** Skills you marked "never claim" cannot appear in any generated
  document. Agents must ask (a `cv_questions` item) instead of guessing.
- **No desktop takeover.** The application-writer is forbidden from using the OS file
  picker or controlling your desktop; uploads go through the browser DOM only.
- **Hard rate limits.** The connection-builder enforces conservative LinkedIn limits
  (100/week, 25/day, 5 notes/month) and stops itself. Note: automating LinkedIn can
  still violate its ToS; you run that agent at your own risk and can disable it with
  one toggle.
- **Your instructions outrank everything.** Each agent reads its `agentInstructions`
  doc (editable in the app) at startup; those directives override the SKILL files.

## 4 · Before you fork or open-source your copy

- Run `npm run audit:secrets`. Add your own patterns (email, phone, project ID, …) to
  `scripts/audit-patterns.local.txt` (gitignored); the script fails the build if any
  pattern appears in committed files.
- Check `git status` for anything unexpected before your first push. The shipped
  `.gitignore` already covers `.env`, service-account keys, and all generated
  personal files.

## Reporting a vulnerability

Open a GitHub issue **without** exploit details and say it's security-related, or
contact the maintainer through the profile linked in the README. Please don't publish
details before a fix lands.
