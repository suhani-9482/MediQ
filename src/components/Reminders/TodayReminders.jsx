import { formatReminderTime, getReminderTypeIcon } from '@services/reminders.js'
import './TodayReminders.css'

const TodayReminders = ({ reminders, loading, onViewAll }) => {
  if (loading) {
    return (
      <div className="today-reminders">
        <div className="today-reminders__header">
          <h3>Today's Reminders</h3>
        </div>
        <div className="today-reminders__loading">
          <div className="today-reminders__spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="today-reminders">
        <div className="today-reminders__header">
          <h3>Today's Reminders</h3>
        </div>
        <div className="today-reminders__empty">
          <span className="today-reminders__empty-icon">✅</span>
          <p>No reminders for today</p>
        </div>
      </div>
    )
  }

  // Sort by time
  const sortedReminders = [...reminders].sort((a, b) => {
    return a.reminder_time.localeCompare(b.reminder_time)
  })

  // Show only first 5
  const displayReminders = sortedReminders.slice(0, 5)
  const hasMore = sortedReminders.length > 5

  return (
    <div className="today-reminders">
      <div className="today-reminders__header">
        <h3>Today's Reminders</h3>
        <span className="today-reminders__count">{reminders.length}</span>
      </div>

      <div className="today-reminders__list">
        {displayReminders.map(reminder => (
          <div key={reminder.id} className={`today-reminders__item today-reminders__item--${reminder.color}`}>
            <div className="today-reminders__icon">
              {getReminderTypeIcon(reminder.reminder_type)}
            </div>
            <div className="today-reminders__info">
              <div className="today-reminders__title">{reminder.title}</div>
              {reminder.medication_name && (
                <div className="today-reminders__medication">
                  {reminder.medication_name}
                  {reminder.dosage && ` - ${reminder.dosage}`}
                </div>
              )}
            </div>
            <div className="today-reminders__time">
              {formatReminderTime(reminder.reminder_time)}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button onClick={onViewAll} className="today-reminders__view-all">
          View all {reminders.length} reminders →
        </button>
      )}
    </div>
  )
}

export default TodayReminders

