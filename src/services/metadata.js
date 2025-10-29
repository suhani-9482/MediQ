import supabase from './supabase.js'

/**
 * Save file metadata to Supabase database
 * @param {object} metadata - File metadata
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const saveFileMetadata = async (metadata) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .insert([{
        user_id: metadata.userId,
        file_path: metadata.filePath,
        file_name: metadata.fileName,
        file_type: metadata.fileType,
        file_size: metadata.fileSize,
        extracted_text: metadata.extractedText || null,
        document_type: metadata.documentType || 'Unknown',
        dates: metadata.dates || [],
        keywords: metadata.keywords || [],
        ocr_confidence: metadata.ocrConfidence || null,
        page_count: metadata.pageCount || null,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error

    console.log('✅ Metadata saved:', data)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Metadata save error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get file metadata by user ID
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getFileMetadata = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Metadata fetch error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Search file metadata by text query
 * @param {string} userId - User ID
 * @param {string} query - Search query
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const searchFileMetadata = async (userId, query) => {
  try {
    if (!query || query.trim() === '') {
      return await getFileMetadata(userId)
    }

    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .or(`file_name.ilike.%${query}%,extracted_text.ilike.%${query}%,document_type.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Search error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete file metadata
 * @param {string} filePath - File path
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFileMetadata = async (filePath) => {
  try {
    const { error } = await supabase
      .from('file_metadata')
      .delete()
      .eq('file_path', filePath)

    if (error) throw error

    console.log('✅ Metadata deleted:', filePath)
    return { success: true }
  } catch (error) {
    console.error('❌ Metadata delete error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update file metadata
 * @param {string} filePath - File path
 * @param {object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateFileMetadata = async (filePath, updates) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .update(updates)
      .eq('file_path', filePath)
      .select()

    if (error) throw error

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Metadata update error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get metadata by file path
 * @param {string} filePath - File path
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getMetadataByPath = async (filePath) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('file_path', filePath)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('❌ Metadata fetch error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * ============================================
 * IPFS-RELATED METADATA FUNCTIONS
 * ============================================
 */

/**
 * Update IPFS backup status for a file
 * @param {string} filePath - File path
 * @param {string} status - Backup status (none, pending, backing_up, completed, failed)
 * @param {object} ipfsData - IPFS data (cid, url, error)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateIPFSStatus = async (filePath, status, ipfsData = {}) => {
  try {
    const updates = {
      ipfs_backup_status: status,
      ...(ipfsData.cid && { ipfs_cid: ipfsData.cid }),
      ...(ipfsData.url && { ipfs_file_url: ipfsData.url }),
      ...(ipfsData.error && { ipfs_backup_error: ipfsData.error }),
      ...(status === 'completed' && { ipfs_backed_up_at: new Date().toISOString() })
    }
    
    const { data, error } = await supabase
      .from('file_metadata')
      .update(updates)
      .eq('file_path', filePath)
      .select()
    
    if (error) throw error
    
    console.log('✅ IPFS status updated:', status)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ IPFS status update error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get files by IPFS backup status
 * @param {string} userId - User ID
 * @param {string} status - Backup status (none, pending, backing_up, completed, failed)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getFilesByIPFSStatus = async (userId, status) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .eq('ipfs_backup_status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Fetch by status error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get IPFS backup statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
 */
export const getIPFSStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('ipfs_backup_status')
      .eq('user_id', userId)
    
    if (error) throw error
    
    const stats = {
      total: data.length,
      backed_up: data.filter(f => f.ipfs_backup_status === 'completed').length,
      pending: data.filter(f => f.ipfs_backup_status === 'pending').length,
      backing_up: data.filter(f => f.ipfs_backup_status === 'backing_up').length,
      failed: data.filter(f => f.ipfs_backup_status === 'failed').length,
      none: data.filter(f => f.ipfs_backup_status === 'none' || !f.ipfs_backup_status).length
    }
    
    stats.backupPercentage = stats.total > 0 
      ? Math.round((stats.backed_up / stats.total) * 100) 
      : 0
    
    return { success: true, stats }
  } catch (error) {
    console.error('❌ IPFS stats error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all files not backed up to IPFS
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getFilesNotBackedUp = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .or('ipfs_backup_status.eq.none,ipfs_backup_status.eq.failed,ipfs_backup_status.is.null')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Fetch not backed up error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get file by IPFS CID
 * @param {string} cid - IPFS Content ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFileByIPFSCID = async (cid) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('ipfs_cid', cid)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Fetch by CID error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * ============================================
 * BLOCKCHAIN-RELATED METADATA FUNCTIONS
 * ============================================
 */

/**
 * Update blockchain anchoring status for a file
 * @param {string} filePath - File path
 * @param {string} status - Anchoring status (none, pending, anchored, failed)
 * @param {object} blockchainData - Blockchain data (hash, txHash, blockNumber, etc)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateBlockchainStatus = async (filePath, status, blockchainData = {}) => {
  try {
    const updates = {
      blockchain_status: status,
      ...(blockchainData.hash && { blockchain_hash: blockchainData.hash }),
      ...(blockchainData.txHash && { blockchain_tx_hash: blockchainData.txHash }),
      ...(blockchainData.blockNumber && { blockchain_block_number: blockchainData.blockNumber }),
      ...(blockchainData.gasUsed && { blockchain_gas_used: blockchainData.gasUsed }),
      ...(blockchainData.contractAddress && { blockchain_contract_address: blockchainData.contractAddress }),
      ...(blockchainData.anchoredBy && { blockchain_anchored_by: blockchainData.anchoredBy }),
      ...(blockchainData.error && { blockchain_error: blockchainData.error }),
      ...(status === 'anchored' && { blockchain_timestamp: new Date().toISOString() })
    }
    
    const { data, error } = await supabase
      .from('file_metadata')
      .update(updates)
      .eq('file_path', filePath)
      .select()
    
    if (error) throw error
    
    console.log('✅ Blockchain status updated:', status)
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('❌ Blockchain status update error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get files by blockchain status
 * @param {string} userId - User ID
 * @param {string} status - Blockchain status (none, pending, anchored, failed)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getFilesByBlockchainStatus = async (userId, status) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .eq('blockchain_status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Fetch by blockchain status error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get blockchain statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
 */
export const getBlockchainStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('blockchain_status')
      .eq('user_id', userId)
    
    if (error) throw error
    
    const stats = {
      total: data.length,
      anchored: data.filter(f => f.blockchain_status === 'anchored').length,
      pending: data.filter(f => f.blockchain_status === 'pending').length,
      failed: data.filter(f => f.blockchain_status === 'failed').length,
      none: data.filter(f => f.blockchain_status === 'none' || !f.blockchain_status).length
    }
    
    stats.anchoredPercentage = stats.total > 0 
      ? Math.round((stats.anchored / stats.total) * 100) 
      : 0
    
    return { success: true, stats }
  } catch (error) {
    console.error('❌ Blockchain stats error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all files not anchored on blockchain
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getFilesNotAnchored = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('user_id', userId)
      .or('blockchain_status.eq.none,blockchain_status.eq.failed,blockchain_status.is.null')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ Fetch not anchored error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get file by blockchain transaction hash
 * @param {string} txHash - Transaction hash
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFileByTxHash = async (txHash) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('blockchain_tx_hash', txHash)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Fetch by TX hash error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get file by blockchain hash
 * @param {string} blockchainHash - Document hash on blockchain
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getFileByBlockchainHash = async (blockchainHash) => {
  try {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('blockchain_hash', blockchainHash)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Fetch by blockchain hash error:', error)
    return { success: false, error: error.message }
  }
}

