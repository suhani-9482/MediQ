import { useState, useEffect } from 'react'
import { useAuth } from '@hooks/useAuth.js'
import FileUpload from '../components/FileUpload/FileUpload.jsx'
import SearchBar from '../components/Search/SearchBar.jsx'
import IPFSBackupButton from '../components/IPFS/IPFSBackupButton.jsx'
import IPFSStatusBadge from '../components/IPFS/IPFSStatusBadge.jsx'
import { listUserFiles, getFileUrl, deleteFile, formatFileSize, getFileIcon } from '@services/storage.js'
import { getFileMetadata, searchFileMetadata, deleteFileMetadata, getIPFSStats, getFilesNotBackedUp } from '@services/metadata.js'
import { getIPFSUrls } from '@services/ipfs.js'
import './MedicalRecords.css'

const MedicalRecords = () => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [metadata, setMetadata] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [ipfsStats, setIpfsStats] = useState(null)
  const [showIPFSInfo, setShowIPFSInfo] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      loadFiles()
    }
  }, [user])

  const loadFiles = async () => {
    if (!user?.uid) return

    setLoading(true)
    
    // Load files, metadata, and IPFS stats
    const [filesResult, metadataResult, ipfsStatsResult] = await Promise.all([
      listUserFiles(user.uid),
      getFileMetadata(user.uid),
      getIPFSStats(user.uid)
    ])
    
    if (filesResult.success) {
      setFiles(filesResult.data)
      setError(null)
    } else {
      setError(filesResult.error)
    }

    if (metadataResult.success) {
      setMetadata(metadataResult.data)
    }
    
    if (ipfsStatsResult.success) {
      setIpfsStats(ipfsStatsResult.stats)
    }
    
    setLoading(false)
  }

  const handleSearch = async (query) => {
    if (!user?.uid) return
    
    setSearchQuery(query)
    setLoading(true)

    const result = await searchFileMetadata(user.uid, query)
    
    if (result.success) {
      setMetadata(result.data)
    }
    
    setLoading(false)
  }

  const handleUploadSuccess = (fileData) => {
    setSuccess('File uploaded successfully!')
    setShowUpload(false)
    loadFiles()
    
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleUploadError = (errorMsg) => {
    setError(errorMsg)
    setTimeout(() => setError(null), 5000)
  }

  const handleDownload = async (file) => {
    const filePath = `${user.uid}/${file.name}`
    const result = await getFileUrl(filePath, 60)
    
    if (result.success) {
      window.open(result.url, '_blank')
    } else {
      setError('Failed to download file')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDelete = async (file) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    const filePath = `${user.uid}/${file.name}`
    
    // Delete both file and metadata
    const [fileResult, metadataResult] = await Promise.all([
      deleteFile(filePath),
      deleteFileMetadata(filePath)
    ])
    
    if (fileResult.success) {
      setSuccess('File deleted successfully!')
      loadFiles()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError('Failed to delete file')
      setTimeout(() => setError(null), 3000)
    }
  }

  // Get metadata for a specific file
  const getMetadataForFile = (fileName) => {
    return metadata.find(m => m.file_name === fileName)
  }
  
  // Handle IPFS backup completion
  const handleIPFSBackupComplete = (updatedFile) => {
    setSuccess('File backed up to IPFS successfully!')
    loadFiles()
    setTimeout(() => setSuccess(null), 3000)
  }
  
  // Handle IPFS backup error
  const handleIPFSBackupError = (errorMsg) => {
    setError(`IPFS Backup failed: ${errorMsg}`)
    setTimeout(() => setError(null), 5000)
  }
  
  // Handle batch backup to IPFS
  const handleBatchBackup = async () => {
    const notBackedUpResult = await getFilesNotBackedUp(user.uid)
    
    if (!notBackedUpResult.success) {
      setError('Failed to check backup status')
      return
    }
    
    const notBackedUp = notBackedUpResult.data
    
    if (notBackedUp.length === 0) {
      setSuccess('All files are already backed up to IPFS!')
      setTimeout(() => setSuccess(null), 3000)
      return
    }
    
    setSuccess(`${notBackedUp.length} file(s) need backup. Use the backup button on each file.`)
    setTimeout(() => setSuccess(null), 5000)
  }

  return (
    <div className="medical-records">
      <div className="medical-records__header">
        <div>
          <h1>Medical Records</h1>
          <p>Upload and manage your medical documents securely</p>
          {ipfsStats && (
            <div className="medical-records__ipfs-stats">
              <span className="ipfs-stat">
                ☁️ IPFS Backups: {ipfsStats.backed_up}/{ipfsStats.total}
              </span>
              {ipfsStats.failed > 0 && (
                <span className="ipfs-stat ipfs-stat--failed">
                  ❌ {ipfsStats.failed} failed
                </span>
              )}
            </div>
          )}
        </div>
        <div className="medical-records__header-actions">
          {ipfsStats && ipfsStats.none > 0 && (
            <button
              onClick={handleBatchBackup}
              className="medical-records__ipfs-btn"
              title="Check which files need IPFS backup"
            >
              ☁️ Backup Status
            </button>
          )}
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="medical-records__upload-btn"
          >
            {showUpload ? '✕ Close' : '📤 Upload New'}
          </button>
        </div>
      </div>

      {error && (
        <div className="medical-records__alert medical-records__alert--error">
          <span className="medical-records__alert-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="medical-records__alert-close">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="medical-records__alert medical-records__alert--success">
          <span className="medical-records__alert-icon">✅</span>
          <span>{success}</span>
        </div>
      )}

      {showUpload && (
        <div className="medical-records__upload-section">
          <FileUpload
            userId={user?.uid}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {!showUpload && (
        <SearchBar onSearch={handleSearch} />
      )}

      <div className="medical-records__content">
        {loading ? (
          <div className="medical-records__loading">
            <div className="medical-records__spinner"></div>
            <p>Loading your records...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="medical-records__empty">
            <div className="medical-records__empty-icon">📋</div>
            <h3>No Records Yet</h3>
            <p>Upload your first medical document to get started</p>
            <button
              onClick={() => setShowUpload(true)}
              className="medical-records__empty-btn"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="medical-records__grid">
            {files.map((file) => {
              const fileMetadata = getMetadataForFile(file.name)
              return (
                <div key={file.id} className="medical-records__card">
                  <div className="medical-records__card-header">
                    <div className="medical-records__card-icon">
                      {getFileIcon(file.metadata?.mimetype || 'application/pdf')}
                    </div>
                    {fileMetadata?.document_type && (
                      <span className="medical-records__card-badge">
                        {fileMetadata.document_type}
                      </span>
                    )}
                  </div>
                  <div className="medical-records__card-content">
                    <h3 className="medical-records__card-name">{file.name}</h3>
                    <div className="medical-records__card-meta">
                      <span>{formatFileSize(file.metadata?.size || 0)}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {fileMetadata && (
                      <div className="medical-records__card-details">
                        {fileMetadata.dates && fileMetadata.dates.length > 0 && (
                          <div className="medical-records__card-info">
                            <span className="medical-records__card-label">📅 Dates:</span>
                            <span className="medical-records__card-value">
                              {fileMetadata.dates.slice(0, 2).map(d => d.date).join(', ')}
                              {fileMetadata.dates.length > 2 && ` +${fileMetadata.dates.length - 2}`}
                            </span>
                          </div>
                        )}
                        {fileMetadata.keywords && fileMetadata.keywords.length > 0 && (
                          <div className="medical-records__card-info">
                            <span className="medical-records__card-label">🏷️ Keywords:</span>
                            <span className="medical-records__card-value">
                              {fileMetadata.keywords.slice(0, 3).join(', ')}
                              {fileMetadata.keywords.length > 3 && ` +${fileMetadata.keywords.length - 3}`}
                            </span>
                          </div>
                        )}
                        {fileMetadata.ocr_confidence && (
                          <div className="medical-records__card-info">
                            <span className="medical-records__card-label">✨ OCR Quality:</span>
                            <span className="medical-records__card-value">
                              {fileMetadata.ocr_confidence.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* IPFS Status Badge */}
                    {fileMetadata && (
                      <div className="medical-records__card-ipfs">
                        <IPFSStatusBadge 
                          file={fileMetadata}
                          showCID={true}
                          onViewIPFS={(file) => {
                            const urls = getIPFSUrls(file.ipfs_cid, file.file_name)
                            window.open(urls.primary, '_blank', 'noopener,noreferrer')
                          }}
                        />
                      </div>
                    )}
                    
                    {/* IPFS Backup Button */}
                    {fileMetadata && fileMetadata.ipfs_backup_status !== 'completed' && (
                      <div className="medical-records__card-ipfs-action">
                        <IPFSBackupButton 
                          file={fileMetadata}
                          onBackupComplete={handleIPFSBackupComplete}
                          onBackupError={handleIPFSBackupError}
                        />
                      </div>
                    )}
                  </div>
                  <div className="medical-records__card-actions">
                    <button
                      onClick={() => handleDownload(file)}
                      className="medical-records__card-btn medical-records__card-btn--view"
                      title="View"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="medical-records__card-btn medical-records__card-btn--delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalRecords

