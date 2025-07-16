import express from 'express';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { validateYouTubeURL, extractVideoId, sanitizeFilename } from '../utils/youtube.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Download audio from YouTube video
router.post('/download', async (req, res) => {
  let tempFilePath = null;
  let outputFilePath = null;

  try {
    const { url, format = 'mp3', quality = 'highest' } = req.body;

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
    
    // Sanitize filename
    const sanitizedTitle = sanitizeFilename(videoDetails.title);
    const timestamp = Date.now();
    const tempFileName = `temp_${timestamp}_${videoId}.webm`;
    const outputFileName = `${sanitizedTitle}_${timestamp}.${format}`;
    
    tempFilePath = path.join(__dirname, '../downloads', tempFileName);
    outputFilePath = path.join(__dirname, '../downloads', outputFileName);

    // Choose best audio format (prefer audio-only formats)
    let audioFormat;
    const audioOnlyFormats = info.formats.filter(format => 
      format.hasAudio && !format.hasVideo && format.container !== 'mhtml'
    );
    
    if (audioOnlyFormats.length > 0) {
      // Use audio-only format for better quality and performance
      audioFormat = audioOnlyFormats
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
    } else {
      // Fallback to formats with audio (even if they have video)
      const audioFormats = info.formats.filter(format => format.hasAudio);
      audioFormat = audioFormats
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
    }

    if (!audioFormat) {
      return res.status(400).json({ error: 'No suitable audio format found' });
    }

    console.log(`Selected format: ${audioFormat.itag}, Quality: ${audioFormat.audioBitrate || 'unknown'}kbps`);

    // Send initial response with download info
    res.json({
      message: 'Download started',
      videoId,
      title: videoDetails.title,
      author: videoDetails.author.name,
      duration: parseInt(videoDetails.lengthSeconds),
      downloadId: timestamp,
      filename: outputFileName,
      estimatedSize: audioFormat.contentLength ? parseInt(audioFormat.contentLength) : null
    });

    // Start download with better options
    console.log(`Starting download for: ${videoDetails.title}`);
    
    const downloadOptions = {
      format: audioFormat,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    };

    const downloadStream = ytdl(url, downloadOptions);
    const writeStream = fs.createWriteStream(tempFilePath);

    let downloadStarted = false;
    let totalSize = 0;
    let downloadedSize = 0;

    downloadStream.on('response', (response) => {
      downloadStarted = true;
      totalSize = parseInt(response.headers['content-length']) || 0;
      console.log(`Download started. Total size: ${totalSize} bytes`);
    });

    downloadStream.on('data', (chunk) => {
      downloadedSize += chunk.length;
      if (totalSize > 0) {
        const progress = Math.round((downloadedSize / totalSize) * 100);
        console.log(`Download progress: ${progress}%`);
      }
    });

    downloadStream.on('error', (error) => {
      console.error('Download stream error:', error);
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    });

    downloadStream.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log('Download completed, starting conversion...');
      
      // Convert to MP3 using ffmpeg with high quality settings
      ffmpeg(tempFilePath)
        .audioBitrate(192) // Higher bitrate for better quality
        .audioChannels(2)  // Stereo
        .audioFrequency(44100) // Standard frequency
        .audioCodec('libmp3lame')
        .format('mp3')
        .outputOptions([
          '-id3v2_version', '3',
          '-write_id3v1', '1'
        ])
        .output(outputFilePath)
        .on('start', (commandLine) => {
          console.log('FFmpeg started with command: ' + commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Conversion progress: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log('Conversion completed successfully');
          // Clean up temp file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          console.log(`File ready for download: ${outputFileName}`);
        })
        .on('error', (err) => {
          console.error('Conversion error:', err);
            // Clean up files
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
          })
          .run();
    });

    writeStream.on('error', (error) => {
      console.error('Write stream error:', error);
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    });

  } catch (error) {
    console.error('Error in download route:', error);
    
    // Clean up files on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (outputFilePath && fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }

    if (error.message.includes('Video unavailable')) {
      return res.status(404).json({ error: 'Video not found or unavailable' });
    }
    
    if (error.message.includes('private')) {
      return res.status(403).json({ error: 'This video is private' });
    }

    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to download video',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Get download status
router.get('/download-status/:downloadId', (req, res) => {
  try {
    const { downloadId } = req.params;
    const downloadsDir = path.join(__dirname, '../downloads');
    
    // Find file with this download ID
    const files = fs.readdirSync(downloadsDir);
    const downloadFile = files.find(file => file.includes(downloadId) && !file.startsWith('temp_'));
    
    if (downloadFile) {
      const filePath = path.join(downloadsDir, downloadFile);
      const stats = fs.statSync(filePath);
      
      res.json({
        status: 'completed',
        filename: downloadFile,
        filesize: stats.size,
        downloadUrl: `/downloads/${downloadFile}`,
        completedAt: stats.mtime
      });
    } else {
      // Check if temp file exists (still processing)
      const tempFile = files.find(file => file.startsWith('temp_') && file.includes(downloadId));
      
      if (tempFile) {
        res.json({
          status: 'processing',
          message: 'File is being processed...'
        });
      } else {
        res.json({
          status: 'not_found',
          message: 'Download not found or expired'
        });
      }
    }
  } catch (error) {
    console.error('Error checking download status:', error);
    res.status(500).json({ 
      error: 'Failed to check download status',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Stream download (alternative endpoint for direct streaming)
router.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { format = 'mp3' } = req.query;
    
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }

    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    const sanitizedTitle = sanitizeFilename(videoDetails.title);
    
    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.${format}"`);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'audio/webm');

    // Choose best audio format
    const audioOnlyFormats = info.formats.filter(format => 
      format.hasAudio && !format.hasVideo && format.container !== 'mhtml'
    );
    
    let audioFormat;
    if (audioOnlyFormats.length > 0) {
      audioFormat = audioOnlyFormats
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
    } else {
      const audioFormats = info.formats.filter(format => format.hasAudio);
      audioFormat = audioFormats
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
    }
    
    if (!audioFormat) {
      return res.status(400).json({ error: 'No suitable audio format found' });
    }

    console.log(`Streaming ${videoDetails.title} with format: ${audioFormat.itag}`);

    const downloadOptions = {
      format: audioFormat,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    };

    const downloadStream = ytdl(url, downloadOptions);

    if (format === 'mp3') {
      // Convert to MP3 on the fly with high quality
      const ffmpegStream = ffmpeg(downloadStream)
        .audioBitrate(192)
        .audioChannels(2)
        .audioFrequency(44100)
        .audioCodec('libmp3lame')
        .format('mp3')
        .outputOptions([
          '-id3v2_version', '3',
          '-write_id3v1', '1'
        ])
        .on('start', () => {
          console.log('Started FFmpeg conversion for streaming');
        })
        .on('error', (error) => {
          console.error('FFmpeg streaming error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Conversion failed' });
          }
        });
      
      ffmpegStream.pipe(res);
    } else {
      // Stream directly for other formats
      downloadStream.pipe(res);
    }

    downloadStream.on('error', (error) => {
      console.error('Download streaming error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Error in stream route:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to stream audio',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

export default router;
