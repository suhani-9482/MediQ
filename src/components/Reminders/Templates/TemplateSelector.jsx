import { useState, useEffect } from 'react'
import { getReminderTemplates, incrementTemplateUsage } from '../../../services/userPreferences.js'
import './TemplateSelector.css'

const TemplateSelector = ({ isOpen, onClose, onSelectTemplate, category = null }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, category])

  const loadTemplates = async () => {
    setLoading(true)
    const result = await getReminderTemplates(category)
    
    if (result.success) {
      setTemplates(result.data)
    }
    
    setLoading(false)
  }

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template)
    
    // Increment usage count
    await incrementTemplateUsage(template.id)
    
    // Parse template data for form
    const templateData = {
      frequency: template.frequency,
      frequency_details: template.frequency_details,
      instructions: template.instructions,
      reminder_template: template.name
    }
    
    onSelectTemplate?.(templateData)
    handleClose()
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    onClose()
  }

  if (!isOpen) return null

  const getCategoryIcon = (cat) => {
    const icons = {
      medication: '💊',
      appointment: '🏥',
      general: '⏰'
    }
    return icons[cat] || '📋'
  }

  const getFrequencyDisplay = (template) => {
    if (template.frequency === 'daily') {
      const times = template.frequency_details?.times?.length || 1
      return `${times}x daily`
    }
    
    if (template.frequency === 'weekly') {
      const days = template.frequency_details?.days?.length || 1
      return `${days}x weekly`
    }
    
    return template.frequency
  }

  return (
    <div className="template-selector__overlay" onClick={handleClose}>
      <div className="template-selector" onClick={(e) => e.stopPropagation()}>
        <div className="template-selector__header">
          <h2>Choose a Template</h2>
          <button
            onClick={handleClose}
            className="template-selector__close"
            aria-label="Close template selector"
          >
            ✕
          </button>
        </div>

        <div className="template-selector__content">
          {loading ? (
            <div className="template-selector__loading">
              <div className="template-selector__spinner" />
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="template-selector__empty">
              <span className="template-selector__empty-icon">📋</span>
              <p>No templates available</p>
            </div>
          ) : (
            <div className="template-selector__grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => handleSelectTemplate(template)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${template.name} template`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectTemplate(template)
                    }
                  }}
                >
                  <div className="template-card__icon">
                    {getCategoryIcon(template.category)}
                  </div>
                  
                  <div className="template-card__content">
                    <h3 className="template-card__title">{template.name}</h3>
                    <p className="template-card__description">{template.description}</p>
                    
                    <div className="template-card__meta">
                      <span className="template-card__frequency">
                        {getFrequencyDisplay(template)}
                      </span>
                      {template.usage_count > 0 && (
                        <span className="template-card__usage">
                          Used {template.usage_count}x
                        </span>
                      )}
                    </div>

                    {template.default_time && (
                      <div className="template-card__time">
                        ⏰ Default: {template.default_time}
                      </div>
                    )}

                    {template.instructions && (
                      <div className="template-card__instructions">
                        💡 {template.instructions}
                      </div>
                    )}
                  </div>

                  <div className="template-card__arrow">→</div>
                </div>
              ))}
            </div>
          )}

          <div className="template-selector__footer">
            <button
              onClick={handleClose}
              className="template-selector__cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateSelector

