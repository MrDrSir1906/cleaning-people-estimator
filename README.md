# The Cleaning People — Estimator

Internal powerwashing estimator and quote generator.

---

## Local Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run locally:
   ```
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

---

## Deploy to Netlify via GitHub

### Step 1 — Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2 — Connect to Netlify

1. Log in to netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and select your repo
4. Build settings (Netlify may auto-detect these):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**

Netlify will build and deploy automatically. Every time you push a change to GitHub, it redeploys.

---

## Formspree

Your Formspree endpoint is already set in `src/App.jsx`:

```
https://formspree.io/f/mjgzwaep
```

Submitted quotes will arrive in your Formspree dashboard and be emailed to the address on your Formspree account.

Free tier: 50 submissions per month.

---

## Making Changes

To update pricing rates, edit the `RATES` object at the top of `src/App.jsx`:

```js
const RATES = { driveway: 0.22, patio: 0.30, walkway: 0.25, fence: 0.35, trash: 15 }
```

Save, commit, and push. Netlify will redeploy automatically.
