import { useState, useEffect, useCallback } from 'react'
import { listUserFiles } from '@services/storage.js'
import { useAuth } from './useAuth.js'

/**
 * Custom hook to fetch and track file statistics
 * @returns {object} File stats and loading state
 */
export const useFileStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRecords: 0,
    loading: true,
    error: null
  })

  const fetchStats = useCallback(async () => {
    if (!user?.uid) {
      setStats({ totalRecords: 0, loading: false, error: null })
      return
    }

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await listUserFiles(user.uid)
      
      if (result.success) {
        // Filter out any folder entries (they have no 'id' or are empty)
        const files = result.data.filter(file => file.id && file.name)
        
        setStats({
          totalRecords: files.length,
          loading: false,
          error: null
        })
      } else {
        setStats({
          totalRecords: 0,
          loading: false,
          error: result.error
        })
      }
    } catch (error) {
      console.error('Error fetching file stats:', error)
      setStats({
        totalRecords: 0,
        loading: false,
        error: error.message
      })
    }
  }, [user?.uid])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Return stats and a refresh function
  return {
    ...stats,
    refreshStats: fetchStats
  }
}

