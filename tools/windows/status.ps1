. (Join-Path $PSScriptRoot "common.ps1")

try {
  Write-Step "Project"
  $owner = Get-PortOwner 3000
  if ($owner) {
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "This computer: http://127.0.0.1:3000"
    foreach ($address in Get-LanAddresses) { Write-Host "LAN:           http://${address}:3000" }
  } else {
    Write-Host "STOPPED"
  }

  Write-Step "Local development database"
  $database = Get-PrismaDevStatus
  if ($database -and $database.status -eq "running") {
    Write-Host "RUNNING" -ForegroundColor Green
  } elseif ($database -and $database.status -eq "not_running") {
    Write-Host "STOPPED"
  } else {
    Write-Host "NOT INSTALLED"
  }
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
