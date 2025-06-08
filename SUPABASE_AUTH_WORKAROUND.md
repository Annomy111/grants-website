# Supabase Authentication Workaround

## Current Status

The Supabase connection has authentication issues due to an invalid service role key. However, the application has multiple fallback mechanisms in place:

1. **Static JSON Data**: The grants and filters are loaded from static JSON files when the API fails
2. **Hardcoded Admin Credentials**: The auth system has fallback credentials that work even when Supabase is down

## How to Login to Admin Panel

### Method 1: Use Hardcoded Credentials (Recommended)

The auth system has built-in fallback credentials that will work even when Supabase is down:

**Option A:**
- Username: `admin`
- Password: `admin123`

**Option B:**
- Username: `mattia`
- Password: `admin123`

These credentials are handled in the auth.js Netlify function (lines 86-147) and will:
1. Check if Supabase auth fails
2. If it fails and the credentials match the hardcoded ones, it will:
   - Create the user in Supabase if possible
   - Grant admin access regardless of Supabase status

### Method 2: Fix Supabase Service Role Key

1. Update the service role key in `/client/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM
   ```

2. Make sure the same key is in your Netlify environment variables

3. Redeploy the application

### Method 3: Use Static Data Mode

The application automatically falls back to static JSON data when Supabase is unavailable. This means:
- Grants will load from `/client/public/data/grants.json`
- Filters will load from `/client/public/data/filters.json`
- The application remains fully functional for viewing grants

## Current Fallback Status

✅ **Working:**
- Grant display (106 grants from Supabase, 107 from static JSON)
- Blog post display (1 published post)
- Static JSON fallback (all files available)
- Hardcoded admin login

❌ **Not Working:**
- Supabase service role authentication
- User management through Supabase

## Recommended Actions

1. **For immediate access**: Use the hardcoded credentials above
2. **For production**: Update the service role key in Netlify environment variables
3. **For development**: The current setup with fallbacks is sufficient

## Technical Details

The auth flow in `/client/netlify/functions/auth.js`:
1. Tries Supabase authentication first
2. If it fails, checks for hardcoded credentials
3. If credentials match, creates/updates user and grants access
4. Returns a valid JWT token for admin access

This design ensures the admin panel remains accessible even during Supabase outages.