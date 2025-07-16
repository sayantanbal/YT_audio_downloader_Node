import express from 'express';
import ytdl from '@distube/ytdl-core';
import { validateYouTubeURL, extractVideoId, sanitizeFilename } from '../utils/youtube.js';

const router = express.Router();

// Get video information
router.post('/video-info', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!validateYouTubeURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID from URL' });
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Get available audio formats
    const audioFormats = info.formats
      .filter(format => format.hasAudio && !format.hasVideo)
      .filter(format => format.container === 'mp4' || format.container === 'webm')
      .map(format => ({
        itag: format.itag,
        container: format.container,
        quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'unknown',
        filesize: format.contentLength ? parseInt(format.contentLength) : null,
        codec: format.audioCodec
      }))
      .sort((a, b) => {
        // Sort by quality (bitrate) descending
        const bitrateA = parseInt(a.quality) || 0;
        const bitrateB = parseInt(b.quality) || 0;
        return bitrateB - bitrateA;
      });

    if (audioFormats.length === 0) {
      return res.status(400).json({ error: 'No audio formats available for this video' });
    }

    const response = {
      videoId,
      title: videoDetails.title,
      author: videoDetails.author.name,
      lengthSeconds: parseInt(videoDetails.lengthSeconds),
      thumbnails: videoDetails.thumbnails,
      description: videoDetails.shortDescription,
      uploadDate: videoDetails.uploadDate,
      viewCount: parseInt(videoDetails.viewCount),
      audioFormats,
      recommendedFormat: audioFormats[0] // Highest quality
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching video info:', error);
    
    if (error.message.includes('Video unavailable')) {
      return res.status(404).json({ error: 'Video not found or unavailable' });
    }
    
    if (error.message.includes('private')) {
      return res.status(403).json({ error: 'This video is private' });
    }

    res.status(500).json({ 
      error: 'Failed to fetch video information',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if video is downloadable
router.post('/check-video', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!validateYouTubeURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const isValid = await ytdl.validateURL(url);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or inaccessible YouTube video' });
    }

    const info = await ytdl.getInfo(url);
    const hasAudio = info.formats.filter(format => format.hasAudio).length > 0;

    res.json({ 
      isDownloadable: isValid && hasAudio,
      title: info.videoDetails.title,
      duration: parseInt(info.videoDetails.lengthSeconds)
    });
  } catch (error) {
    console.error('Error checking video:', error);
    res.status(500).json({ 
      error: 'Failed to check video',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
