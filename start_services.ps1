# ============================================================
# start_services.ps1
# Launches the full recruitment & screening stack locally.
#
# Usage (local Postgres):
#   .\start_services.ps1
#
# Usage (Supabase cloud DB):
#   $env:USE_SUPABASE = "true"
#   $env:DB_PASSWORD  = "your-supabase-db-password"
#   .\start_services.ps1
# ============================================================

$Root = "c:\Users\aryanmi\Downloads\Pre-Proj"

# ── Database Mode ────────────────────────────────────────────
if ($env:USE_SUPABASE -eq "true") {
    Write-Host "Using Supabase cloud database..." -ForegroundColor Cyan
    $DbUrl      = "jdbc:postgresql://db.cfqpdjpvzgkvpipainzp.supabase.co:5432/postgres"
    $DbUser     = "postgres"
    $DbPassword = $env:DB_PASSWORD
    $PyDbUrl    = "postgresql://postgres:${DbPassword}@db.cfqpdjpvzgkvpipainzp.supabase.co:5432/postgres"
    # Note: if corporate firewall blocks port 5432, connect via personal hotspot
} else {
    Write-Host "Using local PostgreSQL database..." -ForegroundColor Green

    # 1. Start local PostgreSQL
    Write-Host "Starting local PostgreSQL..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$Root\tools\pgsql\bin\postgres.exe' -D '$Root\tools\pgsql\data'" -WindowStyle Minimized
    Start-Sleep -Seconds 3

    $DbUrl      = "jdbc:postgresql://localhost:5432/postgres"
    $DbUser     = "postgres"
    $DbPassword = ""
    $PyDbUrl    = "postgresql://postgres@localhost:5432/postgres"
}

# ── 2. Start Spring Boot Backend ────────────────────────────
Write-Host "Starting Spring Boot..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$Root\spring-boot';
    `$env:JAVA_HOME     = '$Root\tools\jdk-21';
    `$env:DB_URL        = '$DbUrl';
    `$env:DB_USERNAME   = '$DbUser';
    `$env:DB_PASSWORD   = '$DbPassword';
    & '`$env:JAVA_HOME\bin\java.exe' -jar target/pmo-mgmt-portal-0.0.1-SNAPSHOT.jar
"@

# ── 3. Start Candidate Shortlist FastAPI ────────────────────
Write-Host "Starting Candidate Shortlist Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$Root\candidate-shortlist';
    `$env:DATABASE_URL = '$PyDbUrl';
    & '..\\.venv\Scripts\uvicorn.exe' main-db:app --host 127.0.0.1 --port 8000
"@

# ── 4. Start Resume Screening FastAPI ───────────────────────
Write-Host "Starting Resume Screening Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$Root\resume-screening';
    `$env:OPENAI_API_KEY = 'mock-key-value-for-startup';
    & '..\\.venv\Scripts\python.exe' -u -m src.main
"@

# ── 5. Start React Frontend ─────────────────────────────────
Write-Host "Starting React Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\React 1'; npm start"

Write-Host ""
Write-Host "All services launched! Opening http://localhost:3000 ..." -ForegroundColor Green
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
