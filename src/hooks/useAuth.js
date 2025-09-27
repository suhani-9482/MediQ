import { useState, useEffect } from 'react'
import { subscribeToAuthState, getCurrentUser } from '@services/auth.js'

/**
 * Custom hook for managing authentication state
 * @returns {object} Authentication state and methods
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthState((authData) => {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: authData.isAuthenticated,
        user: authData.user,
        loading: false,
        error: null
      }))
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  /**
   * Set authentication error
   * @param {string} error - Error message
   */
  const setError = (error) => {
    setAuthState(prev => ({
      ...prev,
      error,
      loading: false
    }))
  }

  /**
   * Clear authentication error
   */
  const clearError = () => {
    setAuthState(prev => ({
      ...prev,
      error: null
    }))
  }

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  const setLoading = (loading) => {
    setAuthState(prev => ({
      ...prev,
      loading
    }))
  }

  return {
    ...authState,
    setError,
    clearError,
    setLoading,
    // Helper methods
    isLoggedIn: authState.isAuthenticated && !authState.loading,
    getCurrentUser
  }
}
