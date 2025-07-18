# Multi-stage Dockerfile for YouTube Audio Downloader
# Optimized for AWS Elastic Beanstalk Docker platform

FROM node:18-alpine AS base

# Install FFmpeg and other dependencies
RUN apk add --no-cache \
    ffmpeg \
    ffmpeg-dev \
    python3 \
    make \
    g++ \
    git

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install
RUN cd backend && npm install --production

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Remove frontend source and dev dependencies to reduce image size
RUN rm -rf frontend/src frontend/public frontend/node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start server
CMD ["npm", "start"]
