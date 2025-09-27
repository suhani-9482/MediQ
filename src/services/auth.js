import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from './firebase.js'

// Email link configuration
const actionCodeSettings = {
  // URL you want to redirect back to
  url: window.location.origin,
  // This must be true for email link sign-in
  handleCodeInApp: true,
}

/**
 * Send magic link to user's email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendMagicLink = async (email) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    
    // Store email locally for the sign-in completion
    window.localStorage.setItem('emailForSignIn', email)
    
    console.log('✅ Magic link sent to:', email)
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending magic link:', error)
    
    // Handle specific Firebase errors
    let errorMessage = 'Failed to send magic link. Please try again.'
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format'
        break
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait a moment and try again'
        break
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection'
        break
      default:
        errorMessage = error.message || errorMessage
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Complete sign-in with email link
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const completeSignIn = async () => {
  try {
    // Check if the current URL is a sign-in link
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return { success: false, error: 'Invalid sign-in link' }
    }

    // Get email from localStorage or prompt user
    let email = window.localStorage.getItem('emailForSignIn')
    
    if (!email) {
      // User opened the link on a different device
      email = window.prompt('Please provide your email for confirmation:')
      if (!email) {
        return { success: false, error: 'Email is required to complete sign-in' }
      }
    }

    // Complete the sign-in
    const result = await signInWithEmailLink(auth, email, window.location.href)
    
    // Clean up localStorage
    window.localStorage.removeItem('emailForSignIn')
    
    // Clean up URL (remove the sign-in parameters)
    window.history.replaceState({}, document.title, window.location.pathname)
    
    console.log('✅ User signed in successfully:', result.user.uid)
    return { success: true, user: result.user }
    
  } catch (error) {
    console.error('❌ Error completing sign-in:', error)
    
    let errorMessage = 'Failed to complete sign-in. Please try again.'
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address'
        break
      case 'auth/invalid-action-code':
        errorMessage = 'Invalid or expired sign-in link'
        break
      case 'auth/expired-action-code':
        errorMessage = 'Sign-in link has expired. Please request a new one'
        break
      default:
        errorMessage = error.message || errorMessage
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Sign out current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth)
    console.log('✅ User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Error signing out:', error)
    return { success: false, error: error.message || 'Failed to sign out' }
  }
}

/**
 * Subscribe to authentication state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} Unsubscribe function
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('🔐 User authenticated:', user.uid)
      callback({
        isAuthenticated: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: user.metadata.creationTime,
          lastSignIn: user.metadata.lastSignInTime
        }
      })
    } else {
      console.log('🔓 User not authenticated')
      callback({
        isAuthenticated: false,
        user: null
      })
    }
  })
}

/**
 * Get current user information
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
  const user = auth.currentUser
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime
    }
  }
  return null
}
