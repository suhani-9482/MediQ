import supabase from './supabase.js'

/**
 * Get user preferences
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No preferences found, return defaults
      return {
        success: true,
        data: getDefaultPreferences(userId)
      }
    }

    if (error) throw error

    return { success: true, data: data || getDefaultPreferences(userId) }
  } catch (error) {
    console.error('❌ Get preferences error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save or update user preferences
 * @param {string} userId - User ID
 * @param {object} preferences - Preferences to save
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) throw error

    console.log('✅ Preferences saved')
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Save preferences error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if time is within quiet hours
 * @param {object} preferences - User preferences
 * @param {Date} time - Time to check (default: now)
 * @returns {boolean}
 */
export const isQuietHours = (preferences, time = new Date()) => {
  if (!preferences?.quiet_hours_enabled) return false

  const currentTime = time.getHours() * 60 + time.getMinutes()
  const start = timeStringToMinutes(preferences.quiet_hours_start)
  const end = timeStringToMinutes(preferences.quiet_hours_end)

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (start > end) {
    return currentTime >= start || currentTime < end
  }

  return currentTime >= start && currentTime < end
}

/**
 * Convert time string to minutes since midnight
 * @param {string} timeString - Time string (HH:MM or HH:MM:SS)
 * @returns {number}
 */
const timeStringToMinutes = (timeString) => {
  if (!timeString) return 0
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get default preferences
 * @param {string} userId - User ID
 * @returns {object}
 */
const getDefaultPreferences = (userId) => ({
  user_id: userId,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  notification_sound: true,
  notification_vibration: true,
  weekly_report_email: false,
  daily_summary_email: false,
  user_email: null,
  calendar_view_default: 'monthly',
  theme: 'light'
})

/**
 * Get adherence streak for user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getAdherenceStreak = async (userId) => {
  try {
    const { data, error} = await supabase
      .from('adherence_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No streak found, create one
      return await initializeStreak(userId)
    }

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('❌ Get streak error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Initialize streak for new user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
const initializeStreak = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('adherence_streaks')
      .insert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .select()

    if (error) throw error

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Initialize streak error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update adherence streak
 * @param {string} userId - User ID
 * @param {boolean} takenToday - Whether user took medications today
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateAdherenceStreak = async (userId, takenToday = true) => {
  try {
    const streakResult = await getAdherenceStreak(userId)
    if (!streakResult.success) return streakResult

    const streak = streakResult.data
    const today = new Date().toISOString().split('T')[0]
    const lastDate = streak.last_activity_date

    let newStreak = streak.current_streak
    let newLongest = streak.longest_streak

    if (takenToday) {
      // Check if this is consecutive day
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastDate === yesterdayStr || lastDate === today) {
        // Consecutive day or same day
        if (lastDate !== today) {
          newStreak += 1
        }
      } else {
        // Streak broken
        newStreak = 1
      }

      // Update longest streak
      if (newStreak > newLongest) {
        newLongest = newStreak
      }
    } else {
      // Missed day - reset streak
      newStreak = 0
    }

    const { data, error } = await supabase
      .from('adherence_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()

    if (error) throw error

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Update streak error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get reminder templates
 * @param {string} category - Optional category filter
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getReminderTemplates = async (category = null) => {
  try {
    let query = supabase
      .from('reminder_templates')
      .select('*')
      .eq('is_system_template', true)
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Get templates error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Increment template usage count
 * @param {number} templateId - Template ID
 * @returns {Promise<{success: boolean}>}
 */
export const incrementTemplateUsage = async (templateId) => {
  try {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId
    })

    // If RPC doesn't exist, update directly
    if (error && error.code === '42883') {
      const { error: updateError } = await supabase
        .from('reminder_templates')
        .update({ 
          usage_count: supabase.raw('usage_count + 1')
        })
        .eq('id', templateId)

      if (updateError) throw updateError
    } else if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Increment template usage error:', error)
    return { success: false, error: error.message }
  }
}

