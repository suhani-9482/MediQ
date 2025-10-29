import { useState, useEffect } from 'react'
import { 
  connectWallet, 
  disconnectWallet, 
  isWalletConnected, 
  getWalletAddress, 
  getBalance,
  formatAddress,
  switchToSepolia,
  getCurrentNetwork
} from '@services/blockchain.js'
import './MetaMaskConnect.css'

const MetaMaskConnect = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('')
  const [network, setNetwork] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  
  useEffect(() => {
    checkConnection()
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])
  
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect()
    } else {
      checkConnection()
    }
  }
  
  const handleChainChanged = () => {
    window.location.reload()
  }
  
  const checkConnection = async () => {
    const connected = await isWalletConnected()
    if (connected) {
      const addr = getWalletAddress()
      if (addr) {
        setAddress(addr)
        setIsConnected(true)
        await updateBalance(addr)
        await updateNetwork()
        onConnectionChange?.(true, addr)
      }
    }
  }
  
  const updateBalance = async (addr) => {
    const result = await getBalance(addr)
    if (result.success) {
      const bal = parseFloat(result.balance).toFixed(4)
      setBalance(bal)
    }
  }
  
  const updateNetwork = async () => {
    const net = await getCurrentNetwork()
    setNetwork(net.name)
    
    // Check if on Sepolia
    if (net.chainId !== '11155111') {
      setError('Please switch to Sepolia testnet')
    } else {
      setError('')
    }
  }
  
  const handleConnect = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Connect wallet
      const result = await connectWallet()
      
      if (result.success) {
        setAddress(result.address)
        setIsConnected(true)
        
        // Switch to Sepolia if needed
        const net = await getCurrentNetwork()
        if (net.chainId !== '11155111') {
          const switchResult = await switchToSepolia()
          if (!switchResult.success) {
            setError('Please switch to Sepolia testnet manually')
          }
        }
        
        await updateBalance(result.address)
        await updateNetwork()
        onConnectionChange?.(true, result.address)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDisconnect = () => {
    disconnectWallet()
    setIsConnected(false)
    setAddress('')
    setBalance('')
    setNetwork('')
    setShowDropdown(false)
    onConnectionChange?.(false, null)
  }
  
  const handleSwitchNetwork = async () => {
    setLoading(true)
    const result = await switchToSepolia()
    if (!result.success) {
      setError(result.error)
    } else {
      setError('')
      await updateNetwork()
    }
    setLoading(false)
  }
  
  if (!isConnected) {
    return (
      <div className="metamask-connect">
        <button 
          onClick={handleConnect}
          disabled={loading}
          className="metamask-connect__btn metamask-connect__btn--connect"
        >
          {loading ? (
            <>
              <div className="metamask-connect__spinner"></div>
              Connecting...
            </>
          ) : (
            <>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="metamask-connect__logo"
              />
              Connect Wallet
            </>
          )}
        </button>
        {error && (
          <div className="metamask-connect__error">
            {error}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="metamask-connect metamask-connect--connected">
      <div className="metamask-connect__info">
        {network && network.toLowerCase() !== 'sepolia' && (
          <button 
            onClick={handleSwitchNetwork}
            className="metamask-connect__network-warning"
            title="Click to switch to Sepolia"
          >
            ⚠️ Wrong Network
          </button>
        )}
        {network && network.toLowerCase() === 'sepolia' && (
          <span className="metamask-connect__network">
            🟢 {network}
          </span>
        )}
        <span className="metamask-connect__balance">
          {balance} ETH
        </span>
      </div>
      
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="metamask-connect__btn metamask-connect__btn--address"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
          alt="MetaMask" 
          className="metamask-connect__logo metamask-connect__logo--small"
        />
        {formatAddress(address)}
        <span className="metamask-connect__dropdown-arrow">
          {showDropdown ? '▲' : '▼'}
        </span>
      </button>
      
      {showDropdown && (
        <div className="metamask-connect__dropdown">
          <div className="metamask-connect__dropdown-item">
            <span className="metamask-connect__dropdown-label">Address:</span>
            <span className="metamask-connect__dropdown-value">{address}</span>
          </div>
          <div className="metamask-connect__dropdown-item">
            <span className="metamask-connect__dropdown-label">Balance:</span>
            <span className="metamask-connect__dropdown-value">{balance} ETH</span>
          </div>
          <div className="metamask-connect__dropdown-item">
            <span className="metamask-connect__dropdown-label">Network:</span>
            <span className="metamask-connect__dropdown-value">{network}</span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="metamask-connect__dropdown-btn"
          >
            🔌 Disconnect
          </button>
        </div>
      )}
      
      {error && (
        <div className="metamask-connect__error">
          {error}
        </div>
      )}
    </div>
  )
}

export default MetaMaskConnect

