/**
 * IPFS Service using Web3.Storage w3up-client
 * Handles file upload, retrieval, and management on IPFS
 */

import { create } from '@web3-storage/w3up-client'

// Client instance (singleton)
let client = null
let isInitialized = false

/**
 * Initialize and authenticate w3up client
 * Note: w3up uses email-based authentication
 */
const initializeClient = async () => {
  if (client && isInitialized) {
    return client
  }

  try {
    console.log('🔄 Initializing Web3.Storage client...')
    
    // Create client instance
    client = await create()
    
    // Check if agent is already authorized
    const space = await client.currentSpace()
    
    if (space) {
      console.log('✅ Web3.Storage client ready, Space:', space.did())
      isInitialized = true
      return client
    }
    
    // If no space, user needs to set up first
    console.warn('⚠️ Web3.Storage not configured. User needs to login.')
    return client
    
  } catch (error) {
    console.error('❌ Failed to initialize Web3.Storage:', error)
    throw error
  }
}

/**
 * Get or create w3up client
 */
const getClient = async () => {
  if (!client) {
    await initializeClient()
  }
  return client
}

/**
 * Check if IPFS is properly configured
 * @returns {Promise<{configured: boolean, hasSpace: boolean, spaceDID?: string}>}
 */
export const checkIPFSConfiguration = async () => {
  try {
    const c = await getClient()
    const space = await c.currentSpace()
    
    return {
      configured: !!space,
      hasSpace: !!space,
      spaceDID: space?.did()
    }
  } catch (error) {
    console.error('Configuration check failed:', error)
    return {
      configured: false,
      hasSpace: false,
      error: error.message
    }
  }
}

/**
 * Login to Web3.Storage via email
 * This triggers an email with a verification link
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const loginToIPFS = async (email) => {
  try {
    const c = await getClient()
    
    console.log(`📧 Sending login email to ${email}...`)
    await c.login(email)
    
    return {
      success: true,
      message: 'Check your email for the verification link!'
    }
  } catch (error) {
    console.error('❌ Login failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to initiate login'
    }
  }
}

/**
 * Upload file to IPFS via Web3.Storage
 * @param {File} file - File object to upload
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{success: boolean, cid?: string, url?: string, error?: string}>}
 */
export const uploadToIPFS = async (file, onProgress = null) => {
  try {
    console.log('📤 Starting IPFS upload:', file.name)
    
    // Check configuration first
    const config = await checkIPFSConfiguration()
    if (!config.configured) {
      throw new Error('Web3.Storage not configured. Please login first.')
    }
    
    const c = await getClient()
    
    if (onProgress) onProgress(10)
    
    // Upload file to IPFS
    console.log('⬆️  Uploading to IPFS...')
    const cid = await c.uploadFile(file)
    
    if (onProgress) onProgress(90)
    
    const cidString = cid.toString()
    
    // Construct gateway URLs
    const w3sUrl = `https://w3s.link/ipfs/${cidString}`
    const ipfsUrl = `ipfs://${cidString}`
    const gatewayUrl = `https://ipfs.io/ipfs/${cidString}`
    
    console.log('✅ File uploaded to IPFS')
    console.log('   CID:', cidString)
    console.log('   URL:', w3sUrl)
    
    if (onProgress) onProgress(100)
    
    return {
      success: true,
      cid: cidString,
      url: w3sUrl,
      ipfsUrl: ipfsUrl,
      gatewayUrl: gatewayUrl,
      fileName: file.name,
      size: file.size
    }
  } catch (error) {
    console.error('❌ IPFS upload error:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload to IPFS'
    }
  }
}

/**
 * Upload directory/multiple files to IPFS
 * @param {File[]} files - Array of File objects
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{success: boolean, cid?: string, error?: string}>}
 */
export const uploadDirectoryToIPFS = async (files, onProgress = null) => {
  try {
    console.log(`📤 Uploading ${files.length} files to IPFS...`)
    
    const config = await checkIPFSConfiguration()
    if (!config.configured) {
      throw new Error('Web3.Storage not configured. Please login first.')
    }
    
    const c = await getClient()
    
    if (onProgress) onProgress(10)
    
    // Upload directory
    const cid = await c.uploadDirectory(files)
    
    if (onProgress) onProgress(90)
    
    const cidString = cid.toString()
    
    console.log('✅ Directory uploaded to IPFS:', cidString)
    
    if (onProgress) onProgress(100)
    
    return {
      success: true,
      cid: cidString,
      url: `https://w3s.link/ipfs/${cidString}`,
      fileCount: files.length
    }
  } catch (error) {
    console.error('❌ Directory upload error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Retrieve/download file from IPFS
 * @param {string} cid - IPFS Content ID
 * @returns {Promise<{success: boolean, blob?: Blob, error?: string}>}
 */
export const retrieveFromIPFS = async (cid) => {
  try {
    console.log('📥 Retrieving from IPFS:', cid)
    
    // Use public gateway to fetch
    const gatewayUrl = `https://w3s.link/ipfs/${cid}`
    
    const response = await fetch(gatewayUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    console.log('✅ File retrieved from IPFS')
    return {
      success: true,
      blob,
      size: blob.size,
      type: blob.type
    }
  } catch (error) {
    console.error('❌ IPFS retrieval error:', error)
    return {
      success: false,
      error: error.message || 'Failed to retrieve from IPFS'
    }
  }
}

/**
 * Download file from IPFS with fallback gateways
 * @param {string} cid - IPFS Content ID
 * @param {string} fileName - Original file name
 * @returns {Promise<{success: boolean, blob?: Blob, error?: string}>}
 */
export const downloadFromIPFS = async (cid, fileName = 'file') => {
  try {
    const gateways = [
      `https://w3s.link/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`
    ]
    
    let lastError = null
    
    for (const gateway of gateways) {
      try {
        console.log(`🔄 Trying gateway: ${gateway}`)
        const response = await fetch(gateway)
        
        if (response.ok) {
          const blob = await response.blob()
          console.log(`✅ Retrieved from: ${gateway}`)
          
          return {
            success: true,
            blob,
            fileName,
            gateway
          }
        }
      } catch (err) {
        lastError = err
        console.warn(`Gateway failed: ${gateway}`, err.message)
      }
    }
    
    throw lastError || new Error('All gateways failed')
    
  } catch (error) {
    console.error('❌ Download failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get IPFS gateway URLs for a CID
 * @param {string} cid - IPFS Content ID
 * @param {string} fileName - Optional file name
 * @returns {object} Gateway URLs
 */
export const getIPFSUrls = (cid, fileName = '') => {
  if (!cid) return null
  
  const path = fileName ? `/${fileName}` : ''
  
  return {
    primary: `https://w3s.link/ipfs/${cid}${path}`,
    ipfs: `ipfs://${cid}${path}`,
    gateways: {
      ipfsIo: `https://ipfs.io/ipfs/${cid}${path}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}${path}`,
      dweb: `https://dweb.link/ipfs/${cid}${path}`,
      pinata: `https://gateway.pinata.cloud/ipfs/${cid}${path}`
    }
  }
}

/**
 * Format CID for display (shortened)
 * @param {string} cid - IPFS Content ID
 * @param {number} length - Number of characters to show on each end
 * @returns {string} Shortened CID
 */
export const formatCID = (cid, length = 8) => {
  if (!cid || cid.length <= length * 2) return cid || 'N/A'
  return `${cid.substring(0, length)}...${cid.substring(cid.length - length)}`
}

/**
 * Validate IPFS CID format
 * @param {string} cid - CID to validate
 * @returns {boolean} Is valid CID
 */
export const isValidCID = (cid) => {
  if (!cid || typeof cid !== 'string') return false
  
  // Basic CID validation (v0 or v1)
  const cidV0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
  const cidV1Regex = /^b[a-z2-7]{58,}$/
  
  return cidV0Regex.test(cid) || cidV1Regex.test(cid)
}

/**
 * Get current space information
 * @returns {Promise<{success: boolean, space?: object, error?: string}>}
 */
export const getCurrentSpace = async () => {
  try {
    const c = await getClient()
    const space = await c.currentSpace()
    
    if (!space) {
      return {
        success: false,
        error: 'No space configured'
      }
    }
    
    return {
      success: true,
      space: {
        did: space.did(),
        name: space.name
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check if IPFS service is ready
 * @returns {Promise<boolean>}
 */
export const isIPFSReady = async () => {
  try {
    const config = await checkIPFSConfiguration()
    return config.configured
  } catch (error) {
    return false
  }
}

export default {
  checkIPFSConfiguration,
  loginToIPFS,
  uploadToIPFS,
  uploadDirectoryToIPFS,
  retrieveFromIPFS,
  downloadFromIPFS,
  getIPFSUrls,
  formatCID,
  isValidCID,
  getCurrentSpace,
  isIPFSReady
}

