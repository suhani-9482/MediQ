-- ========================================
-- Fix RLS Policies for user_preferences table
-- ========================================

-- First, check if RLS is enabled
-- If you want to temporarily disable RLS for testing (NOT recommended for production):
-- ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Better solution: Fix the policies to work correctly

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- Make sure RLS is enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies that handle initial setup
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid()::text = user_id);

-- IMPORTANT: Create a service role policy for the application
-- This allows the authenticated application to manage preferences
CREATE POLICY "Service role can manage all preferences"
  ON user_preferences FOR ALL
  USING (auth.role() = 'service_role');

-- Alternative: If you want to allow authenticated users to create their initial preferences
CREATE POLICY "Authenticated users can upsert own preferences"
  ON user_preferences FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND auth.uid()::text = user_id
  )
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid()::text = user_id
  );

-- ========================================
-- Test the fix
-- ========================================

-- Check if policies are correctly set up
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_preferences';

-- ========================================
-- If the above doesn't work, try this temporary fix:
-- ========================================

-- Option 1: Disable RLS temporarily (for testing only)
-- ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a more permissive policy for authenticated users
-- DROP POLICY IF EXISTS "Authenticated users full access to own preferences" ON user_preferences;
-- CREATE POLICY "Authenticated users full access to own preferences"
--   ON user_preferences
--   FOR ALL
--   USING (true)
--   WITH CHECK (auth.uid()::text = user_id);
