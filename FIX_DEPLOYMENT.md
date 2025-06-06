# 🚨 Fix Deployment Issues - Quick Guide

## The Problem
Your deployed site shows "You need to enable JavaScript to run this app" because the React app is crashing due to missing environment variables. Your local version works because it has a `.env` file with Supabase credentials.

## The Solution - Add Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard
1. Log in to [Netlify](https://app.netlify.com)
2. Select your site: `civil-society-grants-database`

### Step 2: Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add these variables:

```
REACT_APP_SUPABASE_URL=https://adpddtbsstunjotxaldb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo
```

### Step 3: Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

## Why This Happens
- **Local**: Uses `.env` file with Supabase credentials ✅
- **Deployed**: No environment variables configured ❌
- **Result**: React app crashes on initialization, showing the fallback message

## Additional Variables (Optional)
If you have these features enabled, also add:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM
GOOGLE_GEMINI_API_KEY=[your-gemini-api-key-if-using-chat]
```

## Verify It's Working
After deployment:
1. Visit https://civil-society-grants-database.netlify.app
2. You should see the homepage with grants data
3. Check browser console for any errors (F12 → Console)

## Still Not Working?
1. Check Netlify build logs for errors
2. Verify environment variable names match exactly
3. Clear browser cache and try again
4. Check if Supabase project is active

---

**Note**: The `.env` file is gitignored (good practice!), which is why the deployed version doesn't have these values automatically.