# Deployment Troubleshooting Guide

## Issue: "You need to enable JavaScript to run this app"

This error typically means the React app isn't loading properly. Here's a comprehensive troubleshooting guide:

## 1. Check Browser Console

Open the browser developer tools (F12) and check the Console tab for errors:

### Common Errors and Solutions:

#### a) Supabase Connection Error
```
Error: Invalid Supabase URL or Key
```
**Solution**: Set the required environment variables in Netlify:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

#### b) 404 Errors for Static Files
```
GET https://yoursite.netlify.app/static/js/main.xxx.js 404
```
**Solution**: 
- Ensure the build command is `npm run build`
- Ensure the publish directory is `build`
- Check that the build completes successfully

#### c) CORS Errors
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solution**: This is handled in the Netlify functions, but ensure all environment variables are set.

## 2. Verify Netlify Configuration

In your Netlify dashboard:

### Build Settings
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Functions directory**: `netlify/functions`

### Environment Variables Required
```
# Client-side (React App)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side (Netlify Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
```

## 3. Quick Fix: Use Static Data Mode

If you need the site working immediately without database connection:

1. In Netlify, set environment variable:
   ```
   REACT_APP_USE_STATIC_DATA=true
   ```

2. This will use the JSON files in `/public/data/` instead of Supabase

## 4. Deployment Checklist

Before deploying, ensure:

- [ ] All dependencies are listed in `client/package.json`
- [ ] No hardcoded API keys in the code
- [ ] Build runs successfully locally: `cd client && npm run build`
- [ ] All required environment variables are set in Netlify
- [ ] The `netlify.toml` file is in the `client` directory
- [ ] Node version is specified (18.19.0 in netlify.toml)

## 5. Testing After Deployment

1. **Basic Load Test**:
   - Visit your site
   - Open browser console
   - Check for any errors

2. **Functionality Test**:
   - Navigate to `/grants` - should show grant listings
   - Test language switcher (EN/UK)
   - Test dark mode toggle
   - Test chat widget (bottom right)

3. **API Test**:
   - Visit `https://yoursite.netlify.app/api/grants`
   - Should return JSON data or error message

## 6. Common Netlify Issues

### Deploy Failed
Check the deploy log in Netlify dashboard for:
- Missing dependencies
- Build errors
- Node version mismatches

### Functions Not Working
- Ensure functions are in `client/netlify/functions/`
- Check function logs in Netlify dashboard
- Verify all server-side environment variables are set

### Site Loads but No Data
- Check if `REACT_APP_USE_STATIC_DATA` is set to `false`
- Verify Supabase credentials are correct
- Check Supabase dashboard for any issues

## 7. Emergency Fallback

If you need the site working immediately:

1. Set `REACT_APP_USE_STATIC_DATA=true` in Netlify
2. Redeploy
3. Site will use static JSON data from `/public/data/`

This allows the site to function while you troubleshoot database issues.

## 8. Still Having Issues?

1. Clear your browser cache
2. Try incognito/private browsing mode
3. Check Netlify status page: https://www.netlifystatus.com/
4. Review deploy logs in Netlify dashboard
5. Check Supabase dashboard for any service issues

## Contact Support

If issues persist, provide:
- Browser console errors
- Netlify deploy logs
- Which step in this guide failed