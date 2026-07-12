# Build stage
FROM node:20-alpine AS builder

LABEL maintainer "Davenchy <firon1222@gmail.com>"
LABEL description "Build Live-Torrent server image"
LABEL version "4.0"

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built frontend from builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy server files
COPY server.js .
COPY yts-api.js .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
