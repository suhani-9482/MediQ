import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addDays,
  subDays,
  addMonths,
  subMonths
} from 'date-fns'

/**
 * Get days in current week
 * @param {Date} date - Reference date
 * @returns {Array<Date>}
 */
export const getDaysInWeek = (date = new Date()) => {
  const start = startOfWeek(date)
  const end = endOfWeek(date)
  return eachDayOfInterval({ start, end })
}

/**
 * Get days in current month
 * @param {Date} date - Reference date
 * @returns {Array<Date>}
 */
export const getDaysInMonth = (date = new Date()) => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

/**
 * Check if reminder should show on given date
 * @param {object} reminder - Reminder object
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const isReminderOnDate = (reminder, date) => {
  const reminderDate = new Date(reminder.start_date)
  const endDate = reminder.end_date ? new Date(reminder.end_date) : null
  
  // Check if date is within range
  if (date < reminderDate) return false
  if (endDate && date > endDate) return false
  
  // Check frequency
  if (reminder.frequency === 'daily') {
    return true
  }
  
  if (reminder.frequency === 'weekly' && reminder.frequency_details?.days) {
    const dayOfWeek = date.getDay()
    return reminder.frequency_details.days.includes(dayOfWeek)
  }
  
  return false
}

/**
 * Get reminders for specific date
 * @param {Array} reminders - All reminders
 * @param {Date} date - Date to filter
 * @returns {Array}
 */
export const getRemindersForDate = (reminders, date) => {
  return reminders.filter(reminder => isReminderOnDate(reminder, date))
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  return format(date, formatStr)
}

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export const checkIsToday = (date) => {
  return isToday(date)
}

/**
 * Check if two dates are same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean}
 */
export const checkIsSameDay = (date1, date2) => {
  return isSameDay(date1, date2)
}

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Days to add
 * @returns {Date}
 */
export const addDaysToDate = (date, days) => {
  return addDays(date, days)
}

/**
 * Subtract days from date
 * @param {Date} date - Base date
 * @param {number} days - Days to subtract
 * @returns {Date}
 */
export const subtractDaysFromDate = (date, days) => {
  return subDays(date, days)
}

/**
 * Add months to date
 * @param {Date} date - Base date
 * @param {number} months - Months to add
 * @returns {Date}
 */
export const addMonthsToDate = (date, months) => {
  return addMonths(date, months)
}

/**
 * Subtract months from date
 * @param {Date} date - Base date
 * @param {number} months - Months to subtract
 * @returns {Date}
 */
export const subtractMonthsFromDate = (date, months) => {
  return subMonths(date, months)
}

/**
 * Get week number of year
 * @param {Date} date - Date
 * @returns {number}
 */
export const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Get adherence data for chart (last N days)
 * @param {Array} logs - Reminder logs
 * @param {number} days - Number of days
 * @returns {object} Chart data
 */
export const getAdherenceChartData = (logs, days = 30) => {
  const endDate = new Date()
  const startDate = subDays(endDate, days - 1)
  const daysArray = eachDayOfInterval({ start: startDate, end: endDate })
  
  const labels = []
  const takenData = []
  const missedData = []
  
  daysArray.forEach(day => {
    labels.push(format(day, 'MMM d'))
    
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.scheduled_time)
      return isSameDay(logDate, day)
    })
    
    const taken = dayLogs.filter(log => log.action === 'taken').length
    const missed = dayLogs.filter(log => log.action === 'missed').length
    
    takenData.push(taken)
    missedData.push(missed)
  })
  
  return { labels, takenData, missedData }
}

