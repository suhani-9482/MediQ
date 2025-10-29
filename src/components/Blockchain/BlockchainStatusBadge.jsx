import { getEtherscanUrl, formatAddress } from '@services/blockchain.js'
import './BlockchainStatusBadge.css'

const BlockchainStatusBadge = ({ file, showDetails = true, onVerify }) => {
  const status = file.blockchain_status || 'none'
  const txHash = file.blockchain_tx_hash
  const blockNumber = file.blockchain_block_number
  const hash = file.blockchain_hash
  
  const getStatusConfig = () => {
    switch (status) {
      case 'anchored':
        return {
          icon: '✅',
          label: 'Anchored',
          className: 'blockchain-status--anchored'
        }
      case 'pending':
        return {
          icon: '⏳',
          label: 'Anchoring...',
          className: 'blockchain-status--pending'
        }
      case 'failed':
        return {
          icon: '❌',
          label: 'Anchoring failed',
          className: 'blockchain-status--failed'
        }
      default:
        return {
          icon: '⛓️',
          label: 'Not anchored',
          className: 'blockchain-status--none'
        }
    }
  }
  
  const config = getStatusConfig()
  
  const handleViewEtherscan = () => {
    if (txHash) {
      window.open(getEtherscanUrl(txHash), '_blank', 'noopener,noreferrer')
    }
  }
  
  const handleCopyHash = () => {
    if (hash) {
      navigator.clipboard.writeText(hash)
        .then(() => {
          console.log('✅ Hash copied to clipboard')
        })
        .catch(err => {
          console.error('❌ Failed to copy:', err)
        })
    }
  }
  
  const handleCopyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash)
        .then(() => {
          console.log('✅ Transaction hash copied to clipboard')
        })
        .catch(err => {
          console.error('❌ Failed to copy:', err)
        })
    }
  }
  
  return (
    <div className={`blockchain-status-badge ${config.className}`}>
      <div className="blockchain-status-main">
        <span className="blockchain-status-icon">{config.icon}</span>
        <span className="blockchain-status-label">Blockchain: {config.label}</span>
      </div>
      
      {showDetails && status === 'anchored' && txHash && (
        <>
          <div className="blockchain-tx-display">
            <span className="blockchain-tx-label">TX:</span>
            <code 
              className="blockchain-tx-value" 
              title={`${txHash}\n\nClick to copy`}
              onClick={handleCopyTxHash}
              style={{ cursor: 'pointer' }}
            >
              {formatAddress(txHash)}
            </code>
            <button 
              onClick={handleViewEtherscan}
              className="blockchain-etherscan-btn"
              title="View on Etherscan"
            >
              🔗
            </button>
          </div>
          
          {blockNumber && (
            <div className="blockchain-block-display">
              <span className="blockchain-block-label">Block:</span>
              <span className="blockchain-block-value">#{blockNumber.toLocaleString()}</span>
            </div>
          )}
          
          {file.blockchain_gas_used && (
            <div className="blockchain-gas-display">
              <span className="blockchain-gas-label">Gas:</span>
              <span className="blockchain-gas-value">{file.blockchain_gas_used} gwei</span>
            </div>
          )}
          
          {onVerify && (
            <button 
              onClick={() => onVerify(file)}
              className="blockchain-verify-btn"
            >
              🔍 Verify on Chain
            </button>
          )}
        </>
      )}
      
      {showDetails && hash && status === 'anchored' && (
        <div className="blockchain-hash-display">
          <span className="blockchain-hash-label">Hash:</span>
          <code 
            className="blockchain-hash-value" 
            title={`${hash}\n\nClick to copy`}
            onClick={handleCopyHash}
            style={{ cursor: 'pointer' }}
          >
            {formatAddress(hash)}
          </code>
        </div>
      )}
      
      {status === 'failed' && file.blockchain_error && (
        <div className="blockchain-error-msg" title={file.blockchain_error}>
          {file.blockchain_error.length > 50 
            ? `${file.blockchain_error.substring(0, 50)}...` 
            : file.blockchain_error
          }
        </div>
      )}
      
      {status === 'anchored' && file.blockchain_timestamp && (
        <div className="blockchain-anchor-date">
          Anchored {new Date(file.blockchain_timestamp).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

export default BlockchainStatusBadge

