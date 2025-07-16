#!/bin/bash

# YouTube Audio Downloader Backend Startup Script

echo "🚀 Starting YouTube Audio Downloader Backend..."

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    exit 1
fi

echo "✅ FFmpeg found: $(which ffmpeg)"

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Start the server
echo "🌐 Starting server on port 5001..."
npm start
