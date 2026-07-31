# 10 DEPLOYMENT GUIDE — Vercel & Supabase Production Setup

## Objective
This document provides step-by-step instructions for deploying StockPulse to production using **Vercel** (frontend static hosting) and **Supabase Cloud** (managed PostgreSQL database), including CI/CD configuration and environment variable setup.

---

## Big Picture
StockPulse relies on a modern serverless deployment pipeline:
1. **Source Code**: Hosted on GitHub (`anuraggaur29/Retail-Inventory-Analytics-Platform`).
2. **Frontend Deployment**: Automated Vercel build triggered on every `git push origin main`.
3. **Database Hosting**: Cloud-hosted PostgreSQL instance on Supabase Cloud.

---

## Deployment Architecture Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Developer Push         GitHub Repository           Vercel Production      │
│  ┌──────────────┐       ┌─────────────────┐        ┌───────────────────┐    │
│  │ git push     │──────>│ Main Branch     │───────>│ Automatic Build   │    │
│  │ origin main  │       │ (GitHub Webhook)│        │ tsc && vite build │    │
│  └──────────────┘       └─────────────────┘        └───────────────────┘    │
│                                                              │              │
│                                                              v              │
│                                                    Vercel Edge Global CDN   │
│                                                    retail-inventory-...app  │
│                                                              │              │
│                                                              │ Live SQL     │
│                                                              v              │
│                                                    Supabase PostgreSQL DB   │
│                                                    ap-south-1 (3732 rows)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Deployment Instructions

### 1. Database Setup (Supabase Cloud)
1. Sign up at [supabase.com](https://supabase.com) and create a new project named `stockpulse` in region `ap-south-1` (Mumbai).
2. Open **SQL Editor** and run the DDL schema script from [`04_DATABASE_DESIGN.md`](file:///c:/DISK-%20X/SQL%20PROJECT/learning/04_DATABASE_DESIGN.md).
3. Execute the data import script from local machine:
   ```bash
   node scripts/import_to_supabase.js
   ```
   *Output: Inserts 14 categories and 3,732 product rows into PostgreSQL.*

### 2. Frontend SPA Routing Fix (`frontend/vercel.json`)
To prevent HTTP 404 errors when refreshing client-side routes like `/products` or `/inventory`, add rewrite rules to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. Vercel Environment Variables Configuration
Go to **Vercel Dashboard → Settings → Environment Variables** and add:

| Variable Key | Value | Scope |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://bhotkxonwfjzshleygmn.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_CuywkU_kh21kkRp2sj-QUA_u2e7dDJ9` | Production, Preview |

---

## Engineering Decisions

### Why Vercel Rewrites for SPA Routing?
- **Problem**: When a user navigates directly to `https://app.vercel.app/inventory`, Vercel looks for a static file named `/inventory/index.html` on the server and returns 404.
- **Solution**: The `vercel.json` rewrite rule catches all incoming requests and serves `/index.html`, allowing React Router v6 to parse the browser URL client-side.

---

## Key Takeaways
- Vercel handles static frontend distribution over Edge CDN.
- Supabase Cloud hosts the production PostgreSQL database.
- `vercel.json` rewrites prevent 404 errors on browser page reloads.
