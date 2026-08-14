<#
  setup-portable-postgres.ps1
  ---------------------------
  Downloads the official PostgreSQL 16 Windows binaries from EnterpriseDB,
  extracts them and (optionally) starts a local instance.
  Useful when PostgreSQL is not installed system-wide (no admin required).

  Usage:
    powershell -ExecutionPolicy Bypass -File scripts\setup-portable-postgres.ps1
    powershell -ExecutionPolicy Bypass -File scripts\setup-portable-postgres.ps1 -SkipStart

  Then run scripts/start-local-postgres.ps1 afterwards.
#>

param([switch]$SkipStart)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$PG_ROOT = $env:PG_ROOT
if (-not $PG_ROOT) {
  $PG_ROOT = Join-Path $env:LOCALAPPDATA 'StoreRatingPG'
}
$PG_BIN = Join-Path $PG_ROOT 'pgsql\bin'

if (Test-Path (Join-Path $PG_BIN 'initdb.exe')) {
  Write-Host 'PostgreSQL binaries already present.' -ForegroundColor Green
  if (-not $SkipStart) {
    & (Join-Path $PSScriptRoot 'start-local-postgres.ps1')
  }
  exit 0
}

# Keep this in sync with the current page: https://www.enterprisedb.com/download-postgresql-binaries
$ZIP_URL = 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1260422'
$ZIP_NAME = 'postgresql-16.15-1-windows-x64-binaries.zip'
$TEMP_DIR = Join-Path $env:TEMP 'pg-download'

Write-Host 'Downloading PostgreSQL 16 binaries (approx. 330 MB)...'
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null
$zip = Join-Path $TEMP_DIR $ZIP_NAME
if (-not (Test-Path $zip)) {
  Invoke-WebRequest -Uri $ZIP_URL -OutFile $zip -UseBasicParsing
}

Write-Host 'Extracting...'
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $PG_ROOT)
if (-not (Test-Path $PG_BIN)) {
  Write-Host 'Extraction did not produce pgsql/bin. Aborting.' -ForegroundColor Red
  exit 1
}

Write-Host 'PostgreSQL binaries installed under:' $PG_ROOT -ForegroundColor Green
if (-not $SkipStart) {
  & (Join-Path $PSScriptRoot 'start-local-postgres.ps1')
}