-- Create grants table
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

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table  
CREATE TABLE IF NOT EXISTS chat_messages (
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
DROP POLICY IF EXISTS "Grants viewable by everyone" ON grants;
CREATE POLICY "Grants viewable by everyone" ON grants 
FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Own chat sessions only" ON chat_sessions;
CREATE POLICY "Own chat sessions only" ON chat_sessions 
FOR ALL USING (true);

DROP POLICY IF EXISTS "Chat messages for all" ON chat_messages;
CREATE POLICY "Chat messages for all" ON chat_messages 
FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(application_deadline);
CREATE INDEX IF NOT EXISTS idx_grants_organization ON grants(funding_organization);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);