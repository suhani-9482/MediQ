import { useState, useEffect } from 'react'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import './Layout.css'

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      // Auto-close sidebar on mobile when screen size changes
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false)
      } else {
        // On desktop, sidebar is open by default
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    checkMobile()

    // Listen for window resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="layout">
      <Header 
        onMenuToggle={toggleSidebar} 
        isMenuOpen={isSidebarOpen}
      />
      
      <div className="layout__container">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
        />
        
        <main className={`layout__main ${isSidebarOpen && !isMobile ? 'layout__main--with-sidebar' : ''}`}>
          <div className="layout__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
