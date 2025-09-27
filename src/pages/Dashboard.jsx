import { useAuth } from '@hooks/useAuth.js'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Welcome to MediQ</h1>
        <p>Your secure medical records management system</p>
      </div>

      <div className="dashboard__hero">
        <div className="dashboard__hero-content">
          <h2>🎉 Stage 1 Complete!</h2>
          <p>Email-link authentication is working perfectly</p>
          
          <div className="dashboard__user-info">
            <div className="dashboard__user-card">
              <div className="dashboard__user-avatar">
                {user?.displayName 
                  ? user.displayName.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || '?'
                }
              </div>
              <div className="dashboard__user-details">
                <h3>User Information</h3>
                <div className="dashboard__user-field">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="dashboard__user-field">
                  <strong>User ID:</strong> 
                  <code className="dashboard__uid">{user?.uid}</code>
                </div>
                <div className="dashboard__user-field">
                  <strong>Email Verified:</strong> 
                  <span className={`dashboard__status ${user?.emailVerified ? 'dashboard__status--verified' : 'dashboard__status--unverified'}`}>
                    {user?.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
                  </span>
                </div>
                <div className="dashboard__user-field">
                  <strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="dashboard__user-field">
                  <strong>Last Sign In:</strong> {user?.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__features">
        <h2>What's Next?</h2>
        <div className="dashboard__features-grid">
          <div className="dashboard__feature-card dashboard__feature-card--coming-soon">
            <div className="dashboard__feature-icon">📋</div>
            <h3>Medical Records</h3>
            <p>Upload and manage your medical documents securely</p>
            <span className="dashboard__feature-status">Coming in Stage 2</span>
          </div>
          
          <div className="dashboard__feature-card dashboard__feature-card--coming-soon">
            <div className="dashboard__feature-icon">🔍</div>
            <h3>OCR & Text Extraction</h3>
            <p>Automatically extract text and dates from documents</p>
            <span className="dashboard__feature-status">Coming in Stage 3</span>
          </div>
          
          <div className="dashboard__feature-card dashboard__feature-card--coming-soon">
            <div className="dashboard__feature-icon">🌐</div>
            <h3>IPFS Backup</h3>
            <p>Decentralized backup of your medical records</p>
            <span className="dashboard__feature-status">Coming in Stage 4</span>
          </div>
          
          <div className="dashboard__feature-card dashboard__feature-card--coming-soon">
            <div className="dashboard__feature-icon">⛓️</div>
            <h3>Blockchain Anchoring</h3>
            <p>Immutable verification on Ethereum Sepolia</p>
            <span className="dashboard__feature-status">Coming in Stage 5</span>
          </div>
          
          <div className="dashboard__feature-card dashboard__feature-card--coming-soon">
            <div className="dashboard__feature-icon">⏰</div>
            <h3>Smart Reminders</h3>
            <p>Medication and appointment notifications</p>
            <span className="dashboard__feature-status">Coming in Stage 6</span>
          </div>
          
          <div className="dashboard__feature-card dashboard__feature-card--coming-soon">
            <div className="dashboard__feature-icon">🚨</div>
            <h3>Emergency SOS</h3>
            <p>Quick access sharing for emergency situations</p>
            <span className="dashboard__feature-status">Coming in Stage 7</span>
          </div>
        </div>
      </div>

      <div className="dashboard__tech-stack">
        <h2>Technology Stack</h2>
        <div className="dashboard__tech-grid">
          <div className="dashboard__tech-item">
            <span className="dashboard__tech-icon">⚛️</span>
            <span className="dashboard__tech-name">React 18</span>
            <span className="dashboard__tech-status">✅ Active</span>
          </div>
          <div className="dashboard__tech-item">
            <span className="dashboard__tech-icon">⚡</span>
            <span className="dashboard__tech-name">Vite</span>
            <span className="dashboard__tech-status">✅ Active</span>
          </div>
          <div className="dashboard__tech-item">
            <span className="dashboard__tech-icon">🔥</span>
            <span className="dashboard__tech-name">Firebase</span>
            <span className="dashboard__tech-status">✅ Connected</span>
          </div>
          <div className="dashboard__tech-item">
            <span className="dashboard__tech-icon">🔐</span>
            <span className="dashboard__tech-name">Email Auth</span>
            <span className="dashboard__tech-status">✅ Working</span>
          </div>
        </div>
      </div>

      <div className="dashboard__acceptance-criteria">
        <h2>Stage 1 - Acceptance Criteria</h2>
        <div className="dashboard__criteria-list">
          <div className="dashboard__criteria-item dashboard__criteria-item--completed">
            <span className="dashboard__criteria-icon">✅</span>
            <span>Sign in via email link</span>
          </div>
          <div className="dashboard__criteria-item dashboard__criteria-item--completed">
            <span className="dashboard__criteria-icon">✅</span>
            <span>See UID on dashboard</span>
          </div>
          <div className="dashboard__criteria-item dashboard__criteria-item--completed">
            <span className="dashboard__criteria-icon">✅</span>
            <span>Responsive layout works</span>
          </div>
          <div className="dashboard__criteria-item dashboard__criteria-item--completed">
            <span className="dashboard__criteria-icon">✅</span>
            <span>Firebase properly configured</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
