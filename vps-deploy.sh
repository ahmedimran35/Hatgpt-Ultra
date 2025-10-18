#!/bin/bash

# Simple HatGPT Ultra Deployment Script for VPS
# Copy this script to your VPS and run it

echo "🚀 Deploying HatGPT Ultra..."

# Deploy Server
echo "🔧 Deploying Server..."
cd ~/Hatgpt-Ultra/server
git fetch origin main --prune
git reset --hard origin/main
npm ci
rm -rf dist/
npm run build
pm2 delete hatgpt-api 2>/dev/null || true
pm2 start "node dist/index.js" --name hatgpt-api
echo "✅ Server deployed on port 3000"

# Deploy Client
echo "🎨 Deploying Client..."
cd ~/Hatgpt-Ultra/client
git fetch origin main --prune
git reset --hard origin/main
npm ci
npm run build
pm2 delete hatgpt-web 2>/dev/null || true
pm2 start "npx serve -s dist -l 80" --name hatgpt-web
echo "✅ Client deployed on port 80"

# Check Status
echo "📋 Deployment Status:"
pm2 status

# Test CORS
echo "🔍 Testing CORS..."
sleep 2
curl -s -H "Origin: http://54.37.39.3" -X OPTIONS http://54.37.39.3:3000/api/auth/login > /dev/null && echo "✅ CORS working" || echo "❌ CORS issue"

echo "🎉 Deployment completed!"
echo "🌐 Your app is available at: http://54.37.39.3"
