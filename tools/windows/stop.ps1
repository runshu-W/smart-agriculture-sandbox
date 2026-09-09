. (Join-Path $PSScriptRoot "common.ps1")

try {
  $appStopped = Stop-ProjectApplication
  $databaseStopped = Stop-PrismaDev
  if ($appStopped) { Write-Host "Project stopped." -ForegroundColor Green } else { Write-Host "Project was not running." }
  if ($databaseStopped) { Write-Host "Local development database stopped." -ForegroundColor Green } else { Write-Host "Local development database was not running." }
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
