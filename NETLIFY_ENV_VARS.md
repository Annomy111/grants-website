# Netlify Environment Variables Required

The following environment variables need to be set in your Netlify deployment:

## Required Environment Variables

### For the React App (Client-side)
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For Netlify Functions (Server-side)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
```

## How to Set These in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Click "Add a variable"
5. Add each variable with its corresponding value

## Finding Your Values

### Supabase Values
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Find:
   - `REACT_APP_SUPABASE_URL` / `SUPABASE_URL`: Your project URL (e.g., https://xxxx.supabase.co)
   - `REACT_APP_SUPABASE_ANON_KEY`: The "anon public" key
   - `SUPABASE_SERVICE_ROLE_KEY`: The "service_role" key (keep this secret!)

### Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key or use an existing one
3. Use this value for `GEMINI_API_KEY`

## Important Notes

- The client-side variables (REACT_APP_*) are exposed to the browser and should only contain public keys
- The server-side variables are kept secret and only available to Netlify Functions
- Make sure to use the exact variable names as shown above
- After adding/updating environment variables, you need to trigger a new deploy for changes to take effect

## Verifying Your Deployment

After setting the environment variables and redeploying:

1. Check the browser console for any errors
2. Test the grants page to ensure data loads
3. Test the chat widget functionality
4. Check the admin login functionality

If you still see "You need to enable JavaScript to run this app", it likely means:
- The React app isn't loading properly
- There might be a JavaScript error preventing the app from mounting
- Check the browser console for specific error messages