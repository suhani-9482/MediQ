import { useState } from 'react'
import { 
  logReminderAction, 
  getReminderTypeIcon, 
  formatReminderTime,
  getFrequencyText 
} from '@services/reminders.js'
import './ReminderCard.css'

const ReminderCard = ({ reminder, onUpdate, onDelete, onEdit }) => {
  const [actionLoading, setActionLoading] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleAction = async (action) => {
    setActionLoading(true)
    
    try {
      const now = new Date()
      const scheduledTime = new Date()
      const [hours, minutes] = reminder.reminder_time.split(':')
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      await logReminderAction({
        reminderId: reminder.id,
        userId: reminder.user_id,
        scheduledTime: scheduledTime.toISOString(),
        action,
        notes: null
      })

      onUpdate?.()
      setShowActions(false)
    } catch (error) {
      console.error('Error logging action:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleTaken = () => handleAction('taken')
  const handleSkip = () => handleAction('skipped')
  const handleSnooze = () => handleAction('snoozed')

  return (
    <div className={`reminder-card reminder-card--${reminder.color}`}>
      <div className="reminder-card__header">
        <div className="reminder-card__icon">
          {getReminderTypeIcon(reminder.reminder_type)}
        </div>
        <div className="reminder-card__info">
          <h3 className="reminder-card__title">{reminder.title}</h3>
          <div className="reminder-card__meta">
            <span className="reminder-card__time">
              {formatReminderTime(reminder.reminder_time)}
            </span>
            <span className="reminder-card__frequency">
              {getFrequencyText(reminder.frequency, reminder.frequency_details)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowActions(!showActions)}
          className="reminder-card__menu-btn"
          aria-label="Actions"
        >
          ⋮
        </button>
      </div>

      {reminder.medication_name && (
        <div className="reminder-card__medication">
          <strong>{reminder.medication_name}</strong>
          {reminder.dosage && <span> - {reminder.dosage}</span>}
        </div>
      )}

      {reminder.description && (
        <p className="reminder-card__description">{reminder.description}</p>
      )}

      {reminder.instructions && (
        <div className="reminder-card__instructions">
          <span className="reminder-card__instructions-label">Instructions:</span>
          <span>{reminder.instructions}</span>
        </div>
      )}

      <div className="reminder-card__actions">
        <button
          onClick={handleTaken}
          disabled={actionLoading}
          className="reminder-card__action-btn reminder-card__action-btn--taken"
          title="Mark as taken"
        >
          ✓ Taken
        </button>
        <button
          onClick={handleSnooze}
          disabled={actionLoading}
          className="reminder-card__action-btn reminder-card__action-btn--snooze"
          title="Snooze for 10 minutes"
        >
          ⏰ Snooze
        </button>
        <button
          onClick={handleSkip}
          disabled={actionLoading}
          className="reminder-card__action-btn reminder-card__action-btn--skip"
          title="Skip this time"
        >
          ⏭ Skip
        </button>
      </div>

      {showActions && (
        <div className="reminder-card__dropdown">
          <button
            onClick={() => {
              onEdit?.(reminder)
              setShowActions(false)
            }}
            className="reminder-card__dropdown-item"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this reminder?')) {
                onDelete?.(reminder.id)
              }
              setShowActions(false)
            }}
            className="reminder-card__dropdown-item reminder-card__dropdown-item--danger"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default ReminderCard



