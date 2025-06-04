const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'grants.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Creating blog generation enhancement tables...');

  // Civil Society Organizations table
  db.run(`CREATE TABLE IF NOT EXISTS civil_society_organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    website TEXT,
    main_areas_of_work TEXT,
    primary_languages TEXT,
    twitter_url TEXT,
    facebook_url TEXT,
    linkedin_url TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Civil Society Leaders table
  db.run(`CREATE TABLE IF NOT EXISTS civil_society_leaders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    country_affiliation TEXT,
    field TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    known_contributions TEXT,
    languages_of_engagement TEXT,
    organization_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES civil_society_organizations (id)
  )`);

  // News Sources table for monitoring
  db.run(`CREATE TABLE IF NOT EXISTS news_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'rss', 'api', 'website', 'social'
    url TEXT NOT NULL,
    api_key TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_checked DATETIME,
    check_frequency INTEGER DEFAULT 3600, -- seconds
    topics TEXT, -- JSON array of topics to monitor
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // News Articles table (cache for processed news)
  db.run(`CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    source_id INTEGER,
    author TEXT,
    published_at DATETIME,
    relevance_score REAL DEFAULT 0,
    keywords TEXT, -- JSON array
    mentioned_organizations TEXT, -- JSON array of org IDs
    mentioned_leaders TEXT, -- JSON array of leader IDs
    is_processed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES news_sources (id)
  )`);

  // Blog Generation Jobs table
  db.run(`CREATE TABLE IF NOT EXISTS blog_generation_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT NOT NULL, -- 'auto_weekly', 'manual_topic', 'manual_organization'
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    input_parameters TEXT, -- JSON with generation parameters
    generated_content TEXT, -- JSON with generated blog post data
    related_news_articles TEXT, -- JSON array of news article IDs
    related_organizations TEXT, -- JSON array of organization IDs
    related_leaders TEXT, -- JSON array of leader IDs
    blog_post_id INTEGER, -- if generated blog was saved
    created_by INTEGER,
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
  )`);

  // Blog Post Sources table (to track which articles inspired which blog posts)
  db.run(`CREATE TABLE IF NOT EXISTS blog_post_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_post_id INTEGER NOT NULL,
    news_article_id INTEGER,
    organization_id INTEGER,
    leader_id INTEGER,
    source_type TEXT NOT NULL, -- 'news', 'organization', 'leader'
    relevance_weight REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (news_article_id) REFERENCES news_articles (id),
    FOREIGN KEY (organization_id) REFERENCES civil_society_organizations (id),
    FOREIGN KEY (leader_id) REFERENCES civil_society_leaders (id)
  )`);

  // AI Generation Settings table
  db.run(`CREATE TABLE IF NOT EXISTS ai_generation_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_name TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users (id)
  )`);

  // Insert default news sources
  const defaultNewsSources = [
    {
      name: 'Kyiv Independent RSS',
      type: 'rss',
      url: 'https://kyivindependent.com/rss/',
      topics: JSON.stringify(['ukraine', 'civil society', 'human rights'])
    },
    {
      name: 'Ukrainska Pravda RSS',
      type: 'rss', 
      url: 'https://www.pravda.com.ua/rss/',
      topics: JSON.stringify(['ukraine', 'politics', 'corruption'])
    },
    {
      name: 'OSCE Press Releases',
      type: 'rss',
      url: 'https://www.osce.org/rss/',
      topics: JSON.stringify(['democracy', 'human rights', 'ukraine'])
    },
    {
      name: 'EU External Action RSS',
      type: 'rss',
      url: 'https://www.eeas.europa.eu/eeas/rss_en',
      topics: JSON.stringify(['ukraine', 'civil society', 'support'])
    }
  ];

  defaultNewsSources.forEach(source => {
    db.run(`INSERT OR IGNORE INTO news_sources (name, source_type, url, topics) VALUES (?, ?, ?, ?)`,
      [source.name, source.type, source.url, source.topics]);
  });

  // Insert default AI settings
  const defaultAISettings = [
    {
      name: 'openai_api_key',
      value: '',
      description: 'OpenAI API key for GPT content generation'
    },
    {
      name: 'generation_model',
      value: 'gpt-4',
      description: 'AI model to use for content generation'
    },
    {
      name: 'max_tokens',
      value: '2000',
      description: 'Maximum tokens for generated content'
    },
    {
      name: 'temperature',
      value: '0.7',
      description: 'Creativity level for AI generation (0-1)'
    },
    {
      name: 'auto_generation_enabled',
      value: 'false',
      description: 'Enable automatic weekly blog generation'
    },
    {
      name: 'min_relevance_score',
      value: '0.6',
      description: 'Minimum relevance score for news to be included'
    }
  ];

  defaultAISettings.forEach(setting => {
    db.run(`INSERT OR IGNORE INTO ai_generation_settings (setting_name, setting_value, description) VALUES (?, ?, ?)`,
      [setting.name, setting.value, setting.description]);
  });

  console.log('Blog generation enhancement tables created successfully');
});

db.close();