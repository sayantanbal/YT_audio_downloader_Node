#!/bin/bash

# YouTube Audio Downloader - Complete Setup and Start Script

echo "🎵 YouTube Audio Downloader - Setup & Start"
echo "==========================================="

PROJECT_ROOT="/Users/sayantanbal/Desktop/Fun Projects/YT_audio_downloader_Node"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists ffmpeg; then
    echo "❌ FFmpeg is not installed. Installing via Homebrew..."
    if command_exists brew; then
        brew install ffmpeg
    else
        echo "❌ Homebrew not found. Please install FFmpeg manually:"
        echo "   Visit: https://ffmpeg.org/download.html"
        exit 1
    fi
fi

echo "✅ All prerequisites satisfied"

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
fi

# Setup frontend
echo ""
echo "🔧 Setting up frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start services
echo ""
echo "🚀 Starting services..."

# Start backend
echo "🌐 Starting backend server (port 5001)..."
cd "$BACKEND_DIR"
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🖥️  Starting frontend development server (port 5173)..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Services running:"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:5173"
echo "   Health:   http://localhost:5001/api/health"
echo ""
echo "📝 To stop the services:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Or use: pkill -f 'node.*server.js' && pkill -f 'vite'"
echo ""
echo "🎵 Your YouTube Audio Downloader is ready!"

# Keep script running
wait
