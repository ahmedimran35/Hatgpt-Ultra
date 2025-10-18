#!/bin/bash

echo "🚀 Restarting HatGPT Ultra..."

# Start frontend first
echo "🎨 Starting frontend..."
cd ~/Hatgpt-Ultra/client
pm2 start "npx serve -s dist -l 80" --name hatgpt-web

# Start backend
echo "🔧 Starting backend..."
cd ~/Hatgpt-Ultra/server
pm2 start "node dist/index.js" --name hatgpt-api

# Wait for both to start
sleep 3

# Check status
echo "📋 Status:"
pm2 status

echo "✅ Both frontend and backend are running!"
echo "🌐 Frontend: http://54.37.39.3"
echo "🔧 Backend: http://54.37.39.3:3000"
