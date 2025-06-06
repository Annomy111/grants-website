# Hey Claude 👋 this CLAUDE.md file was created by the doctor command. It should help you quickly understand how this codebase is organized and works. This is a living document - feel free to add to it!

If this is your first time here, please run the following at the start and end of your session:
- `npm run doctor` to check system status and available commands
- `npm run commit` to stage and commit your changes

Remember: Never commit secrets or API keys. Keep them in .env files!

## Common Commands

### Development
```bash
# Install all dependencies (root + client + server)
npm run install:all

# Start development environment (recommended)
cd client && netlify dev

# Alternative: Run client and server separately
cd client && npm start     # React app on :3000
cd client && netlify functions:serve  # Functions on :8888

# Build for production
cd client && npm run build

# Run tests
npm test
node tests/comprehensive-test.js
```

### Linting & Type Checking
```bash
# Client linting (if configured)
cd client && npm run lint

# No TypeScript configured yet - consider adding it
```

### Database & Data Management
```bash
# Import grants from CSV
node scripts/import-grants.js

# Setup admin users
node scripts/setup-admin-users.js

# Run Supabase migrations
cd supabase && supabase db push
```

### Deployment
```bash
# Deploy to Netlify (auto-deploys on push to main)
git push origin main

# Manual Netlify deploy
cd client && netlify deploy --prod --dir=build
```

## High-Level Code Architecture

This is a **Civil Society Grants Database** - a multilingual (English/Ukrainian) web application for discovering grants with AI-powered assistance.

### Frontend Architecture (React 18)
- **Entry Point**: `client/src/App.js` - Main router with loading animation, context providers
- **Key Contexts**:
  - `AuthContext` - Supabase authentication
  - `LanguageContext` - i18n language switching
  - `ThemeContext` - Dark/light mode
- **Routing**: React Router v6 with public/admin separation
- **State Management**: React hooks + Context API (no Redux)
- **Styling**: Tailwind CSS with dark mode support
- **i18n**: Using i18next with translations in `client/public/locales/`

### Backend Architecture
- **Primary**: Netlify Functions (serverless) in `client/netlify/functions/`
- **Secondary**: Express server in `server/` (local dev only)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth with JWT tokens
- **File Storage**: Local `uploads/` directory (consider moving to cloud storage)

### Key User Flows
1. **Grant Discovery**: HomePage → GrantsPage (filtered list) → GrantDetail
2. **AI Chat**: Floating widget using Google Gemini API for grant recommendations
3. **Admin Panel**: `/admin/login` → Dashboard with grant/blog/user management
4. **Blog System**: Public blog with AI-powered content generation for admins

### Data Flow
1. **Grants**: Supabase DB → Netlify Functions → React components
2. **Fallback**: Static JSON files in `client/public/data/` if DB fails
3. **Images**: Organization logos stored as SVGs in `client/public/images/logos/`
4. **Blog Media**: Uploaded to `uploads/blog/` directory

## Recent Changes & Known Issues

### Recent Work
- Simplified UX based on user feedback (reduced filters from 6+ to 3)
- Fixed blog creation with simplified editor (`AdminBlogEditorSimple.js`)
- Enhanced homepage with accurate statistics (107 grants, €63M+ funding)
- Fixed mobile responsiveness issues
- Added Ukrainian translations for all content

### Known Issues
- Quill editor has loading issues (using simple textarea workaround)
- Blog images stored locally (should migrate to CDN)
- No proper test suite configured
- Missing TypeScript despite React 18 support

### Active Workarounds
- Using `AdminBlogEditorSimple.js` instead of Quill-based editor
- Static JSON fallback when Supabase is unavailable
- Manual grant data updates via CSV import scripts

## Database Schema

### Main Tables (Supabase)
- `grants` - Grant information with multilingual fields
- `app_users` - Admin accounts (separate from Supabase auth.users)
- `blog_posts` - Blog content with translations
- `blog_generations` - AI-generated content tracking

### Key Grant Fields
- Basic: name, organization, website, deadline
- Multilingual: description_en/uk, eligibility_en/uk, focus_areas_en/uk
- Metadata: grant_size_min/max, type, geographic_focus
- UI: logo_url, application_url

## Environment Variables

### Required for Production
```bash
REACT_APP_SUPABASE_URL          # Supabase project URL
REACT_APP_SUPABASE_ANON_KEY     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY       # Server-side Supabase key
GOOGLE_GEMINI_API_KEY           # For AI chat functionality
```

### Development Helpers
```bash
REACT_APP_USE_STATIC_DATA       # Use JSON files instead of DB
REACT_APP_API_URL               # API endpoint override
```

## Debugging Tips

1. **Grant Display Issues**: Check `client/public/data/grants.json` format
2. **Logo Missing**: Verify SVG exists in `client/public/images/logos/`
3. **Translation Missing**: Check `client/public/locales/[lang]/translation.json`
4. **API Errors**: Netlify Functions logs in Netlify dashboard
5. **Auth Issues**: Check Supabase dashboard for user status

## Project Patterns

### Component Structure
```javascript
// Consistent pattern across pages
const ComponentName = () => {
  const { darkMode } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  // ... state and effects
  return (
    <div className={darkMode ? 'dark-styles' : 'light-styles'}>
      {/* Content */}
    </div>
  );
};
```

### API Call Pattern
```javascript
// Using axios with error handling
try {
  const response = await axios.get('/api/endpoint');
  setData(response.data);
} catch (error) {
  console.error('Error:', error);
  // Fallback to static data if available
}
```

### Tailwind Dark Mode
```javascript
// Consistent dark mode classes
className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
```

## Important Files Reference

- **Main App Logic**: `client/src/App.js`
- **Grant Display**: `client/src/pages/GrantsPage.js`
- **Homepage**: `client/src/pages/HomePage.js`
- **Admin Blog Editor**: `client/src/pages/AdminBlogEditorSimple.js`
- **API Routes**: `client/netlify/functions/*.js`
- **Grant Data Import**: `scripts/import-grants.js`
- **Database Schema**: `supabase/migrations/*.sql`

Remember: This is a public service project for civil society organizations. Keep the UX simple, accessible, and focused on helping users find relevant grants quickly!