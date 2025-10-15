import { useAuth } from '@hooks/useAuth.js'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>Welcome Back</h1>
        <p>Manage your medical records securely</p>
      </div>

      <div className="dashboard__stats-grid">
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-icon">📋</div>
          <div className="dashboard__stat-content">
            <h3>Total Records</h3>
            <p className="dashboard__stat-value">0</p>
          </div>
        </div>

        <div className="dashboard__stat-card">
          <div className="dashboard__stat-icon">📅</div>
          <div className="dashboard__stat-content">
            <h3>Upcoming Reminders</h3>
            <p className="dashboard__stat-value">0</p>
          </div>
        </div>

        <div className="dashboard__stat-card">
          <div className="dashboard__stat-icon">⛓️</div>
          <div className="dashboard__stat-content">
            <h3>Blockchain Verified</h3>
            <p className="dashboard__stat-value">0</p>
          </div>
        </div>

        <div className="dashboard__stat-card">
          <div className="dashboard__stat-icon">🔒</div>
          <div className="dashboard__stat-content">
            <h3>Security Status</h3>
            <p className="dashboard__stat-value">Active</p>
          </div>
        </div>
      </div>

      <div className="dashboard__content-grid">
        <div className="dashboard__quick-actions">
          <h2>Quick Actions</h2>
          <div className="dashboard__action-list">
            <button className="dashboard__action-btn">
              <span className="dashboard__action-icon">📤</span>
              <span>Upload Record</span>
            </button>
            <button className="dashboard__action-btn">
              <span className="dashboard__action-icon">⏰</span>
              <span>Set Reminder</span>
            </button>
            <button className="dashboard__action-btn">
              <span className="dashboard__action-icon">🚨</span>
              <span>Emergency SOS</span>
            </button>
            <button className="dashboard__action-btn">
              <span className="dashboard__action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="dashboard__user-profile">
          <h2>Account Information</h2>
          <div className="dashboard__profile-card">
            <div className="dashboard__profile-avatar">
              {user?.displayName 
                ? user.displayName.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || '?'
              }
            </div>
            <div className="dashboard__profile-details">
              <div className="dashboard__profile-field">
                <span className="dashboard__profile-label">Email</span>
                <span className="dashboard__profile-value">{user?.email}</span>
              </div>
              <div className="dashboard__profile-field">
                <span className="dashboard__profile-label">User ID</span>
                <span className="dashboard__profile-value dashboard__profile-uid">
                  {user?.uid?.substring(0, 18)}...
                </span>
              </div>
              <div className="dashboard__profile-field">
                <span className="dashboard__profile-label">Status</span>
                <span className={`dashboard__profile-badge ${user?.emailVerified ? 'dashboard__profile-badge--verified' : ''}`}>
                  {user?.emailVerified ? '✅ Verified' : '⚠️ Pending'}
                </span>
              </div>
              <div className="dashboard__profile-field">
                <span className="dashboard__profile-label">Member Since</span>
                <span className="dashboard__profile-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__features">
        <h2>Available Features</h2>
        <div className="dashboard__features-grid">
          <div className="dashboard__feature-card">
            <div className="dashboard__feature-icon">📋</div>
            <h3>Medical Records</h3>
            <p>Upload and manage your medical documents securely</p>
          </div>
          
          <div className="dashboard__feature-card">
            <div className="dashboard__feature-icon">⏰</div>
            <h3>Smart Reminders</h3>
            <p>Medication and appointment notifications</p>
          </div>
          
          <div className="dashboard__feature-card">
            <div className="dashboard__feature-icon">🚨</div>
            <h3>Emergency SOS</h3>
            <p>Quick access sharing for emergency situations</p>
          </div>
          
          <div className="dashboard__feature-card">
            <div className="dashboard__feature-icon">⛓️</div>
            <h3>Blockchain</h3>
            <p>Immutable verification and security</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
