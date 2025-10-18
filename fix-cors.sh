#!/bin/bash

echo "🔧 Fixing CORS issue..."

# Kill all Node processes
echo "🛑 Stopping all Node processes..."
pkill -f node 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to server directory
cd ~/Hatgpt-Ultra/server

# Force clean rebuild
echo "🧹 Cleaning old build..."
rm -rf dist/
rm -rf node_modules/

# Reinstall and rebuild
echo "📦 Reinstalling dependencies..."
npm install

echo "🔨 Building server..."
npm run build

# Check the compiled code
echo "🔍 Checking compiled CORS configuration..."
grep -n "54.37.39.3" dist/index.js

# Start server
echo "🚀 Starting server..."
pm2 start "node dist/index.js" --name hatgpt-api

# Wait for server to start
sleep 3

# Test CORS
echo "🧪 Testing CORS..."
curl -H "Origin: http://54.37.39.3" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://54.37.39.3:3000/api/auth/login -v

echo "✅ CORS fix completed!"
