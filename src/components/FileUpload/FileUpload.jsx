import { useState, useRef } from 'react'
import { uploadFile, validateFile, formatFileSize, getFileIcon } from '@services/storage.js'
import { processDocument, canProcessFile } from '@services/documentProcessor.js'
import { saveFileMetadata } from '@services/metadata.js'
import './FileUpload.css'

const FileUpload = ({ userId, onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [completedStages, setCompletedStages] = useState([])
  const [currentStage, setCurrentStage] = useState('')
  const fileInputRef = useRef(null)

  // OCR Processing stages
  const stages = [
    { id: 'upload', label: 'Upload', icon: '📤', description: 'Uploading file' },
    { id: 'preprocessing', label: 'Enhance', icon: '🎨', description: 'Enhancing image quality' },
    { id: 'extracting', label: 'Extract', icon: '🔍', description: 'Extracting text with OCR' },
    { id: 'analyzing', label: 'Analyze', icon: '🧠', description: 'Analyzing content' },
    { id: 'saving', label: 'Save', icon: '💾', description: 'Saving metadata' }
  ]

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      onUploadError?.(validation.error)
      return
    }
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !userId) return

    setUploading(true)
    setUploadProgress(0)
    setProcessingStatus('Uploading file...')
    setCompletedStages([])
    setCurrentStage('upload')

    try {
      // Step 1: Upload file to storage
      setUploadProgress(10)
      const uploadResult = await uploadFile(selectedFile, userId)
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      setUploadProgress(30)
      setCompletedStages(['upload'])
      setCurrentStage('preprocessing')

      // Step 2: Process document (OCR/PDF extraction)
      let processedData = null
      if (canProcessFile(selectedFile.type)) {
        setProcessingStatus('Extracting text...')
        
        const processingResult = await processDocument(selectedFile, ({ stage, progress }) => {
          if (stage === 'preprocessing') {
            setCurrentStage('preprocessing')
            setUploadProgress(30 + (progress * 0.15))
            setProcessingStatus('Enhancing image quality...')
            
            // Mark preprocessing as complete when done
            if (progress >= 95) {
              setCompletedStages(prev => [...new Set([...prev, 'preprocessing'])])
              setCurrentStage('extracting')
            }
          } else if (stage === 'extracting') {
            setCurrentStage('extracting')
            setUploadProgress(45 + (progress * 0.35))
            setProcessingStatus(`Extracting text... ${Math.round(progress)}%`)
            
            // Mark extracting as complete when done
            if (progress >= 95) {
              setCompletedStages(prev => [...new Set([...prev, 'extracting'])])
              setCurrentStage('analyzing')
            }
          } else if (stage === 'analyzing') {
            setCurrentStage('analyzing')
            setUploadProgress(80)
            setProcessingStatus('Analyzing content...')
          }
        })

        if (processingResult.success) {
          processedData = processingResult
          setUploadProgress(80)
          setCompletedStages(prev => [...new Set([...prev, 'analyzing'])])
        }
      } else {
        setUploadProgress(70)
      }

      // Step 3: Save metadata to database
      setCurrentStage('saving')
      setProcessingStatus('Saving metadata...')
      setUploadProgress(90)

      const metadata = {
        userId,
        filePath: uploadResult.data.path,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        extractedText: processedData?.extractedText || null,
        documentType: processedData?.metadata?.documentType || 'Unknown',
        dates: processedData?.metadata?.dates || [],
        keywords: processedData?.metadata?.keywords || [],
        ocrConfidence: processedData?.metadata?.ocrConfidence || null,
        pageCount: processedData?.metadata?.pageCount || null
      }

      await saveFileMetadata(metadata)

      setUploadProgress(100)
      setCompletedStages(prev => [...new Set([...prev, 'saving'])])
      setCurrentStage('complete')
      setProcessingStatus('Complete!')

      // Success
      onUploadSuccess?.({
        ...uploadResult.data,
        metadata: processedData?.metadata
      })

      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
        setUploading(false)
        setProcessingStatus('')
        setCompletedStages([])
        setCurrentStage('')
      }, 1500)

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error.message)
      setUploading(false)
      setUploadProgress(0)
      setProcessingStatus('')
      setCompletedStages([])
      setCurrentStage('')
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setUploading(false)
    setCompletedStages([])
    setCurrentStage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        className="file-upload__input"
        disabled={uploading}
      />

      {!selectedFile ? (
        <div
          className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="file-upload__icon">📤</div>
          <h3>Drag & Drop File Here</h3>
          <p>or click to browse</p>
          <div className="file-upload__hint">
            Supported: PDF, JPG, PNG, GIF, WEBP (Max 50MB)
          </div>
        </div>
      ) : (
        <div className="file-upload__preview">
          <div className="file-upload__preview-header">
            <div className="file-upload__preview-icon">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="file-upload__preview-info">
              <div className="file-upload__preview-name">{selectedFile.name}</div>
              <div className="file-upload__preview-size">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>

          {uploading && (
            <>
              {/* Animated Stage Indicators */}
              <div className="file-upload__stages">
                {stages.map((stage, index) => {
                  const isComplete = completedStages.includes(stage.id)
                  const isActive = currentStage === stage.id
                  
                  return (
                    <div key={stage.id} className="file-upload__stage-wrapper">
                      <div 
                        className={`file-upload__stage ${
                          isComplete ? 'file-upload__stage--complete' : ''
                        } ${
                          isActive ? 'file-upload__stage--active' : ''
                        }`}
                      >
                        <div className="file-upload__stage-icon">
                          {isComplete ? '✅' : stage.icon}
                        </div>
                        <div className="file-upload__stage-label">
                          {stage.label}
                        </div>
                        {isActive && (
                          <div className="file-upload__stage-description">
                            {stage.description}
                          </div>
                        )}
                      </div>
                      {index < stages.length - 1 && (
                        <div className={`file-upload__stage-connector ${
                          isComplete ? 'file-upload__stage-connector--complete' : ''
                        }`}></div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Progress Bar */}
              <div className="file-upload__progress">
                <div className="file-upload__progress-bar">
                  <div
                    className="file-upload__progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="file-upload__progress-text">
                  {processingStatus || `${uploadProgress}%`}
                </div>
              </div>
            </>
          )}

          <div className="file-upload__actions">
            {!uploading ? (
              <>
                <button
                  onClick={handleUpload}
                  className="file-upload__button file-upload__button--upload"
                  disabled={uploading}
                >
                  Upload File
                </button>
                <button
                  onClick={handleCancel}
                  className="file-upload__button file-upload__button--cancel"
                  disabled={uploading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="file-upload__button file-upload__button--uploading"
                disabled
              >
                <span className="file-upload__spinner"></span>
                Uploading...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload

