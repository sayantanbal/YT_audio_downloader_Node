# 🎵 YouTube Audio Downloader

A modern, full-stack web application for downloading high-quality audio from YouTube videos. Built with React frontend and Node.js backend.

![App Preview](https://img.shields.io/badge/Status-Read## 🔧 Development

### Quick Development Setup
```bash
npm run dev          # Start both frontend and backend
npm run frontend     # Start only frontend server
npm run backend      # Start only backend server
npm run build        # Build frontend for production
npm run lint         # Check frontend code quality
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

### Backend Development
```bash
cd backend
npm start            # Start backend server
# Backend uses ES modules and runs directly with node
```ghtgreen) ![React](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-Latest-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🎵 High-Quality Audio**: Download 192kbps MP3 files with optimal audio settings
- **🚀 Fast Processing**: Efficient YouTube audio extraction using ytdl-core
- **💫 Real-time Progress**: Live download status and progress tracking
- **🎯 Smart Downloads**: Browser-handled downloads with proper file save dialogs
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🔒 Secure & Private**: All processing happens locally on your server
- **🧹 Auto Cleanup**: Automatic removal of temporary files after 1 hour
- **⚡ Easy Setup**: One-command installation and startup

## 🎬 Demo

1. **Paste YouTube URL** → Video info loads automatically
2. **Click Download** → High-quality MP3 processing begins
3. **Choose Location** → Browser save dialog appears
4. **Enjoy Audio** → Perfect 192kbps MP3 file ready to use

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│  React Frontend │ ◄─────────────► │ Node.js Backend │
│   (Port 5174)   │   API Calls     │   (Port 5001)   │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │ ytdl-core +     │
                                    │ FFmpeg Pipeline │
                                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **FFmpeg** (for audio conversion)
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd YT_audio_downloader_Node
```

2. **Run the setup script (recommended):**
```bash
./setup.sh
```

3. **Start the application:**
```bash
./start.sh
# Or use: npm run dev (starts both frontend and backend)
```

### Manual Setup

If you prefer manual setup:

1. **Install all dependencies:**
```bash
npm run install-all
# Or manually:
# npm install && cd frontend && npm install && cd ../backend && npm install
```

2. **Install FFmpeg:**
```bash
# macOS (using Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg
```

3. **Start the application:**
```bash
# Option 1: Use convenience script
npm run dev

# Option 2: Start manually in separate terminals
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

4. **Open your browser:**
   - Navigate to `http://localhost:5174` (or the port shown in terminal)
   - Backend runs on `http://localhost:5001`

## 🎯 How to Use

1. **Enter YouTube URL**: Paste any valid YouTube video URL in the input field
2. **Automatic Detection**: App automatically validates and fetches video information
3. **Download Audio**: Click the "Download Audio" button to start processing
4. **Wait for Processing**: Watch the real-time progress as your audio is extracted
5. **Save File**: Browser will show save dialog - choose your preferred location
6. **Enjoy**: Your high-quality MP3 file is ready!

### Supported URL Formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

## 📡 API Reference

### Backend Endpoints (Port 5001)

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/health` | GET | Health check | None |
| `/api/video-info` | POST | Get video details | `{ url: string }` |
| `/api/download` | POST | Start audio download | `{ url: string }` |
| `/api/download-status/:id` | GET | Check download status | None |
| `/downloads/:filename` | GET | Download processed file | None |

### Example API Usage

```javascript
// Get video information
const videoInfo = await fetch('http://localhost:5001/api/video-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
});

// Start download
const download = await fetch('http://localhost:5001/api/download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
});
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with latest features
- **Vite** - Lightning-fast build tool and dev server
- **Modern CSS** - Custom styling with gradients and animations
- **Fetch API** - Native HTTP requests

### Backend
- **Node.js** - JavaScript runtime with ES modules
- **Express.js** - Minimal web framework
- **@distube/ytdl-core v4.16.12** - Reliable YouTube downloader
- **fluent-ffmpeg** - Audio conversion and processing
- **CORS** - Cross-origin resource sharing

### Audio Processing
- **192kbps MP3** - High-quality audio output
- **44.1kHz Sample Rate** - CD-quality audio
- **Stereo Channels** - Full audio experience
- **Smart Format Selection** - Automatically picks best audio source

## 📁 Project Structure

```
YT_audio_downloader_Node/
├── README.md                 # Project documentation
├── DEVELOPMENT.md            # Developer guide
├── FINAL_SUMMARY.md          # Project summary
├── setup.sh                 # Setup script
├── start.sh                 # Start script
├── package.json             # Root package with workspace config
├── frontend/                # Frontend application
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── eslint.config.js    # ESLint rules
│   ├── index.html          # Main HTML entry point
│   ├── src/                # Frontend source code
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Application styles
│   │   ├── main.jsx       # React entry point
│   │   ├── index.css      # Global styles
│   │   ├── services/
│   │   │   └── api.js     # API service layer
│   │   ├── utils/
│   │   │   └── youtube.js # YouTube URL utilities
│   │   └── assets/        # Static assets
│   └── public/            # Static public files
│       └── vite.svg
├── backend/               # Backend source code
│   ├── server.js         # Express server
│   ├── package.json      # Backend dependencies
│   ├── routes/           # API route handlers
│   │   ├── video.js     # Video info routes
│   │   └── download.js  # Download processing routes
│   ├── utils/           # Backend utilities
│   │   └── youtube.js   # YouTube processing helpers
│   └── downloads/       # Temporary file storage (auto-created)
```

## ⚙️ Configuration

### Backend Environment (Optional)
Create `backend/.env` for custom settings:
```env
PORT=5001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

### Audio Quality Settings
The app is configured for optimal quality:
- **Bitrate**: 192kbps (high quality)
- **Sample Rate**: 44.1kHz (CD quality)
- **Channels**: Stereo
- **Format**: MP3 (universal compatibility)

## � Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

### Backend Development
```bash
cd backend
npm start            # Start backend server
# Backend uses ES modules and runs directly with node
```

### Key Development Features
- **Hot Reload**: Frontend auto-reloads on changes
- **Error Handling**: Comprehensive error messages
- **Progress Tracking**: Real-time download status
- **Auto Cleanup**: Temporary files removed automatically

## 🐛 Troubleshooting

### Common Issues & Solutions

**1. "Backend service is offline"**
```bash
# Check if backend is running
cd backend && npm start
# Backend should start on port 5001
```

**2. "FFmpeg not found" or audio conversion fails**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

**3. Downloads open in browser instead of saving**
- ✅ **Fixed in current version** - files now properly trigger save dialogs

**4. Port conflicts**
```bash
# If port 5001 is busy
lsof -ti:5001 | xargs kill -9

# If port 5174 is busy
# Vite will automatically try the next available port
```

**5. CORS errors**
- Ensure backend is running on port 5001
- Check browser console for specific error messages
- Verify frontend is accessing correct backend URL

### Debug Information
- **Frontend**: Open browser Developer Tools → Console
- **Backend**: Check terminal output where `npm start` was run
- **Downloads**: Check `backend/downloads/` directory for temp files

## � Production Deployment

### Build for Production
```bash
# Build frontend
cd frontend && npm run build
# Or from root: npm run build

# The built files will be in the 'frontend/dist' directory
# Serve these files with any web server (nginx, Apache, etc.)
```

### Environment Setup
- Set `NODE_ENV=production` in backend
- Configure proper CORS origins for your domain
- Set up reverse proxy (nginx) for better performance
- Consider using PM2 for backend process management

## 📝 Recent Updates

### Latest Version Features:
- ✅ **Fixed Download Behavior** - Files now properly save instead of opening in browser
- ✅ **Improved Audio Quality** - 192kbps MP3 with optimized settings
- ✅ **Enhanced Error Handling** - Better user feedback for all scenarios
- ✅ **Simplified UI** - Removed unnecessary options, streamlined experience
- ✅ **Browser Compatibility** - Works consistently across all modern browsers

## 👨‍💻 For Developers

Interested in contributing or understanding how the project works?

📖 **[Read the Development Guide](DEVELOPMENT.md)** - Comprehensive guide covering:
- Architecture deep dive
- Code structure explanation
- Development workflow
- Debugging techniques
- Performance optimization
- Security considerations
- Future roadmap

## 📄 License

MIT License - Free to use for personal and commercial projects.

## ⚖️ Legal Notice

**Important**: This tool is for educational and personal use only. Please respect:
- YouTube's Terms of Service
- Copyright laws and content creator rights
- Only download content you have permission to use
- Consider supporting creators through official channels

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ for the open-source community. Star ⭐ this repo if you find it useful!
