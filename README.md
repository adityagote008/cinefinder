# 🎬 CineFinder

> AI-powered Movie & TV Series Recommendation Engine

---

## 🚀 Deploy in 5 Minutes

### Option 1 — Vercel (Recommended)

1. Upload this folder to [GitHub.com](https://github.com) as a new repo
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
3. Click **"Add New Project"** → Import your repo
4. Leave all settings as default → Click **Deploy**
5. ✅ Your site is live at `https://cinefinder.vercel.app`

### Option 2 — Netlify

1. Upload this folder to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo → Click **Deploy**
4. ✅ Live at `https://cinefinder.netlify.app`

### Option 3 — Run Locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## 🌐 Custom Domain Setup

1. Buy a domain on [Namecheap](https://namecheap.com) or [GoDaddy](https://godaddy.com)
2. In Vercel dashboard → Settings → Domains → Add your domain
3. Update DNS records as instructed by Vercel
4. ✅ Live at `https://yourcustomdomain.com`

---

## 🔍 Google Search Console (Get Listed on Google)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **"Add Property"** → Enter your domain
3. Verify ownership (Vercel/Netlify make this easy via DNS)
4. Go to **Sitemaps** → Submit `https://yoursite.com/sitemap.xml`
5. Google indexes your site within 3–7 days ✅

> **Remember:** Update `yoursite.com` in `sitemap.xml`, `robots.txt`, and `index.html` to your actual domain before deploying.

---

## ⚙️ Tech Stack

- **React 18** + **Vite**
- **Claude AI** (Streaming API)
- **TMDB** for movie posters
- Zero external UI libraries

---

## 📁 Project Structure

```
cinefinder/
├── index.html          ← SEO meta tags, fonts
├── vite.config.js      ← Build config
├── vercel.json         ← Vercel deployment
├── netlify.toml        ← Netlify deployment
├── package.json
├── public/
│   ├── favicon.svg
│   ├── robots.txt      ← Google crawler config
│   └── sitemap.xml     ← Google indexing
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← Full CineFinder app
```
