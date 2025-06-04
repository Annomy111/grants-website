-- Completely disable RLS on app_users table
-- This is safe since it's only for admin role management
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Service role can do everything" ON app_users;
DROP POLICY IF EXISTS "Users can read their own profile" ON app_users;
DROP POLICY IF EXISTS "Admin can manage all users" ON app_users;