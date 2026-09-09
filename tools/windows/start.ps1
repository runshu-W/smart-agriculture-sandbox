. (Join-Path $PSScriptRoot "common.ps1")

$startedProcessId = $null
try {
  Assert-NodeEnvironment
  if (-not (Test-Path -LiteralPath (Join-Path $script:ProjectRoot "node_modules"))) {
    throw "Project dependencies are missing. Double-click install.cmd first."
  }

  $existing = Get-PortOwner 3000
  if ($existing) {
    Write-Host "The project is already running: http://127.0.0.1:3000" -ForegroundColor Yellow
    exit 0
  }

  $database = Start-PrismaDev
  Set-DatabaseUrl $database.databaseUrl

  Write-Step "Updating database structure"
  Invoke-ProjectCommand "npm.cmd" @("run", "db:generate")
  Invoke-ProjectCommand "npm.cmd" @("run", "db:deploy")

  New-Item -ItemType Directory -Path $script:RuntimeDirectory -Force | Out-Null
  Set-Content -LiteralPath $script:StdoutLog -Value "" -Encoding UTF8
  Set-Content -LiteralPath $script:StderrLog -Value "" -Encoding UTF8

  Write-Step "Starting the project"
  $process = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev") -WorkingDirectory $script:ProjectRoot -WindowStyle Hidden -RedirectStandardOutput $script:StdoutLog -RedirectStandardError $script:StderrLog -PassThru
  $startedProcessId = $process.Id
  [pscustomobject]@{ processId = $process.Id; startedAt = (Get-Date).ToString("o"); projectRoot = $script:ProjectRoot } |
    ConvertTo-Json | Set-Content -LiteralPath $script:PidFile -Encoding UTF8

  $ready = $false
  for ($attempt = 0; $attempt -lt 60; $attempt += 1) {
    Start-Sleep -Milliseconds 500
    if ($process.HasExited) { break }
    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/student-login" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch { }
  }
  if (-not $ready) {
    $details = if (Test-Path -LiteralPath $script:StderrLog) { (Get-Content -LiteralPath $script:StderrLog -Tail 20) -join "`n" } else { "" }
    throw "The project did not start correctly.`n$details"
  }

  Write-Host "`nProject started:" -ForegroundColor Green
  Write-Host "  This computer: http://127.0.0.1:3000"
  foreach ($address in Get-LanAddresses) { Write-Host "  LAN:           http://${address}:3000" }
} catch {
  if ($startedProcessId) { Stop-ProcessTree $startedProcessId }
  Remove-Item -LiteralPath $script:PidFile -Force -ErrorAction SilentlyContinue
  Write-Error $_.Exception.Message
  exit 1
}
