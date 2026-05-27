# ============================================================
# start_migrated_services.ps1
# Launches the migrated Next.js + Supabase + Python stack locally.
#
# Usage:
#   .\start_migrated_services.ps1
# ============================================================

$Root = "c:\Users\aryanmi\Downloads\Pre-Proj"

# 1. Start local PostgreSQL
Write-Host "Starting local PostgreSQL..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$Root\tools\pgsql\bin\postgres.exe' -D '$Root\tools\pgsql\data'" -WindowStyle Minimized
Start-Sleep -Seconds 2

# 2. Start Candidate Shortlist FastAPI (Port 8000)
Write-Host "Starting Candidate Shortlist Service (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$Root\candidate-shortlist';
    `$env:DATABASE_URL = 'postgresql://postgres@localhost:5432/postgres';
    & '..\\.venv\Scripts\uvicorn.exe' main-db:app --host 127.0.0.1 --port 8000
"@ -WindowStyle Minimized

# 3. Start Resume Screening FastAPI (Port 8001)
Write-Host "Starting Resume Screening Service with Gemini (Port 8001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$Root\resume-screening';
    & '..\\.venv\Scripts\python.exe' -u -m src.main
"@ -WindowStyle Minimized

# 4. Start Next.js Fullstack Web App (Port 3000)
Write-Host "Starting Migrated Next.js Fullstack Web App (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$Root\nextjs-app';
    npm run dev
"@

Write-Host ""
Write-Host "All services launching! Opening http://localhost:3000 ..." -ForegroundColor Green
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"
