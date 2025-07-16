#!/bin/bash

# YouTube Audio Downloader - Setup Script
# This script installs all dependencies and prepares the application for use

echo "🎵 YouTube Audio Downloader - Setup Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    print_warning "Please install Node.js v16 or higher from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
print_status "Checking npm installation..."
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed!"
    exit 1
fi

# Check if FFmpeg is installed
print_status "Checking FFmpeg installation..."
if command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n1 | cut -d' ' -f3)
    print_success "FFmpeg is installed: $FFMPEG_VERSION"
else
    print_warning "FFmpeg is not installed!"
    echo ""
    echo "FFmpeg is required for audio conversion. Please install it:"
    echo "• macOS: brew install ffmpeg"
    echo "• Ubuntu: sudo apt install ffmpeg"
    echo "• Windows: Download from https://ffmpeg.org/"
    echo ""
    read -p "Continue setup without FFmpeg? (y/N): " continue_without_ffmpeg
    if [[ ! $continue_without_ffmpeg =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
print_status "Installing frontend dependencies..."
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

echo ""
print_status "Installing backend dependencies..."
cd backend
if npm install; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

echo ""
print_success "Setup completed successfully! 🎉"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend && npm start"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "3. Open your browser to the URL shown by the frontend server"
echo ""
echo "📚 For more information, see README.md"
echo ""
