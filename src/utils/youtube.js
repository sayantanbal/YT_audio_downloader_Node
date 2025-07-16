// YouTube URL utilities and API helpers

export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /m\.youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const validateYouTubeUrl = (url) => {
  const videoId = extractVideoId(url);
  return videoId && videoId.length === 11;
};

export const getVideoInfo = async (videoId) => {
  try {
    // Using YouTube oEmbed API which is public and doesn't require API key
    const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!response.ok) {
      throw new Error('Video not found or not accessible');
    }
    
    const data = await response.json();
    return {
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url
    };
  } catch (error) {
    throw new Error('Failed to fetch video information. Please check if the video is public and accessible.');
  }
};

// Fallback download function using a client-side approach
export const downloadAudioFallback = async (videoId, videoInfo) => {
  // Note: This is a demonstration approach
  // In a real production app, you would need:
  // 1. A backend service to handle YouTube downloads
  // 2. Proper API keys for YouTube services
  // 3. Compliance with YouTube's Terms of Service
  
  return new Promise((resolve, reject) => {
    // Simulate processing time
    setTimeout(() => {
      // For demo purposes, we'll show how the download would work
      // In reality, you'd need a proper backend service
      const demoMessage = `
        Demo Mode: In a production environment, this would:
        1. Extract audio from: ${videoInfo.title}
        2. Convert to MP3 format
        3. Initiate download
        
        To implement this properly, you need:
        - A backend service (Node.js, Python, etc.)
        - youtube-dl or similar library
        - Proper API handling for YouTube
      `;
      
      console.log(demoMessage);
      
      // For demo, create a text file with instructions
      const blob = new Blob([demoMessage], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${videoInfo.title.replace(/[^a-z0-9]/gi, '_')}_instructions.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      resolve();
    }, 2000);
  });
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
