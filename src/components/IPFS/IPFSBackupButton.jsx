import { useState } from 'react'
import { uploadToIPFS, isIPFSReady } from '@services/ipfs.js'
import { updateIPFSStatus } from '@services/metadata.js'
import { downloadFile } from '@services/storage.js'
import './IPFSBackupButton.css'

const IPFSBackupButton = ({ file, onBackupComplete, onBackupError }) => {
  const [backingUp, setBackingUp] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const handleBackup = async () => {
    try {
      setBackingUp(true)
      setProgress(0)
      
      // Check if IPFS is configured
      const ready = await isIPFSReady()
      if (!ready) {
        throw new Error('IPFS is not configured. Please check Web3.Storage setup.')
      }
      
      // Update status to pending
      await updateIPFSStatus(file.file_path, 'pending')
      setProgress(10)
      
      // Download file from Supabase Storage
      console.log('📥 Downloading file from storage...')
      const downloadResult = await downloadFile(file.file_path)
      
      if (!downloadResult.success) {
        throw new Error('Failed to download file from storage')
      }
      
      setProgress(25)
      
      // Convert blob to File object
      const fileObj = new File([downloadResult.data], file.file_name, {
        type: file.file_type
      })
      
      // Update status to backing_up
      await updateIPFSStatus(file.file_path, 'backing_up')
      setProgress(30)
      
      // Upload to IPFS
      console.log('☁️ Uploading to IPFS...')
      const ipfsResult = await uploadToIPFS(fileObj, (ipfsProgress) => {
        // Map IPFS progress from 30-90%
        setProgress(30 + (ipfsProgress * 0.6))
      })
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.error)
      }
      
      // Update status to completed
      setProgress(95)
      await updateIPFSStatus(file.file_path, 'completed', {
        cid: ipfsResult.cid,
        url: ipfsResult.url
      })
      
      setProgress(100)
      
      // Notify parent component
      onBackupComplete?.({
        ...file,
        ipfs_cid: ipfsResult.cid,
        ipfs_file_url: ipfsResult.url,
        ipfs_backup_status: 'completed',
        ipfs_backed_up_at: new Date().toISOString()
      })
      
      // Reset after delay
      setTimeout(() => {
        setBackingUp(false)
        setProgress(0)
      }, 1500)
      
    } catch (error) {
      console.error('❌ Backup error:', error)
      
      // Update status to failed
      await updateIPFSStatus(file.file_path, 'failed', {
        error: error.message
      })
      
      onBackupError?.(error.message)
      setBackingUp(false)
      setProgress(0)
    }
  }
  
  // Determine button state
  const isBackedUp = file.ipfs_backup_status === 'completed'
  const isFailed = file.ipfs_backup_status === 'failed'
  const isPending = file.ipfs_backup_status === 'pending' || file.ipfs_backup_status === 'backing_up'
  
  return (
    <div className="ipfs-backup-button">
      {!isBackedUp && !backingUp && !isPending && (
        <button
          onClick={handleBackup}
          className={`ipfs-btn ipfs-btn--backup ${isFailed ? 'ipfs-btn--retry' : ''}`}
          disabled={backingUp}
          title={isFailed ? 'Retry backup to IPFS' : 'Backup this file to IPFS'}
        >
          {isFailed ? (
            <>
              <span className="ipfs-icon">🔄</span>
              Retry Backup
            </>
          ) : (
            <>
              <span className="ipfs-icon">☁️</span>
              Backup to IPFS
            </>
          )}
        </button>
      )}
      
      {backingUp && (
        <div className="ipfs-backing-up">
          <div className="ipfs-spinner"></div>
          <span className="ipfs-backing-up-text">Backing up... {Math.round(progress)}%</span>
          <div className="ipfs-progress-bar">
            <div 
              className="ipfs-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {isBackedUp && !backingUp && (
        <div className="ipfs-backed-up">
          <span className="ipfs-icon">✅</span>
          <span>Backed up to IPFS</span>
        </div>
      )}
      
      {isPending && !backingUp && (
        <div className="ipfs-pending">
          <span className="ipfs-icon">⏳</span>
          <span>Backup pending...</span>
        </div>
      )}
    </div>
  )
}

export default IPFSBackupButton

