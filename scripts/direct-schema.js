const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  console.log('🚀 Creating tables directly...');

  try {
    // Create grants table first
    console.log('Creating grants table...');
    const { error: grantsError } = await supabase
      .from('grants')
      .select('*')
      .limit(1);

    if (grantsError && grantsError.message.includes('does not exist')) {
      // Table doesn't exist, let's create it using a workaround
      console.log('❌ Grants table does not exist');
      console.log('🔧 Please create the schema manually in Supabase dashboard:');
      console.log('1. Go to https://adpddtbsstunjotxaldb.supabase.co');
      console.log('2. Go to SQL Editor');
      console.log('3. Run this SQL:');
      
      const sql = `
-- Create grants table
CREATE TABLE grants (
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

-- Create chat sessions table
CREATE TABLE chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table  
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES chat_sessions(id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  recommended_grants JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Grants viewable by everyone" ON grants 
FOR SELECT USING (status = 'active');

CREATE POLICY "Own chat sessions only" ON chat_sessions 
FOR ALL USING (true);

CREATE POLICY "Chat messages for all" ON chat_messages 
FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_deadline ON grants(application_deadline);
CREATE INDEX idx_grants_organization ON grants(funding_organization);
`;

      console.log(sql);
      return false;
    } else {
      console.log('✅ Grants table already exists');
      return true;
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  createTables().then((success) => {
    if (success) {
      console.log('✅ Tables exist or created successfully');
      process.exit(0);
    } else {
      console.log('🔧 Please create tables manually as shown above');
      process.exit(1);
    }
  });
}

module.exports = { createTables };