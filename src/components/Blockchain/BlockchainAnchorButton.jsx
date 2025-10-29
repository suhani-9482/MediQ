import { useState } from 'react'
import { 
  generateDocumentHash,
  anchorToBlockchain,
  isWalletConnected,
  connectWallet,
  switchToSepolia,
  getCurrentNetwork,
  getContractAddress
} from '@services/blockchain.js'
import { updateBlockchainStatus } from '@services/metadata.js'
import { downloadFile } from '@services/storage.js'
import './BlockchainAnchorButton.css'

const BlockchainAnchorButton = ({ file, onAnchorComplete, onAnchorError }) => {
  const [anchoring, setAnchoring] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  
  const handleAnchor = async () => {
    try {
      setAnchoring(true)
      setProgress(0)
      setStatus('Checking wallet connection...')
      
      // Check if wallet is connected
      const connected = await isWalletConnected()
      if (!connected) {
        setStatus('Connecting wallet...')
        const connectResult = await connectWallet()
        if (!connectResult.success) {
          throw new Error(connectResult.error)
        }
      }
      
      setProgress(10)
      
      // Check network
      setStatus('Checking network...')
      const network = await getCurrentNetwork()
      if (network.chainId !== '11155111') {
        setStatus('Switching to Sepolia...')
        const switchResult = await switchToSepolia()
        if (!switchResult.success) {
          throw new Error('Please switch to Sepolia testnet manually')
        }
      }
      
      setProgress(20)
      
      // Check if contract is deployed
      const contractAddress = getContractAddress()
      if (!contractAddress) {
        throw new Error('Smart contract not deployed. Please deploy the contract first.')
      }
      
      // Update status to pending
      await updateBlockchainStatus(file.file_path, 'pending')
      setProgress(30)
      
      // Download file from storage
      setStatus('Downloading file...')
      console.log('📥 Downloading file from storage...')
      const downloadResult = await downloadFile(file.file_path)
      
      if (!downloadResult.success) {
        throw new Error('Failed to download file from storage')
      }
      
      setProgress(40)
      
      // Convert blob to File object
      const fileObj = new File([downloadResult.data], file.file_name, {
        type: file.file_type
      })
      
      // Generate document hash
      setStatus('Generating document hash...')
      console.log('🔐 Generating document hash...')
      const documentHash = await generateDocumentHash(fileObj)
      console.log('   Document hash:', documentHash)
      
      setProgress(50)
      
      // Get IPFS CID if available
      const ipfsCid = file.ipfs_cid || ''
      
      // Anchor to blockchain
      setStatus('Sending transaction...')
      console.log('⛓️ Anchoring to blockchain...')
      
      const anchorResult = await anchorToBlockchain(
        documentHash,
        ipfsCid,
        (progressMsg) => {
          setStatus(progressMsg)
          if (progressMsg.includes('Preparing')) setProgress(60)
          if (progressMsg.includes('Sending')) setProgress(70)
          if (progressMsg.includes('Waiting')) setProgress(85)
        }
      )
      
      if (!anchorResult.success) {
        throw new Error(anchorResult.error)
      }
      
      setProgress(95)
      
      // Update metadata with blockchain info
      setStatus('Saving blockchain data...')
      await updateBlockchainStatus(file.file_path, 'anchored', {
        hash: documentHash,
        txHash: anchorResult.txHash,
        blockNumber: anchorResult.blockNumber,
        gasUsed: anchorResult.gasUsed,
        contractAddress: contractAddress,
        anchoredBy: await (await connectWallet()).address
      })
      
      setProgress(100)
      setStatus('Successfully anchored!')
      
      // Notify parent component
      onAnchorComplete?.({
        ...file,
        blockchain_hash: documentHash,
        blockchain_tx_hash: anchorResult.txHash,
        blockchain_block_number: anchorResult.blockNumber,
        blockchain_status: 'anchored',
        blockchain_timestamp: new Date().toISOString()
      })
      
      // Reset after delay
      setTimeout(() => {
        setAnchoring(false)
        setStatus('')
        setProgress(0)
      }, 2000)
      
    } catch (error) {
      console.error('❌ Anchoring error:', error)
      
      // Update status to failed
      await updateBlockchainStatus(file.file_path, 'failed', {
        error: error.message
      })
      
      onAnchorError?.(error.message)
      setAnchoring(false)
      setStatus('')
      setProgress(0)
    }
  }
  
  // Determine button state
  const isAnchored = file.blockchain_status === 'anchored'
  const isFailed = file.blockchain_status === 'failed'
  const isPending = file.blockchain_status === 'pending'
  
  if (isAnchored) {
    return (
      <div className="blockchain-anchor-button">
        <div className="blockchain-anchored">
          <span className="blockchain-icon">✅</span>
          <span>Anchored on Blockchain</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="blockchain-anchor-button">
      {!anchoring && !isPending && (
        <button
          onClick={handleAnchor}
          className={`blockchain-btn blockchain-btn--anchor ${isFailed ? 'blockchain-btn--retry' : ''}`}
          disabled={anchoring}
          title={isFailed ? 'Retry blockchain anchoring' : 'Anchor this file on blockchain'}
        >
          {isFailed ? (
            <>
              <span className="blockchain-icon">🔄</span>
              Retry Anchoring
            </>
          ) : (
            <>
              <span className="blockchain-icon">⛓️</span>
              Anchor to Blockchain
            </>
          )}
        </button>
      )}
      
      {anchoring && (
        <div className="blockchain-anchoring">
          <div className="blockchain-spinner"></div>
          <span className="blockchain-anchoring-text">{status}</span>
          <div className="blockchain-progress-bar">
            <div 
              className="blockchain-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {isPending && !anchoring && (
        <div className="blockchain-pending">
          <span className="blockchain-icon">⏳</span>
          <span>Anchoring pending...</span>
        </div>
      )}
    </div>
  )
}

export default BlockchainAnchorButton

