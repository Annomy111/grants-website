#!/bin/bash

# Project Cleanup Script
# This script organizes the project structure and removes clutter

echo "🧹 Starting Project Cleanup..."
echo "================================"

# Create archive directories
echo "📁 Creating archive directories..."
mkdir -p archived/screenshots
mkdir -p archived/reports
mkdir -p archived/legacy-scripts
mkdir -p archived/temp-files

# Move screenshots
echo "📸 Moving screenshots..."
mv *.png archived/screenshots/ 2>/dev/null || echo "  No screenshots to move"
mv *.jpg archived/screenshots/ 2>/dev/null || echo "  No JPG files to move"

# Move report JSONs
echo "📊 Moving report files..."
mv *-report-*.json archived/reports/ 2>/dev/null || echo "  No report files to move"
mv *-log-*.json archived/reports/ 2>/dev/null || echo "  No log files to move"

# Move temporary directories
echo "📦 Moving temporary directories..."
mv temp-* archived/temp-files/ 2>/dev/null || echo "  No temp directories to move"

# Archive duplicate scripts
echo "📜 Identifying duplicate scripts..."
cd scripts/

# Logo-related scripts (keep only the best one)
mkdir -p ../archived/legacy-scripts/logo-scripts
mv *logo*.js ../archived/legacy-scripts/logo-scripts/ 2>/dev/null
# Restore the main one
mv ../archived/legacy-scripts/logo-scripts/fetch-real-logos-agents.js . 2>/dev/null

# Database scripts (keep only active ones)
mkdir -p ../archived/legacy-scripts/database-scripts
mv database-cleanup*.js ../archived/legacy-scripts/database-scripts/ 2>/dev/null
mv execute-database*.js ../archived/legacy-scripts/database-scripts/ 2>/dev/null

# Blog scripts (consolidate)
mkdir -p ../archived/legacy-scripts/blog-scripts
mv *blog*.js ../archived/legacy-scripts/blog-scripts/ 2>/dev/null
# Restore the main ones
mv ../archived/legacy-scripts/blog-scripts/create-ukraine-civil-society-post.js . 2>/dev/null

cd ..

# Update .gitignore
echo "📝 Updating .gitignore..."
cat >> .gitignore << 'EOL'

# Archived files
archived/
*.log
temp-*/
*-report-*.json
*-log-*.json

# IDE files
.idea/
.vscode/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/
EOL

# Create organized scripts structure
echo "🗂️  Organizing scripts directory..."
cd scripts/
mkdir -p database deployment maintenance utils

# Move scripts to appropriate directories
mv *database*.js database/ 2>/dev/null || true
mv *verification*.js database/ 2>/dev/null || true
mv fix-*.js database/ 2>/dev/null || true
mv add-*.js database/ 2>/dev/null || true

mv deploy*.sh deployment/ 2>/dev/null || true
mv start-*.sh deployment/ 2>/dev/null || true

mv backup*.sh maintenance/ 2>/dev/null || true
mv cleanup*.js maintenance/ 2>/dev/null || true

cd ..

# Count results
echo ""
echo "📊 Cleanup Summary:"
echo "=================="
echo "Screenshots archived: $(ls archived/screenshots/ 2>/dev/null | wc -l)"
echo "Reports archived: $(ls archived/reports/ 2>/dev/null | wc -l)"
echo "Legacy scripts archived: $(find archived/legacy-scripts/ -name "*.js" 2>/dev/null | wc -l)"
echo "Active scripts remaining: $(find scripts/ -name "*.js" -o -name "*.sh" | wc -l)"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Review archived/ directory and delete if not needed"
echo "2. Run 'git status' to see changes"
echo "3. Commit the cleaned structure"