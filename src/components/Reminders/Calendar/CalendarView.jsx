import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { getRemindersForDate, formatDate, checkIsToday } from '../../../utils/dateHelpers.js'
import { getReminderTypeIcon, formatReminderTime } from '../../../services/reminders.js'
import './CalendarView.css'

const CalendarView = ({ reminders, onDateSelect, onReminderClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('month') // month, week

  const handleDateChange = (date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null

    const dayReminders = getRemindersForDate(reminders, date)
    
    if (dayReminders.length === 0) return null

    return (
      <div className="calendar-tile-content">
        <div className="calendar-tile-count">{dayReminders.length}</div>
        <div className="calendar-tile-indicators">
          {dayReminders.slice(0, 3).map((reminder, idx) => (
            <span 
              key={idx} 
              className={`calendar-tile-dot calendar-tile-dot--${reminder.color}`}
            />
          ))}
        </div>
      </div>
    )
  }

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null

    const classes = []
    
    if (checkIsToday(date)) {
      classes.push('calendar-tile--today')
    }
    
    const dayReminders = getRemindersForDate(reminders, date)
    if (dayReminders.length > 0) {
      classes.push('calendar-tile--has-reminders')
    }
    
    return classes.join(' ')
  }

  const selectedDayReminders = getRemindersForDate(reminders, selectedDate)

  return (
    <div className="calendar-view">
      <div className="calendar-view__header">
        <h2>Calendar View</h2>
        <div className="calendar-view__controls">
          <button
            onClick={() => setView('month')}
            className={`calendar-view__control-btn ${view === 'month' ? 'active' : ''}`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`calendar-view__control-btn ${view === 'week' ? 'active' : ''}`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="calendar-view__calendar">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          prev2Label={null}
          next2Label={null}
        />
      </div>

      <div className="calendar-view__selected-day">
        <h3 className="calendar-view__selected-day-title">
          {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        
        {selectedDayReminders.length === 0 ? (
          <div className="calendar-view__no-reminders">
            <span className="calendar-view__no-reminders-icon">📅</span>
            <p>No reminders scheduled for this day</p>
          </div>
        ) : (
          <div className="calendar-view__reminders-list">
            {selectedDayReminders.map(reminder => (
              <div
                key={reminder.id}
                className={`calendar-reminder-card calendar-reminder-card--${reminder.color}`}
                onClick={() => onReminderClick?.(reminder)}
              >
                <div className="calendar-reminder-card__icon">
                  {getReminderTypeIcon(reminder.reminder_type)}
                </div>
                <div className="calendar-reminder-card__content">
                  <div className="calendar-reminder-card__title">{reminder.title}</div>
                  {reminder.medication_name && (
                    <div className="calendar-reminder-card__medication">
                      {reminder.medication_name}
                      {reminder.dosage && ` - ${reminder.dosage}`}
                    </div>
                  )}
                </div>
                <div className="calendar-reminder-card__time">
                  {formatReminderTime(reminder.reminder_time)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="calendar-view__legend">
        <div className="calendar-view__legend-title">Reminder Types:</div>
        <div className="calendar-view__legend-items">
          <div className="calendar-view__legend-item">
            <span className="calendar-view__legend-dot calendar-view__legend-dot--blue" />
            <span>Medication</span>
          </div>
          <div className="calendar-view__legend-item">
            <span className="calendar-view__legend-dot calendar-view__legend-dot--green" />
            <span>Appointment</span>
          </div>
          <div className="calendar-view__legend-item">
            <span className="calendar-view__legend-dot calendar-view__legend-dot--orange" />
            <span>Lab Test</span>
          </div>
          <div className="calendar-view__legend-item">
            <span className="calendar-view__legend-dot calendar-view__legend-dot--purple" />
            <span>Refill</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView

