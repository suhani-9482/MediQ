import { useState, useRef } from 'react'
import { extractPrescriptionData, suggestReminderSettings } from '../../../services/prescriptionOCR.js'
import LoadingSpinner from '../../Layout/LoadingSpinner.jsx'
import './PrescriptionImportModal.css'

const PrescriptionImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ stage: '', progress: 0 })
  const [extractedData, setExtractedData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Accept both images and PDFs
    const isImage = selectedFile.type.startsWith('image/')
    const isPDF = selectedFile.type === 'application/pdf'
    
    if (!isImage && !isPDF) {
      alert('Please select an image or PDF file')
      return
    }

    setFile(selectedFile)
    
    // Create preview (only for images)
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      // For PDFs, show a generic PDF icon/placeholder
      setPreview('PDF')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    
    if (droppedFile) {
      const isImage = droppedFile.type.startsWith('image/')
      const isPDF = droppedFile.type === 'application/pdf'
      
      if (isImage || isPDF) {
        setFile(droppedFile)
        
        if (isImage) {
          const reader = new FileReader()
          reader.onload = (e) => setPreview(e.target.result)
          reader.readAsDataURL(droppedFile)
        } else {
          setPreview('PDF')
        }
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleProcessPrescription = async () => {
    if (!file) return

    setProcessing(true)
    setProgress({ stage: 'Starting...', progress: 0 })

    try {
      const result = await extractPrescriptionData(file, (progressUpdate) => {
        const stageText = {
          preprocessing: 'Enhancing image...',
          extracting: 'Extracting text...',
          analyzing: 'Analyzing prescription...',
          complete: 'Complete!'
        }
        
        setProgress({
          stage: stageText[progressUpdate.stage] || progressUpdate.stage,
          progress: progressUpdate.progress
        })
      })

      if (result.success) {
        setExtractedData(result.data)
        const reminderSuggestions = suggestReminderSettings(result.data)
        setSuggestions(reminderSuggestions)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('OCR error:', error)
      alert('Failed to process prescription. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleImportSuggestions = () => {
    onImportComplete?.(suggestions)
    handleClose()
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setExtractedData(null)
    setSuggestions([])
    setProcessing(false)
    setProgress({ stage: '', progress: 0 })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="prescription-import-modal__overlay" onClick={handleClose}>
      <div className="prescription-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prescription-import-modal__header">
          <h2>Import Prescription</h2>
          <button
            onClick={handleClose}
            className="prescription-import-modal__close"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="prescription-import-modal__content">
          {!extractedData ? (
            <>
              {/* Upload Section */}
              {!file ? (
                <div
                  className="prescription-import-modal__upload"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="prescription-import-modal__upload-icon">📋</div>
                  <h3>Upload Prescription Image</h3>
                  <p>Drag and drop or click to select</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className="prescription-import-modal__preview-section">
                  {preview && (
                    <div className="prescription-import-modal__preview">
                      {preview === 'PDF' ? (
                        <div className="prescription-import-modal__pdf-preview">
                          <div className="prescription-import-modal__pdf-icon">📄</div>
                          <p>{file?.name}</p>
                          <span className="prescription-import-modal__file-type">PDF Document</span>
                        </div>
                      ) : (
                        <img src={preview} alt="Prescription preview" />
                      )}
                    </div>
                  )}
                  
                  <div className="prescription-import-modal__actions">
                    <button
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                      className="prescription-import-modal__btn prescription-import-modal__btn--secondary"
                    >
                      Choose Different File
                    </button>
                    <button
                      onClick={handleProcessPrescription}
                      disabled={processing}
                      className="prescription-import-modal__btn prescription-import-modal__btn--primary"
                    >
                      {processing ? 'Processing...' : 'Process Prescription'}
                    </button>
                  </div>

                  {processing && (
                    <div className="prescription-import-modal__progress">
                      <div className="prescription-import-modal__progress-bar">
                        <div
                          className="prescription-import-modal__progress-fill"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      <p className="prescription-import-modal__progress-text">
                        {progress.stage} ({Math.round(progress.progress)}%)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Results Section */}
              <div className="prescription-import-modal__results">
                <h3>Extracted Information</h3>
                
                <div className="prescription-import-modal__extracted">
                  {extractedData.doctorName && (
                    <div className="prescription-import-modal__field">
                      <strong>Doctor:</strong> {extractedData.doctorName}
                    </div>
                  )}
                  
                  {extractedData.date && (
                    <div className="prescription-import-modal__field">
                      <strong>Date:</strong> {extractedData.date}
                    </div>
                  )}

                  {extractedData.medications && extractedData.medications.length > 0 && (
                    <div className="prescription-import-modal__field">
                      <strong>Medications Found:</strong>
                      <ul className="prescription-import-modal__list">
                        {extractedData.medications.map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.instructions && extractedData.instructions.length > 0 && (
                    <div className="prescription-import-modal__field">
                      <strong>Instructions:</strong>
                      <ul className="prescription-import-modal__list">
                        {extractedData.instructions.map((inst, idx) => (
                          <li key={idx}>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <>
                    <h3>Suggested Reminders</h3>
                    <div className="prescription-import-modal__suggestions">
                      {suggestions.map((suggestion, idx) => (
                        <div key={idx} className="prescription-import-modal__suggestion">
                          <div className="prescription-import-modal__suggestion-title">
                            💊 {suggestion.medication_name}
                          </div>
                          <div className="prescription-import-modal__suggestion-details">
                            <span>Dosage: {suggestion.dosage || 'As prescribed'}</span>
                            <span>Frequency: {suggestion.frequency}</span>
                            <span>Times: {suggestion.suggested_times.join(', ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="prescription-import-modal__import-actions">
                      <button
                        onClick={handleClose}
                        className="prescription-import-modal__btn prescription-import-modal__btn--secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleImportSuggestions}
                        className="prescription-import-modal__btn prescription-import-modal__btn--primary"
                      >
                        Import {suggestions.length} Reminder{suggestions.length !== 1 ? 's' : ''}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrescriptionImportModal

