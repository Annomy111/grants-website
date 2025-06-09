# Netlify Setup Guide

This guide will help you connect your GitHub repository to Netlify for automatic deployments.

## Prerequisites

- GitHub repository created and pushed (✓ Complete)
- Netlify account (free tier works)
- Supabase project credentials

## Option 1: Netlify Web Dashboard (Recommended)

### Step 1: Import from GitHub

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select the **grants-website** repository

### Step 2: Configure Build Settings

Set these build settings:

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `client/build`
- **Functions directory**: `client/netlify/functions`

### Step 3: Set Environment Variables

Click **"Show advanced"** before deploying and add:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REACT_APP_USE_STATIC_DATA=false
NODE_VERSION=18.19.0
NPM_FLAGS=--no-optional
```

Optional (for AI chat):

```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 4: Deploy

Click **"Deploy site"** and wait for the build to complete.

## Option 2: Netlify CLI

If you prefer using the CLI:

```bash
# Link to existing site
netlify link

# Or create new site
netlify init

# Deploy
netlify deploy --prod
```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

### 2. Build Hooks

For manual deployments without pushing to GitHub:

1. Go to **Site settings** → **Build & deploy** → **Build hooks**
2. Create a new build hook
3. Use the webhook URL to trigger builds

### 3. Deploy Notifications

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add email or Slack notifications for:
   - Deploy succeeded
   - Deploy failed
   - Deploy started

### 4. Environment Variables Management

To update environment variables after deployment:

1. Go to **Site settings** → **Environment variables**
2. Add, edit, or delete variables
3. Trigger a new deploy for changes to take effect

## Deployment Status Badge

Add this to your README.md:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

## Troubleshooting

### Build Failures

1. Check build logs in Netlify dashboard
2. Common issues:
   - Missing environment variables
   - Node version mismatch
   - Package installation errors

### Function Errors

1. Check function logs: **Functions** tab in Netlify dashboard
2. Verify environment variables are set
3. Test locally with `netlify dev`

### Slow Builds

1. Check if `node_modules` is being cached
2. Optimize build command
3. Use `NPM_FLAGS=--no-optional`

## Continuous Deployment

With GitHub connected:

1. **Production branch (main)**: Auto-deploys to production URL
2. **Pull requests**: Get preview deployments
3. **Other branches**: Can enable branch deploys

## Advanced Configuration

### Redirects and Headers

Already configured in `netlify.toml`:

- API routes proxy to functions
- SPA routing for React
- Cache headers for assets

### Build Plugins

Consider adding:

- Lighthouse CI for performance monitoring
- Sitemap generation
- Image optimization

## Monitoring

1. **Analytics**: Enable Netlify Analytics (paid feature)
2. **Forms**: Netlify can handle form submissions
3. **Functions**: Monitor usage and errors

---

Your site should now be live at: `https://YOUR-SITE-NAME.netlify.app`
