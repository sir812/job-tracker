Param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "Staging changes..."
git add .

Write-Host "Committing with message: $Message"
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
  Write-Host "Commit failed (exit $LASTEXITCODE)" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Commit successful"
