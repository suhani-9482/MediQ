import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth.js'
import { useReminders } from '@hooks/useReminders.js'
import { useNotifications } from '@hooks/useNotifications.js'
import { deleteReminder } from '@services/reminders.js'
import { exportReminderListPDF } from '../services/pdfExport.js'
import ReminderList from '../components/Reminders/ReminderList.jsx'
import AddReminderModal from '../components/Reminders/AddReminderModal.jsx'
import CalendarView from '../components/Reminders/Calendar/CalendarView.jsx'
import AdherenceStats from '../components/Reminders/Statistics/AdherenceStats.jsx'
import PrescriptionImportModal from '../components/Reminders/PrescriptionImport/PrescriptionImportModal.jsx'
import TemplateSelector from '../components/Reminders/Templates/TemplateSelector.jsx'
import ReminderSettings from '../components/Reminders/Settings/ReminderSettings.jsx'
import './Reminders.css'

const Reminders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { reminders, todayReminders, adherenceStats, loading, refreshReminders } = useReminders()
  const { permission, requestPermission, supported } = useNotifications()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [filter, setFilter] = useState('all')
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('list') // list, calendar, statistics
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleAddReminder = () => {
    setEditingReminder(null)
    setShowAddModal(true)
  }

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder)
    setShowAddModal(true)
  }

  const handleDeleteReminder = async (reminderId) => {
    const result = await deleteReminder(reminderId)
    
    if (result.success) {
      setSuccess('Reminder deleted successfully!')
      refreshReminders()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError('Failed to delete reminder')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleModalSuccess = () => {
    setSuccess(editingReminder ? 'Reminder updated successfully!' : 'Reminder added successfully!')
    refreshReminders()
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleEnableNotifications = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      setSuccess('Notifications enabled!')
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handlePrescriptionImport = (suggestions) => {
    // Auto-fill form with first suggestion and open modal
    if (suggestions.length > 0) {
      setEditingReminder(suggestions[0])
      setShowAddModal(true)
      setSuccess(`Imported ${suggestions.length} medication${suggestions.length > 1 ? 's' : ''} from prescription!`)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleTemplateSelect = (templateData) => {
    // Pre-fill modal with template data
    setEditingReminder(templateData)
    setShowAddModal(true)
  }

  const handleExportPDF = () => {
    exportReminderListPDF(filteredReminders, user?.email || user?.id)
    setSuccess('PDF exported successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  // Filter reminders
  const filteredReminders = filter === 'all' 
    ? reminders 
    : reminders.filter(r => r.reminder_type === filter)

  return (
    <div className="reminders-page">
      <div className="reminders-page__header">
        <div>
          <h1>Reminders</h1>
          <p>Manage your medication and appointment reminders</p>
        </div>
        <div className="reminders-page__header-actions">
          <button
            onClick={() => setShowSettings(true)}
            className="reminders-page__action-btn reminders-page__action-btn--secondary"
            aria-label="Open settings"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleAddReminder}
            className="reminders-page__add-btn"
          >
            ➕ Add Reminder
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="reminders-page__quick-actions">
        <button
          onClick={() => setShowPrescriptionModal(true)}
          className="reminders-page__quick-action"
          aria-label="Import prescription"
        >
          <span className="reminders-page__quick-action-icon">📋</span>
          <span>Import Prescription</span>
        </button>
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="reminders-page__quick-action"
          aria-label="Use template"
        >
          <span className="reminders-page__quick-action-icon">📝</span>
          <span>Use Template</span>
        </button>
        <button
          onClick={handleExportPDF}
          className="reminders-page__quick-action"
          aria-label="Export PDF"
        >
          <span className="reminders-page__quick-action-icon">📄</span>
          <span>Export PDF</span>
        </button>
      </div>

      {/* Notifications banner */}
      {supported && permission !== 'granted' && (
        <div className="reminders-page__notification-banner">
          <div className="reminders-page__notification-content">
            <span className="reminders-page__notification-icon">🔔</span>
            <div>
              <strong>Enable Notifications</strong>
              <p>Get notified when it's time for your reminders</p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="reminders-page__notification-btn"
          >
            Enable
          </button>
        </div>
      )}

      {/* Success/Error messages */}
      {success && (
        <div className="reminders-page__alert reminders-page__alert--success">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="reminders-page__alert reminders-page__alert--error">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="reminders-page__stats">
        <div className="reminders-page__stat-card">
          <div className="reminders-page__stat-icon">📋</div>
          <div className="reminders-page__stat-content">
            <div className="reminders-page__stat-value">{reminders.length}</div>
            <div className="reminders-page__stat-label">Total Reminders</div>
          </div>
        </div>

        <div className="reminders-page__stat-card">
          <div className="reminders-page__stat-icon">⏰</div>
          <div className="reminders-page__stat-content">
            <div className="reminders-page__stat-value">{todayReminders.length}</div>
            <div className="reminders-page__stat-label">Today</div>
          </div>
        </div>

        <div className="reminders-page__stat-card">
          <div className="reminders-page__stat-icon">📊</div>
          <div className="reminders-page__stat-content">
            <div className="reminders-page__stat-value">
              {adherenceStats?.adherenceRate || 0}%
            </div>
            <div className="reminders-page__stat-label">Adherence (7 days)</div>
          </div>
        </div>

        <div className="reminders-page__stat-card">
          <div className="reminders-page__stat-icon">✅</div>
          <div className="reminders-page__stat-content">
            <div className="reminders-page__stat-value">
              {adherenceStats?.taken || 0}
            </div>
            <div className="reminders-page__stat-label">Taken</div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="reminders-page__view-tabs">
        <button
          onClick={() => setCurrentView('list')}
          className={`reminders-page__view-tab ${currentView === 'list' ? 'active' : ''}`}
        >
          📋 List
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`reminders-page__view-tab ${currentView === 'calendar' ? 'active' : ''}`}
        >
          📅 Calendar
        </button>
        <button
          onClick={() => setCurrentView('statistics')}
          className={`reminders-page__view-tab ${currentView === 'statistics' ? 'active' : ''}`}
        >
          📊 Statistics
        </button>
      </div>

      {/* List View */}
      {currentView === 'list' && (
        <>
          {/* Filters */}
          <div className="reminders-page__filters">
            <button
              onClick={() => setFilter('all')}
              className={`reminders-page__filter-btn ${filter === 'all' ? 'active' : ''}`}
            >
              All ({reminders.length})
            </button>
            <button
              onClick={() => setFilter('medication')}
              className={`reminders-page__filter-btn ${filter === 'medication' ? 'active' : ''}`}
            >
              💊 Medications ({reminders.filter(r => r.reminder_type === 'medication').length})
            </button>
            <button
              onClick={() => setFilter('appointment')}
              className={`reminders-page__filter-btn ${filter === 'appointment' ? 'active' : ''}`}
            >
              🏥 Appointments ({reminders.filter(r => r.reminder_type === 'appointment').length})
            </button>
            <button
              onClick={() => setFilter('lab_test')}
              className={`reminders-page__filter-btn ${filter === 'lab_test' ? 'active' : ''}`}
            >
              🔬 Lab Tests ({reminders.filter(r => r.reminder_type === 'lab_test').length})
            </button>
            <button
              onClick={() => setFilter('refill')}
              className={`reminders-page__filter-btn ${filter === 'refill' ? 'active' : ''}`}
            >
              📋 Refills ({reminders.filter(r => r.reminder_type === 'refill').length})
            </button>
          </div>

          {/* Reminder List */}
          <ReminderList
            reminders={filteredReminders}
            loading={loading}
            onUpdate={refreshReminders}
            onDelete={handleDeleteReminder}
            onEdit={handleEditReminder}
          />
        </>
      )}

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <CalendarView
          reminders={reminders}
          onDateSelect={(date) => console.log('Selected date:', date)}
          onReminderClick={handleEditReminder}
        />
      )}

      {/* Statistics View */}
      {currentView === 'statistics' && (
        <AdherenceStats
          logs={adherenceStats?.logs || []}
          userName={user?.email || user?.id}
          days={30}
        />
      )}

      {/* Add/Edit Modal */}
      <AddReminderModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingReminder(null)
        }}
        onSuccess={handleModalSuccess}
        editReminder={editingReminder}
        userId={user?.uid}
      />

      {/* Prescription Import Modal */}
      <PrescriptionImportModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        onImportComplete={handlePrescriptionImport}
      />

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Settings Modal */}
      <ReminderSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}

export default Reminders

