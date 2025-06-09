#!/bin/bash

# Production Deployment Script for Civil Society Grants Website
set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Backup database if it exists
if [[ -f "server/database/grants.db" ]]; then
    echo -e "${YELLOW}Creating database backup...${NC}"
    cp server/database/grants.db server/database/grants.db.backup.$(date +%Y%m%d_%H%M%S)
fi

# Install dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd server
npm ci --only=production
cd ..

echo -e "${YELLOW}Installing client dependencies...${NC}"
cd client
npm ci

# Build the React app
echo -e "${YELLOW}Building React application...${NC}"
npm run build

cd ..

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p server/logs
mkdir -p uploads/blog

# Set up environment
echo -e "${YELLOW}Setting up production environment...${NC}"
if [[ ! -f "server/.env" ]]; then
    cp server/.env.production server/.env
    echo -e "${GREEN}Created .env file from .env.production template${NC}"
    echo -e "${RED}⚠️  IMPORTANT: Please update the .env file with your production values!${NC}"
fi

# Initialize database with indexes if needed
echo -e "${YELLOW}Initializing database...${NC}"
cd server
node database/init.js
cd ..

# Set proper permissions (if on Linux/Unix)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}Setting file permissions...${NC}"
    chmod +x scripts/*.sh
    chmod 755 uploads/blog
fi

echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update server/.env with your production values"
echo "2. Configure your reverse proxy (nginx/apache)"
echo "3. Set up SSL certificates"
echo "4. Start the application with: npm run start:prod"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo "npm run start:prod"