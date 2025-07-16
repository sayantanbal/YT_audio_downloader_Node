#!/bin/bash

# Test script for YouTube Audio Downloader API

echo "🧪 Testing YouTube Audio Downloader API"
echo "======================================"

API_BASE="http://localhost:5001/api"
TEST_VIDEO="https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll - public domain

# Check if backend is running
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/health")
if [[ $? -eq 0 ]]; then
    echo "✅ Backend is running"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend is not running. Please start it first:"
    echo "   cd backend && npm start"
    exit 1
fi

echo ""
echo "2. Testing video info endpoint..."
VIDEO_INFO_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$TEST_VIDEO\"}" \
    "$API_BASE/video-info")

if [[ $? -eq 0 ]] && [[ $VIDEO_INFO_RESPONSE == *"title"* ]]; then
    echo "✅ Video info endpoint working"
    echo "   Title found in response"
else
    echo "❌ Video info endpoint failed"
    echo "   Response: $VIDEO_INFO_RESPONSE"
fi

echo ""
echo "3. Testing video check endpoint..."
CHECK_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$TEST_VIDEO\"}" \
    "$API_BASE/check-video")

if [[ $? -eq 0 ]] && [[ $CHECK_RESPONSE == *"isDownloadable"* ]]; then
    echo "✅ Video check endpoint working"
    echo "   Downloadability check successful"
else
    echo "❌ Video check endpoint failed"
    echo "   Response: $CHECK_RESPONSE"
fi

echo ""
echo "4. Testing invalid URL handling..."
INVALID_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"not-a-youtube-url\"}" \
    "$API_BASE/video-info")

if [[ $INVALID_RESPONSE == *"error"* ]]; then
    echo "✅ Invalid URL handling working"
    echo "   Error response returned as expected"
else
    echo "❌ Invalid URL handling failed"
    echo "   Response: $INVALID_RESPONSE"
fi

echo ""
echo "🎉 API testing complete!"
echo ""
echo "📝 To test the full download functionality:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Paste a YouTube URL"
echo "   3. Click 'Get Video Info' and then 'Download Audio'"
