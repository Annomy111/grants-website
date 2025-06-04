# Multi-stage Docker build for Civil Society Grants Website

# Stage 1: Build React application
FROM node:18-alpine AS frontend-build

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy client source
COPY client/ ./

# Build the React application
RUN npm run build

# Stage 2: Setup Node.js server
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    sqlite \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm ci --only=production && npm cache clean --force

# Copy server source
COPY server/ ./server/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/client/build ./client/build

# Copy configuration files
COPY scripts/ ./scripts/
COPY config/ ./config/

# Create necessary directories
RUN mkdir -p uploads/blog server/logs backups \
    && chown -R nodejs:nodejs /app

# Copy environment template
COPY server/.env.production ./server/.env.template

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "http.get('http://localhost:5001/api/grants', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/server.js"]