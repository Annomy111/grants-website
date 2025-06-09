# Update Static Grants Script

This script fetches all active grants from the Supabase database and updates the static JSON files used by the frontend as fallback data.

## Purpose

The frontend uses static JSON files as a fallback when the Supabase database is unavailable. This script ensures those static files stay synchronized with the database content.

## Files Updated

The script updates the following files:
- `client/public/data/grants.json` - English grants data
- `client/public/data/grants_uk.json` - Ukrainian grants data
- `client/public/data/filters.json` - Filter options for English UI
- `client/public/data/filters_uk.json` - Filter options for Ukrainian UI

## Usage

```bash
# From project root
npm run update:static-grants

# Or directly
node scripts/update-static-grants.js

# Dry run mode (shows what would be updated without modifying files)
node scripts/update-static-grants.js --dry-run
```

## Environment Variables Required

The script needs either:
- `REACT_APP_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- OR `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## Features

- Fetches all active grants from Supabase
- Creates backups of existing JSON files before updating
- Formats data to match existing JSON structure
- Generates filter options from grant data
- Shows summary statistics after update
- Displays upcoming grant deadlines

## When to Run

Run this script:
- After importing new grants to the database
- After editing grants in the admin panel
- Before deploying to ensure static data is current
- As part of regular maintenance

## Backup Files

The script automatically creates timestamped backups of existing JSON files before updating them. Backups are saved in the same directory with a `.backup-{timestamp}.json` extension.