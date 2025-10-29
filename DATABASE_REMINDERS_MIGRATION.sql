-- ========================================
-- Reminders System Migration
-- Stage 6A: Core Reminder System
-- ========================================

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  
  -- Reminder details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50) NOT NULL, -- medication, appointment, lab_test, refill
  
  -- Medication specific
  medication_name VARCHAR(255),
  dosage VARCHAR(100),
  instructions TEXT,
  
  -- Scheduling
  start_date DATE NOT NULL,
  end_date DATE,
  reminder_time TIME NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- daily, weekly, custom
  frequency_details JSONB, -- {days: [1,3,5], interval: 2}
  
  -- Notification settings
  notification_enabled BOOLEAN DEFAULT true,
  notification_lead_time INTEGER DEFAULT 0, -- minutes before
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  color VARCHAR(20) DEFAULT 'blue',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reminder logs table (track when reminders are taken/missed)
CREATE TABLE IF NOT EXISTS reminder_logs (
  id BIGSERIAL PRIMARY KEY,
  reminder_id BIGINT REFERENCES reminders(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  
  -- Log details
  scheduled_time TIMESTAMP NOT NULL,
  action VARCHAR(50) NOT NULL, -- taken, missed, snoozed, skipped
  action_time TIMESTAMP,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder_id ON reminder_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_scheduled_time ON reminder_logs(scheduled_time);

-- RLS Policies
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can view own reminder logs" ON reminder_logs;
DROP POLICY IF EXISTS "Users can insert own reminder logs" ON reminder_logs;

-- Create policies
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own reminder logs"
  ON reminder_logs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own reminder logs"
  ON reminder_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Add comments for documentation
COMMENT ON TABLE reminders IS 'Stores user reminders for medications, appointments, etc.';
COMMENT ON TABLE reminder_logs IS 'Tracks reminder actions (taken, missed, snoozed, skipped)';

COMMENT ON COLUMN reminders.reminder_type IS 'Type: medication, appointment, lab_test, refill';
COMMENT ON COLUMN reminders.frequency IS 'Frequency: daily, weekly, custom';
COMMENT ON COLUMN reminders.frequency_details IS 'JSON with custom frequency details';
COMMENT ON COLUMN reminder_logs.action IS 'Action: taken, missed, snoozed, skipped';

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('reminders', 'reminder_logs');



