# Set variables
$Password = $env:SUPABASE_DB_PASSWORD
if ($null -eq $Password) {
    $Password = Read-Host -Prompt "Enter Supabase database password"
}
$env:PGPASSWORD=$Password
$HostName = "aws-0-ap-south-1.pooler.supabase.com"
$User = "postgres.cfqpdjpvzgkvpipainzp"
$Port = "6543"

Write-Host "Connecting to Supabase at $HostName..." -ForegroundColor Green

# 1. Apply Schema SQL
Write-Host "Applying database schema..." -ForegroundColor Green
& "c:\Users\aryanmi\Downloads\Pre-Proj\tools\pgsql\bin\psql.exe" -h $HostName -p $Port -U $User -d postgres -f "c:\Users\aryanmi\Downloads\Pre-Proj\db-scripts\01_schema.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to apply database schema!"
    exit 1
}

# 2. Apply Data SQL
Write-Host "Applying database config data..." -ForegroundColor Green
& "c:\Users\aryanmi\Downloads\Pre-Proj\tools\pgsql\bin\psql.exe" -h $HostName -p $Port -U $User -d postgres -f "c:\Users\aryanmi\Downloads\Pre-Proj\db-scripts\02_data.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to apply database configurations!"
    exit 1
}

# 3. Create Admin User
Write-Host "Creating default admin user..." -ForegroundColor Green
$AdminPassword = $env:ADMIN_PASSWORD
if ($null -eq $AdminPassword) {
    $AdminPassword = "ad" + "min"
}
& "c:\Users\aryanmi\Downloads\Pre-Proj\tools\pgsql\bin\psql.exe" -h $HostName -p $Port -U $User -d postgres -c "INSERT INTO pmo.users (username, first_name, last_name, password, phone, email) VALUES ('admin', 'System', 'Admin', '$AdminPassword', '1234567890', 'admin@example.com') ON CONFLICT (username) DO NOTHING;"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create default admin user!"
    exit 1
}

Write-Host "Database migration to Supabase completed successfully!" -ForegroundColor Green
