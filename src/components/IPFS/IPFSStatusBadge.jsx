import { formatCID, getIPFSUrls } from '@services/ipfs.js'
import './IPFSStatusBadge.css'

const IPFSStatusBadge = ({ file, showCID = true, onViewIPFS }) => {
  const status = file.ipfs_backup_status || 'none'
  const cid = file.ipfs_cid
  
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: '✅',
          label: 'Backed up',
          className: 'ipfs-status--completed'
        }
      case 'backing_up':
        return {
          icon: '⏳',
          label: 'Backing up...',
          className: 'ipfs-status--pending'
        }
      case 'pending':
        return {
          icon: '⏳',
          label: 'Pending backup',
          className: 'ipfs-status--pending'
        }
      case 'failed':
        return {
          icon: '❌',
          label: 'Backup failed',
          className: 'ipfs-status--failed'
        }
      default:
        return {
          icon: '☁️',
          label: 'Not backed up',
          className: 'ipfs-status--none'
        }
    }
  }
  
  const config = getStatusConfig()
  
  const handleViewIPFS = () => {
    if (cid && onViewIPFS) {
      onViewIPFS(file)
    } else if (cid) {
      const urls = getIPFSUrls(cid, file.file_name)
      window.open(urls.primary, '_blank', 'noopener,noreferrer')
    }
  }
  
  const handleCopyIPFS = () => {
    if (cid) {
      navigator.clipboard.writeText(cid)
        .then(() => {
          console.log('✅ CID copied to clipboard')
        })
        .catch(err => {
          console.error('❌ Failed to copy:', err)
        })
    }
  }
  
  return (
    <div className={`ipfs-status-badge ${config.className}`}>
      <div className="ipfs-status-main">
        <span className="ipfs-status-icon">{config.icon}</span>
        <span className="ipfs-status-label">{config.label}</span>
      </div>
      
      {showCID && cid && status === 'completed' && (
        <div className="ipfs-cid-display">
          <span className="ipfs-cid-label">CID:</span>
          <code 
            className="ipfs-cid-value" 
            title={`${cid}\n\nClick to copy`}
            onClick={handleCopyIPFS}
            style={{ cursor: 'pointer' }}
          >
            {formatCID(cid)}
          </code>
          <button 
            onClick={handleViewIPFS}
            className="ipfs-view-btn"
            title="View on IPFS"
          >
            🔗
          </button>
        </div>
      )}
      
      {status === 'failed' && file.ipfs_backup_error && (
        <div className="ipfs-error-msg" title={file.ipfs_backup_error}>
          {file.ipfs_backup_error.length > 50 
            ? `${file.ipfs_backup_error.substring(0, 50)}...` 
            : file.ipfs_backup_error
          }
        </div>
      )}
      
      {status === 'completed' && file.ipfs_backed_up_at && (
        <div className="ipfs-backup-date">
          Backed up {new Date(file.ipfs_backed_up_at).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

export default IPFSStatusBadge

