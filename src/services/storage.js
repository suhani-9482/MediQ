import supabase from './supabase.js'

const BUCKET_NAME = 'medical-records'

/**
 * Initialize storage bucket (call this once during setup)
 */
export const initializeStorage = async () => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp'
        ]
      })
      
      if (error) throw error
      console.log('✅ Storage bucket created:', data)
    }
    
    return { success: true }
  } catch (error) {
    console.error('❌ Storage initialization error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload file to Supabase Storage
 * @param {File} file - File object to upload
 * @param {string} userId - User ID for organizing files
 * @param {function} onProgress - Progress callback (percentage)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const uploadFile = async (file, userId, onProgress = null) => {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${userId}/${timestamp}_${sanitizedName}`
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Get public URL (signed URL for private bucket)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    console.log('✅ File uploaded:', data.path)
    
    return {
      success: true,
      data: {
        path: data.path,
        url: urlData?.signedUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('❌ Upload error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {object} Validation result
 */
export const validateFile = (file) => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
  
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Only PDF and images are allowed.' }
  }
  
  return { valid: true }
}

/**
 * List all files for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const listUserFiles = async (userId) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) throw error
    
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('❌ List files error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get signed URL for a file
 * @param {string} filePath - Full file path
 * @param {number} expiresIn - Expiry time in seconds (default 1 hour)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const getFileUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn)
    
    if (error) throw error
    
    return { success: true, url: data.signedUrl }
  } catch (error) {
    console.error('❌ Get file URL error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a file
 * @param {string} filePath - Full file path
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])
    
    if (error) throw error
    
    console.log('✅ File deleted:', filePath)
    return { success: true }
  } catch (error) {
    console.error('❌ Delete file error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Download a file
 * @param {string} filePath - Full file path
 * @returns {Promise<{success: boolean, data?: Blob, error?: string}>}
 */
export const downloadFile = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath)
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Download file error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file icon based on type
 * @param {string} fileType - MIME type
 * @returns {string} Icon emoji
 */
export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType === 'application/pdf') return '📄'
  return '📎'
}

