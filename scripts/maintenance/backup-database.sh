#!/bin/bash

# Database Backup Script
set -e

echo "📦 Creating database backup..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backups directory if it doesn't exist
mkdir -p backups

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
if [[ -f "server/database/grants.db" ]]; then
    cp server/database/grants.db "backups/grants_${TIMESTAMP}.db"
    echo -e "${GREEN}✅ Database backed up to: backups/grants_${TIMESTAMP}.db${NC}"
    
    # Keep only last 10 backups
    ls -t backups/grants_*.db | tail -n +11 | xargs -r rm
    echo -e "${YELLOW}Old backups cleaned up (keeping last 10)${NC}"
else
    echo -e "${YELLOW}⚠️  Database file not found at server/database/grants.db${NC}"
fi

# Backup uploads if they exist
if [[ -d "uploads/blog" ]] && [[ "$(ls -A uploads/blog)" ]]; then
    tar -czf "backups/uploads_${TIMESTAMP}.tar.gz" uploads/
    echo -e "${GREEN}✅ Uploads backed up to: backups/uploads_${TIMESTAMP}.tar.gz${NC}"
    
    # Keep only last 5 upload backups
    ls -t backups/uploads_*.tar.gz | tail -n +6 | xargs -r rm
else
    echo -e "${YELLOW}⚠️  No uploads to backup${NC}"
fi

echo -e "${GREEN}✅ Backup process complete!${NC}"