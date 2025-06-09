# Backend Architecture Documentation

## Current Architecture (As of June 2025)

This project uses a **pure serverless architecture** with Netlify Functions. The Express server has been removed from production use.

### Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Client   │────▶│ Netlify Functions│────▶│    Supabase     │
│   (Frontend)    │     │  (Serverless)   │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
   [Static CDN]            [AWS Lambda]              [PostgreSQL]
   - HTML/CSS/JS          - API Logic               - Grant Data
   - Assets               - Auth                    - User Data
   - Translations         - Business Logic          - Blog Posts
```

## Netlify Functions

Location: `/client/netlify/functions/`

### Available Functions

1. **auth.js**
   - POST `/auth/login` - User authentication
   - GET `/auth/me` - Get current user
   - POST `/auth/change-password` - Change password

2. **grants.js**
   - GET `/grants` - List all grants
   - GET `/grants/:id` - Get specific grant
   - GET `/grants/filters` - Get filter options
   - POST `/grants` - Create grant (admin)
   - PUT `/grants/:id` - Update grant (admin)
   - DELETE `/grants/:id` - Delete grant (admin)

3. **blog.js**
   - GET `/blog` - List blog posts
   - GET `/blog/:id` - Get specific post
   - GET `/blog/slug/:slug` - Get post by slug
   - POST `/blog` - Create post (admin)
   - PUT `/blog/:id` - Update post (admin)
   - DELETE `/blog/:id` - Delete post (admin)

4. **chat.js**
   - POST `/chat` - AI-powered grant recommendations using Google Gemini

## Database

- **Provider**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT tokens
- **Row Level Security**: Enabled for all tables

### Main Tables

- `grants` - Grant information with multilingual fields
- `app_users` - Admin accounts (separate from Supabase auth.users)
- `blog_posts` - Blog content with translations
- `blog_generations` - AI-generated content tracking (unused in production)

## Environment Variables

### Required for Production

```bash
REACT_APP_SUPABASE_URL          # Supabase project URL
REACT_APP_SUPABASE_ANON_KEY     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY       # Server-side Supabase key
GOOGLE_GEMINI_API_KEY           # For AI chat functionality
```

## Migration History

### Express Server Removal (June 2025)

The Express server (`/server` directory) was removed as it contained features not used in production:

**Removed Features:**
- Blog Generation System (AI-powered content generation)
- User Management (full CRUD for admin users)
- Background Jobs (automated content aggregation)
- Local SQLite Database (development only)
- News Aggregation APIs
- Social Media Monitoring
- Statistics Services

**Why Removed:**
1. Not deployed to production (Netlify doesn't support Express)
2. Duplicate functionality with Netlify Functions
3. Reduced complexity and maintenance burden
4. Focused on working production features

### Admin UI Updates

Removed non-functional menu items:
- Blog Generation menu and pages
- Users management menu and pages

## Development Workflow

### Local Development
```bash
cd client && netlify dev
```

### Production Deployment
- Automatic via Netlify on push to `main` branch
- Manual: `cd client && netlify deploy --prod`

## Security Considerations

1. **Authentication**: JWT tokens with Supabase Auth
2. **Authorization**: Role-based access (admin, editor, viewer)
3. **API Security**: All admin endpoints require authentication
4. **Database Security**: Row Level Security enabled
5. **Fallback Auth**: Hardcoded admin credentials for emergency access

## Performance Optimizations

1. **Static JSON Fallback**: When Supabase is unavailable
2. **CDN Distribution**: All static assets via Netlify CDN
3. **Serverless Functions**: Auto-scaling with AWS Lambda
4. **Client-side Caching**: React Query for API responses

## Future Considerations

1. **Blog Media**: Currently stored locally, should migrate to CDN
2. **TypeScript**: Add type safety to the codebase
3. **Testing**: Implement proper test suite
4. **Monitoring**: Add error tracking and performance monitoring