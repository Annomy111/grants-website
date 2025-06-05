# Deployment Guide

This guide covers deploying the Civil Society Grants Database to production using Netlify and Supabase.

## Prerequisites

- GitHub account with repository access
- Netlify account (free tier works)
- Supabase account (free tier works)
- Domain name (optional)

## Step 1: Prepare Your Repository

### 1.1 Clean Up Repository

Before pushing to GitHub, ensure your repository is clean:

```bash
# Remove all test files and reports
rm -f *-test.js *-debug.js *-report.* test-*.js debug-*.js
rm -f check-*.js diagnose-*.js verify-*.js simple-*.js
rm -f final-*.js puppeteer-*.js quick-*.js
rm -f investigate-*.js find-*.js generate-*.js
rm -f ukrainian-translation-*.js

# Remove analysis reports
rm -f *_REPORT.md *_ANALYSIS.md *_SUMMARY.md

# Remove build artifacts
rm -f client/build-deployment.zip

# Ensure .gitignore is updated
git add .gitignore
```

### 1.2 Commit Changes

```bash
git add .
git commit -m "Prepare for production deployment"
```

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `grants-website`
3. Make it public or private as needed
4. Don't initialize with README (we already have one)

### 2.2 Push Code

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/grants-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Supabase Setup

### 3.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `grants-database`
   - Database password: (save this securely)
   - Region: Choose closest to your users

### 3.2 Run Database Migrations

1. In Supabase Dashboard, go to SQL Editor
2. Run each migration file in order:

```sql
-- Run these in order:
-- 1. supabase/migrations/20250604202627_create_grants_schema.sql
-- 2. supabase/migrations/20250604205730_create_app_users_table.sql
-- 3. supabase/migrations/20250604220000_fix_app_users_rls.sql
-- 4. supabase/migrations/20250604220100_disable_app_users_rls.sql
-- 5. supabase/migrations/20250604223000_create_blog_posts_table.sql
-- 6. supabase/migrations/20250605000001_enhance_grants_schema.sql
-- 7. supabase/migrations/20250605120000_add_ukrainian_translations.sql
```

### 3.3 Import Grant Data

1. Clone your repo locally (if not already)
2. Update `.env` with Supabase credentials:
```bash
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
3. Run import script:
```bash
node scripts/import-grants.js
```

### 3.4 Get API Keys

From Supabase Dashboard > Settings > API:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret!)

## Step 4: Netlify Deployment

### 4.1 Connect GitHub to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify to access your GitHub
5. Select your `grants-website` repository

### 4.2 Configure Build Settings

Set the following build settings:

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `client/build`
- **Functions directory**: `client/netlify/functions`

### 4.3 Environment Variables

In Netlify Dashboard > Site settings > Environment variables, add:

```bash
# Required
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REACT_APP_USE_STATIC_DATA=false

# Optional (for AI chat)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Build settings
NODE_VERSION=18.19.0
NPM_FLAGS=--no-optional
```

### 4.4 Deploy

1. Click "Deploy site"
2. Wait for build to complete (3-5 minutes)
3. Your site will be live at `https://YOUR-SITE-NAME.netlify.app`

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Netlify > Domain settings
2. Add custom domain
3. Follow DNS configuration instructions

### 5.2 Enable HTTPS

Netlify automatically provisions SSL certificates via Let's Encrypt.

## Step 6: Post-Deployment

### 6.1 Test Everything

- [ ] Homepage loads correctly
- [ ] Language switching works (EN/UK)
- [ ] Grants display with all information
- [ ] Filters work properly
- [ ] Chat widget functions (if API key set)
- [ ] Admin login works
- [ ] Admin can edit grants

### 6.2 Set Up Monitoring

1. Enable Netlify Analytics (optional)
2. Set up error tracking (Sentry, etc.)
3. Configure uptime monitoring

### 6.3 Backup Strategy

1. Enable Supabase automatic backups
2. Set up regular data exports
3. Keep local backups of:
   - Grant data CSV
   - Organization logos
   - Blog content

## Continuous Deployment

With GitHub connected, every push to `main` branch will:

1. Trigger Netlify build
2. Run build command
3. Deploy if successful
4. Keep previous version if build fails

### Branch Deploys

For staging environments:

1. Create a `develop` branch
2. Enable branch deploys in Netlify
3. Access at `develop--YOUR-SITE-NAME.netlify.app`

## Troubleshooting

### Build Failures

1. Check build logs in Netlify
2. Common issues:
   - Missing environment variables
   - Node version mismatch
   - Package installation errors

### Function Errors

1. Check function logs in Netlify
2. Verify environment variables
3. Test locally with `netlify dev`

### Database Connection Issues

1. Verify Supabase is not paused (free tier)
2. Check service role key is correct
3. Verify RLS policies if enabled

## Rollback

If issues occur:

1. In Netlify > Deploys
2. Find last working deploy
3. Click "Publish deploy"

## Security Checklist

- [ ] Environment variables are set (not in code)
- [ ] Service role key is in Netlify only
- [ ] No sensitive data in Git history
- [ ] CORS properly configured
- [ ] RLS policies enabled (if needed)
- [ ] Admin routes protected

---

For additional help, check:
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)
- Project README.md