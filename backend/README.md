# 🎵 YouTube Audio Downloader Backend

High-performance Node.js backend server for processing YouTube audio downloads with optimal quality settings.

![Node.js](https://img.shields.io/badge/Node.js-Latest-green) ![Express](https://img.shields.io/badge/Express-4.x-lightgrey) ![FFmpeg](https://img.shields.io/badge/FFmpeg-Required-red)

## ✨ Features

- **🎵 High-Quality Audio**: 192kbps MP3 output with 44.1kHz sample rate
- **⚡ Fast Processing**: Efficient YouTube audio extraction using @distube/ytdl-core
- **📁 Smart Downloads**: Proper file headers for browser download dialogs
- **🧹 Auto Cleanup**: Temporary files removed after 1 hour
- **🔒 CORS Enabled**: Frontend integration with security headers
- **📊 Progress Tracking**: Real-time download status monitoring
- **🛡️ Error Handling**: Comprehensive validation and error responses

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **FFmpeg** installed and accessible in PATH

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install FFmpeg:**
```bash
# macOS (using Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

4. **Start the server:**
```bash
npm start
```

Server runs on **http://localhost:5001** with health check at `/api/health`

## 📡 API Reference

### Base URL: `http://localhost:5001/api`

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/health` | GET | Health check & server status | None |
| `/video-info` | POST | Get YouTube video metadata | `{ url: string }` |
| `/download` | POST | Process audio download | `{ url: string }` |
| `/download-status/:id` | GET | Check download progress | None |

### File Downloads
| Endpoint | Method | Description | Headers |
|----------|--------|-------------|---------|
| `/downloads/:filename` | GET | Download processed MP3 | `Content-Disposition: attachment` |

## 🔧 API Usage Examples

### Get Video Information
```javascript
const response = await fetch('http://localhost:5001/api/video-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
  })
});

const videoInfo = await response.json();
// Returns: { title, author, lengthSeconds, thumbnails, viewCount }
```

### Start Audio Download
```javascript
const response = await fetch('http://localhost:5001/api/download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
  })
});

const result = await response.json();
// Returns: { downloadId, status: 'processing' }
```

### Check Download Status
```javascript
const response = await fetch(`http://localhost:5001/api/download-status/${downloadId}`);
const status = await response.json();
// Returns: { status: 'completed', filename: 'audio.mp3' } | { status: 'processing' }
```

### Download File
```javascript
// Direct download with proper headers
window.location.href = `http://localhost:5001/downloads/${filename}`;
// Or use fetch for programmatic access
```

## 🛠️ Technical Details

### Audio Processing Pipeline
1. **Extract Audio**: Use ytdl-core to get highest quality audio stream
2. **Convert Format**: FFmpeg converts to MP3 with optimal settings:
   - **Bitrate**: 192kbps (high quality)
   - **Sample Rate**: 44.1kHz (CD quality)
   - **Channels**: Stereo
   - **Codec**: MP3 (universal compatibility)
3. **File Serving**: Express serves with download headers
4. **Auto Cleanup**: Files removed after 1 hour

### Dependencies
```json
{
  "@distube/ytdl-core": "^4.16.12",  // YouTube downloader
  "express": "^4.21.2",              // Web framework
  "fluent-ffmpeg": "^2.1.3",         // Audio conversion
  "cors": "^2.8.5",                  // CORS middleware
  "uuid": "^11.0.5"                  // Unique IDs
}
```

### Error Handling
- **Invalid URLs**: Validates YouTube URL format
- **Private Videos**: Handles access restrictions
- **Network Issues**: Retry mechanisms and timeouts
- **FFmpeg Errors**: Audio conversion error handling
- **File System**: Disk space and permissions checks

## ⚙️ Configuration

### Environment Variables (Optional)
Create `.env` file for custom settings:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174

# Audio Processing
AUDIO_BITRATE=192
AUDIO_FREQUENCY=44100
AUDIO_CHANNELS=2

# File Management
CLEANUP_INTERVAL_MS=3600000    # 1 hour
MAX_FILE_AGE_MS=3600000        # 1 hour
```

### Default Settings
- **Port**: 5001
- **Audio Quality**: 192kbps MP3
- **File Cleanup**: Every hour
- **CORS**: Localhost ports enabled
- **Download Directory**: `./downloads/` (auto-created)

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables (optional)
├── routes/                # API route handlers
│   ├── video.js          # Video info endpoints
│   └── download.js       # Download processing
├── utils/                 # Helper utilities
│   └── youtube.js        # YouTube URL validation
└── downloads/            # Temporary file storage (auto-created)
    └── *.mp3            # Processed audio files
```

## 🔍 Monitoring & Debugging

### Health Check
```bash
curl http://localhost:5001/api/health
# Returns: { status: "OK", message: "...", timestamp: "..." }
```

### Logs & Debug Info
- **Server Startup**: Port, downloads directory, health check URL
- **Download Progress**: Real-time processing status
- **Error Details**: Comprehensive error messages
- **File Cleanup**: Automatic cleanup notifications

### Common Log Messages
```
🚀 YouTube Audio Downloader Backend running on port 5001
📁 Downloads directory: /path/to/downloads
🌐 Health check: http://localhost:5001/api/health
🎵 Starting download for: [Video Title]
✅ Download completed: filename.mp3
🧹 Cleaned up old file: old-audio.mp3
```

## 🐛 Troubleshooting

### FFmpeg Issues
```bash
# Check if FFmpeg is installed
ffmpeg -version

# Install if missing (macOS)
brew install ffmpeg

# Install if missing (Ubuntu)
sudo apt install ffmpeg
```

### Port Conflicts
```bash
# Check what's using port 5001
lsof -ti:5001

# Kill process if needed
lsof -ti:5001 | xargs kill -9
```

### CORS Errors
- Ensure frontend URL is in CORS_ORIGINS
- Check browser network tab for specific errors
- Verify backend is accessible from frontend

### Download Failures
- Verify YouTube URL is valid and public
- Check video has audio tracks
- Ensure sufficient disk space
- Check FFmpeg installation and PATH

## 🚀 Performance

### Optimizations
- **Streaming**: Direct audio stream processing
- **Memory Efficient**: Minimal RAM usage during conversion
- **Auto Cleanup**: Prevents disk space issues
- **Error Recovery**: Graceful handling of failures

### Limitations
- **Rate Limiting**: YouTube may throttle requests
- **File Size**: Large videos may take longer to process
- **Concurrent Downloads**: Limited by system resources

## 📄 License

MIT License - Free for personal and commercial use.

---

**Part of the YouTube Audio Downloader project** - See main README for complete setup instructions.
