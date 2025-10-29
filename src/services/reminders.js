import supabase from './supabase.js'

/**
 * Create a new reminder
 * @param {object} reminderData - Reminder data
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const createReminder = async (reminderData) => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        user_id: reminderData.userId,
        title: reminderData.title,
        description: reminderData.description || null,
        reminder_type: reminderData.reminderType,
        medication_name: reminderData.medicationName || null,
        dosage: reminderData.dosage || null,
        instructions: reminderData.instructions || null,
        start_date: reminderData.startDate,
        end_date: reminderData.endDate || null,
        reminder_time: reminderData.reminderTime,
        frequency: reminderData.frequency,
        frequency_details: reminderData.frequencyDetails || null,
        notification_enabled: reminderData.notificationEnabled !== false,
        notification_lead_time: reminderData.notificationLeadTime || 0,
        is_active: true,
        color: reminderData.color || 'blue'
      }])
      .select()

    if (error) throw error

    console.log('✅ Reminder created:', data[0])
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Create reminder error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all reminders for a user
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getReminders = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true })

    // Apply filters
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }
    if (filters.reminderType) {
      query = query.eq('reminder_type', filters.reminderType)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Get reminders error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get today's reminders
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getTodayReminders = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`)

    if (error) throw error

    // Filter by frequency
    const todayReminders = (data || []).filter(reminder => {
      if (reminder.frequency === 'daily') return true
      if (reminder.frequency === 'weekly' && reminder.frequency_details?.days) {
        return reminder.frequency_details.days.includes(dayOfWeek)
      }
      return true
    })

    return { success: true, data: todayReminders }
  } catch (error) {
    console.error('❌ Get today reminders error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update a reminder
 * @param {number} reminderId - Reminder ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateReminder = async (reminderId, updates) => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)
      .select()

    if (error) throw error

    console.log('✅ Reminder updated:', data[0])
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Update reminder error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a reminder
 * @param {number} reminderId - Reminder ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteReminder = async (reminderId) => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)

    if (error) throw error

    console.log('✅ Reminder deleted:', reminderId)
    return { success: true }
  } catch (error) {
    console.error('❌ Delete reminder error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Log a reminder action (taken, missed, snoozed, skipped)
 * @param {object} logData - Log data
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const logReminderAction = async (logData) => {
  try {
    const { data, error } = await supabase
      .from('reminder_logs')
      .insert([{
        reminder_id: logData.reminderId,
        user_id: logData.userId,
        scheduled_time: logData.scheduledTime,
        action: logData.action,
        action_time: new Date().toISOString(),
        notes: logData.notes || null
      }])
      .select()

    if (error) throw error

    console.log('✅ Reminder action logged:', data[0])
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Log reminder action error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get reminder logs for a specific reminder
 * @param {number} reminderId - Reminder ID
 * @param {number} days - Number of days to look back (default 30)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getReminderLogs = async (reminderId, days = 30) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('reminder_logs')
      .select('*')
      .eq('reminder_id', reminderId)
      .gte('scheduled_time', startDate.toISOString())
      .order('scheduled_time', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Get reminder logs error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get adherence statistics for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default 30)
 * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
 */
export const getAdherenceStats = async (userId, days = 30) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('reminder_logs')
      .select('action')
      .eq('user_id', userId)
      .gte('scheduled_time', startDate.toISOString())

    if (error) throw error

    const logs = data || []
    const total = logs.length
    const taken = logs.filter(log => log.action === 'taken').length
    const missed = logs.filter(log => log.action === 'missed').length
    const skipped = logs.filter(log => log.action === 'skipped').length
    const snoozed = logs.filter(log => log.action === 'snoozed').length

    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0

    return {
      success: true,
      stats: {
        total,
        taken,
        missed,
        skipped,
        snoozed,
        adherenceRate,
        period: days
      }
    }
  } catch (error) {
    console.error('❌ Get adherence stats error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get reminder type color
 * @param {string} type - Reminder type
 * @returns {string} Color code
 */
export const getReminderTypeColor = (type) => {
  const colors = {
    medication: 'blue',
    appointment: 'green',
    lab_test: 'orange',
    refill: 'purple'
  }
  return colors[type] || 'blue'
}

/**
 * Get reminder type icon
 * @param {string} type - Reminder type
 * @returns {string} Icon emoji
 */
export const getReminderTypeIcon = (type) => {
  const icons = {
    medication: '💊',
    appointment: '🏥',
    lab_test: '🔬',
    refill: '📋'
  }
  return icons[type] || '⏰'
}

/**
 * Format reminder time for display
 * @param {string} time - Time string (HH:MM:SS)
 * @returns {string} Formatted time
 */
export const formatReminderTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Get frequency display text
 * @param {string} frequency - Frequency type
 * @param {object} details - Frequency details
 * @returns {string} Display text
 */
export const getFrequencyText = (frequency, details) => {
  if (frequency === 'daily') return 'Every day'
  if (frequency === 'weekly' && details?.days) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const selectedDays = details.days.map(d => dayNames[d]).join(', ')
    return `Every ${selectedDays}`
  }
  return frequency
}



