const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://adpddtbsstunjotxaldb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM'
);

async function setupAdminUsers() {
  console.log('🔐 Setting up admin users table...');

  try {
    // Check if app_users table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('app_users')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('❌ app_users table does not exist. Creating via SQL...');
      
      console.log('\n📋 Manual SQL needed:');
      console.log('Go to Supabase SQL Editor and run:');
      console.log('=====================================');
      
      const sql = `
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_app_users_user_id ON app_users(user_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
`;
      
      console.log(sql);
      console.log('=====================================');
      return false;
    } else {
      console.log('✅ app_users table exists');
      
      // Create default admin users
      console.log('👤 Creating default admin users...');
      
      const adminUsers = [
        { email: 'admin@admin.local', role: 'admin' },
        { email: 'mattia@admin.local', role: 'admin' }
      ];
      
      for (const adminUser of adminUsers) {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from('app_users')
          .select('*')
          .eq('email', adminUser.email)
          .single();
        
        if (!existingUser) {
          console.log(`Creating admin user: ${adminUser.email}`);
          
          // For now, just create the app_users record
          // The auth function will create the actual auth.users record on first login
          const { error: insertError } = await supabase
            .from('app_users')
            .insert({
              email: adminUser.email,
              role: adminUser.role,
              user_id: null // Will be updated when user first logs in
            });
          
          if (insertError) {
            console.log(`❌ Failed to create ${adminUser.email}:`, insertError.message);
          } else {
            console.log(`✅ Created ${adminUser.email}`);
          }
        } else {
          console.log(`✅ ${adminUser.email} already exists`);
        }
      }
      
      return true;
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

setupAdminUsers().then(success => {
  if (success) {
    console.log('\n🎉 Admin users setup completed!');
  } else {
    console.log('\n🔧 Manual setup required - follow instructions above');
  }
}).catch(err => {
  console.error('❌ Script failed:', err.message);
});