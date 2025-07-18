// API service for YouTube Audio Downloader Backend

// Use relative URLs in production, absolute URLs in development
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' // Use relative URLs in production
  : 'http://localhost:5001/api'; // Use localhost in development

class YouTubeAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getVideoInfo(url) {
    return this.makeRequest('/video-info', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async startDownload(url, format = 'mp3', quality = 'highest') {
    return this.makeRequest('/download', {
      method: 'POST',
      body: JSON.stringify({ url, format, quality }),
    });
  }

  async getDownloadStatus(downloadId) {
    return this.makeRequest(`/download-status/${downloadId}`);
  }

  async checkVideo(url) {
    return this.makeRequest('/check-video', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async checkHealth() {
    try {
      const response = await this.makeRequest('/health');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Download file directly from the downloads endpoint
  getDownloadUrl(filename) {
    return `${this.baseURL.replace('/api', '')}/downloads/${filename}`;
  }

  // Trigger file download in browser
  async downloadFile(filename) {
    try {
      const url = this.getDownloadUrl(filename);
      
      // Fetch the file as a blob to force download
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('File not found or not ready for download');
      }

      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a download URL
      const downloadUrl = URL.createObjectURL(blob);
      
      // Create download link with proper attributes
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(downloadUrl);
      
      return { 
        success: true, 
        filename, 
        method: 'blob-download'
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Poll download status until completion
  async pollDownloadStatus(downloadId, onProgress, intervalMs = 2000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await this.getDownloadStatus(downloadId);
          
          if (result.status === 'completed') {
            onProgress(100);
            resolve(result);
          } else if (result.status === 'processing') {
            onProgress(50); // Approximate progress
            setTimeout(poll, intervalMs);
          } else if (result.status === 'not_found') {
            reject(new Error('Download not found or expired'));
          } else {
            setTimeout(poll, intervalMs);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

// Create and export a singleton instance
export const youtubeAPI = new YouTubeAPIService();

// Named exports for individual methods
export const {
  getVideoInfo,
  startDownload,
  getDownloadStatus,
  checkVideo,
  checkHealth,
  downloadFile,
  pollDownloadStatus
} = youtubeAPI;

export default youtubeAPI;
