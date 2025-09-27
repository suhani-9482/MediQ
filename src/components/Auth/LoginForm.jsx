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
      <div className="login-form">
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
    )
  }

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h1>Welcome to MediQ</h1>
        <p>Secure Medical Records Management</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form__form">
        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
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

      <div className="login-form__info">
        <div className="login-form__feature">
          <span className="login-form__feature-icon">🔐</span>
          <span>Passwordless & Secure</span>
        </div>
        <div className="login-form__feature">
          <span className="login-form__feature-icon">⚡</span>
          <span>Quick Email Authentication</span>
        </div>
        <div className="login-form__feature">
          <span className="login-form__feature-icon">🏥</span>
          <span>HIPAA Compliant</span>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
