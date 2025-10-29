/**
 * Blockchain Service
 * Handles all blockchain interactions including MetaMask, smart contract, and Sepolia testnet
 */

import { ethers } from 'ethers'
import { MetaMaskSDK } from '@metamask/sdk'

// Contract ABI (Application Binary Interface)
const CONTRACT_ABI = [
  "function anchorDocument(bytes32 documentHash, string ipfsCid) external",
  "function verifyDocument(bytes32 documentHash) external view returns (bool exists, bytes32, string memory ipfsCid, address anchoredBy, uint256 timestamp, uint256 blockNumber)",
  "function getDocument(bytes32 documentHash) external view returns (tuple(bytes32 documentHash, string ipfsCid, address anchoredBy, uint256 timestamp, uint256 blockNumber, bool exists))",
  "function getUserDocuments(address user) external view returns (bytes32[])",
  "function getUserDocumentCount(address user) external view returns (uint256)",
  "function checkDocumentExists(bytes32 documentHash) external view returns (bool)",
  "function documentCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event DocumentAnchored(bytes32 indexed documentHash, string ipfsCid, address indexed anchoredBy, uint256 timestamp, uint256 blockNumber)"
]

// Sepolia testnet configuration
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia Test Network',
  rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18
  },
  blockExplorerUrls: ['https://sepolia.etherscan.io/']
}

// Contract address (will be set after deployment)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || null

// Initialize MetaMask SDK
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "MediQ",
    url: window.location.origin,
  },
  infuraAPIKey: "9aa3d95b3bc440fa88ea12eaa4456161",
  defaultReadOnlyChainId: "0xaa36a7",
})

// State management
let ethereum = null
let provider = null
let signer = null
let contract = null
let currentAccount = null

/**
 * Initialize blockchain connection
 */
const initializeBlockchain = async () => {
  try {
    // Get ethereum provider from MetaMask SDK
    ethereum = MMSDK.getProvider()
    
    if (!ethereum) {
      throw new Error('MetaMask not detected')
    }
    
    // Create ethers provider
    provider = new ethers.BrowserProvider(ethereum)
    
    return true
  } catch (error) {
    console.error('Failed to initialize blockchain:', error)
    return false
  }
}

/**
 * Connect to MetaMask wallet
 * @returns {Promise<{success: boolean, address?: string, error?: string}>}
 */
export const connectWallet = async () => {
  try {
    if (!ethereum) {
      await initializeBlockchain()
    }
    
    if (!ethereum) {
      return {
        success: false,
        error: 'MetaMask is not installed. Please install MetaMask extension.'
      }
    }
    
    // Request account access
    const accounts = await ethereum.request({ 
      method: 'eth_requestAccounts' 
    })
    
    if (accounts.length === 0) {
      return {
        success: false,
        error: 'No accounts found. Please connect your MetaMask wallet.'
      }
    }
    
    currentAccount = accounts[0]
    signer = await provider.getSigner()
    
    // Initialize contract if address is available
    if (CONTRACT_ADDRESS) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    }
    
    console.log('✅ Wallet connected:', currentAccount)
    
    return {
      success: true,
      address: currentAccount
    }
  } catch (error) {
    console.error('❌ Wallet connection failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to connect wallet'
    }
  }
}

/**
 * Disconnect wallet
 */
export const disconnectWallet = () => {
  currentAccount = null
  signer = null
  contract = null
  console.log('Wallet disconnected')
}

/**
 * Check if wallet is connected
 * @returns {Promise<boolean>}
 */
export const isWalletConnected = async () => {
  try {
    if (!ethereum) {
      await initializeBlockchain()
    }
    
    if (!ethereum) return false
    
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    return accounts.length > 0
  } catch (error) {
    console.error('Error checking wallet connection:', error)
    return false
  }
}

/**
 * Get current wallet address
 * @returns {string|null}
 */
export const getWalletAddress = () => {
  return currentAccount
}

/**
 * Switch to Sepolia network
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const switchToSepolia = async () => {
  try {
    if (!ethereum) {
      return {
        success: false,
        error: 'MetaMask not detected'
      }
    }
    
    // Try to switch to Sepolia
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      })
      
      return { success: true }
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the network
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          })
          
          return { success: true }
        } catch (addError) {
          return {
            success: false,
            error: 'Failed to add Sepolia network'
          }
        }
      }
      
      throw switchError
    }
  } catch (error) {
    console.error('Failed to switch network:', error)
    return {
      success: false,
      error: error.message || 'Failed to switch to Sepolia'
    }
  }
}

/**
 * Get current network
 * @returns {Promise<{chainId: string, name: string}>}
 */
export const getCurrentNetwork = async () => {
  try {
    if (!provider) {
      await initializeBlockchain()
    }
    
    const network = await provider.getNetwork()
    
    return {
      chainId: network.chainId.toString(),
      name: network.name || 'Unknown'
    }
  } catch (error) {
    console.error('Failed to get network:', error)
    return {
      chainId: '0',
      name: 'Unknown'
    }
  }
}

/**
 * Get wallet balance
 * @param {string} address - Wallet address
 * @returns {Promise<{success: boolean, balance?: string, error?: string}>}
 */
export const getBalance = async (address = currentAccount) => {
  try {
    if (!provider) {
      await initializeBlockchain()
    }
    
    if (!address) {
      return {
        success: false,
        error: 'No wallet address provided'
      }
    }
    
    const balance = await provider.getBalance(address)
    const balanceInEth = ethers.formatEther(balance)
    
    return {
      success: true,
      balance: balanceInEth
    }
  } catch (error) {
    console.error('Failed to get balance:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Generate SHA-256 hash of file content
 * @param {File} file - File to hash
 * @returns {Promise<string>} Hash with 0x prefix
 */
export const generateDocumentHash = async (file) => {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Return with 0x prefix for Ethereum compatibility
    return '0x' + hashHex
  } catch (error) {
    console.error('Failed to generate hash:', error)
    throw error
  }
}

/**
 * Anchor document hash to blockchain
 * @param {string} documentHash - Document hash (0x prefixed)
 * @param {string} ipfsCid - IPFS CID
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{success: boolean, txHash?: string, blockNumber?: number, error?: string}>}
 */
export const anchorToBlockchain = async (documentHash, ipfsCid, onProgress = null) => {
  try {
    if (!contract) {
      if (!CONTRACT_ADDRESS) {
        return {
          success: false,
          error: 'Smart contract not deployed. Please deploy the contract first.'
        }
      }
      
      // Try to connect wallet and initialize contract
      const connectResult = await connectWallet()
      if (!connectResult.success) {
        return connectResult
      }
    }
    
    // Check if document already exists
    const exists = await contract.checkDocumentExists(documentHash)
    if (exists) {
      return {
        success: false,
        error: 'Document already anchored on blockchain'
      }
    }
    
    if (onProgress) onProgress('Preparing transaction...')
    
    // Estimate gas
    const gasEstimate = await contract.anchorDocument.estimateGas(
      documentHash,
      ipfsCid
    )
    
    console.log('Estimated gas:', gasEstimate.toString())
    
    if (onProgress) onProgress('Sending transaction...')
    
    // Send transaction
    const tx = await contract.anchorDocument(documentHash, ipfsCid, {
      gasLimit: gasEstimate * 110n / 100n // Add 10% buffer
    })
    
    console.log('Transaction sent:', tx.hash)
    
    if (onProgress) onProgress('Waiting for confirmation...')
    
    // Wait for confirmation
    const receipt = await tx.wait()
    
    console.log('✅ Document anchored successfully!')
    console.log('   Transaction hash:', receipt.hash)
    console.log('   Block number:', receipt.blockNumber)
    console.log('   Gas used:', receipt.gasUsed.toString())
    
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    }
  } catch (error) {
    console.error('❌ Anchoring failed:', error)
    
    // Parse error message
    let errorMessage = 'Failed to anchor document'
    if (error.message.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient ETH balance for gas fees'
    } else if (error.message.includes('already anchored')) {
      errorMessage = 'Document already anchored on blockchain'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Verify document on blockchain
 * @param {string} documentHash - Document hash to verify
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const verifyOnBlockchain = async (documentHash) => {
  try {
    if (!provider) {
      await initializeBlockchain()
    }
    
    if (!CONTRACT_ADDRESS) {
      return {
        success: false,
        error: 'Smart contract address not configured'
      }
    }
    
    // Create read-only contract instance
    const readContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    )
    
    // Verify document
    const result = await readContract.verifyDocument(documentHash)
    
    if (!result[0]) {
      return {
        success: true,
        data: {
          exists: false
        }
      }
    }
    
    return {
      success: true,
      data: {
        exists: true,
        documentHash: result[1],
        ipfsCid: result[2],
        anchoredBy: result[3],
        timestamp: Number(result[4]),
        blockNumber: Number(result[5])
      }
    }
  } catch (error) {
    console.error('Verification failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getTransactionDetails = async (txHash) => {
  try {
    if (!provider) {
      await initializeBlockchain()
    }
    
    const tx = await provider.getTransaction(txHash)
    const receipt = await provider.getTransactionReceipt(txHash)
    
    if (!tx || !receipt) {
      return {
        success: false,
        error: 'Transaction not found'
      }
    }
    
    return {
      success: true,
      data: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      }
    }
  } catch (error) {
    console.error('Failed to get transaction:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Estimate gas for anchoring
 * @param {string} documentHash - Document hash
 * @param {string} ipfsCid - IPFS CID
 * @returns {Promise<{success: boolean, gasEstimate?: string, error?: string}>}
 */
export const estimateGas = async (documentHash, ipfsCid) => {
  try {
    if (!contract) {
      return {
        success: false,
        error: 'Wallet not connected'
      }
    }
    
    const gasEstimate = await contract.anchorDocument.estimateGas(
      documentHash,
      ipfsCid
    )
    
    // Get gas price
    const gasPrice = await provider.getFeeData()
    const estimatedCost = gasEstimate * gasPrice.gasPrice
    
    return {
      success: true,
      gasEstimate: gasEstimate.toString(),
      estimatedCost: ethers.formatEther(estimatedCost)
    }
  } catch (error) {
    console.error('Gas estimation failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get Etherscan URL for transaction
 * @param {string} txHash - Transaction hash
 * @returns {string} Etherscan URL
 */
export const getEtherscanUrl = (txHash) => {
  return `https://sepolia.etherscan.io/tx/${txHash}`
}

/**
 * Get Etherscan URL for address
 * @param {string} address - Ethereum address
 * @returns {string} Etherscan URL
 */
export const getEtherscanAddressUrl = (address) => {
  return `https://sepolia.etherscan.io/address/${address}`
}

/**
 * Format Ethereum address for display
 * @param {string} address - Full address
 * @returns {string} Shortened address
 */
export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Set contract address (for deployment)
 * @param {string} address - Contract address
 */
export const setContractAddress = (address) => {
  if (ethers.isAddress(address)) {
    localStorage.setItem('MEDIQ_CONTRACT_ADDRESS', address)
    window.location.reload() // Reload to reinitialize with new contract
  }
}

/**
 * Get contract address
 * @returns {string|null} Contract address
 */
export const getContractAddress = () => {
  return CONTRACT_ADDRESS || localStorage.getItem('MEDIQ_CONTRACT_ADDRESS')
}

// Export everything as default too
export default {
  connectWallet,
  disconnectWallet,
  isWalletConnected,
  getWalletAddress,
  switchToSepolia,
  getCurrentNetwork,
  getBalance,
  generateDocumentHash,
  anchorToBlockchain,
  verifyOnBlockchain,
  getTransactionDetails,
  estimateGas,
  getEtherscanUrl,
  getEtherscanAddressUrl,
  formatAddress,
  setContractAddress,
  getContractAddress
}

