# Candidate Shortlist Platform

A full-stack recruitment and candidate screening system for PMO teams.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Material UI |
| Backend API | Spring Boot 3.5 (Java 21) |
| Candidate Matching | Python FastAPI + sentence-transformers |
| Resume Screening | Python FastAPI + OpenAI |
| Database | PostgreSQL (Supabase cloud) |

## Project Structure

```
.
├── React 1/              # React frontend
├── spring-boot/          # Spring Boot REST API (port 8081)
├── candidate-shortlist/  # Python FastAPI – skill matching (port 8000)
├── resume-screening/     # Python FastAPI – resume analysis (port 8001)
├── db-scripts/           # Database schema & seed data SQL
├── render.yaml           # Render deployment blueprint
├── DEPLOYMENT.md         # Full hosting guide
├── migrate_supabase_http.py  # Supabase migration via HTTPS
└── start_services.ps1    # Local startup script (Windows)
```

## Running Locally

### Prerequisites
- Windows with PowerShell
- Tools bundled in `tools/` (JDK 21, Maven, PostgreSQL)

### Start All Services
```powershell
cd "c:\path\to\Pre-Proj"
.\start_services.ps1
```

Then open **http://localhost:3000**

**Login:** `admin` / `admin`

## Deploying to the Cloud

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions on deploying to Render (backends) and Vercel (frontend).

### Quick Deploy
1. Fork/clone this repo
2. Run the Supabase migration:
   ```powershell
   $env:SUPABASE_TOKEN = "your-token"
   python migrate_supabase_http.py
   ```
3. Connect to [Render Blueprint](https://dashboard.render.com/select-repo?type=blueprint)
4. Deploy frontend on [Vercel](https://vercel.com/new)

## Environment Variables

See [`.env.example`](./.env.example) for a full list of required environment variables.


.\start_migrated_services.ps1
