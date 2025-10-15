import Tesseract from 'tesseract.js'

/**
 * Extract text from an image file using Tesseract OCR
 * @param {File|Blob} imageFile - Image file to process
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{success: boolean, text?: string, confidence?: number, error?: string}>}
 */
export const extractTextFromImage = async (imageFile, onProgress = null) => {
  try {
    console.log('🔍 Starting OCR for image:', imageFile.name)
    
    const result = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100)
            onProgress(progress)
          }
        }
      }
    )

    const text = result.data.text.trim()
    const confidence = result.data.confidence

    console.log('✅ OCR completed:', {
      textLength: text.length,
      confidence: confidence.toFixed(2) + '%'
    })

    return {
      success: true,
      text,
      confidence,
      words: result.data.words?.length || 0
    }
  } catch (error) {
    console.error('❌ OCR error:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract text from image'
    }
  }
}

/**
 * Check if file is an image
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
export const isImageFile = (mimeType) => {
  return mimeType?.startsWith('image/')
}

/**
 * Get OCR status message based on confidence
 * @param {number} confidence - OCR confidence percentage
 * @returns {string}
 */
export const getOCRQuality = (confidence) => {
  if (confidence >= 90) return 'Excellent'
  if (confidence >= 75) return 'Good'
  if (confidence >= 60) return 'Fair'
  return 'Poor'
}

