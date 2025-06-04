#!/usr/bin/env node

const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Direct Supabase client approach since MCP might be complex for schema setup
const supabase = createClient(
  'https://adpddtbsstunjotxaldb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM'
);

async function setupSchema() {
  console.log('🚀 Setting up Supabase schema...');

  // Create tables using direct SQL via the REST API
  const schemas = [
    {
      name: 'grants table',
      sql: `
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
      `
    },
    {
      name: 'chat_sessions table',
      sql: `
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id SERIAL PRIMARY KEY,
          user_id UUID,
          session_data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'chat_messages table',
      sql: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES chat_sessions(id),
          message TEXT NOT NULL,
          response TEXT NOT NULL,
          recommended_grants JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'RLS policies',
      sql: `
        ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
        ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Grants viewable by everyone" ON grants;
        CREATE POLICY "Grants viewable by everyone" ON grants 
        FOR SELECT USING (status = 'active');
        
        DROP POLICY IF EXISTS "Own chat sessions only" ON chat_sessions;
        CREATE POLICY "Own chat sessions only" ON chat_sessions 
        FOR ALL USING (true);
        
        DROP POLICY IF EXISTS "Chat messages for all" ON chat_messages;
        CREATE POLICY "Chat messages for all" ON chat_messages 
        FOR ALL USING (true);
      `
    },
    {
      name: 'indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
        CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(application_deadline);
        CREATE INDEX IF NOT EXISTS idx_grants_organization ON grants(funding_organization);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
      `
    }
  ];

  let success = 0;
  
  for (const schema of schemas) {
    try {
      console.log(`Creating ${schema.name}...`);
      
      // Use Supabase REST API to execute SQL
      const response = await fetch(`https://adpddtbsstunjotxaldb.supabase.co/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo'
        },
        body: JSON.stringify({ sql_query: schema.sql })
      });

      if (response.ok) {
        console.log(`✅ ${schema.name} created successfully`);
        success++;
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create ${schema.name}:`, error);
      }
    } catch (err) {
      console.log(`❌ Error creating ${schema.name}:`, err.message);
    }
  }

  console.log(`\n📊 Schema setup summary: ${success}/${schemas.length} successful`);
  
  if (success > 0) {
    console.log('✅ Schema setup completed! Testing table access...');
    
    // Test if we can access the grants table
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.log('❌ Table access test failed:', error.message);
        console.log('🔧 Manual setup may be required via Supabase dashboard');
      } else {
        console.log('✅ Table access test successful!');
        return true;
      }
    } catch (err) {
      console.log('❌ Table access test error:', err.message);
    }
  }
  
  return false;
}

// Run the setup
setupSchema().then((success) => {
  if (success) {
    console.log('\n🎉 Ready to import grants data!');
    process.exit(0);
  } else {
    console.log('\n🔧 Manual setup required - check Supabase dashboard');
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});