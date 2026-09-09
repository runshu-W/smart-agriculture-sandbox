Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$script:RuntimeDirectory = Join-Path $script:ProjectRoot ".runtime"
$script:PidFile = Join-Path $script:RuntimeDirectory "app-process.json"
$script:StdoutLog = Join-Path $script:RuntimeDirectory "app.stdout.log"
$script:StderrLog = Join-Path $script:RuntimeDirectory "app.stderr.log"
$script:DatabaseName = "smart-v2"

function Write-Step([string]$Message) {
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Invoke-ProjectCommand([string]$Command, [string[]]$Arguments) {
  Push-Location $script:ProjectRoot
  try {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
  } finally {
    Pop-Location
  }
}

function Assert-NodeEnvironment {
  if (-not (Get-Command "node" -ErrorAction SilentlyContinue) -or -not (Get-Command "npm.cmd" -ErrorAction SilentlyContinue)) {
    throw "Node.js is missing. Install Node.js 20 LTS or newer from https://nodejs.org/."
  }
  $version = (& node --version).Trim().TrimStart("v")
  if ([int]($version.Split(".")[0]) -lt 20) {
    throw "Node.js $version is too old. Install Node.js 20 or newer."
  }
  Write-Host "Node.js $version"
}

function Get-PrismaDevStatus {
  $helper = Join-Path $PSScriptRoot "prisma-dev-state.mjs"
  Push-Location $script:ProjectRoot
  try {
    $json = & node $helper $script:DatabaseName 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $json) { return $null }
    return ($json | Out-String | ConvertFrom-Json)
  } catch {
    return $null
  } finally {
    Pop-Location
  }
}

function Start-PrismaDev {
  $status = Get-PrismaDevStatus
  if (-not $status -or $status.status -eq "no_such_server") {
    Write-Step "Creating the local development database"
    Invoke-ProjectCommand "npx.cmd" @("prisma", "dev", "--name", $script:DatabaseName, "--detach") | Out-Host
  } elseif ($status.status -ne "running") {
    Write-Step "Starting the local development database"
    Invoke-ProjectCommand "npx.cmd" @("prisma", "dev", "start", $script:DatabaseName) | Out-Host
  }

  for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
    Start-Sleep -Milliseconds 500
    $status = Get-PrismaDevStatus
    if ($status -and $status.status -eq "running" -and $status.databaseUrl) { return $status }
  }
  throw "The local development database did not start."
}

function Stop-PrismaDev {
  $status = Get-PrismaDevStatus
  if ($status -and $status.status -in @("running", "starting_up")) {
    Invoke-ProjectCommand "npx.cmd" @("prisma", "dev", "stop", $script:DatabaseName) | Out-Host
    return $true
  }
  return $false
}

function Set-DatabaseUrl([string]$DatabaseUrl) {
  $envPath = Join-Path $script:ProjectRoot ".env"
  Set-Content -LiteralPath $envPath -Value "DATABASE_URL=`"$DatabaseUrl`"" -Encoding UTF8
}

function Get-LanAddresses {
  @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.AddressState -eq "Preferred" -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
    Select-Object -ExpandProperty IPAddress -Unique)
}

function Get-PortOwner([int]$Port = 3000) {
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
}

function Stop-ProcessTree([int]$RootProcessId) {
  $processes = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
  function Stop-Children([int]$ParentId) {
    foreach ($child in @($processes | Where-Object { $_.ParentProcessId -eq $ParentId })) {
      Stop-Children $child.ProcessId
      Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
  Stop-Children $RootProcessId
  Stop-Process -Id $RootProcessId -Force -ErrorAction SilentlyContinue
}

function Stop-ProjectApplication {
  $stopped = $false
  if (Test-Path -LiteralPath $script:PidFile) {
    try {
      $state = Get-Content -LiteralPath $script:PidFile -Raw -Encoding UTF8 | ConvertFrom-Json
      if (Get-Process -Id ([int]$state.processId) -ErrorAction SilentlyContinue) {
        Stop-ProcessTree ([int]$state.processId)
        $stopped = $true
      }
    } finally {
      Remove-Item -LiteralPath $script:PidFile -Force -ErrorAction SilentlyContinue
    }
  }

  $owner = Get-PortOwner 3000
  if ($owner) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$($owner.OwningProcess)" -ErrorAction SilentlyContinue
    if ($processInfo -and $processInfo.CommandLine -like "*$script:ProjectRoot*") {
      Stop-ProcessTree ([int]$owner.OwningProcess)
      $stopped = $true
    }
  }
  return $stopped
}
