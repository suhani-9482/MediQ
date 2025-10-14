import supabase from './supabase.js'

/**
 * Send magic link to user's email using Supabase
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendMagicLink = async (email) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    const redirectTo = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      throw error
    }

    window.localStorage.setItem('emailForSignIn', email)
    console.log('✅ Magic link sent to:', email)
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending magic link:', error)
    let errorMessage = 'Failed to send magic link. Please try again.'
    if (error?.message) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

/**
 * Complete sign-in if URL contains a Supabase session (handled automatically)
 * Returns current user if already signed in.
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const completeSignIn = async () => {
  try {
    // Supabase handles session from URL automatically when detectSessionInUrl is true.
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // If there is an auth error propagated via URL, surface it
      return { success: false, error: error.message }
    }

    if (data?.user) {
      const user = data.user
      // Clean up URL if it contains tokens or params
      if (window.location.search || window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      return { success: true, user }
    }

    return { success: false, error: 'Invalid sign-in link' }
  } catch (error) {
    console.error('❌ Error completing sign-in:', error)
    return { success: false, error: error?.message || 'Failed to complete sign-in. Please try again.' }
  }
}

/**
 * Sign out current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    console.log('✅ User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Error signing out:', error)
    return { success: false, error: error?.message || 'Failed to sign out' }
  }
}

/**
 * Subscribe to authentication state changes
 * @param {function} callback - Callback({ isAuthenticated, user })
 * @returns {function} Unsubscribe function
 */
export const subscribeToAuthState = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user || null
    if (user) {
      console.log('🔐 User authenticated:', user.id)
      callback({
        isAuthenticated: true,
        user: {
          uid: user.id,
          email: user.email,
          emailVerified: Boolean(user.email_confirmed_at),
          displayName: user.user_metadata?.full_name || null,
          photoURL: user.user_metadata?.avatar_url || null,
          createdAt: user.created_at,
          lastSignIn: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        },
      })
    } else {
      console.log('🔓 User not authenticated')
      callback({ isAuthenticated: false, user: null })
    }
  })

  return () => data.subscription.unsubscribe()
}

/**
 * Get current user information
 * @returns {Promise<object|null>} Current user or null
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return null
  return {
    uid: user.id,
    email: user.email,
    emailVerified: Boolean(user.email_confirmed_at),
    displayName: user.user_metadata?.full_name || null,
    photoURL: user.user_metadata?.avatar_url || null,
    createdAt: user.created_at,
    lastSignIn: null,
  }
}
