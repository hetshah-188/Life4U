@echo off
echo ========================================
echo  Life4U - GitHub Pages Deployment Script
echo ========================================
echo.

cd /d "Z:\Het shah\DE sem-6\Life4U\FINAL-mongodb-to-sql-migration\frontend-react"

echo [1/3] Installing gh-pages...
call npm install --save-dev gh-pages
if %errorlevel% neq 0 (
    echo ERROR: Failed to install gh-pages
    exit /b 1
)

echo.
echo [2/3] Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    exit /b 1
)

echo.
echo [3/3] Deploying to GitHub Pages (gh-pages branch)...
call npm run deploy
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    exit /b 1
)

echo.
echo ========================================
echo  Deployment complete!
echo  Your site will be live at: https://life4u.me
echo ========================================
echo.
