# Environment Variable Setup Guide

## Overview

This guide explains how to configure environment variables for the Civil Society Grants Database.

## Required Environment Variables

### For Local Development

1. Copy `.env.example` to `.env.local` in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values:

   **Supabase Configuration:**
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)

   **AI Chat:**
   - `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key for chat functionality

### For Netlify Production

1. Go to your Netlify dashboard
2. Navigate to Site settings → Environment variables
3. Add the following variables:

   ```
   REACT_APP_SUPABASE_URL=<your-supabase-url>
   REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   GOOGLE_GEMINI_API_KEY=<your-gemini-key>
   ```

## Getting Your Keys

### Supabase

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - `URL` → `REACT_APP_SUPABASE_URL`
   - `anon public` → `REACT_APP_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Google Gemini

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key → `GOOGLE_GEMINI_API_KEY`

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different keys for development and production**
3. **Rotate keys regularly**
4. **Limit API key permissions** where possible

## Troubleshooting

### Common Issues

1. **"Supabase not configured" error**
   - Check that all Supabase environment variables are set
   - Verify the URLs don't have trailing slashes

2. **AI Chat not working**
   - Ensure `GOOGLE_GEMINI_API_KEY` is set in Netlify
   - Check API key quotas in Google Console

3. **Authentication failures**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
   - Check Supabase dashboard for auth configuration

### Fallback Mode

If Supabase is unavailable, the app will:
- Use static JSON data for grants
- Allow hardcoded admin login (admin/admin123)
- Disable blog functionality

To force static data mode:
```bash
REACT_APP_USE_STATIC_DATA=true
```

## Environment Variable Reference

| Variable | Required | Description | Used By |
|----------|----------|-------------|---------|
| `REACT_APP_SUPABASE_URL` | Yes | Supabase project URL | Client & Functions |
| `REACT_APP_SUPABASE_ANON_KEY` | Yes | Public anonymous key | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side admin key | Functions only |
| `GOOGLE_GEMINI_API_KEY` | Yes | AI chat API key | Functions only |
| `REACT_APP_USE_STATIC_DATA` | No | Force static data mode | Client |
| `REACT_APP_API_URL` | No | Override API endpoint | Client |