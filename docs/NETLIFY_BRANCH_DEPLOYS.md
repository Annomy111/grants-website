# Netlify Branch Deploy Configuration

## Overview

This guide explains how to set up branch deploys on Netlify for the Civil Society Grants Database.

## Branch Deploy Strategy

1. **main** branch → Production (grants-database.netlify.app)
2. **develop** branch → Development preview (develop--grants-database.netlify.app)
3. **feature/** branches → Deploy previews (feature-name--grants-database.netlify.app)

## Setup Instructions

### 1. Enable Branch Deploys in Netlify

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
4. Under **Branch deploys**, click **Edit settings**
5. Select **All branches** or add specific branches:
   - Add `develop` for development branch
   - Optionally add pattern `feature/*` for feature branches

### 2. Configure Deploy Contexts

The `netlify.toml` file already includes context-specific configurations:

```toml
[context.develop]
  command = "npm run build"
  [context.develop.environment]
    REACT_APP_ENV = "develop"

[context.branch-deploy]
  command = "npm run build"
  [context.branch-deploy.environment]
    REACT_APP_ENV = "preview"
```

### 3. Environment Variables per Branch

#### Option A: Via Netlify UI
1. Go to **Site settings** → **Environment variables**
2. Click on a variable to edit
3. Under **Deploy contexts**, select which branches should use this value
4. Add branch-specific values

#### Option B: Via netlify.toml
Add environment variables for specific contexts:

```toml
[context.develop.environment]
  REACT_APP_API_URL = "https://develop--grants-database.netlify.app/.netlify/functions"
  REACT_APP_ENV = "develop"
```

### 4. Create Development Branch

```bash
# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

## Branch Workflow

### Feature Development

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature

# Netlify creates deploy preview automatically
```

### Merging to Develop

```bash
# Create PR from feature branch to develop
# After review and merge, develop branch auto-deploys
```

### Production Release

```bash
# Create PR from develop to main
# After review and merge, production auto-deploys
```

## Deploy Preview Features

### Automatic Features

- **Deploy previews** for all pull requests
- **Branch deploys** for specified branches
- **Split testing** capability (A/B testing)
- **Rollback** to previous deploys

### Deploy Preview Comments

Netlify automatically comments on PRs with:
- Deploy preview URL
- Build logs link
- Deploy status

## Environment-Specific Features

Use `REACT_APP_ENV` to enable/disable features:

```javascript
// In your React code
const isDevelop = process.env.REACT_APP_ENV === 'develop';
const isPreview = process.env.REACT_APP_ENV === 'preview';

// Show debug info only in develop
{isDevelop && <DebugPanel />}

// Show preview banner
{isPreview && <PreviewBanner />}
```

## Custom Domain Setup

### For Branch Deploys

1. **Develop branch**: `develop.yourdomain.com`
   - Add CNAME record pointing to `develop--grants-database.netlify.app`

2. **Preview branches**: Use Netlify subdomains
   - Format: `branch-name--site-name.netlify.app`

## Build Notifications

### Slack Integration

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add Slack incoming webhook
3. Configure for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed

### Email Notifications

1. Same location as above
2. Add email addresses
3. Select notification types

## Debugging Branch Deploys

### Check Build Logs

1. Go to **Deploys** tab in Netlify
2. Click on specific deploy
3. View **Deploy log** for errors

### Common Issues

1. **Environment variables missing**
   - Check branch-specific env vars
   - Verify context configuration

2. **Build failures**
   - Check Node version matches
   - Review dependency differences

3. **Functions not working**
   - Ensure function env vars are set
   - Check function logs in Netlify

## Security Considerations

1. **Different API keys** per environment
2. **Restrict preview deploys** for sensitive features
3. **Password protection** for develop branch:
   ```toml
   [context.develop]
     [context.develop.headers]
       Basic-Auth = "user:password"
   ```

## Monitoring

### Netlify Analytics

- Track visits per branch deploy
- Monitor performance metrics
- View function invocations

### Build Performance

- Compare build times across branches
- Optimize slow builds
- Cache dependencies

## Best Practices

1. **Always deploy to develop first**
2. **Use feature flags** for experimental features
3. **Test on preview URLs** before merging
4. **Keep develop stable** - it's your staging environment
5. **Document branch-specific configs** in README