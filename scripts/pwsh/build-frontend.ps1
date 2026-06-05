Set-StrictMode -Version Latest
Write-Host "Installing frontend deps..."
npm ci

Write-Host "Building frontend..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed (exit $LASTEXITCODE)" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Frontend build completed"
