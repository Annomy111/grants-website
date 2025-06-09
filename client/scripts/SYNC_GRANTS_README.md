# Grant Sync Script

This script synchronizes grant data between the JSON file and Supabase database.

## Purpose

The `sync-json-to-supabase.js` script ensures that the Supabase database stays in sync with the `grants.json` file. It handles:

- **Inserting** new grants that exist in JSON but not in Supabase
- **Updating** existing grants when data has changed
- **Deleting** grants that have been removed from the JSON file
- **Preserving** all grant fields including Ukrainian translations

## Usage

From the client directory:

```bash
npm run sync:grants
```

Or directly:

```bash
node scripts/sync-json-to-supabase.js
```

## Prerequisites

Ensure your `.env` file contains:
- `REACT_APP_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Features

1. **Smart Comparison**: Only updates grants that have actually changed
2. **Batch Processing**: Inserts grants in batches of 50 for efficiency
3. **Field Mapping**: Correctly maps all fields including:
   - Basic grant information
   - Detailed fields (contact info, requirements, etc.)
   - Ukrainian translations
   - Metadata (timestamps, view counts, etc.)
4. **Status Preservation**: Maintains the correct `active/inactive` status
5. **Progress Reporting**: Shows detailed sync progress and results

## What Gets Synced

- All 136 grants from the JSON file
- All grant fields including:
  - Basic info (name, organization, deadline, etc.)
  - Detailed descriptions and requirements
  - Contact information
  - Ukrainian translations
  - Keywords and metadata
  - Status and featured flags

## When to Run

Run this script when:
- You've updated the `grants.json` file manually
- You need to ensure database consistency
- After importing new grant data from CSV
- To fix any discrepancies between JSON and database

## Output Example

```
🔄 Starting JSON to Supabase sync...
📊 Found 136 grants in JSON file
🗄️  Found 107 grants in Supabase

📋 Sync Summary:
   - Grants to insert: 29
   - Grants to update: 0
   - Grants to delete: 0

➕ Inserting new grants...
✅ Inserted batch 1

✨ Sync completed! Total grants in Supabase: 136
```