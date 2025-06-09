#!/bin/bash

# Create Feature Branch Script
# Usage: ./scripts/create-feature-branch.sh feature-name

if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide a feature name"
    echo "Usage: ./scripts/create-feature-branch.sh feature-name"
    echo "Example: ./scripts/create-feature-branch.sh add-grant-filtering"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"

echo "🚀 Creating new feature branch: $BRANCH_NAME"
echo "==========================================="

# Ensure we're on develop and up to date
echo "📥 Updating develop branch..."
git checkout develop
git pull origin develop

# Create and checkout new branch
echo "🌿 Creating branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

echo ""
echo "✅ Success! You're now on branch: $BRANCH_NAME"
echo ""
echo "Next steps:"
echo "1. Make your changes"
echo "2. Commit with: git commit -m \"feat: your feature description\""
echo "3. Push with: git push -u origin $BRANCH_NAME"
echo "4. Create a PR on GitHub from $BRANCH_NAME → develop"
echo ""
echo "Happy coding! 🎉"