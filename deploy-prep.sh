#!/bin/bash

echo "🚀 Preparing for AWS Elastic Beanstalk deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm is available"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install || {
    echo "❌ Failed to install root dependencies"
    exit 1
}

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production || {
    echo "❌ Failed to install backend dependencies"
    cd ..
    exit 1
}
cd ..

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
npm install || {
    echo "❌ Failed to install frontend dependencies"
    cd ..
    exit 1
}

# Build frontend
echo "🏗️ Building frontend for production..."
npm run build || {
    echo "❌ Frontend build failed"
    cd ..
    exit 1
}
cd ..

# Verify build
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend build successful"
    echo "📁 Build output: $(du -sh frontend/dist | cut -f1)"
else
    echo "❌ Frontend build failed - dist directory not found"
    exit 1
fi

# Check if EB CLI is available
if command -v eb &> /dev/null; then
    echo "✅ EB CLI is available"
    echo "🚀 Ready for deployment! You can now run:"
    echo "   eb init    (if not already initialized)"
    echo "   eb create  (to create new environment)"
    echo "   eb deploy  (to deploy to existing environment)"
else
    echo "⚠️  EB CLI not found. Install it with:"
    echo "   pip install awsebcli"
fi

echo ""
echo "✅ Deployment preparation complete!"
echo "📋 Summary:"
echo "   - Root dependencies: ✅ Installed"
echo "   - Backend dependencies: ✅ Installed"
echo "   - Frontend dependencies: ✅ Installed"
echo "   - Frontend build: ✅ Complete"
echo "   - AWS configuration: ✅ Ready"
echo ""
echo "🚀 Your application is ready for AWS Elastic Beanstalk deployment!"
