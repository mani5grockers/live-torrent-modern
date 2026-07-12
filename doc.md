# Live Torrent v4.0 - Deployment Guide

Complete deployment documentation for Live Torrent v4.0, upgraded with Vue 3, Vuetify 3, Node 20, and modern security practices.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Production Configuration](#production-configuration)
7. [Security Considerations](#security-considerations)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## 🔧 System Requirements

### Minimum Requirements
- **Node.js**: 20.x LTS or higher
- **npm**: 10.x or higher
- **Docker**: 20.x or higher (for Docker deployment)
- **Memory**: 2GB RAM minimum
- **Disk Space**: 5GB free space

### Recommended Requirements
- **Node.js**: 20.x LTS
- **npm**: 10.x
- **Memory**: 4GB RAM
- **Disk Space**: 10GB free space
- **CPU**: 2+ cores

## 💻 Local Development Setup

### Prerequisites
```bash
# Check Node.js version (should be 20.x or higher)
node --version

# Check npm version (should be 10.x or higher)
npm --version
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Davenchy/live-torrent.git
cd live-torrent
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run development servers**
```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev-server  # Backend only
npm run serve       # Frontend only
```

5. **Access the application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# OpenSubtitles API
OSUA=TemporaryUserAgent

# Security (Optional but recommended)
ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com
```

### Optional Environment Variables

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Torrent Rate Limiting (stricter)
TORRENT_RATE_LIMIT_WINDOW_MS=900000
TORRENT_RATE_LIMIT_MAX_REQUESTS=20

# Logging
LOG_LEVEL=combined
```

### Environment File Template (`.env.example`)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# OpenSubtitles API User Agent
# Get your user agent from: https://trac.opensubtitles.org/projects/opensubtitles/wiki/DevReadFirst
OSUA=TemporaryUserAgent

# CORS Configuration (comma-separated origins)
# Set to * for development, specific domains for production
ALLOWED_ORIGINS=*

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Torrent-specific Rate Limiting
TORRENT_RATE_LIMIT_WINDOW_MS=900000
TORRENT_RATE_LIMIT_MAX_REQUESTS=20

# Logging
LOG_LEVEL=combined
```

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image**
```bash
docker build -t live-torrent:latest .
```

2. **Run the container**
```bash
docker run -d \
  --name live-torrent \
  -p 3000:8080 \
  -e PORT=8080 \
  -e OSUA=YourUserAgent \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  live-torrent:latest
```

3. **View logs**
```bash
docker logs -f live-torrent
```

4. **Stop the container**
```bash
docker stop live-torrent
```

### Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  live-torrent:
    build: .
    container_name: live-torrent
    ports:
      - "3000:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - OSUA=${OSUA:-TemporaryUserAgent}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-*}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    volumes:
      - ./logs:/usr/src/app/logs
```

Run with Docker Compose:
```bash
# Create .env file
echo "OSUA=YourUserAgent" > .env
echo "ALLOWED_ORIGINS=https://yourdomain.com" >> .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Configuration

For production, use multi-stage build and optimize:

```bash
# Build production image
docker build -t live-torrent:prod .

# Run with resource limits
docker run -d \
  --name live-torrent-prod \
  -p 3000:8080 \
  --memory="2g" \
  --cpus="2" \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e OSUA=YourUserAgent \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  --restart unless-stopped \
  live-torrent:prod
```

## ☁️ Cloud Deployment

### Heroku Deployment

1. **Prepare for Heroku**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=8080
heroku config:set OSUA=YourUserAgent
heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
```

2. **Deploy**
```bash
# Push to Heroku
git push heroku main

# Or build locally and deploy
docker build -t live-torrent .
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

3. **Verify deployment**
```bash
heroku open
heroku logs --tail
```

### AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Create application**
```bash
eb init -p node.js live-torrent
eb create live-torrent-env
```

2. **Configure environment**
```bash
eb setenv NODE_ENV=production
eb setenv PORT=8080
eb setenv OSUA=YourUserAgent
eb setenv ALLOWED_ORIGINS=https://your-domain.elasticbeanstalk.com
```

3. **Deploy**
```bash
eb deploy
```

#### Using AWS ECS (Fargate)

1. **Create task definition** with Docker image
2. **Configure load balancer** and target groups
3. **Set environment variables** in task definition
4. **Deploy service**

### DigitalOcean Deployment

#### Using DigitalOcean App Platform

1. **Create app** from Docker Hub or GitHub
2. **Configure environment variables**
3. **Set resource allocation** (minimum 2GB RAM)
4. **Deploy**

#### Using DigitalOcean Droplet

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/Davenchy/live-torrent.git
cd live-torrent

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=8080
OSUA=YourUserAgent
ALLOWED_ORIGINS=https://your-domain.com
EOF

# Run with Docker Compose
docker-compose up -d
```

### Google Cloud Platform

#### Using Google Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/live-torrent

# Deploy to Cloud Run
gcloud run deploy live-torrent \
  --image gcr.io/PROJECT-ID/live-torrent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080,OSUA=YourUserAgent,ALLOWED_ORIGINS=https://your-domain.com
```

## 🚀 Production Configuration

### Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Process Manager (PM2)

Install and configure PM2 for process management:

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name live-torrent

# Configure PM2 for auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs live-torrent
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'live-torrent',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Run with PM2:
```bash
pm2 start ecosystem.config.js
```

### Nginx Reverse Proxy

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Reverse proxy to Live Torrent
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /img/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate secrets regularly
- Use secret management services in cloud environments

### 2. CORS Configuration

Set specific allowed origins in production:

```env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 3. Rate Limiting

The application includes built-in rate limiting:
- General API: 100 requests per 15 minutes per IP
- Torrent operations: 20 requests per 15 minutes per IP

Adjust these limits based on your needs:

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
TORRENT_RATE_LIMIT_MAX_REQUESTS=20
```

### 4. Security Headers

The application uses Helmet.js for security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- HTTP Strict Transport Security (HSTS)

### 5. HTTPS/SSL

Always use HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Configure proper SSL/TLS settings
- Enable HSTS

### 6. Firewall Configuration

Configure firewall rules:
- Allow only necessary ports (80, 443)
- Restrict SSH access
- Use fail2ban for SSH protection

### 7. Regular Updates

Keep dependencies updated:
```bash
# Check for updates
npm audit

# Update dependencies
npm update

# Security audit
npm audit fix
```

## 📊 Monitoring and Maintenance

### Health Checks

The application includes a health check endpoint:

```bash
curl http://your-domain.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Logging

Logs are configured with Morgan:
- Development: detailed console output
- Production: combined log format

Configure log aggregation:
- Use ELK Stack (Elasticsearch, Logstash, Kibana)
- Use cloud logging services (AWS CloudWatch, Google Cloud Logging)
- Use third-party services (Loggly, Papertrail, Sentry)

### Performance Monitoring

Implement monitoring:
- **APM**: New Relic, Datadog, or AppDynamics
- **Error Tracking**: Sentry, Rollbar
- **Uptime Monitoring**: UptimeRobot, Pingdom

### Backup Strategy

- Regular database backups (if using database)
- Backup configuration files
- Backup SSL certificates
- Document disaster recovery procedures

### Scaling Strategies

#### Horizontal Scaling
- Use load balancer (Nginx, HAProxy, AWS ALB)
- Run multiple instances behind load balancer
- Use PM2 cluster mode

#### Vertical Scaling
- Increase server resources
- Optimize application performance
- Use caching (Redis, Memcached)

## � PWA Testing and Verification

### Testing PWA Functionality

After deployment, verify the PWA is working correctly:

#### 1. **Service Worker Registration**
```bash
# Open browser DevTools (F12)
# Go to Application tab
# Check Service Workers section
# Should show "service-worker.js" as active and running
```

#### 2. **Manifest Validation**
```bash
# In DevTools Application tab
# Check Manifest section
# Verify all fields are correctly populated
# Icons should load without errors
```

#### 3. **Offline Testing**
```bash
# 1. Load the application online
# 2. Open DevTools Network tab
# 3. Check "Offline" checkbox
# 4. Reload the page
# 5. Application should still load from cache
```

#### 4. **Install as App**
```bash
# Desktop: Look for install icon in address bar
# Mobile: Add to Home Screen from browser menu
# Should install as standalone application
```

#### 5. **Lighthouse PWA Audit**
```bash
# 1. Open DevTools
# 2. Go to Lighthouse tab
# 3. Select "Progressive Web App" category
# 4. Run audit
# 5. Should score 90+ in all PWA categories
```

### PWA Features Included

- ✅ **Service Worker**: Automatic caching and offline support
- ✅ **Manifest**: Installable as native app
- ✅ **Offline Support**: Caches static assets and API responses
- ✅ **Background Sync**: Periodic content updates
- ✅ **Push Notifications**: Ready for implementation
- ✅ **App Shortcuts**: Quick access to main features
- ✅ **Responsive Design**: Works on all device sizes

### PWA Configuration Files

- **vite.config.js**: PWA plugin configuration
- **src/pwa-register.js**: Service worker registration logic
- **public/manifest.json**: App manifest for installation
- **public/sw.js**: Auto-generated service worker (by Vite PWA)

### Common PWA Issues

#### Service Worker Not Registering
```bash
# Check if serving over HTTPS (required for PWA)
# Verify service worker file exists in dist/
# Check browser console for registration errors
# Ensure manifest.json is accessible
```

#### Offline Not Working
```bash
# Verify cache strategies in vite.config.js
# Check network tab for failed requests
# Ensure static assets are cached
# Review service worker scope
```

#### Install Prompt Not Showing
```bash
# Ensure site is served over HTTPS
# Check manifest has required fields
- name
- short_name
- icons (minimum 192x192)
- start_url
- display
# Verify site has been visited before (Chrome requirement)
# Check browser supports PWA installation
```

## �🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Or in PM2 ecosystem file
node_args: "--max-old-space-size=4096"
```

#### 3. Docker Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Build without cache
docker build --no-cache -t live-torrent .
```

#### 4. CORS Errors
- Check `ALLOWED_ORIGINS` environment variable
- Verify CORS configuration in server.js
- Check browser console for specific error messages

#### 5. API Timeout Errors
- Check backend server status
- Verify network connectivity
- Increase timeout values in axios configuration
- Check rate limiting settings

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm start
```

### Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash

HEALTH_URL="http://localhost:3000/health"
MAX_RETRIES=5
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  if curl -f -s $HEALTH_URL > /dev/null; then
    echo "Health check passed"
    exit 0
  fi
  echo "Health check failed, retrying... ($i/$MAX_RETRIES)"
  sleep $RETRY_DELAY
done

echo "Health check failed after $MAX_RETRIES attempts"
exit 1
```

## 📞 Support and Resources

### Documentation
- Vue 3: https://vuejs.org/
- Vuetify 3: https://vuetifyjs.com/
- Node.js: https://nodejs.org/docs/
- Express.js: https://expressjs.com/

### Community
- GitHub Issues: https://github.com/Davenchy/live-torrent/issues
- Email: firon1222@gmail.com

### Backend Package
- Live Torrent Backend: https://github.com/Davenchy/live-torrent-backend

## 🔄 Version History

### v4.0.0 (Current)
- Upgraded to Vue 3
- Upgraded to Vuetify 3
- Migrated from Vuex to Pinia
- Updated to Node 20 LTS
- Replaced deprecated request library with axios
- Added security enhancements (Helmet.js, rate limiting)
- Improved error handling
- Updated Docker configuration
- Migrated from Vue CLI to Vite
- Enhanced input validation
- Added health check endpoint

### v3.2.2 (Previous)
- Vue 2.6.11
- Vuetify 1.5.24
- Node 12
- Vue CLI 3.x

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated**: 2024-07-13  
**Version**: 4.0.0  
**Maintainer**: Davenchy <firon1222@gmail.com>