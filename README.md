# Civil Society Grants Database 🌍

A comprehensive multilingual web application for discovering and managing civil society grants, featuring English/Ukrainian support, AI-powered grant assistance, and a modern admin dashboard.

## 🌟 Features

### Public Features
- **Multilingual Support**: Full English and Ukrainian translations for all 107+ grants
- **Advanced Grant Search**: Filter by organization, eligibility, grant type, and deadline
- **AI Chat Assistant**: Get personalized grant recommendations via AI-powered chat
- **Detailed Grant Information**: Comprehensive details including eligibility criteria, focus areas, and application links
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Organization Logos**: Visual representation of 50+ funding organizations
- **Real-time Updates**: Live data from Supabase PostgreSQL database

### Admin Panel Features
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Grant Management**: Full CRUD operations for grants with multilingual support
- **Blog System**: AI-powered blog generation with rich text editor
- **User Management**: Admin account creation and role management
- **Dashboard Analytics**: Real-time statistics and usage metrics
- **Translation Management**: Manage content in multiple languages

## 📁 Project Structure

```
grants-website/
├── client/                    # React 18 frontend
│   ├── public/               # Static assets
│   │   ├── data/            # JSON data (fallback)
│   │   ├── images/logos/    # Organization logos (SVG)
│   │   └── locales/         # i18n translations
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts (Auth, Theme, Language)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and Supabase client
│   └── netlify/
│       └── functions/       # Serverless API endpoints
├── server/                   # Local development server (optional)
├── scripts/                  # Data import and utility scripts
├── supabase/                # Database migrations and config
│   └── migrations/         # SQL migration files
└── docs/                    # Additional documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Netlify account (for deployment)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/[YOUR_USERNAME]/grants-website.git
cd grants-website
```

2. Install all dependencies
```bash
npm run install:all
```

3. Set up environment variables

Create `.env` files in the client directory:

**client/.env.local**
```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:8888/.netlify/functions
REACT_APP_USE_STATIC_DATA=false
REACT_APP_GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

**client/.env.production**
```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=/.netlify/functions
REACT_APP_USE_STATIC_DATA=false
```

4. Set up Supabase database

- Create a new Supabase project
- Run migrations from `supabase/migrations/` in order
- Or use Supabase CLI:
```bash
cd supabase
supabase db push
```

5. Import grant data
```bash
node scripts/import-grants.js
```

### Running the Application

**Development with Netlify Dev (Recommended)**
```bash
cd client
netlify dev
```

This starts both the React dev server and Netlify Functions.

**Alternative: Run separately**
```bash
# Terminal 1 - React app
cd client
npm start

# Terminal 2 - Netlify Functions
cd client
netlify functions:serve
```

Access the application:
- Main site: http://localhost:3000
- API functions: http://localhost:8888/.netlify/functions/
- Admin panel: http://localhost:3000/admin

### Setting up Admin Access

1. Create admin users via Supabase dashboard or script:
```bash
node scripts/setup-admin-users.js
```

2. Use Supabase Auth for login

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript support
- **Tailwind CSS** for styling
- **i18next** for internationalization
- **React Router v6** for navigation
- **Axios** for API calls
- **React Quill** for rich text editing

### Backend
- **Netlify Functions** (AWS Lambda)
- **Supabase** for database and auth
- **Node.js 18+** runtime

### Database
- **Supabase (PostgreSQL)** with:
  - `grants` - Grant information with Ukrainian translations
  - `app_users` - Admin accounts
  - `blog_posts` - Blog content
  - `blog_generations` - AI-generated content

## 🚀 Deployment

### Automatic Deployment via GitHub

1. **Push to GitHub**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Connect to Netlify**
- Import your GitHub repository in Netlify
- Configure build settings:
  - Build command: `cd client && npm run build`
  - Publish directory: `client/build`
  - Functions directory: `client/netlify/functions`

3. **Set Environment Variables in Netlify**
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REACT_APP_USE_STATIC_DATA=false
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### Manual Deployment
```bash
cd client
npm run build
netlify deploy --prod --dir=build
```

## 🌐 API Documentation

### Public Endpoints

**GET /api/grants**
- Fetch all grants with pagination
- Query params: `limit`, `offset`, `organization`, `type`

**GET /api/grants/:id**
- Get specific grant details

**POST /api/chat/grants**
- AI-powered grant recommendations
- Body: `{ "message": "your question", "language": "en|uk" }`

### Protected Endpoints (Admin)

**POST /api/auth/login**
- Admin authentication

**PUT /api/grants/:id**
- Update grant information

**POST /api/blog**
- Create/update blog posts

## 🔒 Security

- Supabase Row Level Security (RLS) policies
- JWT authentication for admin routes
- Environment variables for sensitive data
- CORS configured for production
- Input validation and sanitization

## 🧪 Testing

```bash
# Run tests
npm test

# Test API endpoints
node tests/test-api.js

# Test chat functionality
node tests/test-chat.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Grant data sourced from various civil society organizations
- Ukrainian translations by AI-powered translation system
- Organization logos collected via automated agents

---

Built with ❤️ for civil society organizations worldwide
