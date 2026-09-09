. (Join-Path $PSScriptRoot "common.ps1")

try {
  Write-Step "Checking packaging tools"
  if (-not (Get-Command "tar.exe" -ErrorAction SilentlyContinue)) {
    throw "Windows tar.exe is missing. Use Windows 10/11 or install bsdtar."
  }

  $outputDirectory = Join-Path $script:ProjectRoot ".packages"
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $archiveName = "smart_v2-development-$timestamp.zip"
  $archivePath = Join-Path $outputDirectory $archiveName
  if (Test-Path -LiteralPath $archivePath) {
    $archiveName = "smart_v2-development-$timestamp-$([guid]::NewGuid().ToString('N').Substring(0, 6)).zip"
    $archivePath = Join-Path $outputDirectory $archiveName
  }

  $includedPaths = @(
    "AGENTS.md",
    "README.md",
    ".env.example",
    ".gitignore",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next-env.d.ts",
    "next.config.ts",
    "prisma.config.ts",
    "eslint.config.mjs",
    "playwright.config.ts",
    "vitest.config.ts",
    "app",
    "components",
    "docs",
    "e2e",
    "lib",
    "prisma",
    "public",
    "scripts",
    "tests",
    "tools"
  )
  $missing = @($includedPaths | Where-Object { -not (Test-Path -LiteralPath (Join-Path $script:ProjectRoot $_)) })
  if ($missing.Count) { throw "Required packaging paths are missing: $($missing -join ', ')" }

  Write-Step "Creating development package"
  Push-Location $script:ProjectRoot
  try {
    $tarArguments = @(
      "-a", "-c", "-f", $archivePath,
      "--exclude=*/.DS_Store",
      "--exclude=public/assets/*/source",
      "--exclude=public/assets/*/source/*"
    ) + $includedPaths
    & tar.exe @tarArguments
    if ($LASTEXITCODE -ne 0) { throw "tar.exe failed with exit code $LASTEXITCODE." }
  } finally {
    Pop-Location
  }

  Write-Step "Validating package contents"
  $entries = @(& tar.exe -tf $archivePath)
  if ($LASTEXITCODE -ne 0 -or -not $entries.Count) { throw "The package could not be read after creation." }
  $forbidden = @($entries | Where-Object {
    $_ -match "(^|/)(\.git|node_modules|\.next|\.runtime|\.packages|generated|artifacts|test-results|playwright-report|coverage|tmp)(/|$)" -or
    ($_ -match "(^|/)\.env($|\.)" -and $_ -notmatch "(^|/)\.env\.example$") -or
    $_ -match "(^|/)\.DS_Store$" -or
    $_ -match "\.log$|\.tsbuildinfo$"
  })
  if ($forbidden.Count) { throw "Forbidden files were found in the package: $($forbidden -join ', ')" }

  $requiredEntries = @(
    "README.md",
    "package.json",
    "package-lock.json",
    ".env.example",
    "prisma/schema.prisma",
    "prisma/seed.ts",
    "tools/windows/install.cmd",
    "tools/windows/start.cmd",
    "tools/windows/stop.cmd",
    "public/assets/"
  )
  $missingEntries = @($requiredEntries | Where-Object { $_ -notin $entries })
  if ($missingEntries.Count) { throw "Package validation failed; missing: $($missingEntries -join ', ')" }

  $hash = Get-FileHash -LiteralPath $archivePath -Algorithm SHA256
  $hashPath = "$archivePath.sha256"
  Set-Content -LiteralPath $hashPath -Value "$($hash.Hash)  $archiveName" -Encoding ASCII
  $size = [math]::Round((Get-Item -LiteralPath $archivePath).Length / 1MB, 2)

  Write-Host "`nPackage completed:" -ForegroundColor Green
  Write-Host "  File:   $archivePath"
  Write-Host "  Size:   $size MB"
  Write-Host "  SHA256: $($hash.Hash)"
  Write-Host "  Check:  $hashPath"
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
