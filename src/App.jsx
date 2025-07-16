import { useState, useEffect } from 'react'
import './App.css'
import { extractVideoId, validateYouTubeUrl } from './utils/youtube'
import { youtubeAPI } from './services/api'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [downloadId, setDownloadId] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking')

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const health = await youtubeAPI.checkHealth()
      setBackendStatus(health.success ? 'online' : 'offline')
    } catch (error) {
      setBackendStatus('offline')
    }
  }

  const downloadAudio = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      setError('Invalid YouTube URL. Please check the URL and try again.')
      return
    }

    if (backendStatus === 'offline') {
      setError('Backend service is unavailable. Please try again later.')
      return
    }

    setLoading(true)
    setError('')
    setDownloadProgress(0)
    setDownloadId(null)

    try {
      // First get video info
      console.log('Getting video info for:', url)
      const videoData = await youtubeAPI.getVideoInfo(url)
      
      if (videoData) {
        setVideoInfo({
          title: videoData.title,
          author: videoData.author,
          duration: videoData.lengthSeconds,
          thumbnail: videoData.thumbnails?.[0]?.url || '',
          viewCount: videoData.viewCount
        })

        // Start the download
        console.log('Starting download...')
        const downloadResult = await youtubeAPI.startDownload(url, 'mp3', 'highest')
        
        if (downloadResult && downloadResult.downloadId) {
          setDownloadId(downloadResult.downloadId)
          setDownloadProgress(25)
          
          // Poll for download status
          try {
            const result = await youtubeAPI.pollDownloadStatus(
              downloadResult.downloadId,
              (progress) => setDownloadProgress(progress)
            )
            
            if (result.status === 'completed' && result.filename) {
              setDownloadProgress(100)
              // Trigger browser download
              setTimeout(async () => {
                try {
                  const downloadResult = await youtubeAPI.downloadFile(result.filename)
                  console.log('Download completed:', downloadResult)
                } catch (downloadError) {
                  console.error('Download error:', downloadError)
                  setError(downloadError.message || 'Failed to download file')
                }
              }, 1000)
            }
          } catch (pollError) {
            console.error('Download polling error:', pollError)
            setError('Download failed during processing. Please try again.')
          }
        } else {
          throw new Error(downloadResult?.error || 'Failed to start download')
        }
      } else {
        throw new Error('Failed to get video information')
      }

    } catch (error) {
      console.error('Download error:', error)
      setError(error.message || 'Failed to download audio. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setError('')
    setIsValidUrl(validateYouTubeUrl(newUrl))
  }

  const clearInput = () => {
    setUrl('')
    setError('')
    setVideoInfo(null)
    setDownloadProgress(0)
    setIsValidUrl(false)
    setDownloadId(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && isValidUrl && backendStatus === 'online') {
      downloadAudio()
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatViewCount = (count) => {
    if (!count) return ''
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`
    }
    return `${count} views`
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🎵 YouTube Audio Downloader</h1>
          <p>Download audio from YouTube videos easily and safely</p>
          <div className={`backend-status ${backendStatus}`}>
            <span className="status-indicator"></span>
            Backend: {backendStatus === 'online' ? '🟢 Online' : backendStatus === 'offline' ? '🔴 Offline' : '🟡 Checking...'}
          </div>
        </header>

        <div className="main-content">
          <div className="input-section">
            <div className="input-wrapper">
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                onKeyPress={handleKeyPress}
                placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
                className={`url-input ${isValidUrl ? 'valid' : ''} ${error ? 'error' : ''}`}
                disabled={loading || backendStatus !== 'online'}
              />
              {url && (
                <button 
                  className="clear-btn"
                  onClick={clearInput}
                  disabled={loading}
                  aria-label="Clear input"
                >
                  ×
                </button>
              )}
            </div>
            <button 
              onClick={downloadAudio}
              disabled={loading || !isValidUrl || backendStatus !== 'online'}
              className="download-btn"
            >
              {loading ? '🔄 Processing...' : '⬇️ Download Audio'}
            </button>
          </div>

          {backendStatus === 'offline' && (
            <div className="error-message">
              <span>⚠️ Backend service is offline. Please start the Node.js backend server first.</span>
              <button onClick={checkBackendHealth} className="retry-btn">
                🔄 Retry Connection
              </button>
            </div>
          )}

          {error && backendStatus === 'online' && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          {loading && videoInfo && (
            <div className="video-info">
              <img src={videoInfo.thumbnail} alt="Video thumbnail" className="thumbnail" />
              <div className="info">
                <h3>{videoInfo.title}</h3>
                <p>by {videoInfo.author}</p>
                <div className="video-meta">
                  {videoInfo.duration && (
                    <span className="meta-item">⏱️ {formatDuration(videoInfo.duration)}</span>
                  )}
                  {videoInfo.viewCount && (
                    <span className="meta-item">👀 {formatViewCount(videoInfo.viewCount)}</span>
                  )}
                </div>
                <div className="status">
                  <span className="status-badge">📹 Video found</span>
                </div>
              </div>
            </div>
          )}

          {downloadProgress > 0 && (
            <div className="progress-section">
              <div className="progress-label">
                {downloadProgress < 100 ? 
                  `🎵 Processing audio... ${Math.round(downloadProgress)}%` : 
                  '✅ Download Complete!'
                }
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              {downloadProgress === 100 && (
                <div className="success-message">
                  🎉 Your audio file has been downloaded! Check your downloads folder.
                </div>
              )}
            </div>
          )}

          <div className="features">
            <h3>✨ Features</h3>
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <div>
                  <strong>Fast Processing</strong>
                  <p>Powered by ytdl-core for reliable downloads</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎵</span>
                <div>
                  <strong>High Quality MP3</strong>
                  <p>192kbps audio quality</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>Private & Secure</strong>
                  <p>Files processed locally on your server</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <div>
                  <strong>Real-time Progress</strong>
                  <p>Live download progress updates</p>
                </div>
              </div>
            </div>
          </div>

          <div className="instructions">
            <h3>📋 How to use:</h3>
            <ol>
              <li>Make sure the Node.js backend is running (see setup instructions)</li>
              <li>Copy a YouTube video URL from your browser</li>
              <li>Paste it in the input field above</li>
              <li>Click the "Download Audio" button</li>
              <li>Wait for processing to complete</li>
              <li>Your MP3 file will be downloaded to your browser's default downloads folder</li>
            </ol>
            
            <div className="supported-formats">
              <h4>🔗 Supported URL formats:</h4>
              <ul>
                <li><code>https://www.youtube.com/watch?v=VIDEO_ID</code></li>
                <li><code>https://youtu.be/VIDEO_ID</code></li>
                <li><code>https://www.youtube.com/embed/VIDEO_ID</code></li>
                <li><code>https://www.youtube.com/shorts/VIDEO_ID</code></li>
              </ul>
            </div>
            
            <p className="disclaimer">
              <strong>⚖️ Important:</strong> This tool respects YouTube's terms of service. 
              Only download content you have permission to use. For educational and personal use only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
