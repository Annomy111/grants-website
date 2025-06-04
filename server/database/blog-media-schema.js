const Database = require('./db');

async function createBlogMediaSchema() {
  const db = Database;
  
  try {
    console.log('Creating blog media schema...');
    
    // Blog images table
    await db.run(`
      CREATE TABLE IF NOT EXISTS blog_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_url TEXT,
        attribution TEXT,
        description TEXT,
        photographer TEXT,
        source TEXT,
        license TEXT,
        width INTEGER,
        height INTEGER,
        blog_post_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
      )
    `);
    
    // Blog statistics cache table
    await db.run(`
      CREATE TABLE IF NOT EXISTS blog_statistics_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_key TEXT UNIQUE NOT NULL,
        statistics_data TEXT NOT NULL,
        source TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Blog media usage tracking
    await db.run(`
      CREATE TABLE IF NOT EXISTS blog_media_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blog_post_id INTEGER NOT NULL,
        media_type TEXT NOT NULL CHECK(media_type IN ('image', 'statistic', 'infographic')),
        media_id INTEGER,
        position_in_content INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
      )
    `);
    
    // Add media fields to blog_posts table if they don't exist
    await db.run(`
      ALTER TABLE blog_posts ADD COLUMN featured_image_id INTEGER REFERENCES blog_images(id)
    `).catch(() => console.log('featured_image_id column already exists'));
    
    await db.run(`
      ALTER TABLE blog_posts ADD COLUMN has_media BOOLEAN DEFAULT 0
    `).catch(() => console.log('has_media column already exists'));
    
    await db.run(`
      ALTER TABLE blog_posts ADD COLUMN media_metadata TEXT
    `).catch(() => console.log('media_metadata column already exists'));
    
    // Create indexes for better performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_blog_images_post ON blog_images(blog_post_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_blog_media_usage_post ON blog_media_usage(blog_post_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_statistics_cache_key ON blog_statistics_cache(cache_key)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_statistics_cache_expires ON blog_statistics_cache(expires_at)');
    
    console.log('✅ Blog media schema created successfully');
    
  } catch (error) {
    console.error('Error creating blog media schema:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createBlogMediaSchema()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createBlogMediaSchema;