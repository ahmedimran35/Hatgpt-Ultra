#!/bin/bash

echo "🚀 HatGPT Ultra - Complete Deployment"
echo "===================================="

# Stop everything first
echo "🛑 Stopping all processes..."
pm2 delete all 2>/dev/null || true
pkill -f node 2>/dev/null || true
sleep 2

# Deploy Server
echo "🔧 Deploying Server..."
cd ~/Hatgpt-Ultra/server
git fetch origin main --prune
git reset --hard origin/main
npm ci
rm -rf dist/
npm run build
pm2 start "node dist/index.js" --name hatgpt-api
echo "✅ Server deployed on port 3000"

# Deploy Client  
echo "🎨 Deploying Client..."
cd ~/Hatgpt-Ultra/client
git fetch origin main --prune
git reset --hard origin/main
npm ci
npm run build
pm2 start "npx serve -s dist -l 80" --name hatgpt-web
echo "✅ Client deployed on port 80"

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check status
echo "📋 Final Status:"
pm2 status

# Test CORS
echo "🧪 Testing CORS..."
curl -s -H "Origin: http://54.37.39.3" -X OPTIONS http://54.37.39.3:3000/api/auth/login > /dev/null && echo "✅ CORS working" || echo "❌ CORS issue"

echo ""
echo "🎉 Deployment Complete!"
echo "🌐 Frontend: http://54.37.39.3"
echo "🔧 Backend: http://54.37.39.3:3000"
echo "📊 Status: pm2 status"
echo "📝 Logs: pm2 logs"
