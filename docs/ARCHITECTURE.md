# Architecture Overview

## System Architecture

The Civil Society Grants Database follows a modern JAMstack architecture with the following components:

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

## Frontend Architecture

### Technology Stack
- **React 18**: UI library with hooks and functional components
- **TypeScript**: Type safety (optional, can be added)
- **Tailwind CSS**: Utility-first CSS framework
- **i18next**: Internationalization framework

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation and language switcher
│   ├── Footer.js       # Site footer
│   ├── GrantEditModal.js    # Admin grant editing
│   └── GrantsChatWidget.js  # AI chat interface
│
├── pages/              # Route-based page components
│   ├── HomePage.js     # Landing page
│   ├── GrantsPage.js   # Grant listing and filtering
│   ├── GrantDetail.js  # Individual grant view
│   ├── BlogPage.js     # Blog listing
│   ├── AdminDashboard.js    # Admin overview
│   └── AdminGrants.js       # Grant management
│
├── context/            # React Context providers
│   ├── AuthContext.js  # Authentication state
│   ├── ThemeContext.js # Dark/light mode
│   └── LanguageContext.js   # i18n integration
│
├── hooks/              # Custom React hooks
│   └── useQuillLoader.js    # Rich text editor loader
│
└── lib/                # Utilities and configuration
    └── supabase.js     # Supabase client setup
```

### State Management

1. **Local State**: useState for component-specific state
2. **Context API**: For global state (auth, theme, language)
3. **Supabase Realtime**: For live data updates (optional)

### Routing

- **React Router v6**: Client-side routing
- Protected routes for admin sections
- Lazy loading for code splitting

## Backend Architecture

### Serverless Functions

Located in `client/netlify/functions/`:

```
functions/
├── auth.js        # Authentication endpoints
├── grants.js      # Grant CRUD operations
├── chat.js        # AI chat integration
└── blog.js        # Blog management
```

### API Design

RESTful API endpoints:

```
GET    /api/grants          # List all grants
GET    /api/grants/:id      # Get specific grant
POST   /api/grants          # Create grant (admin)
PUT    /api/grants/:id      # Update grant (admin)
DELETE /api/grants/:id      # Delete grant (admin)

POST   /api/auth/login      # Admin login
POST   /api/auth/logout     # Admin logout
GET    /api/auth/me         # Current user

POST   /api/chat/grants     # AI chat query
```

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌───────────┐
│  Client  │────▶│   Netlify    │────▶│ Supabase  │
│          │     │  Function    │     │   Auth    │
└──────────┘     └──────────────┘     └───────────┘
     │                   │                    │
     │   1. Login        │   2. Verify        │
     │   Credentials     │   with Supabase    │
     │                   │                    │
     │◀──────────────────┤◀───────────────────┤
     │   4. JWT Token    │   3. User Data     │
```

## Database Architecture

### Schema Design

**grants table**
```sql
- id (uuid, primary key)
- grant_name (text)
- grant_name_uk (text)
- funding_organization (text)
- funding_organization_uk (text)
- description (text)
- description_uk (text)
- focus_area (text[])
- focus_area_uk (text[])
- eligibility_criteria (text)
- eligibility_criteria_uk (text)
- eligible_countries (text[])
- eligible_countries_uk (text[])
- grant_type (text)
- grant_type_uk (text)
- grant_size (text)
- grant_size_uk (text)
- application_deadline (text)
- application_link (text)
- logo_url (text)
- additional_info (text)
- additional_info_uk (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**app_users table**
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- role (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**blog_posts table**
```sql
- id (uuid, primary key)
- title (text)
- slug (text, unique)
- content (text)
- excerpt (text)
- author_id (uuid, foreign key)
- status (text)
- published_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### Data Access Patterns

1. **Public Access**: Read-only for grants and blog posts
2. **Admin Access**: Full CRUD with authentication
3. **Row Level Security**: Implemented via Supabase RLS

## Deployment Architecture

### CI/CD Pipeline

```
GitHub Push → Netlify Build → Deploy to CDN
     │              │              │
     ▼              ▼              ▼
[Webhook]    [Build Process]  [Global CDN]
             - Install deps    - Static files
             - Build React     - Functions
             - Bundle          - Edge network
```

### Infrastructure

1. **Netlify**
   - Static site hosting
   - Serverless functions (AWS Lambda)
   - Automatic SSL
   - Global CDN

2. **Supabase**
   - PostgreSQL database
   - Authentication service
   - Realtime subscriptions
   - Storage (future: blog images)

3. **External APIs**
   - Google Gemini for AI chat
   - Future: Email service

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization (SVG logos)
- Static data fallback
- Service worker (optional)

### Backend
- Serverless function caching
- Database query optimization
- Connection pooling
- API response caching

### Caching Strategy

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Browser │────▶│   CDN   │────▶│ Function │────▶│ Database │
│  Cache  │     │  Cache  │     │  Cache   │     │          │
└─────────┘     └─────────┘     └──────────┘     └──────────┘
  1 hour         1 day          5 minutes         Source
```

## Security Architecture

### Authentication
- Supabase Auth with JWT tokens
- Secure HTTP-only cookies (optional)
- Role-based access control

### API Security
- CORS configuration
- Rate limiting (via Netlify)
- Input validation
- SQL injection prevention (via Supabase)

### Data Protection
- Environment variables for secrets
- No sensitive data in Git
- Encrypted database connections
- HTTPS everywhere

## Scalability Considerations

### Horizontal Scaling
- Serverless functions auto-scale
- CDN handles traffic spikes
- Database connection pooling

### Vertical Scaling
- Upgrade Supabase tier for more resources
- Increase Netlify function timeout/memory
- Add caching layers

### Future Considerations
1. **Microservices**: Split functions by domain
2. **GraphQL**: For complex data queries
3. **Redis Cache**: For session/data caching
4. **Image CDN**: For blog post images
5. **Search Service**: Elasticsearch/Algolia integration

## Monitoring and Observability

### Application Monitoring
- Netlify Analytics
- Function logs
- Error tracking (Sentry)

### Performance Monitoring
- Core Web Vitals
- API response times
- Database query performance

### Business Metrics
- Grant views/applications
- User engagement
- Popular search terms

---

This architecture provides a solid foundation for growth while maintaining simplicity and cost-effectiveness.