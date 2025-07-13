-- Create email_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  subscription_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(email, subscription_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_type ON email_subscriptions(subscription_type);

-- Add RLS policies
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (subscribe)
CREATE POLICY "Allow anonymous insert" ON email_subscriptions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Only authenticated users can view subscriptions
CREATE POLICY "Authenticated users can view" ON email_subscriptions
  FOR SELECT TO authenticated
  USING (true);