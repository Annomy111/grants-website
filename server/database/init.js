const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'grants.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table for admin authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Grants table
  db.run(`CREATE TABLE IF NOT EXISTS grants (
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
  )`);

  // Blog posts table
  db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )`);

  // Blog categories table
  db.run(`CREATE TABLE IF NOT EXISTS blog_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_uk TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Blog post categories junction table
  db.run(`CREATE TABLE IF NOT EXISTS blog_post_categories (
    post_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES blog_categories (id) ON DELETE CASCADE
  )`);

  // Create default admin users
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
    ['admin', 'admin@grants.ua', defaultPassword, 'admin']);
  
  db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
    ['mattia', 'mattia@grants.ua', defaultPassword, 'admin']);

  console.log('Database initialized successfully');
});

db.close();