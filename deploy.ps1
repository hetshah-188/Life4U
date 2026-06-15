Set-Location "Z:\Het shah\DE sem-6\Life4U\FINAL-mongodb-to-sql-migration\frontend-react"
Write-Host "[1/3] Installing gh-pages..." -ForegroundColor Cyan
npm install --save-dev gh-pages
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Install failed" -ForegroundColor Red; exit 1 }

Write-Host "[2/3] Building production bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Build failed" -ForegroundColor Red; exit 1 }

Write-Host "[3/3] Deploying to GitHub Pages..." -ForegroundColor Cyan
npx gh-pages -d dist
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Deploy failed" -ForegroundColor Red; exit 1 }

Write-Host "Deployment complete! Site: https://life4u.me" -ForegroundColor Green
