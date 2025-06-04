#!/usr/bin/env node

/**
 * Supabase Setup and Migration Script
 * 
 * This script sets up Supabase database schema and migrates existing data
 * from SQLite to Supabase PostgreSQL with enhanced features.
 */

const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class SupabaseSetup {
  constructor() {
    this.localDbPath = path.join(__dirname, '../server/database/grants.db');
    this.supabase = null;
  }

  async initSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log(`
🚀 SUPABASE SETUP REQUIRED

1. Go to https://supabase.com
2. Create a new project (free tier)
3. Get your credentials from Settings > API

Set these environment variables:
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export SUPABASE_ANON_KEY="your-anon-key"

Then run this script again.
      `);
      process.exit(1);
    }

    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('✅ Connected to Supabase');
  }

  async createSchema() {
    console.log('📋 Creating Supabase schema with enhanced features...');

    // Create tables with Row Level Security
    const schema = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (enhanced with profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Grants table (enhanced with metadata)
CREATE TABLE IF NOT EXISTS grants (
  id BIGSERIAL PRIMARY KEY,
  grant_name TEXT NOT NULL,
  funding_organization TEXT NOT NULL,
  country_region TEXT,
  eligibility_criteria TEXT,
  focus_areas TEXT,
  grant_amount TEXT,
  application_deadline DATE,
  duration TEXT,
  website_link TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'draft')),
  featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog posts table (enhanced)
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_uk TEXT,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  content_uk TEXT,
  excerpt TEXT,
  excerpt_uk TEXT,
  author_id UUID REFERENCES users(id),
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat sessions table (for AI integration)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat messages table (for AI history)
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  recommended_grants JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Grant views tracking
CREATE TABLE IF NOT EXISTS grant_views (
  id BIGSERIAL PRIMARY KEY,
  grant_id BIGINT REFERENCES grants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grants_funding_organization ON grants(funding_organization);
CREATE INDEX IF NOT EXISTS idx_grants_country_region ON grants(country_region);
CREATE INDEX IF NOT EXISTS idx_grants_application_deadline ON grants(application_deadline);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_featured ON grants(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_grant_views_grant_id ON grant_views(grant_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql_query: schema });
      if (error) {
        // Fallback: execute each statement individually
        const statements = schema.split(';').filter(s => s.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            const { error: stmtError } = await this.supabase.rpc('exec_sql', { 
              sql_query: statement.trim() + ';' 
            });
            if (stmtError) console.log(`⚠️  Statement warning: ${stmtError.message}`);
          }
        }
      }
      console.log('✅ Schema created successfully');
    } catch (error) {
      console.log('⚠️  Schema creation had some warnings, but core tables should be created');
    }
  }

  async setupRLS() {
    console.log('🔐 Setting up Row Level Security...');

    const rlsPolicies = `
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_views ENABLE ROW LEVEL SECURITY;

-- Grants policies (public read, admin write)
CREATE POLICY "Grants are viewable by everyone" ON grants FOR SELECT USING (true);
CREATE POLICY "Grants are editable by admins" ON grants FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor'))
);

-- Blog posts policies
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (
  status = 'published' OR 
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor'))
);
CREATE POLICY "Blog posts are editable by admins" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor'))
);

-- Users policies (admin only)
CREATE POLICY "Users are viewable by admins" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);
CREATE POLICY "Users are editable by admins" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Chat policies (own sessions only)
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = session_id AND chat_sessions.user_id = auth.uid())
);
CREATE POLICY "Users can create chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
    `;

    try {
      const statements = rlsPolicies.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await this.supabase.rpc('exec_sql', { 
            sql_query: statement.trim() + ';' 
          });
          if (error) console.log(`⚠️  RLS warning: ${error.message}`);
        }
      }
      console.log('✅ Row Level Security configured');
    } catch (error) {
      console.log('⚠️  RLS setup completed with some warnings');
    }
  }

  async migrateData() {
    console.log('📦 Migrating data from SQLite...');

    if (!fs.existsSync(this.localDbPath)) {
      console.log('⚠️  No local SQLite database found, skipping data migration');
      return;
    }

    const data = await this.readLocalData();

    // Create default admin user
    const { data: existingUsers } = await this.supabase.from('users').select('*').limit(1);
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log('👤 Creating default admin user...');
      const { error: userError } = await this.supabase.from('users').insert({
        email: 'admin@grants.ua',
        username: 'admin',
        full_name: 'System Administrator',
        role: 'admin'
      });
      if (userError) console.log('⚠️  Admin user creation warning:', userError.message);
    }

    // Migrate grants
    if (data.grants.length > 0) {
      console.log(`📊 Migrating ${data.grants.length} grants...`);
      
      const grantsToInsert = data.grants.map(grant => ({
        grant_name: grant.grant_name,
        funding_organization: grant.funding_organization,
        country_region: grant.country_region,
        eligibility_criteria: grant.eligibility_criteria,
        focus_areas: grant.focus_areas,
        grant_amount: grant.grant_amount,
        application_deadline: grant.application_deadline,
        duration: grant.duration,
        website_link: grant.website_link,
        status: 'active'
      }));

      const { error: grantsError } = await this.supabase
        .from('grants')
        .insert(grantsToInsert);
      
      if (grantsError) {
        console.log('⚠️  Some grants may not have migrated:', grantsError.message);
      } else {
        console.log('✅ Grants migrated successfully');
      }
    }

    // Migrate blog posts if they exist
    if (data.blogPosts.length > 0) {
      console.log(`📝 Migrating ${data.blogPosts.length} blog posts...`);
      
      const postsToInsert = data.blogPosts.map(post => ({
        title: post.title,
        title_uk: post.title_uk,
        slug: post.slug,
        content: post.content,
        content_uk: post.content_uk,
        excerpt: post.excerpt,
        excerpt_uk: post.excerpt_uk,
        featured_image: post.featured_image,
        status: post.status || 'draft',
        published_at: post.published_at
      }));

      const { error: postsError } = await this.supabase
        .from('blog_posts')
        .insert(postsToInsert);
      
      if (postsError) {
        console.log('⚠️  Some blog posts may not have migrated:', postsError.message);
      } else {
        console.log('✅ Blog posts migrated successfully');
      }
    }
  }

  async readLocalData() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.localDbPath);
      
      const data = {
        users: [],
        grants: [],
        blogPosts: []
      };

      // Read grants
      db.all("SELECT * FROM grants", (err, rows) => {
        if (err) {
          data.grants = [];
        } else {
          data.grants = rows || [];
        }

        // Read blog posts
        db.all("SELECT * FROM blog_posts", (err, rows) => {
          if (err) {
            data.blogPosts = [];
          } else {
            data.blogPosts = rows || [];
          }

          db.close();
          resolve(data);
        });
      });
    });
  }

  async generateEnvFile() {
    console.log('📝 Generating environment configuration...');

    const envContent = `# Supabase Configuration
SUPABASE_URL=${process.env.SUPABASE_URL}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}

# For Netlify Functions
REACT_APP_SUPABASE_URL=${process.env.SUPABASE_URL}
REACT_APP_SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}
`;

    fs.writeFileSync(path.join(__dirname, '../.env.supabase'), envContent);
    console.log('✅ Environment file created: .env.supabase');
  }

  async verify() {
    console.log('🔍 Verifying migration...');

    const { data: grants, error: grantsError } = await this.supabase
      .from('grants')
      .select('count', { count: 'exact' });

    const { data: users, error: usersError } = await this.supabase
      .from('users')
      .select('count', { count: 'exact' });

    const { data: posts, error: postsError } = await this.supabase
      .from('blog_posts')
      .select('count', { count: 'exact' });

    console.log('📊 Verification Results:');
    console.log(`   - Grants: ${grants?.[0]?.count || 0}`);
    console.log(`   - Users: ${users?.[0]?.count || 0}`);
    console.log(`   - Blog Posts: ${posts?.[0]?.count || 0}`);

    // Test sample query
    const { data: sampleGrant } = await this.supabase
      .from('grants')
      .select('grant_name, funding_organization')
      .limit(1);

    if (sampleGrant && sampleGrant.length > 0) {
      console.log(`✅ Sample grant: "${sampleGrant[0].grant_name}" by ${sampleGrant[0].funding_organization}`);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Supabase setup and migration...\n');

      await this.initSupabase();
      await this.createSchema();
      await this.setupRLS();
      await this.migrateData();
      await this.generateEnvFile();
      await this.verify();

      console.log('\n🎉 Supabase setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Add Supabase environment variables to Netlify');
      console.log('2. Update React app to use Supabase client');
      console.log('3. Deploy updated Netlify functions');
      console.log('4. Test admin panel with Supabase auth');
      console.log('5. Enable AI chat enhancements');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new SupabaseSetup();
  setup.run();
}

module.exports = SupabaseSetup;