#!/usr/bin/env node

/**
 * Migration Script: SQLite → Turso (Serverless SQLite)
 * 
 * This script migrates your existing SQLite database to Turso,
 * a serverless SQLite-compatible database perfect for Netlify.
 */

const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@libsql/client');
const path = require('path');

class TursoMigration {
  constructor() {
    this.localDbPath = path.join(__dirname, '../server/database/grants.db');
    this.tursoClient = null;
  }

  async initTurso() {
    // Check environment variables
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(`
❌ Missing Turso credentials!

Please set up Turso first:
1. npm install -g @turso/cli
2. turso auth signup
3. turso db create civil-society-grants
4. turso db tokens create civil-society-grants

Then set environment variables:
export TURSO_DATABASE_URL="libsql://your-db.turso.io"
export TURSO_AUTH_TOKEN="your-token"
      `);
    }

    this.tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('✅ Connected to Turso database');
  }

  async readLocalData() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.localDbPath);
      
      const data = {
        users: [],
        grants: [],
        blogPosts: []
      };

      // Read users
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          console.log('⚠️  Users table not found or empty');
          data.users = [];
        } else {
          data.users = rows;
        }

        // Read grants
        db.all("SELECT * FROM grants", (err, rows) => {
          if (err) {
            console.log('⚠️  Grants table not found or empty');
            data.grants = [];
          } else {
            data.grants = rows;
          }

          // Read blog posts
          db.all("SELECT * FROM blog_posts", (err, rows) => {
            if (err) {
              console.log('⚠️  Blog posts table not found or empty');
              data.blogPosts = [];
            } else {
              data.blogPosts = rows;
            }

            db.close();
            resolve(data);
          });
        });
      });
    });
  }

  async createTursoSchema() {
    console.log('📋 Creating Turso schema...');

    // Create tables in Turso
    const schema = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS grants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grant_name TEXT NOT NULL,
        funding_organization TEXT NOT NULL,
        country_region TEXT,
        eligibility_criteria TEXT,
        focus_areas TEXT,
        grant_amount TEXT,
        application_deadline TEXT,
        duration TEXT,
        website_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        title_uk TEXT,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        content_uk TEXT,
        excerpt TEXT,
        excerpt_uk TEXT,
        author_id INTEGER,
        featured_image TEXT,
        status TEXT DEFAULT 'draft',
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_grants_funding_organization ON grants(funding_organization)`,
      `CREATE INDEX IF NOT EXISTS idx_grants_country_region ON grants(country_region)`,
      `CREATE INDEX IF NOT EXISTS idx_grants_application_deadline ON grants(application_deadline)`,
      `CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`,
      `CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)`
    ];

    for (const sql of schema) {
      await this.tursoClient.execute(sql);
    }

    console.log('✅ Schema created successfully');
  }

  async migrateData(data) {
    console.log('📦 Migrating data to Turso...');

    // Migrate users
    if (data.users.length > 0) {
      console.log(`👥 Migrating ${data.users.length} users...`);
      for (const user of data.users) {
        await this.tursoClient.execute({
          sql: `INSERT OR REPLACE INTO users (id, username, email, password, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [user.id, user.username, user.email, user.password, user.role, user.created_at]
        });
      }
    }

    // Migrate grants
    if (data.grants.length > 0) {
      console.log(`📊 Migrating ${data.grants.length} grants...`);
      for (const grant of data.grants) {
        await this.tursoClient.execute({
          sql: `INSERT OR REPLACE INTO grants 
                (id, grant_name, funding_organization, country_region, eligibility_criteria, 
                 focus_areas, grant_amount, application_deadline, duration, website_link, 
                 created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            grant.id, grant.grant_name, grant.funding_organization, grant.country_region,
            grant.eligibility_criteria, grant.focus_areas, grant.grant_amount,
            grant.application_deadline, grant.duration, grant.website_link,
            grant.created_at, grant.updated_at
          ]
        });
      }
    }

    // Migrate blog posts
    if (data.blogPosts.length > 0) {
      console.log(`📝 Migrating ${data.blogPosts.length} blog posts...`);
      for (const post of data.blogPosts) {
        await this.tursoClient.execute({
          sql: `INSERT OR REPLACE INTO blog_posts 
                (id, title, title_uk, slug, content, content_uk, excerpt, excerpt_uk,
                 author_id, featured_image, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            post.id, post.title, post.title_uk, post.slug, post.content, post.content_uk,
            post.excerpt, post.excerpt_uk, post.author_id, post.featured_image,
            post.status, post.published_at, post.created_at, post.updated_at
          ]
        });
      }
    }

    console.log('✅ Data migration complete!');
  }

  async verify() {
    console.log('🔍 Verifying migration...');

    const grants = await this.tursoClient.execute('SELECT COUNT(*) as count FROM grants');
    const users = await this.tursoClient.execute('SELECT COUNT(*) as count FROM users');
    const posts = await this.tursoClient.execute('SELECT COUNT(*) as count FROM blog_posts');

    console.log(`📊 Verification Results:`);
    console.log(`   - Grants: ${grants.rows[0].count}`);
    console.log(`   - Users: ${users.rows[0].count}`);
    console.log(`   - Blog Posts: ${posts.rows[0].count}`);

    // Test a sample query
    const sampleGrant = await this.tursoClient.execute({
      sql: 'SELECT grant_name, funding_organization FROM grants LIMIT 1'
    });

    if (sampleGrant.rows.length > 0) {
      console.log(`✅ Sample grant: "${sampleGrant.rows[0].grant_name}" by ${sampleGrant.rows[0].funding_organization}`);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting SQLite → Turso migration...\n');

      await this.initTurso();
      const data = await this.readLocalData();
      await this.createTursoSchema();
      await this.migrateData(data);
      await this.verify();

      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Update your Netlify environment variables with Turso credentials');
      console.log('2. Deploy the new serverless functions');
      console.log('3. Test the API endpoints');
      console.log('4. Remove static JSON fallback once confirmed working');

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new TursoMigration();
  migration.run();
}

module.exports = TursoMigration;