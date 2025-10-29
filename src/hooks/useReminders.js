import { useState, useEffect, useCallback } from 'react'
import { getReminders, getTodayReminders, getAdherenceStats } from '@services/reminders.js'
import { useAuth } from './useAuth.js'

/**
 * Custom hook for managing reminders
 * @returns {object} Reminders state and methods
 */
export const useReminders = () => {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [todayReminders, setTodayReminders] = useState([])
  const [adherenceStats, setAdherenceStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReminders = useCallback(async () => {
    if (!user?.uid) {
      setReminders([])
      setTodayReminders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [allResult, todayResult, statsResult] = await Promise.all([
        getReminders(user.uid, { isActive: true }),
        getTodayReminders(user.uid),
        getAdherenceStats(user.uid, 7) // Last 7 days
      ])

      if (allResult.success) {
        setReminders(allResult.data)
      } else {
        setError(allResult.error)
      }

      if (todayResult.success) {
        setTodayReminders(todayResult.data)
      }

      if (statsResult.success) {
        setAdherenceStats({
          ...statsResult.stats,
          logs: statsResult.logs
        })
      }
    } catch (err) {
      console.error('Error fetching reminders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  return {
    reminders,
    todayReminders,
    adherenceStats,
    loading,
    error,
    refreshReminders: fetchReminders
  }
}



