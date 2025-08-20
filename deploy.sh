#!/bin/bash

# Zantri Admin Panel Deployment Script
# This script automates the deployment process to GitHub Pages

echo "🚀 Starting Zantri Admin Panel Deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the admin-panel directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy: Update admin panel for GitHub Pages"

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/zantri-admin-panel.git"
    echo "   Then run this script again."
    exit 1
fi

# Push to main branch
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your admin panel will be available at:"
echo "   https://yourusername.github.io/zantri-admin-panel/"
echo ""
echo "📝 Don't forget to:"
echo "   1. Configure Firebase security rules"
echo "   2. Add your domain to Firebase authorized domains"
echo "   3. Test the admin login with admin@gmail.com"
