# Candidate Shortlist Platform — Deployment Guide

## Architecture

```
Vercel (React Frontend)
    │
    ├──► Render (Spring Boot :8081)  ──► Supabase (PostgreSQL)
    ├──► Render (Candidate API :8000) ──► Supabase (PostgreSQL)
    └──► Render (Resume API :8001)
```

---

## Step 1: Deploy Backend Services on Render

### A. Connect GitHub to Render
1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Blueprint"**
3. Connect to GitHub → select **`Aryan0854/candidate-shortlist`**
4. Render detects `render.yaml` and creates all 3 services automatically

### B. Set Secret Environment Variables (Render Dashboard)
After the services are created, go to each service → **Environment** → add:

| Service | Variable | Value |
|---------|----------|-------|
| `pmo-spring-boot` | `DB_PASSWORD` | `kcDwjY7a_#2FpF8` |
| `pmo-candidate-shortlist` | `DB_PASSWORD` | `kcDwjY7a_#2FpF8` |
| `pmo-resume-screening` | `OPENAI_API_KEY` | *(your real OpenAI key)* |

---

## Step 2: Deploy React Frontend on Vercel

1. Go to **https://vercel.com/new**
2. Import from GitHub → select **`Aryan0854/candidate-shortlist`**
3. Set **Root Directory** to: `React 1`
4. Framework preset: **Create React App**
5. Add environment variables:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://pmo-spring-boot.onrender.com` |
| `REACT_APP_AI_API_URL` | `https://pmo-candidate-shortlist.onrender.com` |
| `REACT_APP_RESUME_API_URL` | `https://pmo-resume-screening.onrender.com` |

6. Click **Deploy**

---

## Step 3: Update Frontend URL in Spring Boot

After Vercel gives you the final URL (e.g. `https://pmo-xyz.vercel.app`):
- Go to Render → `pmo-spring-boot` → Environment
- Add: `CORS_ALLOWED_ORIGINS` = `https://pmo-xyz.vercel.app`

---

## Default Credentials
- **Username**: `admin`
- **Password**: `admin`
