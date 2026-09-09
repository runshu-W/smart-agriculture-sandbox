. (Join-Path $PSScriptRoot "common.ps1")

try {
  Write-Step "Checking Node.js"
  Assert-NodeEnvironment

  Write-Step "Installing project dependencies"
  Invoke-ProjectCommand "npm.cmd" @("ci")

  $database = Start-PrismaDev
  Set-DatabaseUrl $database.databaseUrl
  Write-Host "Local database is ready."

  Write-Step "Preparing database structure and demo data"
  Invoke-ProjectCommand "npm.cmd" @("run", "db:generate")
  Invoke-ProjectCommand "npm.cmd" @("run", "db:deploy")
  Invoke-ProjectCommand "npm.cmd" @("run", "db:seed")

  Write-Host "`nInstallation completed. Double-click start.cmd to run the project." -ForegroundColor Green
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
