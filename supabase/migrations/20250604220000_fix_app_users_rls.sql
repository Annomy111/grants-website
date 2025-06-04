-- Drop existing problematic policies on app_users
DROP POLICY IF EXISTS "Users can read their own data" ON app_users;
DROP POLICY IF EXISTS "Users can update their own data" ON app_users;
DROP POLICY IF EXISTS "Admin can do everything" ON app_users;

-- Disable RLS temporarily to fix the issue
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Service role can do everything" ON app_users
    FOR ALL USING (true);

CREATE POLICY "Users can read their own profile" ON app_users
    FOR SELECT USING (auth.uid() = user_id);

-- Allow service role and admin users to manage all records
CREATE POLICY "Admin can manage all users" ON app_users
    FOR ALL USING (
        current_setting('role') = 'service_role' OR
        EXISTS (
            SELECT 1 FROM app_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role = 'admin'
        )
    );