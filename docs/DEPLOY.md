# Deploying JobPilot online

JobPilot is a monorepo with **two independent sites** that deploy separately on
Netlify (or Vercel / any static host):

| Site | Folder | What it is | Example URL |
|---|---|---|---|
| **App** | `app/` | The dashboard you actually use (demo + live mode) | `https://7js-jobpilot.netlify.app` |
| **Landing** | `landing/` | The marketing page people arrive from | `https://7js-jobpilot-landing.netlify.app` |

Both are plain Vite static builds. Nothing here is secret: the app reads its
Firebase config from environment variables, and your data is protected by the
Firestore security rules (see [SETUP.md](SETUP.md) step 5), not by the host.

---

## Prerequisites

1. The repo is pushed to GitHub (see the bottom of this guide if it isn't yet).
2. A free [Netlify](https://netlify.com) account, signed in with GitHub.

---

## 1 · Deploy the app

1. Netlify → **Add new site → Import an existing project → GitHub** → pick the
   `JobPilot` repo.
2. Configure the build:

   | Field | Value |
   |---|---|
   | **Base directory** | `app` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `app/dist` |

   (These match `app/netlify.toml`, so Netlify usually fills them in for you.)
3. **Environment variables** → add every `VITE_*` value from your `app/.env`
   (the six `VITE_FIREBASE_*` keys, `VITE_ALLOWED_EMAIL`, and optionally
   `VITE_FIREBASE_VAPID_KEY` to enable phone push notifications). Without them the
   site builds fine but runs in **demo mode**.
   - For a **pure public demo**, skip the Firebase vars and instead add
     `VITE_DEMO_MODE = true`. That is exactly what `7js-jobpilot.netlify.app` is.
4. **Deploy site.** When it's live, rename it: **Site settings → Change site
   name → `7js-jobpilot`** so the URL becomes `https://7js-jobpilot.netlify.app`.

**✓ You know it worked when:** the URL loads the dashboard. With `VITE_DEMO_MODE=true`
you see the purple demo banner; with real Firebase vars you get the sign-in screen.

> The `app/public/_redirects` file (`/* /index.html 200`) is what keeps deep links
> like `/applications` working on refresh. It's already in the repo, no action needed.

---

## 2 · Deploy the landing page

Repeat the import for the **same repo**, a second site:

1. Netlify → **Add new site → Import an existing project → GitHub** → `JobPilot`.
2. Configure:

   | Field | Value |
   |---|---|
   | **Base directory** | `landing` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `landing/dist` |

3. No environment variables are needed for the landing site.
4. **Deploy**, then rename it (e.g. `7js-jobpilot-landing`) under **Change site name**.

**✓ You know it worked when:** the marketing page loads and its **Try the demo**
button opens your app site.

### Pointing the landing page at your app

The landing page links to the app via two constants in
[`landing/src/content.js`](../landing/src/content.js):

```js
export const DEMO_URL       = 'https://7js-jobpilot.netlify.app'; // "Try the demo" buttons
export const DEMO_EMBED_URL = 'https://7js-jobpilot.netlify.app'; // the live iframe in the hero
```

They already point at `7js-jobpilot.netlify.app`. If your app ends up on a
different URL, change both, commit, and Netlify redeploys automatically.

---

## 3 · Auto-deploy on every push

Both sites are now wired to the GitHub repo, so **every `git push` to `main`
triggers a rebuild**. To deploy a change:

```bash
git add -A
git commit -m "Update X"
git push
```

Netlify picks it up within seconds. Watch progress under each site's **Deploys** tab.

---

## First push to GitHub (if you haven't yet)

> **🔒 Running it for yourself? Use a _private_ repo.**
> The public JobPilot repo (this one) contains zero personal data by design. But once
> you set it up for real, you'll generate local files with your CV, profile, and market
> playbook, and you may be tempted to commit a convenience tweak. Keep your own copy
> **private** so none of that can ever leak:
>
> - **Personal use → private repo.** On GitHub: **New repository → Private**, or fork
>   this one and flip **Settings → General → Change visibility → Private**. Netlify
>   deploys from private repos on the free tier just fine.
> - **Contributing back → public fork.** Only if you're sending a PR upstream, and even
>   then your personal files stay gitignored.
>
> Either way, your secrets (`.env`, `service-account.json`) and `references/` are
> gitignored and never get committed.

```bash
# from the repo root
git add -A
npm run audit:secrets        # must print "✓ No forbidden content found."
git commit -m "Set up my JobPilot"
git push -u origin main
```

`references/` and all secrets are gitignored, so they never leave your machine.
Run `npm run audit:secrets` before every push as a second safety net.

---

## Custom domains (optional)

Once you own a domain, in either site: **Domain settings → Add a domain**, then
follow Netlify's DNS instructions. Netlify provisions HTTPS automatically. After
adding a custom domain to the app, update `DEMO_URL` / `DEMO_EMBED_URL` to match.
