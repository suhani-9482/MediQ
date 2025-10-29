-- ========================================
-- Fix Authentication Relationship for Tables
-- ========================================

-- IMPORTANT: This will properly link tables to auth.users

-- Step 1: Check current auth.users to see the ID format
SELECT id, email FROM auth.users LIMIT 5;

-- Step 2: Check what's in user_preferences
SELECT * FROM user_preferences LIMIT 5;

-- Step 3: Add Foreign Key Constraints (if not exists)
-- This ensures user_id references actual auth users

-- For user_preferences table
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- For adherence_streaks table
ALTER TABLE adherence_streaks
DROP CONSTRAINT IF EXISTS adherence_streaks_user_id_fkey;

ALTER TABLE adherence_streaks
ADD CONSTRAINT adherence_streaks_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Note: reminder_templates doesn't need this as it's system-wide templates

-- Step 4: Fix RLS Policies with proper UUID casting
-- First disable RLS to clean up
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_streaks DISABLE ROW LEVEL SECURITY;

-- Re-enable with correct policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_streaks ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Enable all operations for users on their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Allow authenticated users full access to own data" ON user_preferences;
DROP POLICY IF EXISTS "Authenticated users can manage own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Service role full access" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- Create correct policies for user_preferences
CREATE POLICY "Enable access for users based on user_id"
ON user_preferences
FOR ALL
USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Drop existing policies for adherence_streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON adherence_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON adherence_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON adherence_streaks;

-- Create correct policies for adherence_streaks
CREATE POLICY "Enable access for users based on user_id"
ON adherence_streaks
FOR ALL
USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Step 5: Alternative - Create a trigger to auto-populate user_id
-- This ensures user_id is always set correctly
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid()::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to user_preferences
DROP TRIGGER IF EXISTS set_user_preferences_user_id ON user_preferences;
CREATE TRIGGER set_user_preferences_user_id
BEFORE INSERT ON user_preferences
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION set_user_id();

-- Apply trigger to adherence_streaks
DROP TRIGGER IF EXISTS set_adherence_streaks_user_id ON adherence_streaks;
CREATE TRIGGER set_adherence_streaks_user_id
BEFORE INSERT ON adherence_streaks
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION set_user_id();

-- Step 6: Test function to safely upsert preferences
CREATE OR REPLACE FUNCTION upsert_my_preferences(
    p_quiet_hours_enabled BOOLEAN DEFAULT false,
    p_quiet_hours_start TIME DEFAULT '22:00',
    p_quiet_hours_end TIME DEFAULT '07:00',
    p_notification_sound BOOLEAN DEFAULT true,
    p_notification_vibration BOOLEAN DEFAULT true,
    p_weekly_report_email BOOLEAN DEFAULT false,
    p_daily_summary_email BOOLEAN DEFAULT false,
    p_user_email VARCHAR(255) DEFAULT NULL,
    p_calendar_view_default VARCHAR(20) DEFAULT 'monthly',
    p_theme VARCHAR(20) DEFAULT 'light'
)
RETURNS user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result user_preferences;
BEGIN
    INSERT INTO user_preferences (
        user_id,
        quiet_hours_enabled,
        quiet_hours_start,
        quiet_hours_end,
        notification_sound,
        notification_vibration,
        weekly_report_email,
        daily_summary_email,
        user_email,
        calendar_view_default,
        theme
    ) VALUES (
        auth.uid()::text,  -- Automatically use current user
        p_quiet_hours_enabled,
        p_quiet_hours_start,
        p_quiet_hours_end,
        p_notification_sound,
        p_notification_vibration,
        p_weekly_report_email,
        p_daily_summary_email,
        p_user_email,
        p_calendar_view_default,
        p_theme
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        quiet_hours_enabled = EXCLUDED.quiet_hours_enabled,
        quiet_hours_start = EXCLUDED.quiet_hours_start,
        quiet_hours_end = EXCLUDED.quiet_hours_end,
        notification_sound = EXCLUDED.notification_sound,
        notification_vibration = EXCLUDED.notification_vibration,
        weekly_report_email = EXCLUDED.weekly_report_email,
        daily_summary_email = EXCLUDED.daily_summary_email,
        user_email = EXCLUDED.user_email,
        calendar_view_default = EXCLUDED.calendar_view_default,
        theme = EXCLUDED.theme,
        updated_at = NOW()
    RETURNING * INTO v_result;
    
    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_my_preferences TO authenticated;

-- ========================================
-- QUICKEST FIX: Just disable RLS if you don't need it
-- ========================================
-- If you just want to get it working quickly:

ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_streaks DISABLE ROW LEVEL SECURITY;

-- The reminder_templates table doesn't need RLS since it's system-wide

-- ========================================
-- Verification Queries
-- ========================================

-- Check if foreign keys exist
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('user_preferences', 'adherence_streaks');

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('user_preferences', 'adherence_streaks', 'reminder_templates');
