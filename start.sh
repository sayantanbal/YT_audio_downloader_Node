#!/bin/bash

# YouTube Audio Downloader - Start Script
# This script starts both frontend and backend servers

echo "🎵 YouTube Audio Downloader"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[NOTE]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "backend" ]]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

print_info "Checking if servers are already running..."

# Check if backend is running
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null; then
    print_warning "Backend server is already running on port 5001"
else
    print_info "Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    print_success "Backend server started (PID: $BACKEND_PID)"
fi

# Wait a moment for backend to start
sleep 2

# Check if frontend is running on common ports
FRONTEND_RUNNING=false
for port in 5173 5174 3000; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        print_warning "Frontend server is already running on port $port"
        FRONTEND_RUNNING=true
        break
    fi
done

if [[ "$FRONTEND_RUNNING" == false ]]; then
    print_info "Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    print_success "Frontend server started (PID: $FRONTEND_PID)"
fi

echo ""
print_success "Application is starting up!"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5174 (or next available port)"
echo "🔧 Backend API running at: http://localhost:5001"
echo "❤️  Health check: http://localhost:5001/api/health"
echo ""
print_warning "Keep this terminal open to see server logs"
print_warning "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop the servers
wait
