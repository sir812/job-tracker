Set-StrictMode -Version Latest
Write-Host "Checking for docker..."
try {
  docker --version | Out-Null
} catch {
  Write-Host "Docker not found. Install Docker Desktop or use CI images." -ForegroundColor Yellow
  exit 1
}

Write-Host "Building docker-compose images..."
docker compose build

if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker compose build failed (exit $LASTEXITCODE)" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Docker compose build completed"
