Set-StrictMode -Version Latest
Write-Host "Installing backend deps..."
Push-Location backend
npm ci

Write-Host "Running backend tests..."
$env:NODE_ENV = 'test'

Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "Running tests..."
npm test
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -ne 0) {
  Write-Host "Backend tests failed (exit $exitCode)" -ForegroundColor Red
  exit $exitCode
}

Write-Host "Backend tests passed"
