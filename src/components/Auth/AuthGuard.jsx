import { useEffect } from 'react'
import { useAuth } from '@hooks/useAuth.js'
import { completeSignIn } from '@services/auth.js'
import LoginForm from './LoginForm.jsx'
import LoadingSpinner from '../Layout/LoadingSpinner.jsx'
import './AuthGuard.css'

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, error, setError, clearError, setLoading } = useAuth()

  useEffect(() => {
    // Check if this is a sign-in link when component mounts
    const handleSignInLink = async () => {
      try {
        const result = await completeSignIn()
        if (result.error && result.error !== 'Invalid sign-in link') {
          setError(result.error)
        }
      } catch (error) {
        console.error('Error handling sign-in link:', error)
      }
    }

    handleSignInLink()
  }, [setError])

  const handleLoginSuccess = (message) => {
    clearError()
    // Message will be shown by LoginForm component
    console.log('Login success:', message)
  }

  const handleLoginError = (errorMessage) => {
    setError(errorMessage)
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="auth-guard">
        <div className="auth-guard__loading">
          <LoadingSpinner size="large" />
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="auth-guard">
        <div className="auth-guard__container">
          {error && (
            <div className="auth-guard__error" role="alert">
              <span className="auth-guard__error-icon">⚠️</span>
              <span className="auth-guard__error-message">{error}</span>
              <button
                onClick={clearError}
                className="auth-guard__error-close"
                aria-label="Close error message"
              >
                ✕
              </button>
            </div>
          )}
          
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
          
          <div className="auth-guard__footer">
            <p>
              By signing in, you agree to our{' '}
              <a href="#" className="auth-guard__link">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="auth-guard__link">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, render protected content
  return children
}

export default AuthGuard
