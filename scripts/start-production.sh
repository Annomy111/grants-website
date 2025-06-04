#!/bin/bash

# Production Start Script
set -e

echo "🚀 Starting Civil Society Grants Website in production mode..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if production build exists
if [[ ! -d "client/build" ]]; then
    echo -e "${YELLOW}Production build not found. Running build process...${NC}"
    cd client
    npm run build
    cd ..
fi

# Check if .env exists
if [[ ! -f "server/.env" ]]; then
    echo -e "${YELLOW}No .env file found. Copying from .env.production...${NC}"
    cp server/.env.production server/.env
fi

# Start the server
echo -e "${GREEN}Starting server...${NC}"
cd server
NODE_ENV=production npm start