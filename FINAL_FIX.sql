-- ========================================
-- FINAL FIX - Run this immediately
-- ========================================

-- Disable RLS on all three tables
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_templates DISABLE ROW LEVEL SECURITY;

-- Make user_id nullable (to handle edge cases)
ALTER TABLE user_preferences ALTER COLUMN user_id DROP NOT NULL;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_preferences', 'adherence_streaks', 'reminder_templates');

