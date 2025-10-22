import { useState, useEffect } from 'react'
import { checkIPFSConfiguration, loginToIPFS } from '@services/ipfs.js'
import './IPFSSetup.css'

const IPFSSetup = ({ onSetupComplete }) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('checking') // checking, not_configured, email_sent, configured
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  useEffect(() => {
    checkConfiguration()
  }, [])
  
  const checkConfiguration = async () => {
    setLoading(true)
    try {
      const config = await checkIPFSConfiguration()
      
      if (config.configured) {
        setStatus('configured')
        setMessage(`Connected to Web3.Storage! Space: ${config.spaceDID?.substring(0, 20)}...`)
        onSetupComplete?.(true)
      } else {
        setStatus('not_configured')
      }
    } catch (err) {
      setError('Failed to check IPFS configuration')
      setStatus('not_configured')
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const result = await loginToIPFS(email)
      
      if (result.success) {
        setStatus('email_sent')
        setMessage(result.message)
      } else {
        setError(result.error || 'Failed to send login email')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'checking') {
    return (
      <div className="ipfs-setup ipfs-setup--checking">
        <div className="ipfs-setup__spinner"></div>
        <p>Checking IPFS configuration...</p>
      </div>
    )
  }
  
  if (status === 'configured') {
    return (
      <div className="ipfs-setup ipfs-setup--configured">
        <div className="ipfs-setup__success-icon">✅</div>
        <h3>IPFS Ready!</h3>
        <p>{message}</p>
        <button 
          onClick={checkConfiguration}
          className="ipfs-setup__btn ipfs-setup__btn--secondary"
        >
          Refresh Status
        </button>
      </div>
    )
  }
  
  if (status === 'email_sent') {
    return (
      <div className="ipfs-setup ipfs-setup--email-sent">
        <div className="ipfs-setup__icon">📧</div>
        <h3>Check Your Email!</h3>
        <p>{message}</p>
        <div className="ipfs-setup__instructions">
          <ol>
            <li>Open the email from Web3.Storage</li>
            <li>Click the verification link</li>
            <li>Complete the setup in your browser</li>
            <li>Come back here and refresh</li>
          </ol>
        </div>
        <button 
          onClick={checkConfiguration}
          className="ipfs-setup__btn ipfs-setup__btn--primary"
        >
          I've Completed Setup - Check Again
        </button>
        <button 
          onClick={() => setStatus('not_configured')}
          className="ipfs-setup__btn ipfs-setup__btn--secondary"
        >
          Send Another Email
        </button>
      </div>
    )
  }
  
  return (
    <div className="ipfs-setup ipfs-setup--not-configured">
      <div className="ipfs-setup__icon">☁️</div>
      <h3>Setup IPFS Backup</h3>
      <p className="ipfs-setup__description">
        Enable decentralized file backup with Web3.Storage. 
        Your files will be stored on IPFS with redundant copies worldwide.
      </p>
      
      <form onSubmit={handleLogin} className="ipfs-setup__form">
        <div className="ipfs-setup__field">
          <label htmlFor="ipfs-email">Email Address</label>
          <input
            id="ipfs-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={loading}
            className="ipfs-setup__input"
          />
          <span className="ipfs-setup__hint">
            We'll send you a verification link from Web3.Storage
          </span>
        </div>
        
        {error && (
          <div className="ipfs-setup__error">
            <span className="ipfs-setup__error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <button 
          type="submit"
          disabled={loading}
          className="ipfs-setup__btn ipfs-setup__btn--primary"
        >
          {loading ? (
            <>
              <div className="ipfs-setup__btn-spinner"></div>
              Sending...
            </>
          ) : (
            <>
              <span>✉️</span>
              Send Verification Email
            </>
          )}
        </button>
      </form>
      
      <div className="ipfs-setup__info">
        <h4>Why Web3.Storage?</h4>
        <ul>
          <li>✅ Free decentralized storage</li>
          <li>✅ Content-addressed (CID-based)</li>
          <li>✅ Redundant backups on Filecoin</li>
          <li>✅ Fast global CDN access</li>
        </ul>
      </div>
    </div>
  )
}

export default IPFSSetup

