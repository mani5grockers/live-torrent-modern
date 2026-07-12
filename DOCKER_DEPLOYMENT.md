# Docker Deployment Guide

Complete Docker deployment guide for Live Torrent v4.0 - Modern Vue 3 + Vuetify 3 + Node 20 application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [Docker Compose](#docker-compose)
6. [Multi-Stage Build](#multi-stage-build)
7. [Configuration](#configuration)
8. [Deployment Strategies](#deployment-strategies)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **Git**: For cloning the repository

### Check Docker Installation
```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Check Docker is running
docker ps
```

### Install Docker (if needed)

#### macOS
```bash
# Download Docker Desktop for Mac
# https://www.docker.com/products/docker-desktop
```

#### Linux (Ubuntu/Debian)
```bash
# Update package index
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Windows
```bash
# Download Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/mani5grockers/live-torrent-modern.git
cd live-torrent-modern
```

### 2. Build Docker Image
```bash
docker build -t live-torrent:latest .
```

### 3. Run Container
```bash
docker run -d \
  --name live-torrent \
  -p 3000:8080 \
  -e PORT=8080 \
  -e OSUA=TemporaryUserAgent \
  live-torrent:latest
```

### 4. Access Application
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 💻 Development Setup

### Development Docker Compose

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  live-torrent-dev:
    build: 
      context: .
      dockerfile: Dockerfile.dev
    container_name: live-torrent-dev
    ports:
      - "3000:8080"
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - PORT=8080
      - OSUA=TemporaryUserAgent
      - ALLOWED_ORIGINS=*
    volumes:
      - ./src:/usr/src/app/src
      - ./public:/usr/src/app/public
      - /usr/src/app/node_modules
    command: npm run dev
    restart: unless-stopped
    networks:
      - live-torrent-network

networks:
  live-torrent-network:
    driver: bridge
```

### Development Dockerfile

Create `Dockerfile.dev`:

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 8080

# Run development server
CMD ["npm", "run", "dev"]
```

### Run Development Environment
```bash
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## 🏭 Production Deployment

### Production Dockerfile (Current)

The current `Dockerfile` uses multi-stage build for optimization:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY server.js .
COPY yts-api.js .

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### Build Production Image
```bash
# Build with tag
docker build -t live-torrent:prod .

# Build with version tag
docker build -t live-torrent:4.0.0 .

# Build without cache
docker build --no-cache -t live-torrent:latest .
```

### Run Production Container

#### Basic Run
```bash
docker run -d \
  --name live-torrent-prod \
  -p 3000:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e OSUA=YourUserAgent \
  live-torrent:prod
```

#### With Resource Limits
```bash
docker run -d \
  --name live-torrent-prod \
  -p 3000:8080 \
  --memory="2g" \
  --cpus="2" \
  --memory-swap="2g" \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e OSUA=YourUserAgent \
  -e ALLOWED_ORIGINS=https://yourdomain.com \
  --restart unless-stopped \
  live-torrent:prod
```

#### With Volume Mounts
```bash
docker run -d \
  --name live-torrent-prod \
  -p 3000:8080 \
  -v $(pwd)/logs:/usr/src/app/logs \
  -v $(pwd)/.env:/usr/src/app/.env:ro \
  -e NODE_ENV=production \
  -e PORT=8080 \
  --restart unless-stopped \
  live-torrent:prod
```

## 🐳 Docker Compose

### Production Docker Compose (Current)

The current `docker-compose.yml`:

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
      - RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-900000}
      - RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS:-100}
      - TORRENT_RATE_LIMIT_MAX_REQUESTS=${TORRENT_RATE_LIMIT_MAX_REQUESTS:-20}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    volumes:
      - ./logs:/usr/src/app/logs
    networks:
      - live-torrent-network

networks:
  live-torrent-network:
    driver: bridge
```

### Using Docker Compose

#### Start Services
```bash
# Create .env file first
cat > .env << EOF
OSUA=YourUserAgent
ALLOWED_ORIGINS=https://yourdomain.com
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

#### Scale Services
```bash
# Scale to multiple instances
docker-compose up -d --scale live-torrent=3

# Note: You'll need a load balancer for scaling
```

## 🏗️ Multi-Stage Build

### Build Stages Breakdown

#### Stage 1: Builder
```dockerfile
FROM node:20-alpine AS builder
# Installs all dependencies including dev dependencies
# Builds the frontend application
# Result: Optimized production build in /dist
```

#### Stage 2: Production
```dockerfile
FROM node:20-alpine AS production
# Only installs production dependencies
# Copies built artifacts from builder stage
# Creates non-root user for security
# Sets up health checks
# Result: Minimal production image
```

### Benefits of Multi-Stage Build
- ✅ **Smaller final image** (dev dependencies not included)
- ✅ **Better security** (reduced attack surface)
- ✅ **Faster deployment** (smaller image to push/pull)
- ✅ **Consistent builds** (same base images)

### Build Optimization
```bash
# Use BuildKit for better performance
DOCKER_BUILDKIT=1 docker build -t live-torrent:latest .

# Parallel build stages
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t live-torrent:latest .

# Export build cache
docker build --cache-from live-torrent:latest -t live-torrent:new .
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# Server Configuration
NODE_ENV=production
PORT=8080

# OpenSubtitles API
OSUA=TemporaryUserAgent

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
TORRENT_RATE_LIMIT_MAX_REQUESTS=20

# Logging
LOG_LEVEL=combined
```

### Docker Compose with Environment File

```yaml
version: '3.8'

services:
  live-torrent:
    build: .
    container_name: live-torrent
    ports:
      - "3000:8080"
    env_file:
      - .env
    restart: unless-stopped
```

### Docker Secrets (Advanced)

For sensitive data, use Docker secrets:

```yaml
version: '3.8'

services:
  live-torrent:
    build: .
    container_name: live-torrent
    ports:
      - "3000:8080"
    secrets:
      - osua_secret
      - cors_origins
    environment:
      - OSUA_FILE=/run/secrets/osua_secret
      - ALLOWED_ORIGINS_FILE=/run/secrets/cors_origins

secrets:
  osua_secret:
    file: ./secrets/osua.txt
  cors_origins:
    file: ./secrets/cors_origins.txt
```

## 🌍 Deployment Strategies

### 1. Standalone Deployment

#### Single Server
```bash
# Build and run
docker-compose up -d

# Configure Nginx reverse proxy
# (see Nginx configuration below)
```

### 2. Load Balanced Deployment

#### Docker Compose with Nginx

Create `docker-compose.lb.yml`:

```yaml
version: '3.8'

services:
  live-torrent-1:
    build: .
    container_name: live-torrent-1
    environment:
      - PORT=8080
      - OSUA=${OSUA}
    networks:
      - live-torrent-network
    restart: unless-stopped

  live-torrent-2:
    build: .
    container_name: live-torrent-2
    environment:
      - PORT=8080
      - OSUA=${OSUA}
    networks:
      - live-torrent-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: nginx-lb
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - live-torrent-1
      - live-torrent-2
    networks:
      - live-torrent-network
    restart: unless-stopped

networks:
  live-torrent-network:
    driver: bridge
```

#### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream live_torrent_backend {
        least_conn;
        server live-torrent-1:8080;
        server live-torrent-2:8080;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://live_torrent_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 3. Docker Swarm Deployment

#### Initialize Swarm
```bash
docker swarm init
```

#### Deploy Stack
```yaml
version: '3.8'

services:
  live-torrent:
    image: live-torrent:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    ports:
      - "3000:8080"
    environment:
      - NODE_ENV=production
      - OSUA=${OSUA}
    networks:
      - live-torrent-network

networks:
  live-torrent-network:
    driver: overlay
```

#### Deploy Stack
```bash
docker stack deploy -c docker-compose.swarm.yml live-torrent
```

### 4. Kubernetes Deployment

#### Create Deployment File

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: live-torrent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: live-torrent
  template:
    metadata:
      labels:
        app: live-torrent
    spec:
      containers:
      - name: live-torrent
        image: live-torrent:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
        - name: OSUA
          valueFrom:
            secretKeyRef:
              name: live-torrent-secrets
              key: osua
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: live-torrent-service
spec:
  selector:
    app: live-torrent
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

#### Deploy to Kubernetes
```bash
kubectl apply -f k8s-deployment.yaml
```

## 📊 Monitoring & Logging

### Container Logs

```bash
# View logs
docker logs live-torrent

# Follow logs
docker logs -f live-torrent

# Last 100 lines
docker logs --tail 100 live-torrent

# Logs with timestamps
docker logs -t live-torrent
```

### Docker Compose Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs live-torrent

# Follow logs
docker-compose logs -f
```

### Health Check Monitoring

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' live-torrent

# Continuous health monitoring
watch -n 5 'docker inspect --format="{{.State.Health.Status}}" live-torrent'
```

### Resource Monitoring

```bash
# Container resource usage
docker stats live-torrent

# All containers
docker stats

# Specific resource metrics
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" live-torrent
```

### Log Aggregation

#### ELK Stack Integration

Create `docker-compose.logging.yml`:

```yaml
version: '3.8'

services:
  live-torrent:
    build: .
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=live-torrent"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    volumes:
      - esdata:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  esdata:
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker logs live-torrent

# Check container status
docker ps -a

# Inspect container
docker inspect live-torrent

# Common fixes:
# - Check environment variables
# - Verify port availability
# - Check file permissions
# - Ensure .env file exists
```

#### 2. Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:8080 live-torrent
```

#### 3. Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Build without cache
docker build --no-cache -t live-torrent .

# Check Docker disk space
docker system df

# Clean up unused resources
docker system prune
```

#### 4. Memory Issues
```bash
# Increase container memory
docker run --memory="2g" live-torrent

# Check container memory usage
docker stats live-torrent

# Increase Node.js memory
docker run -e NODE_OPTIONS="--max-old-space-size=4096" live-torrent
```

#### 5. Network Issues
```bash
# Check container network
docker network ls
docker network inspect bridge

# Test DNS resolution
docker run --rm live-torrent nslookup google.com

# Restart Docker daemon
sudo systemctl restart docker
```

### Debug Mode

#### Enable Debug Logging
```bash
# Run with debug environment
docker run -e DEBUG=* live-torrent

# Enable Node.js debug
docker run -e NODE_OPTIONS="--inspect" live-torrent
```

#### Interactive Debugging
```bash
# Run container interactively
docker run -it --entrypoint /bin/sh live-torrent

# Access running container
docker exec -it live-torrent /bin/sh
```

### Performance Optimization

#### Image Size Reduction
```bash
# Analyze image layers
docker history live-torrent

# Use .dockerignore
echo "node_modules
npm-debug.log
.git
.env
*.md" > .dockerignore

# Multi-stage build (already implemented)
```

#### Build Speed Optimization
```bash
# Use BuildKit
export DOCKER_BUILDKIT=1

# Layer caching
docker build --cache-from live-torrent:latest -t live-torrent:new .

# Parallel builds
docker build --parallel=true -t live-torrent:latest .
```

## 🔐 Security Best Practices

### 1. Use Non-Root User
✅ Already implemented in Dockerfile
```dockerfile
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 2. Scan Images for Vulnerabilities
```bash
# Use Trivy
trivy image live-torrent:latest

# Use Docker Scan
docker scan live-torrent:latest
```

### 3. Minimal Base Image
✅ Using `node:20-alpine` (smaller attack surface)

### 4. Read-Only Root Filesystem
```yaml
# In docker-compose.yml
services:
  live-torrent:
    read_only: true
    tmpfs:
      - /tmp
```

### 5. Resource Limits
```bash
# Set memory and CPU limits
docker run --memory="2g" --cpus="2" live-torrent
```

### 6. Network Isolation
```yaml
# Use custom networks
networks:
  live-torrent-network:
    driver: bridge
    internal: true  # No external access
```

## 📈 Performance Tuning

### 1. Node.js Optimization
```dockerfile
# Add to Dockerfile
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=production
```

### 2. Docker Optimization
```yaml
# In docker-compose.yml
services:
  live-torrent:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 3. Application Optimization
- Enable gzip compression
- Implement caching strategies
- Use CDN for static assets
- Optimize database queries

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/docker.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          mani5grockers/live-torrent:latest
          mani5grockers/live-torrent:${{ github.sha }}
        cache-from: type=registry,ref=mani5grockers/live-torrent:buildcache
        cache-to: type=registry,ref=mani5grockers/live-torrent:buildcache,mode=max
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/README.md)

---

**Last Updated**: 2024-07-13  
**Version**: 4.0.0  
**Maintainer**: mani5grockers