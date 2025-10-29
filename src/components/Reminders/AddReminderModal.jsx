import { useState, useEffect } from 'react'
import { createReminder, updateReminder, getReminderTypeColor } from '@services/reminders.js'
import './AddReminderModal.css'

const AddReminderModal = ({ isOpen, onClose, onSuccess, editReminder = null, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminderType: 'medication',
    medicationName: '',
    dosage: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reminderTime: '09:00',
    frequency: 'daily',
    frequencyDetails: { days: [1, 2, 3, 4, 5] }, // Mon-Fri by default
    notificationEnabled: true,
    color: 'blue'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editReminder) {
      setFormData({
        title: editReminder.title || '',
        description: editReminder.description || '',
        reminderType: editReminder.reminder_type || 'medication',
        medicationName: editReminder.medication_name || '',
        dosage: editReminder.dosage || '',
        instructions: editReminder.instructions || '',
        startDate: editReminder.start_date || new Date().toISOString().split('T')[0],
        endDate: editReminder.end_date || '',
        reminderTime: editReminder.reminder_time?.substring(0, 5) || '09:00',
        frequency: editReminder.frequency || 'daily',
        frequencyDetails: editReminder.frequency_details || { days: [1, 2, 3, 4, 5] },
        notificationEnabled: editReminder.notification_enabled !== false,
        color: editReminder.color || 'blue'
      })
    } else {
      // Reset form for new reminder
      setFormData({
        title: '',
        description: '',
        reminderType: 'medication',
        medicationName: '',
        dosage: '',
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        reminderTime: '09:00',
        frequency: 'daily',
        frequencyDetails: { days: [1, 2, 3, 4, 5] },
        notificationEnabled: true,
        color: 'blue'
      })
    }
  }, [editReminder, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-set color based on reminder type
    if (name === 'reminderType') {
      setFormData(prev => ({
        ...prev,
        color: getReminderTypeColor(value)
      }))
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.frequencyDetails?.days || []
      const newDays = days.includes(day)
        ? days.filter(d => d !== day)
        : [...days, day].sort()
      
      return {
        ...prev,
        frequencyDetails: { ...prev.frequencyDetails, days: newDays }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const reminderData = {
        userId,
        title: formData.title,
        description: formData.description,
        reminderType: formData.reminderType,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        instructions: formData.instructions,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        reminderTime: formData.reminderTime,
        frequency: formData.frequency,
        frequencyDetails: formData.frequency === 'weekly' ? formData.frequencyDetails : null,
        notificationEnabled: formData.notificationEnabled,
        color: formData.color
      }

      let result
      if (editReminder) {
        result = await updateReminder(editReminder.id, reminderData)
      } else {
        result = await createReminder(reminderData)
      }

      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="reminder-modal-overlay" onClick={onClose}>
      <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reminder-modal__header">
          <h2>{editReminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
          <button onClick={onClose} className="reminder-modal__close" aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <div className="reminder-modal__error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reminder-modal__form">
          {/* Reminder Type */}
          <div className="reminder-modal__field">
            <label htmlFor="reminderType">Reminder Type</label>
            <select
              id="reminderType"
              name="reminderType"
              value={formData.reminderType}
              onChange={handleChange}
              required
            >
              <option value="medication">💊 Medication</option>
              <option value="appointment">🏥 Appointment</option>
              <option value="lab_test">🔬 Lab Test</option>
              <option value="refill">📋 Prescription Refill</option>
            </select>
          </div>

          {/* Title */}
          <div className="reminder-modal__field">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Take Aspirin"
              required
            />
          </div>

          {/* Medication-specific fields */}
          {formData.reminderType === 'medication' && (
            <>
              <div className="reminder-modal__field">
                <label htmlFor="medicationName">Medication Name</label>
                <input
                  type="text"
                  id="medicationName"
                  name="medicationName"
                  value={formData.medicationName}
                  onChange={handleChange}
                  placeholder="e.g., Aspirin"
                />
              </div>

              <div className="reminder-modal__field">
                <label htmlFor="dosage">Dosage</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="e.g., 100mg"
                />
              </div>

              <div className="reminder-modal__field">
                <label htmlFor="instructions">Instructions</label>
                <input
                  type="text"
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="e.g., Take with food"
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="reminder-modal__field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows="3"
            />
          </div>

          {/* Time */}
          <div className="reminder-modal__field">
            <label htmlFor="reminderTime">Time *</label>
            <input
              type="time"
              id="reminderTime"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Frequency */}
          <div className="reminder-modal__field">
            <label htmlFor="frequency">Frequency *</label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="daily">Every day</option>
              <option value="weekly">Specific days</option>
            </select>
          </div>

          {/* Weekly days selector */}
          {formData.frequency === 'weekly' && (
            <div className="reminder-modal__field">
              <label>Select Days</label>
              <div className="reminder-modal__days">
                {dayNames.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDayToggle(index)}
                    className={`reminder-modal__day ${
                      formData.frequencyDetails?.days?.includes(index) ? 'active' : ''
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date range */}
          <div className="reminder-modal__field-group">
            <div className="reminder-modal__field">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="reminder-modal__field">
              <label htmlFor="endDate">End Date (Optional)</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Notification toggle */}
          <div className="reminder-modal__field reminder-modal__field--checkbox">
            <label>
              <input
                type="checkbox"
                name="notificationEnabled"
                checked={formData.notificationEnabled}
                onChange={handleChange}
              />
              <span>Enable notifications</span>
            </label>
          </div>

          {/* Actions */}
          <div className="reminder-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="reminder-modal__btn reminder-modal__btn--cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="reminder-modal__btn reminder-modal__btn--submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : editReminder ? 'Update Reminder' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReminderModal

