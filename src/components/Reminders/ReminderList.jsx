import ReminderCard from './ReminderCard.jsx'
import './ReminderList.css'

const ReminderList = ({ reminders, loading, onUpdate, onDelete, onEdit }) => {
  if (loading) {
    return (
      <div className="reminder-list__loading">
        <div className="reminder-list__spinner"></div>
        <p>Loading reminders...</p>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="reminder-list__empty">
        <div className="reminder-list__empty-icon">⏰</div>
        <h3>No Reminders Yet</h3>
        <p>Create your first reminder to get started</p>
      </div>
    )
  }

  // Group reminders by type
  const groupedReminders = reminders.reduce((acc, reminder) => {
    const type = reminder.reminder_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(reminder)
    return acc
  }, {})

  const typeLabels = {
    medication: '💊 Medications',
    appointment: '🏥 Appointments',
    lab_test: '🔬 Lab Tests',
    refill: '📋 Refills'
  }

  return (
    <div className="reminder-list">
      {Object.entries(groupedReminders).map(([type, typeReminders]) => (
        <div key={type} className="reminder-list__group">
          <h3 className="reminder-list__group-title">
            {typeLabels[type] || type}
            <span className="reminder-list__group-count">{typeReminders.length}</span>
          </h3>
          <div className="reminder-list__grid">
            {typeReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReminderList

