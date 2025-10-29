import { useState, useEffect } from 'react'
import { getUserPreferences, saveUserPreferences } from '../../../services/userPreferences.js'
import { useAuth } from '../../../hooks/useAuth.js'
import './ReminderSettings.css'

const ReminderSettings = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    notification_sound: true,
    notification_vibration: true,
    weekly_report_email: false,
    daily_summary_email: false,
    user_email: '',
    calendar_view_default: 'monthly',
    theme: 'light'
  })

  useEffect(() => {
    if (isOpen && user) {
      loadPreferences()
    }
  }, [isOpen, user])

  const loadPreferences = async () => {
    setLoading(true)
    
    const result = await getUserPreferences(user.id)
    
    if (result.success && result.data) {
      setPreferences(result.data)
    }
    
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    
    const result = await saveUserPreferences(user.uid || user.id, preferences)
    
    if (result.success) {
      alert('Settings saved successfully! ✅')
    } else {
      alert(`Failed to save settings: ${result.error}`)
    }
    
    setSaving(false)
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="reminder-settings__overlay" onClick={handleClose}>
      <div className="reminder-settings" onClick={(e) => e.stopPropagation()}>
        <div className="reminder-settings__header">
          <h2>Reminder Settings</h2>
          <button
            onClick={handleClose}
            className="reminder-settings__close"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="reminder-settings__content">
          {loading ? (
            <div className="reminder-settings__loading">
              <div className="reminder-settings__spinner" />
              <p>Loading settings...</p>
            </div>
          ) : (
            <>
              {/* Quiet Hours */}
              <div className="reminder-settings__section">
                <h3>🌙 Quiet Hours</h3>
                <p className="reminder-settings__description">
                  Suppress notifications during specified hours
                </p>

                <div className="reminder-settings__field">
                  <label className="reminder-settings__toggle">
                    <input
                      type="checkbox"
                      checked={preferences.quiet_hours_enabled}
                      onChange={(e) => handleChange('quiet_hours_enabled', e.target.checked)}
                    />
                    <span className="reminder-settings__toggle-slider" />
                    <span className="reminder-settings__toggle-label">
                      Enable Quiet Hours
                    </span>
                  </label>
                </div>

                {preferences.quiet_hours_enabled && (
                  <div className="reminder-settings__time-range">
                    <div className="reminder-settings__time-field">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={preferences.quiet_hours_start}
                        onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                        className="reminder-settings__time-input"
                      />
                    </div>
                    <div className="reminder-settings__time-field">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={preferences.quiet_hours_end}
                        onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                        className="reminder-settings__time-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="reminder-settings__section">
                <h3>🔔 Notification Preferences</h3>

                <div className="reminder-settings__field">
                  <label className="reminder-settings__toggle">
                    <input
                      type="checkbox"
                      checked={preferences.notification_sound}
                      onChange={(e) => handleChange('notification_sound', e.target.checked)}
                    />
                    <span className="reminder-settings__toggle-slider" />
                    <span className="reminder-settings__toggle-label">
                      Play Sound
                    </span>
                  </label>
                </div>

                <div className="reminder-settings__field">
                  <label className="reminder-settings__toggle">
                    <input
                      type="checkbox"
                      checked={preferences.notification_vibration}
                      onChange={(e) => handleChange('notification_vibration', e.target.checked)}
                    />
                    <span className="reminder-settings__toggle-slider" />
                    <span className="reminder-settings__toggle-label">
                      Vibration
                    </span>
                  </label>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="reminder-settings__section">
                <h3>📧 Email Notifications</h3>

                <div className="reminder-settings__field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={preferences.user_email || ''}
                    onChange={(e) => handleChange('user_email', e.target.value)}
                    placeholder="your@email.com"
                    className="reminder-settings__input"
                  />
                </div>

                <div className="reminder-settings__field">
                  <label className="reminder-settings__toggle">
                    <input
                      type="checkbox"
                      checked={preferences.daily_summary_email}
                      onChange={(e) => handleChange('daily_summary_email', e.target.checked)}
                    />
                    <span className="reminder-settings__toggle-slider" />
                    <span className="reminder-settings__toggle-label">
                      Daily Summary Email
                    </span>
                  </label>
                </div>

                <div className="reminder-settings__field">
                  <label className="reminder-settings__toggle">
                    <input
                      type="checkbox"
                      checked={preferences.weekly_report_email}
                      onChange={(e) => handleChange('weekly_report_email', e.target.checked)}
                    />
                    <span className="reminder-settings__toggle-slider" />
                    <span className="reminder-settings__toggle-label">
                      Weekly Adherence Report
                    </span>
                  </label>
                </div>
              </div>

              {/* Display Preferences */}
              <div className="reminder-settings__section">
                <h3>🎨 Display Preferences</h3>

                <div className="reminder-settings__field">
                  <label>Default Calendar View</label>
                  <select
                    value={preferences.calendar_view_default}
                    onChange={(e) => handleChange('calendar_view_default', e.target.value)}
                    className="reminder-settings__select"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="reminder-settings__field">
                  <label>Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    className="reminder-settings__select"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="reminder-settings__footer">
          <button
            onClick={handleClose}
            className="reminder-settings__btn reminder-settings__btn--secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="reminder-settings__btn reminder-settings__btn--primary"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReminderSettings

