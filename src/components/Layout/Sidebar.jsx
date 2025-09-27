import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      description: 'Overview & Statistics'
    },
    {
      id: 'records',
      label: 'Medical Records',
      icon: '📋',
      path: '/records',
      description: 'Upload & Manage Documents',
      submenu: [
        { label: 'All Records', path: '/records', icon: '📄' },
        { label: 'Lab Reports', path: '/records/lab-reports', icon: '🔬' },
        { label: 'Prescriptions', path: '/records/prescriptions', icon: '💊' },
        { label: 'Scans & Images', path: '/records/scans', icon: '🏥' }
      ]
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: '⏰',
      path: '/reminders',
      description: 'Medication & Appointment Alerts'
    },
    {
      id: 'emergency',
      label: 'Emergency SOS',
      icon: '🚨',
      path: '/emergency',
      description: 'Quick Access & Sharing'
    },
    {
      id: 'blockchain',
      label: 'Blockchain',
      icon: '⛓️',
      path: '/blockchain',
      description: 'Document Anchoring & Verification'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/settings',
      description: 'Preferences & Privacy'
    }
  ]

  const handleSubmenuToggle = (itemId) => {
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId)
  }

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth <= 768) {
      onClose()
    }
  }

  const isActivePath = (path) => {
    if (path === '/dashboard' && location.pathname === '/') return true
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar__overlay"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar__nav">
          <div className="sidebar__header">
            <h2>Navigation</h2>
            <button
              onClick={onClose}
              className="sidebar__close"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <ul className="sidebar__menu">
            {menuItems.map((item) => (
              <li key={item.id} className="sidebar__menu-item">
                <div className="sidebar__menu-link-container">
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`sidebar__menu-link ${
                      isActivePath(item.path) ? 'sidebar__menu-link--active' : ''
                    }`}
                  >
                    <span className="sidebar__menu-icon">{item.icon}</span>
                    <div className="sidebar__menu-content">
                      <span className="sidebar__menu-label">{item.label}</span>
                      <span className="sidebar__menu-description">{item.description}</span>
                    </div>
                  </Link>

                  {item.submenu && (
                    <button
                      onClick={() => handleSubmenuToggle(item.id)}
                      className={`sidebar__submenu-toggle ${
                        activeSubmenu === item.id ? 'sidebar__submenu-toggle--active' : ''
                      }`}
                      aria-label={`Toggle ${item.label} submenu`}
                    >
                      ▼
                    </button>
                  )}
                </div>

                {item.submenu && activeSubmenu === item.id && (
                  <ul className="sidebar__submenu">
                    {item.submenu.map((subItem, index) => (
                      <li key={index} className="sidebar__submenu-item">
                        <Link
                          to={subItem.path}
                          onClick={handleLinkClick}
                          className={`sidebar__submenu-link ${
                            isActivePath(subItem.path) ? 'sidebar__submenu-link--active' : ''
                          }`}
                        >
                          <span className="sidebar__submenu-icon">{subItem.icon}</span>
                          <span className="sidebar__submenu-label">{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="sidebar__footer">
            <div className="sidebar__footer-item">
              <span className="sidebar__footer-icon">🔒</span>
              <div className="sidebar__footer-content">
                <div className="sidebar__footer-label">Secure & Private</div>
                <div className="sidebar__footer-description">HIPAA Compliant</div>
              </div>
            </div>
            
            <div className="sidebar__footer-item">
              <span className="sidebar__footer-icon">⛓️</span>
              <div className="sidebar__footer-content">
                <div className="sidebar__footer-label">Blockchain Verified</div>
                <div className="sidebar__footer-description">Immutable Records</div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
