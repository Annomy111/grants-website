#!/bin/bash
cd "/Users/winzendwyers/grants website/client"

# Automated Netlify deployment
{
  echo "2"  # Create & configure a new project
  echo ""   # Select default team
  echo "civil-society-grants-database"  # Project name
} | netlify deploy --prod --dir=build