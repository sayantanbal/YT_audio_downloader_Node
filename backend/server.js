import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import videoRoutes from './routes/video.js';
import downloadRoutes from './routes/download.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // Add your production domain here
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from downloads directory with download headers
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(downloadsDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set headers to force download
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  // Send the file
  res.sendFile(filePath);
});

// Routes
app.use('/api', videoRoutes);
app.use('/api', downloadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'YouTube Audio Downloader Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Cleanup old downloads periodically (every hour)
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  fs.readdir(downloadsDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log(`Cleaned up old file: ${file}`);
            }
          });
        }
      });
    });
  });
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => {
  console.log(`🚀 YouTube Audio Downloader Backend running on port ${PORT}`);
  console.log(`📁 Downloads directory: ${downloadsDir}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
