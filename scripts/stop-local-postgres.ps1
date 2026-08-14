<#
  stop-local-postgres.ps1
  -----------------------
  Stops the portable PostgreSQL instance (only processes under PG_ROOT).

  Usage:
    powershell -ExecutionPolicy Bypass -File scripts\stop-local-postgres.ps1
#>

$PG_ROOT = $env:PG_ROOT
if (-not $PG_ROOT) {
  $PG_ROOT = Join-Path $env:LOCALAPPDATA 'StoreRatingPG'
}
$PG_BIN = Join-Path $PG_ROOT 'pgsql\bin'
$PG_DATA = Join-Path $PG_ROOT 'data'

if ((Test-Path (Join-Path $PG_BIN 'pg_ctl.exe')) -and (Test-Path (Join-Path $PG_DATA 'postmaster.pid'))) {
  & (Join-Path $PG_BIN 'pg_ctl.exe') -D $PG_DATA stop -m fast
  Write-Host 'PostgreSQL stopped.'
} else {
  Write-Host 'PostgreSQL is not running (or no data directory found).'
}