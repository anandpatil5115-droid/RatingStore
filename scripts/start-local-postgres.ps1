<#
  start-local-postgres.ps1
  ------------------------
  Starts the portable PostgreSQL 16 instance used for local development.

  Variables (override if needed):
    PG_ROOT  - directory that contains the pgsql binaries and the data folder
    PG_PORT  - port the server listens on (default 5432)
    PG_DB    - name of the database to create if it does not exist

  Usage:
    powershell -ExecutionPolicy Bypass -File scripts\start-local-postgres.ps1
#>

$ErrorActionPreference = 'Stop'

$PG_ROOT = $env:PG_ROOT
if (-not $PG_ROOT) {
  $PG_ROOT = Join-Path $env:LOCALAPPDATA 'StoreRatingPG'
}
$PG_BIN = Join-Path $PG_ROOT 'pgsql\bin'
$PG_DATA = Join-Path $PG_ROOT 'data'
$PG_LOG = Join-Path $PG_ROOT 'server.log'
$PG_PORT = $env:PG_PORT
if (-not $PG_PORT) { $PG_PORT = '5432' }
$PG_DB = $env:PG_DB
if (-not $PG_DB) { $PG_DB = 'store_rating' }

if (-not (Test-Path (Join-Path $PG_BIN 'initdb.exe'))) {
  Write-Host 'Portable PostgreSQL binaries not found. Run scripts/setup-portable-postgres.ps1 first.' -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $PG_DATA 'PG_VERSION'))) {
  Write-Host 'Initializing PostgreSQL data directory...'
  & (Join-Path $PG_BIN 'initdb.exe') -D $PG_DATA -U postgres --auth=trust --encoding=UTF8 --locale=C | Out-Null
  if (-not $?) { Write-Host 'initdb failed.' -ForegroundColor Red; exit 1 }
}

$listener = Get-NetTCPConnection -LocalPort $PG_PORT -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  Write-Host "PostgreSQL already listening on port $PG_PORT." -ForegroundColor Green
} else {
  Write-Host "Starting PostgreSQL on port $PG_PORT..."
  Start-Process -FilePath (Join-Path $PG_BIN 'postgres.exe') -ArgumentList @('-D', $PG_DATA, '-p', $PG_PORT) -WindowStyle Hidden -RedirectStandardOutput $PG_LOG -RedirectStandardError $PG_LOG
  Start-Sleep -Seconds 4
}

$psql = Join-Path $PG_BIN 'psql.exe'
$exists = & $psql -U postgres -h localhost -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname = '$PG_DB'" 2>$null
if ($exists -ne '1') {
  Write-Host "Creating database '$PG_DB'..."
  & $psql -U postgres -h localhost -p $PG_PORT -c "CREATE DATABASE $PG_DB;" | Out-Null
}

Write-Host "PostgreSQL is ready on localhost:$PG_PORT (database: $PG_DB)." -ForegroundColor Green
Write-Host "DATABASE_URL=postgresql://postgres:postgres@localhost:$PG_PORT/$PG_DB"
