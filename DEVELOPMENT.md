# 🛠️ Development Guide

This guide provides detailed information for developers who want to contribute to or modify the YouTube Audio Downloader project.

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  ┌─────────────────┐                                       │
│  │  React Frontend │                                       │
│  │   (Port 5174)   │                                       │
│  └─────────────────┘                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/JSON API Calls
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Node.js Backend                           │
│                   (Port 5001)                              │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   Express.js    │  │   ytdl-core     │                │
│  │   Web Server    │  │   YouTube API   │                │
│  └─────────────────┘  └─────────────────┘                │
│              │                   │                        │
│              │                   │                        │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │    FFmpeg       │  │  File System    │                │
│  │ Audio Converter │  │   Management    │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **URL Input**: User enters YouTube URL in React frontend
2. **Validation**: Frontend validates URL format using regex
3. **Video Info**: Backend fetches metadata using ytdl-core
4. **Download Request**: Frontend sends download request
5. **Audio Extraction**: Backend extracts highest quality audio stream
6. **Format Conversion**: FFmpeg converts to 192kbps MP3
7. **File Serving**: Express serves file with download headers
8. **Browser Download**: User gets proper save dialog

## 🔧 Development Environment Setup

### Prerequisites
- Node.js v16+ (recommended: v18 or v20)
- npm v8+
- FFmpeg (system installation)
- Git
- Modern code editor (VS Code recommended)

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-vscode.nodejs-extension-pack"
  ]
}
```

### Project Setup
```bash
# Clone repository
git clone <repo-url>
cd youtube-audio-downloader

# Run setup script
./setup.sh

# Or manual setup:
npm install
cd backend && npm install && cd ..
```

## 📁 Detailed Project Structure

```
youtube-audio-downloader/
├── README.md                    # Main project documentation
├── setup.sh                    # Automated setup script
├── start.sh                    # Development startup script
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite build configuration
├── eslint.config.js            # ESLint rules
├── index.html                  # Main HTML entry point
│
├── src/                        # Frontend source code
│   ├── main.jsx                # React application entry
│   ├── App.jsx                 # Main React component
│   ├── App.css                 # Application styles
│   ├── index.css               # Global CSS styles
│   │
│   ├── services/               # API service layer
│   │   └── api.js              # Backend communication
│   │
│   ├── utils/                  # Frontend utilities
│   │   └── youtube.js          # URL validation & parsing
│   │
│   └── assets/                 # Static assets
│       └── react.svg
│
├── backend/                    # Backend source code
│   ├── README.md               # Backend-specific docs
│   ├── server.js               # Express server main file
│   ├── package.json            # Backend dependencies
│   │
│   ├── routes/                 # API route handlers
│   │   ├── video.js            # Video info endpoints
│   │   └── download.js         # Download processing
│   │
│   ├── utils/                  # Backend utilities
│   │   └── youtube.js          # YouTube helpers
│   │
│   └── downloads/              # Temporary file storage
│       └── (auto-generated)    # Processed MP3 files
│
└── public/                     # Static public files
    └── vite.svg                # Vite logo
```

## 🔍 Code Architecture

### Frontend Architecture (React)

#### Components Structure
```jsx
App.jsx (Main Component)
├── Header Section
├── Status Indicators
├── URL Input Section
├── Download Button
├── Progress Display
├── Video Information
└── Feature List
```

#### State Management
```javascript
// Main application state
const [url, setUrl] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [videoInfo, setVideoInfo] = useState(null)
const [downloadProgress, setDownloadProgress] = useState(0)
const [isValidUrl, setIsValidUrl] = useState(false)
const [downloadId, setDownloadId] = useState(null)
const [backendStatus, setBackendStatus] = useState('checking')
```

#### API Service Layer
```javascript
// services/api.js - Centralized API communication
class YouTubeAPIService {
  // Health checks
  checkHealth()
  
  // Video operations
  getVideoInfo(url)
  
  // Download operations
  startDownload(url)
  getDownloadStatus(downloadId)
  downloadFile(filename)
  
  // Utilities
  pollDownloadStatus(downloadId, onProgress)
}
```

### Backend Architecture (Node.js/Express)

#### Route Structure
```
/api/
├── health              (GET)    # Server health check
├── video-info          (POST)   # Get YouTube video metadata
├── download            (POST)   # Start download process
├── download-status/:id (GET)    # Check download progress
└── /downloads/:filename (GET)   # Serve processed files
```

#### Request/Response Flow
```javascript
// Typical download flow
POST /api/download { url: "..." }
  ↓
YouTube URL validation
  ↓
ytdl-core audio extraction
  ↓
FFmpeg MP3 conversion
  ↓
File storage with unique ID
  ↓
Response: { downloadId, status: "processing" }

// Status checking
GET /api/download-status/:id
  ↓
File system check
  ↓
Response: { status: "completed", filename: "..." }
```

## 🧩 Key Components Deep Dive

### Frontend Components

#### URL Validation (`utils/youtube.js`)
```javascript
export const validateYouTubeUrl = (url) => {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url));
};

export const extractVideoId = (url) => {
  // Extract video ID from various YouTube URL formats
};
```

#### API Service (`services/api.js`)
```javascript
class YouTubeAPIService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api';
  }

  async makeRequest(endpoint, options = {}) {
    // Centralized HTTP request handling
    // Error handling and response parsing
  }

  async downloadFile(filename) {
    // Blob-based download for proper file saving
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    // Trigger browser download
  }
}
```

### Backend Components

#### Video Processing (`routes/download.js`)
```javascript
export const downloadAudio = async (req, res) => {
  try {
    // 1. Validate YouTube URL
    const { url } = req.body;
    
    // 2. Extract video info
    const info = await ytdl.getInfo(url);
    
    // 3. Select best audio format
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const format = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
    
    // 4. Create unique filename
    const downloadId = uuidv4();
    const filename = `${downloadId}.mp3`;
    
    // 5. Setup FFmpeg conversion
    ffmpeg(ytdl(url, { format }))
      .audioBitrate(192)
      .audioFrequency(44100)
      .audioChannels(2)
      .format('mp3')
      .save(outputPath);
      
  } catch (error) {
    // Error handling
  }
};
```

#### File Serving (`server.js`)
```javascript
// Custom download endpoint with proper headers
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(downloadsDir, filename);
  
  // Force download with proper headers
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  res.sendFile(filePath);
});
```

## 🔧 Development Workflow

### Starting Development
```bash
# Terminal 1 - Backend with auto-reload
cd backend
npm run dev  # Uses nodemon for auto-restart

# Terminal 2 - Frontend with hot reload
npm run dev  # Vite dev server
```

### Code Quality
```bash
# Lint frontend code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Workflow
1. **Unit Testing**: Test individual functions
2. **Integration Testing**: Test API endpoints
3. **E2E Testing**: Full user workflow
4. **Performance Testing**: Download speed and memory usage

## 🐛 Debugging Guide

### Frontend Debugging
```javascript
// Enable debug logging
console.log('API Response:', response);

// Browser DevTools
// - Network tab for API calls
// - Console for JavaScript errors
// - Application tab for localStorage/sessionStorage
```

### Backend Debugging
```javascript
// Add debug logging
console.log('Download started for:', videoTitle);
console.log('FFmpeg progress:', progress);

// Common debug points
// - URL validation
// - ytdl-core format selection
// - FFmpeg conversion process
// - File system operations
```

### Common Issues & Solutions

#### "FFmpeg not found"
```bash
# Check FFmpeg installation
which ffmpeg
ffmpeg -version

# Install if missing
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Ubuntu
```

#### "CORS Policy Error"
```javascript
// Check backend CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

#### "Download Opens in Browser"
```javascript
// Ensure proper headers in backend
res.setHeader('Content-Disposition', 'attachment; filename="file.mp3"');
res.setHeader('Content-Type', 'application/octet-stream');

// Frontend blob download
const blob = await response.blob();
const url = URL.createObjectURL(blob);
// Trigger download
```

## 🚀 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy load components
- **Bundle Analysis**: Use `npm run build` and analyze output
- **Asset Optimization**: Compress images and resources
- **Caching**: Implement service worker for offline support

### Backend Optimizations
- **Streaming**: Direct stream processing (no temp files)
- **Connection Pooling**: Reuse HTTP connections
- **Memory Management**: Monitor RAM usage during conversion
- **Concurrent Downloads**: Limit simultaneous processing

### Audio Quality Settings
```javascript
// Optimized FFmpeg settings
.audioBitrate(192)        // High quality without bloat
.audioFrequency(44100)    // CD quality sample rate
.audioChannels(2)         // Stereo output
.audioCodec('libmp3lame') // Best MP3 encoder
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Download success rate
- Average processing time
- Error rates by error type
- Popular video formats
- Server resource usage

### Logging Strategy
```javascript
// Structured logging
const logDownload = {
  timestamp: new Date().toISOString(),
  videoId: extractVideoId(url),
  duration: processingTime,
  fileSize: finalFileSize,
  status: 'completed'
};
```

## 🔐 Security Considerations

### Input Validation
```javascript
// Strict URL validation
const isValidYouTubeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['youtube.com', 'youtu.be'].includes(urlObj.hostname);
  } catch {
    return false;
  }
};
```

### Rate Limiting
```javascript
// Prevent abuse
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});
```

### File System Security
```javascript
// Prevent path traversal
const safePath = path.resolve(downloadsDir, filename);
if (!safePath.startsWith(downloadsDir)) {
  throw new Error('Invalid file path');
}
```

## 📝 Contributing Guidelines

### Code Style
- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add JSDoc comments for functions

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Update documentation
5. Submit pull request with detailed description

### Commit Message Format
```
type(scope): brief description

- Detailed explanation of changes
- Why the change was made
- Any breaking changes

Closes #issue-number
```

## 🔮 Future Enhancements

### Planned Features
- **Multiple Formats**: Support for FLAC, WAV, OGG
- **Playlist Support**: Download entire YouTube playlists
- **Quality Options**: User-selectable audio quality
- **Batch Processing**: Multiple URLs at once
- **Progress Notifications**: Real-time download updates
- **User Accounts**: Save download history
- **Dark Mode**: UI theme switching

### Technical Improvements
- **TypeScript Migration**: Better type safety
- **Test Coverage**: Comprehensive test suite
- **Docker Support**: Containerized deployment
- **Database Integration**: Store download metadata
- **Caching Layer**: Redis for performance
- **Microservices**: Split into smaller services

---

**Happy Coding! 🚀** This guide should help you understand and contribute to the YouTube Audio Downloader project.
