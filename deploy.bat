@echo off
REM Zantri Admin Panel Deployment Script for Windows
REM This script automates the deployment process to GitHub Pages

echo 🚀 Starting Zantri Admin Panel Deployment...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the admin-panel directory.
    pause
    exit /b 1
)

REM Check if git is initialized
if not exist ".git" (
    echo 📝 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
)

REM Add all files
echo 📁 Adding files to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Deploy: Update admin panel for GitHub Pages"

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  No remote origin found. Please add your GitHub repository:
    echo    git remote add origin https://github.com/yourusername/zantri-admin-panel.git
    echo    Then run this script again.
    pause
    exit /b 1
)

REM Push to main branch
echo 📤 Pushing to GitHub...
git push origin main

REM Deploy to GitHub Pages
echo 🌐 Deploying to GitHub Pages...
npm run deploy

echo ✅ Deployment complete!
echo.
echo 🎉 Your admin panel will be available at:
echo    https://yourusername.github.io/zantri-admin-panel/
echo.
echo 📝 Don't forget to:
echo    1. Configure Firebase security rules
echo    2. Add your domain to Firebase authorized domains
echo    3. Test the admin login with admin@gmail.com

pause
