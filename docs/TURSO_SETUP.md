# 🚀 Turso Serverless SQLite Setup Guide

## Why Turso?

✅ **SQLite-compatible** - Your existing schema works!  
✅ **True serverless** - Scales to zero, pay per request  
✅ **Edge replication** - Fast globally  
✅ **Perfect for Netlify** - No cold start issues

## 🔧 Quick Setup (5 minutes)

### 1. Install Turso CLI

```bash
npm install -g @turso/cli
turso auth signup
```

### 2. Create Database

```bash
# Create your database
turso db create civil-society-grants

# Get connection details
turso db show civil-society-grants

# Create auth token
turso db tokens create civil-society-grants
```

### 3. Install Dependencies

```bash
# In your project root
npm install @libsql/client

# In the server directory (for migration script)
cd server && npm install @libsql/client
```

### 4. Set Environment Variables

Add to Netlify environment variables:

```bash
TURSO_DATABASE_URL=libsql://civil-society-grants-[random].turso.io
TURSO_AUTH_TOKEN=your-auth-token-from-step-2
```

Local development (create `.env` in server/):

```bash
TURSO_DATABASE_URL=libsql://civil-society-grants-[random].turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 5. Run Migration

```bash
# Make sure your environment variables are set
node scripts/migrate-to-turso.js
```

### 6. Update Netlify Configuration

Update `client/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18.19.0"

[functions]
  directory = "../netlify/functions"
  node_bundler = "esbuild"

# Enable API endpoints
[[redirects]]
  from = "/api/grants/*"
  to = "/.netlify/functions/grants/:splat"
  status = 200

[[redirects]]
  from = "/api/grants"
  to = "/.netlify/functions/grants"
  status = 200

# SPA routing for everything else
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 7. Deploy

```bash
cd client
netlify deploy --prod --dir=build
```

## 🎯 Benefits You Get

### **Before (Static JSON)**

❌ No real-time updates  
❌ No admin functionality  
❌ Manual data management  
❌ No user authentication

### **After (Turso)**

✅ **Real-time admin panel** - Add/edit grants instantly  
✅ **User authentication** - Secure admin access  
✅ **API endpoints** - `/api/grants`, `/api/filters`  
✅ **Automatic backups** - Turso handles this  
✅ **Global performance** - Edge replication  
✅ **Zero maintenance** - Serverless scaling

## 📊 Features Enabled

1. **Working Admin Panel**

   ```
   https://yoursite.com/admin/login
   - Add new grants
   - Edit existing grants
   - Manage users
   - Blog management
   ```

2. **API Endpoints**

   ```
   GET /api/grants - List all grants with filters
   GET /api/grants/:id - Get specific grant
   POST /api/grants - Create grant (admin)
   PUT /api/grants/:id - Update grant (admin)
   DELETE /api/grants/:id - Delete grant (admin)
   GET /api/grants/filters - Get filter options
   ```

3. **Real-time Updates**
   - Admin adds grant → Immediately visible on site
   - No rebuilding/redeploying needed

## 💰 Cost

**Free tier includes:**

- 500 databases
- 9GB total storage
- 1 million row reads/month
- 10,000 row writes/month

**For your grants website:** Probably free forever! 🎉

## 🔄 Migration Verification

After migration, verify it worked:

```bash
# Test API endpoint
curl https://yoursite.netlify.app/api/grants

# Should return JSON array of grants
```

## 🆘 Troubleshooting

### "Module not found: @libsql/client"

```bash
cd netlify/functions
npm install @libsql/client
```

### "Authentication failed"

```bash
# Regenerate token
turso db tokens create civil-society-grants
# Update environment variables
```

### "Database not found"

```bash
turso db list
# Make sure your database exists
```

## 🎪 Result

**Before:** Static website with JSON files  
**After:** Full-stack application with real database!

Your admin panel will actually work, and you can manage grants in real-time without touching code! 🚀
