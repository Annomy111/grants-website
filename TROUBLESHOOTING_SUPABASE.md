# Supabase Connection Troubleshooting Guide

## Problem Summary
The site was working 2 hours ago but is now not connecting to Supabase, despite environment variables being set in Netlify.

## Investigation Results

### 1. Local Testing ✅
- Supabase connection works locally with proper environment variables
- Database contains 136 active grants
- All credentials are valid and functional

### 2. Code Analysis 

#### Environment Variable Handling
The application uses multiple naming conventions for environment variables:

**Frontend (React):**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

**Netlify Functions:**
- `SUPABASE_URL` (preferred)
- `REACT_APP_SUPABASE_URL` (fallback)
- `SUPABASE_SERVICE_ROLE_KEY` (preferred)
- `SUPABASE_ANON_KEY` (fallback)
- `REACT_APP_SUPABASE_ANON_KEY` (last fallback)

### 3. Changes Made
1. Added debug logging to `grants.js` function to track environment variable availability
2. Added multiple fallbacks for environment variable names
3. Added better error handling with detailed debug information

## Immediate Actions to Take

### 1. Verify Environment Variables in Netlify
1. Go to https://app.netlify.com
2. Select your site
3. Navigate to Site settings → Environment variables
4. Ensure these variables are set:
   ```
   REACT_APP_SUPABASE_URL=https://adpddtbsstunjotxaldb.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[your_anon_key]
   SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
   GOOGLE_GEMINI_API_KEY=[your_gemini_key]
   ```

### 2. Add Additional Variables (if not present)
Also add these for better compatibility:
   ```
   SUPABASE_URL=https://adpddtbsstunjotxaldb.supabase.co
   SUPABASE_ANON_KEY=[same as REACT_APP_SUPABASE_ANON_KEY]
   ```

### 3. Trigger a Full Rebuild
After verifying/adding variables:
1. Go to Deploys tab in Netlify
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. This ensures all environment variables are properly loaded

### 4. Test the Debug Endpoint
Once deployed, visit:
```
https://your-site.netlify.app/.netlify/functions/grants-debug
```

This will show:
- Which environment variables are available
- Connection attempt details
- Any errors encountered

### 5. Check Netlify Function Logs
1. In Netlify dashboard, go to Functions tab
2. Click on the `grants` function
3. Check recent invocations for error messages

## Common Issues and Solutions

### Issue 1: Environment Variables Not Loading
**Symptom:** Functions return "Database configuration error"
**Solution:** 
- Ensure variables are set in Netlify dashboard (not just .env files)
- Trigger a full rebuild with cache clear
- Check that variable names match exactly (case-sensitive)

### Issue 2: CORS Errors
**Symptom:** Browser console shows CORS errors
**Solution:** Already handled in code with proper headers

### Issue 3: Function Timeout
**Symptom:** 502 errors after 10 seconds
**Solution:** Check Supabase dashboard for any service issues

### Issue 4: Build vs Runtime Variables
**Note:** 
- `REACT_APP_*` variables are embedded at build time
- Non-prefixed variables are available at runtime in functions
- Both need to be set in Netlify for full functionality

## Verification Steps

1. **Check Build Logs:**
   - Look for any warnings about missing environment variables
   - Ensure build completes successfully

2. **Test API Directly:**
   ```bash
   curl https://your-site.netlify.app/.netlify/functions/grants
   ```

3. **Check Browser Console:**
   - Open DevTools on your site
   - Look for any error messages
   - Check Network tab for failed requests

4. **Use Test Page:**
   Upload the `test-netlify-api.html` file to your public folder and access it to run comprehensive tests.

## Emergency Fallback
The site is designed to fall back to static JSON data if Supabase fails. If you're seeing old data (107 grants instead of 136), it means:
1. The Supabase connection is failing
2. The app is using `/data/grants.json` as fallback
3. The static files may need updating

To update static files:
```bash
node scripts/update-static-grants.js
```

## Next Steps
1. Deploy the updated code with enhanced debugging
2. Check the debug endpoint to see what environment variables are available
3. Verify all required variables are set in Netlify
4. Trigger a full rebuild with cache clear
5. Monitor function logs for any errors

The enhanced error handling should provide clear information about what's failing.