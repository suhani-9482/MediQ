import { useState } from 'react'
import { sendMagicLink } from '@services/auth.js'
import './LoginForm.css'

const LoginForm = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      onError?.('Please enter your email address')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await sendMagicLink(email.trim())
      
      if (result.success) {
        setLinkSent(true)
        onSuccess?.('Magic link sent! Check your email and click the link to sign in.')
      } else {
        onError?.(result.error)
      }
    } catch (error) {
      onError?.('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendLink = async () => {
    if (!email.trim()) return
    
    setIsLoading(true)
    setLinkSent(false)
    
    try {
      const result = await sendMagicLink(email.trim())
      
      if (result.success) {
        setLinkSent(true)
        onSuccess?.('New magic link sent! Check your email.')
      } else {
        onError?.(result.error)
      }
    } catch (error) {
      onError?.('Failed to resend link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (linkSent) {
    return (
      <div className="login-form-container">
        {/* Left Panel */}
        <div className="login-form__left-panel">
          <div className="login-form__branding">
            <div className="login-form__logo-top">
              <span className="login-form__logo-icon">📱</span>
              <span className="login-form__logo-text">MEDIQ</span>
            </div>
            <h2 className="login-form__tagline">
              Experiencing Healthcare, One Click at a Time
            </h2>
            <p className="login-form__subtitle">
              Your Health, Your Records, Your Control
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-form__right-panel">
          <div className="login-form__success">
            <div className="login-form__icon">
              📧
            </div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="login-form__instructions">
              Click the link in your email to sign in. The link will expire in 1 hour.
            </p>
            
            <div className="login-form__actions">
              <button
                type="button"
                onClick={handleResendLink}
                disabled={isLoading}
                className="login-form__button login-form__button--secondary"
              >
                {isLoading ? 'Sending...' : 'Resend Link'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setLinkSent(false)
                  setEmail('')
                }}
                className="login-form__button login-form__button--text"
              >
                Use Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-form-container">
      {/* Left Panel - Medical Image & Branding */}
      <div className="login-form__left-panel">
        <div className="login-form__branding">
          <div className="login-form__logo-top">
            <span className="login-form__logo-icon">📱</span>
            <span className="login-form__logo-text">MEDIQ</span>
          </div>
          <h2 className="login-form__tagline">
            Experiencing Healthcare, One Click at a Time
          </h2>
          <p className="login-form__subtitle">
            Your Health, Your Records, Your Control
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form__right-panel">
        <div className="login-form">
          <div className="login-form__header-text">
            <h2>Welcome Back</h2>
            <p>Enter your email to receive a secure login link</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form__form">
            <div className="login-form__field">
              <label htmlFor="email" className="login-form__label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="login-form__input"
                disabled={isLoading}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="login-form__button login-form__button--primary"
            >
              {isLoading ? (
                <>
                  <span className="login-form__spinner"></span>
                  Sending Magic Link...
                </>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>

          <div className="login-form__divider">
            <span>Or Login with Google</span>
          </div>

          <button className="login-form__google-btn" disabled>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Login with Google
          </button>

          <div className="login-form__info-box">
            <div className="login-form__info-item">
              <span className="login-form__info-icon">🔐</span>
              <span>Passwordless & Secure</span>
            </div>
            <div className="login-form__info-item">
              <span className="login-form__info-icon">⚡</span>
              <span>Quick Email Authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
