# Set root path
$Root = "c:\Users\aryanmi\Downloads\Pre-Proj"

# 1. Start PostgreSQL
Write-Host "Starting PostgreSQL..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$Root\tools\pgsql\bin\postgres.exe' -D '$Root\tools\pgsql\data'" -WindowStyle Minimized

# Wait a moment for PostgreSQL to boot
Start-Sleep -Seconds 3

# 2. Start Spring Boot Backend
Write-Host "Starting Spring Boot..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\spring-boot'; `$env:JAVA_HOME = '$Root\tools\jdk-21'; & '`$env:JAVA_HOME\bin\java.exe' -jar target/pmo-mgmt-portal-0.0.1-SNAPSHOT.jar"

# 3. Start Candidate Shortlist FastAPI
Write-Host "Starting Candidate Shortlist Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\candidate-shortlist'; & '..\.venv\Scripts\uvicorn.exe' main-db:app --host 127.0.0.1 --port 8000"

# 4. Start Resume Screening FastAPI
Write-Host "Starting Resume Screening Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\resume-screening'; `$env:OPENAI_API_KEY = 'mock-key-value-for-startup'; & '..\.venv\Scripts\python.exe' -u -m src.main"

# 5. Start React Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\React 1'; npm start"

Write-Host "All services launched! The browser should open http://localhost:3000 automatically." -ForegroundColor Green
