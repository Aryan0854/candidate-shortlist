# Migrated Platform — Production Deployment Guide

This guide details how to host and deploy the migrated Recruitment Automation Platform in production.

---

## 🏗️ Architecture Overview

```
             ┌──────────────────────────────────────────┐
             │            Vercel Frontend               │
             │             (Next.js App)                │
             └──────┬────────────────────────────┬──────┘
                    │                            │
                    ▼ (Proxied via /api/*)       ▼ (Direct SQL Pooler)
     ┌──────────────────────────────┐     ┌──────────────────────────────┐
     │        Render Hosting        │     │       Supabase Cloud         │
     │  (FastAPI Microservices)     │     │    (PostgreSQL & Storage)    │
     │                              │     │                              │
     │  - :8000 candidate-shortlist │     │  - pmo schema tables         │
     │  - :8001 resume-screening    │     │  - resume storage bucket     │
     │    (uses Gemini API)         │     │                              │
     └──────────────────────────────┘     └──────────────────────────────┘
```

---

## 1. Database Setup: Supabase Cloud

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://supabase.com) and create a new project.
2. **Initialize Schema & Seed Data**:
   - Open the **SQL Editor** in Supabase.
   - Copy the contents of [`nextjs-app/supabase/schema.sql`](file:///c:/Users/aryanmi/Downloads/Pre-Proj/nextjs-app/supabase/schema.sql) and execute the query. This creates the `pmo` schema, tables, seed configurations, and the default admin user.
3. **Configure Storage Buckets**:
   - Create two storage buckets inside the Supabase Storage dashboard:
     - `resumes`: Set to private (for candidate profiles).
     - `documents`: Set to private (for other uploaded files).

---

## 2. Microservice Setup: Render Hosting

We host the two FastAPI backend microservices on Render using their respective `Dockerfile`s.

1. **Deploy Candidate Shortlist Service (`pmo-candidate-shortlist`)**:
   - Create a new **Web Service** on Render.
   - Connect your repository and set the **Root Directory** to: `candidate-shortlist`.
   - Render automatically detects the `Dockerfile` and builds it.
   - **Environment Variables**:
     - `DATABASE_URL`: `postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require` (your Supabase connection pooler string).

2. **Deploy Resume Screening Service (`pmo-resume-screening`)**:
   - Create a new **Web Service** on Render.
   - Connect your repository and set the **Root Directory** to: `resume-screening`.
   - **Environment Variables**:
     - `GEMINI_API_KEY`: `AIzaSyBRn0swmMrdbvgwOwKDQUGyA1CBfiukLE` (or your production Gemini API key).

---

## 3. Fullstack Frontend Setup: Vercel

Vercel is the recommended environment for hosting Next.js App Router applications.

1. **Deploy Next.js on Vercel**:
   - Go to [Vercel](https://vercel.com/new) and import your repository.
   - Set the **Root Directory** to: `nextjs-app`.
   - Keep the Framework preset as **Next.js**.
2. **Configure Environment Variables**:
   - Add the following variables in the Vercel project settings:
     - `NEXT_PUBLIC_SUPABASE_URL`: `https://[ref].supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `[your-anon-key]`
     - `SUPABASE_SERVICE_ROLE_KEY`: `[your-service-role-key]`
     - `DATABASE_URL`: `postgres://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`
     - `PYTHON_AI_API_URL`: `https://pmo-candidate-shortlist.onrender.com` (your Render URL for port 8000)
     - `PYTHON_RESUME_API_URL`: `https://pmo-resume-screening.onrender.com` (your Render URL for port 8001)
3. **Click Deploy**. Vercel will build the frontend pages and host them globally.
