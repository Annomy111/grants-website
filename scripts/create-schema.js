const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSchema() {
  console.log('🚀 Creating Supabase schema...');

  const schemas = [
    // Grants table
    `
    CREATE TABLE IF NOT EXISTS grants (
      id SERIAL PRIMARY KEY,
      grant_name TEXT NOT NULL,
      funding_organization TEXT,
      country_region TEXT,
      eligibility_criteria TEXT,
      focus_areas TEXT,
      grant_amount TEXT,
      application_deadline TEXT,
      duration TEXT,
      website_link TEXT,
      status TEXT DEFAULT 'active',
      featured BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Users table for admin authentication
    `
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'viewer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Chat sessions
    `
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      session_data JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Chat messages
    `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      session_id INTEGER REFERENCES chat_sessions(id),
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      recommended_grants JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Blog posts
    `
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      status TEXT DEFAULT 'published',
      featured_image TEXT,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,

    // Enable RLS
    `ALTER TABLE grants ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;`,

    // RLS Policies
    `
    DROP POLICY IF EXISTS "Grants viewable by everyone" ON grants;
    CREATE POLICY "Grants viewable by everyone" ON grants 
    FOR SELECT USING (status = 'active');
    `,
    
    `
    DROP POLICY IF EXISTS "Blog posts viewable by everyone" ON blog_posts;
    CREATE POLICY "Blog posts viewable by everyone" ON blog_posts 
    FOR SELECT USING (status = 'published');
    `,
    
    `
    DROP POLICY IF EXISTS "Own chat sessions only" ON chat_sessions;
    CREATE POLICY "Own chat sessions only" ON chat_sessions 
    FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);
    `,
    
    `
    DROP POLICY IF EXISTS "Chat messages for own sessions" ON chat_messages;
    CREATE POLICY "Chat messages for own sessions" ON chat_messages 
    FOR ALL USING (
      session_id IN (
        SELECT id FROM chat_sessions 
        WHERE user_id = auth.uid() OR user_id IS NULL
      )
    );
    `,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);`,
    `CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(application_deadline);`,
    `CREATE INDEX IF NOT EXISTS idx_grants_organization ON grants(funding_organization);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);`,
  ];

  let success = 0;
  let errors = 0;

  for (const [index, sql] of schemas.entries()) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql.trim() });
      
      if (error) {
        console.log(`❌ Schema ${index + 1} failed:`, error.message);
        errors++;
      } else {
        console.log(`✅ Schema ${index + 1} executed successfully`);
        success++;
      }
    } catch (err) {
      console.log(`❌ Schema ${index + 1} error:`, err.message);
      errors++;
    }
  }

  console.log(`\n📊 Schema creation summary:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Errors: ${errors}`);

  return success > 0;
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  createSchema().then((success) => {
    if (success) {
      console.log('✅ Schema creation completed');
      process.exit(0);
    } else {
      console.log('❌ Schema creation failed');
      process.exit(1);
    }
  });
}

module.exports = { createSchema };