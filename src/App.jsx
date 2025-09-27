import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '@components/Auth/AuthGuard.jsx'
import Layout from '@components/Layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <AuthGuard>
        <Layout>
          <Routes>
            {/* Dashboard - Default route */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* Placeholder routes for future stages */}
            <Route path="/records" element={<ComingSoonPage title="Medical Records" stage="2" />} />
            <Route path="/records/*" element={<ComingSoonPage title="Medical Records" stage="2" />} />
            <Route path="/reminders" element={<ComingSoonPage title="Reminders" stage="6" />} />
            <Route path="/emergency" element={<ComingSoonPage title="Emergency SOS" stage="7" />} />
            <Route path="/blockchain" element={<ComingSoonPage title="Blockchain" stage="5" />} />
            <Route path="/settings" element={<ComingSoonPage title="Settings" stage="8" />} />
            
            {/* 404 - Not found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthGuard>
    </div>
  )
}

// Coming Soon placeholder component
const ComingSoonPage = ({ title, stage }) => {
  return (
    <div className="coming-soon">
      <div className="coming-soon__content">
        <div className="coming-soon__icon">🚧</div>
        <h1>{title}</h1>
        <p>This feature is coming in Stage {stage}</p>
        <p className="coming-soon__description">
          We're building MediQ in stages to ensure each feature is robust and secure.
          {title} will be available once we complete Stage {stage} of development.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="coming-soon__button"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

// 404 Not Found component
const NotFoundPage = () => {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <div className="not-found__icon">🔍</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="not-found__button"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default App
