/**
 * YouTube utility functions for URL validation and processing
 */

/**
 * Validate if a URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export function validateYouTubeURL(url) {
  if (!url || typeof url !== 'string') return false;
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export function extractVideoId(url) {
  if (!url) return null;
  
  // Regular expressions for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Sanitize filename by removing invalid characters
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'untitled';
  
  // Remove invalid characters for file systems
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-_\.\s]/g, '') // Keep only alphanumeric, hyphens, underscores, dots
    .substring(0, 100) // Limit length
    .trim();
}

/**
 * Format duration from seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration (e.g., "3:45" or "1:23:45")
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Check if URL is a playlist
 * @param {string} url - YouTube URL
 * @returns {boolean} - True if URL is a playlist
 */
export function isPlaylistURL(url) {
  if (!url) return false;
  return url.includes('list=') || url.includes('playlist');
}

/**
 * Extract playlist ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Playlist ID or null if not found
 */
export function extractPlaylistId(url) {
  if (!url) return null;
  
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * Get thumbnail URL for a video
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns {string} - Thumbnail URL
 */
export function getThumbnailURL(videoId, quality = 'medium') {
  if (!videoId) return '';
  
  const qualityMap = {
    'default': 'default',
    'medium': 'mqdefault',
    'high': 'hqdefault',
    'standard': 'sddefault',
    'maxres': 'maxresdefault'
  };
  
  const thumbnailQuality = qualityMap[quality] || 'mqdefault';
  return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
}

/**
 * Clean up old files in a directory
 * @param {string} directory - Directory path
 * @param {number} maxAge - Maximum age in milliseconds
 */
export function cleanupOldFiles(directory, maxAge = 60 * 60 * 1000) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}
