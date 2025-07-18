# 🚀 AWS Elastic Beanstalk Deployment Guide

## Overview
This guide will help you deploy the YouTube Audio Downloader full-stack application to AWS Elastic Beanstalk.

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured
- EB CLI installed (`pip install awsebcli`)

### 2. Local Development Environment
- Node.js 18+ installed
- npm 8+ installed
- Git installed

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Elastic Beanstalk                    │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Load Balancer │    │      EC2        │                │
│  │    (nginx)      │───►│   Instance      │                │
│  │                 │    │  - Node.js App  │                │
│  └─────────────────┘    │  - Frontend     │                │
│                         │  - Backend API  │                │
│                         │  - FFmpeg       │                │
│                         └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Deployment

### 1. Prepare Your Application

```bash
# Run the deployment preparation script
./deploy-prep.sh
```

This script will:
- ✅ Check Node.js version compatibility
- ✅ Install all dependencies
- ✅ Build the frontend for production
- ✅ Verify the build output
- ✅ Check for EB CLI availability

### 2. Initialize Elastic Beanstalk

```bash
# Initialize EB application (first time only)
eb init

# Follow the prompts:
# - Select your AWS region (e.g., us-east-1)
# - Create a new application or select existing
# - Choose Node.js platform
# - Select Node.js 18 running on 64bit Amazon Linux 2
# - Choose not to use CodeCommit (unless you want to)
# - Setup SSH if desired
```

### 3. Create Environment

```bash
# Create production environment
eb create youtube-audio-downloader-prod

# This will:
# - Create an application environment
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your application
```

### 4. Configure Environment Variables

In the AWS Console → Elastic Beanstalk → Your Application → Configuration → Software:

```
NODE_ENV=production
CORS_ORIGINS=*
```

Or use EB CLI:
```bash
eb setenv NODE_ENV=production CORS_ORIGINS=*
```

### 5. Deploy Updates

```bash
# For future deployments
./deploy-prep.sh  # Rebuild frontend
eb deploy         # Deploy to AWS
```

### 6. Open Your Application

```bash
eb open
```

## Configuration Details

### Instance Configuration
- **Instance Type**: t3.small (minimum recommended)
- **Platform**: Node.js 18 running on 64bit Amazon Linux 2
- **Load Balancer**: Application Load Balancer
- **Auto Scaling**: 1-4 instances

### Environment Variables
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets production mode |
| `CORS_ORIGINS` | `*` | Allows all origins (adjust for security) |
| `PORT` | `8080` | Automatically set by EB |

### Health Check
- **URL**: `/api/health`
- **Timeout**: 5 seconds
- **Interval**: 30 seconds
- **Healthy threshold**: 3
- **Unhealthy threshold**: 5

## Monitoring and Troubleshooting

### View Logs
```bash
eb logs                    # View recent logs
eb logs --all             # View all logs
eb ssh                    # SSH into instance
```

### Check Application Health
```bash
eb health                 # Environment health status
eb status                 # Detailed environment info
```

### Common Issues and Solutions

#### 1. Deployment Fails
```bash
# Check deployment logs
eb logs

# Common causes:
# - Missing dependencies
# - Build failures
# - FFmpeg installation issues
```

#### 2. FFmpeg Not Found
- Verify `.ebextensions/01_ffmpeg.config` is present
- Check instance logs for FFmpeg installation

#### 3. Frontend Not Loading
- Ensure `npm run build` completed successfully
- Check that `frontend/dist` directory exists
- Verify static file serving configuration

#### 4. CORS Errors
- Check `CORS_ORIGINS` environment variable
- Ensure frontend is making requests to correct domain

#### 5. High Memory Usage
- Upgrade to larger instance type (t3.medium or t3.large)
- Monitor CloudWatch metrics

## Performance Optimization

### Instance Sizing
- **t3.small**: Good for testing, limited concurrent users
- **t3.medium**: Recommended for production, 2-5 concurrent downloads
- **t3.large**: High-traffic applications, 5+ concurrent downloads

### Auto Scaling Configuration
```bash
# Configure auto scaling
eb config

# Add to configuration:
# MinSize: 1
# MaxSize: 4
# Triggers based on CPU utilization
```

### Monitoring
- Enable Enhanced Health Reporting
- Set up CloudWatch alarms for:
  - CPU utilization > 80%
  - Memory utilization > 90%
  - Disk space > 85%

## Security Considerations

### Environment Variables
- Never commit `.env` files to Git
- Use EB environment configuration for secrets
- Rotate access keys regularly

### CORS Configuration
```bash
# For production, replace * with your domain
eb setenv CORS_ORIGINS=https://yourdomain.com
```

### HTTPS
- Enable HTTPS in load balancer configuration
- Consider using AWS Certificate Manager

## Cost Estimation

### Basic Setup (t3.small)
- EC2 Instance: ~$15/month
- Load Balancer: ~$16/month
- Data Transfer: Variable
- **Total**: ~$30-40/month

### Production Setup (t3.medium with auto-scaling)
- EC2 Instances: ~$30-60/month
- Load Balancer: ~$16/month
- Data Transfer: Variable
- **Total**: ~$50-80/month

## Maintenance

### Regular Tasks
- Monitor logs for errors
- Update dependencies monthly
- Review CloudWatch metrics
- Test deployments in staging environment

### Backup Strategy
- Application code: Git repository
- Environment configuration: Export using EB CLI
- Database: Not applicable (stateless application)

## Alternative Deployment Options

### Docker Platform
```bash
# Use Dockerfile for containerized deployment
eb init --platform "Docker running on 64bit Amazon Linux 2"
```

### Multi-Container Setup
- Separate frontend and backend containers
- Use Docker Compose for local development
- Deploy using EB multi-container Docker

## Support and Resources

### AWS Documentation
- [Elastic Beanstalk Developer Guide](https://docs.aws.amazon.com/elasticbeanstalk/)
- [EB CLI Reference](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)

### Application Specific
- Check application logs in CloudWatch
- Use EB health dashboard
- Monitor application metrics

---

## Quick Reference Commands

```bash
# Deployment workflow
./deploy-prep.sh              # Prepare for deployment
eb init                       # Initialize (first time)
eb create production          # Create environment
eb deploy                     # Deploy updates
eb open                       # Open application

# Monitoring
eb health                     # Check health
eb logs                       # View logs
eb status                     # Environment status

# Environment management
eb list                       # List environments
eb use production            # Switch environment
eb terminate production     # Terminate environment
```

🚀 Your YouTube Audio Downloader is now ready for production deployment on AWS Elastic Beanstalk!
