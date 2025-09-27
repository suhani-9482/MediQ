import { useState } from 'react'
import { useAuth } from '@hooks/useAuth.js'
import { signOutUser } from '@services/auth.js'
import './Header.css'

const Header = ({ onMenuToggle, isMenuOpen }) => {
  const { user } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOutUser()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
      setIsUserMenuOpen(false)
    }
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const closeUserMenu = () => {
    setIsUserMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header__container">
        {/* Left side - Menu button and logo */}
        <div className="header__left">
          <button
            onClick={onMenuToggle}
            className="header__menu-button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`header__menu-icon ${isMenuOpen ? 'header__menu-icon--open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          
          <div className="header__logo">
            <h1>
              <span className="header__logo-icon">🏥</span>
              MediQ
            </h1>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="header__right">
          {user && (
            <div className="header__user">
              <div className="header__user-info">
                <span className="header__user-email">{user.email}</span>
                <span className="header__user-status">
                  {user.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
                </span>
              </div>
              
              <div className="header__user-menu">
                <button
                  onClick={toggleUserMenu}
                  className="header__user-button"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="header__avatar">
                    {user.displayName 
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()
                    }
                  </div>
                  <span className="header__dropdown-icon">▼</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="header__user-menu-overlay"
                      onClick={closeUserMenu}
                    ></div>
                    <div className="header__user-menu-dropdown">
                      <div className="header__user-menu-header">
                        <div className="header__user-menu-email">{user.email}</div>
                        <div className="header__user-menu-uid">ID: {user.uid.substring(0, 8)}...</div>
                      </div>
                      
                      <div className="header__user-menu-divider"></div>
                      
                      <button
                        onClick={() => {
                          closeUserMenu()
                          // TODO: Navigate to profile page
                          console.log('Navigate to profile')
                        }}
                        className="header__user-menu-item"
                      >
                        <span className="header__user-menu-icon">👤</span>
                        Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          closeUserMenu()
                          // TODO: Navigate to settings page
                          console.log('Navigate to settings')
                        }}
                        className="header__user-menu-item"
                      >
                        <span className="header__user-menu-icon">⚙️</span>
                        Settings
                      </button>
                      
                      <div className="header__user-menu-divider"></div>
                      
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="header__user-menu-item header__user-menu-item--danger"
                      >
                        <span className="header__user-menu-icon">🚪</span>
                        {isSigningOut ? 'Signing out...' : 'Sign Out'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
