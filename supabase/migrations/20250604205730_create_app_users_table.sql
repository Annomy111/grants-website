-- Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own profile" ON app_users;
CREATE POLICY "Users can view own profile" ON app_users 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all users" ON app_users;
CREATE POLICY "Admins can manage all users" ON app_users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM app_users 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_users_user_id ON app_users(user_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);