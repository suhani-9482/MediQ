-- ========================================
-- Reminders System Migration - Stage 6B
-- Advanced Features
-- ========================================

-- Add additional columns to reminders table
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS preparation_instructions TEXT,
ADD COLUMN IF NOT EXISTS reminder_template VARCHAR(50),
ADD COLUMN IF NOT EXISTS lead_time_minutes INTEGER DEFAULT 60; -- For appointments: remind X minutes before

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  -- Notification preferences
  notification_sound BOOLEAN DEFAULT true,
  notification_vibration BOOLEAN DEFAULT true,
  
  -- Email preferences
  weekly_report_email BOOLEAN DEFAULT false,
  daily_summary_email BOOLEAN DEFAULT false,
  user_email VARCHAR(255),
  
  -- Display preferences
  calendar_view_default VARCHAR(20) DEFAULT 'monthly', -- monthly, weekly
  theme VARCHAR(20) DEFAULT 'light',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reminder templates table
CREATE TABLE IF NOT EXISTS reminder_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- medication, appointment, general
  
  -- Template settings
  frequency VARCHAR(50) NOT NULL,
  frequency_details JSONB,
  default_time TIME,
  instructions TEXT,
  
  -- Metadata
  is_system_template BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create adherence streaks table
CREATE TABLE IF NOT EXISTS adherence_streaks (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  
  -- Streak info
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_category ON reminder_templates(category);
CREATE INDEX IF NOT EXISTS idx_adherence_streaks_user_id ON adherence_streaks(user_id);

-- RLS Policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid()::text = user_id);

-- RLS Policies for adherence_streaks
ALTER TABLE adherence_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streaks" ON adherence_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON adherence_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON adherence_streaks;

CREATE POLICY "Users can view own streaks"
  ON adherence_streaks FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own streaks"
  ON adherence_streaks FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own streaks"
  ON adherence_streaks FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Insert default system templates
INSERT INTO reminder_templates (name, description, category, frequency, frequency_details, default_time, instructions, is_system_template) VALUES
('Twice Daily', 'Take medication twice per day', 'medication', 'daily', '{"times": ["08:00", "20:00"]}', '08:00', 'Take 12 hours apart', true),
('Three Times Daily', 'Take medication three times per day', 'medication', 'daily', '{"times": ["08:00", "14:00", "20:00"]}', '08:00', 'Take with meals', true),
('Every 8 Hours', 'Take medication every 8 hours', 'medication', 'daily', '{"times": ["06:00", "14:00", "22:00"]}', '06:00', 'Take every 8 hours around the clock', true),
('With Meals', 'Take with breakfast, lunch, and dinner', 'medication', 'daily', '{"times": ["08:00", "13:00", "19:00"]}', '08:00', 'Take with food', true),
('Before Bed', 'Take before bedtime', 'medication', 'daily', '{"times": ["21:00"]}', '21:00', 'Take before going to sleep', true),
('Weekly Vitamin', 'Take vitamin supplement weekly', 'medication', 'weekly', '{"days": [1], "times": ["09:00"]}', '09:00', 'Take on Monday mornings', true),
('Weekday Morning', 'Monday through Friday mornings', 'medication', 'weekly', '{"days": [1,2,3,4,5], "times": ["08:00"]}', '08:00', 'Weekdays only', true),
('Monthly Checkup', 'Monthly doctor appointment reminder', 'appointment', 'monthly', '{"day": 1}', '10:00', 'Schedule monthly checkup', true)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE user_preferences IS 'User notification and display preferences';
COMMENT ON TABLE reminder_templates IS 'Predefined reminder templates for quick setup';
COMMENT ON TABLE adherence_streaks IS 'Tracks user adherence streaks and achievements';

COMMENT ON COLUMN reminders.location IS 'Location for appointments (address, clinic name)';
COMMENT ON COLUMN reminders.doctor_name IS 'Doctor or healthcare provider name';
COMMENT ON COLUMN reminders.preparation_instructions IS 'Preparation needed (e.g., fasting)';
COMMENT ON COLUMN reminders.reminder_template IS 'Template used to create this reminder';
COMMENT ON COLUMN reminders.lead_time_minutes IS 'Minutes before appointment to send reminder';

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the migration:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('user_preferences', 'reminder_templates', 'adherence_streaks');

