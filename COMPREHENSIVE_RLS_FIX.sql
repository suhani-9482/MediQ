-- ========================================
-- Comprehensive Fix for user_preferences RLS Issues
-- ========================================

-- Step 1: Check current user authentication
-- Run this to see what user ID is being used
SELECT auth.uid() as current_user_id;

-- Step 2: Check if there are any existing preferences
SELECT * FROM user_preferences LIMIT 5;

-- Step 3: Temporarily disable RLS to test if that's the issue
-- (Only for testing - re-enable after!)
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Step 4: After testing, re-enable and fix policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Service role can manage all preferences" ON user_preferences;
DROP POLICY IF EXISTS "Authenticated users can upsert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Authenticated users full access to own preferences" ON user_preferences;

-- Create a single, comprehensive policy for authenticated users
CREATE POLICY "Enable all operations for users on their own preferences"
ON user_preferences
FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Also create a service role bypass (for admin operations if needed)
CREATE POLICY "Service role bypass"
ON user_preferences
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 5: Test the setup with an insert
-- Replace 'your-user-id-here' with an actual user ID from auth.users
/*
INSERT INTO user_preferences (
    user_id,
    quiet_hours_enabled,
    quiet_hours_start,
    quiet_hours_end,
    notification_sound,
    notification_vibration,
    weekly_report_email,
    daily_summary_email,
    calendar_view_default,
    theme
) VALUES (
    auth.uid()::text,  -- This will use the current authenticated user's ID
    false,
    '22:00',
    '07:00',
    true,
    true,
    false,
    false,
    'monthly',
    'light'
) ON CONFLICT (user_id) 
DO UPDATE SET
    updated_at = NOW();
*/

-- Step 6: Verify the new policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_preferences';

-- Step 7: If you're still having issues, check the auth.users table
-- This will show you the actual user IDs in your system
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;

-- Step 8: Alternative - Create a function to handle preferences
-- This can bypass some RLS issues
CREATE OR REPLACE FUNCTION upsert_user_preferences(
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
SET search_path = public
AS $$
DECLARE
    v_user_id TEXT;
    v_result user_preferences;
BEGIN
    -- Get the current user's ID
    v_user_id := auth.uid()::text;
    
    -- Upsert the preferences
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
        theme,
        updated_at
    ) VALUES (
        v_user_id,
        p_quiet_hours_enabled,
        p_quiet_hours_start,
        p_quiet_hours_end,
        p_notification_sound,
        p_notification_vibration,
        p_weekly_report_email,
        p_daily_summary_email,
        p_user_email,
        p_calendar_view_default,
        p_theme,
        NOW()
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_user_preferences TO authenticated;

-- Step 9: Create a simpler view for reading preferences
CREATE OR REPLACE VIEW my_preferences AS
SELECT * FROM user_preferences
WHERE user_id = auth.uid()::text;

-- Grant select on the view
GRANT SELECT ON my_preferences TO authenticated;
