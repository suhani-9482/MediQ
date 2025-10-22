import Tesseract from 'tesseract.js'

/**
 * Extract text from an image file using Tesseract OCR
 * @param {File|Blob} imageFile - Image file to process
 * @param {object} options - OCR options
 * @returns {Promise<{success: boolean, text?: string, confidence?: number, error?: string}>}
 */
export const extractTextFromImage = async (imageFile, options = {}) => {
  const {
    languages = ['eng'], // Can be ['eng', 'spa', 'fra', etc.]
    onProgress = null,
    psm = 3, // Page segmentation mode (3 = Automatic page segmentation)
    oem = 3  // OCR Engine mode (3 = Default, based on what is available)
  } = options;

  try {
    console.log('🔍 Starting OCR for image:', imageFile.name)
    console.log('  → Languages:', languages.join(', '))
    console.log('  → PSM:', psm, '| OEM:', oem)
    
    const result = await Tesseract.recognize(
      imageFile,
      languages.join('+'), // Support multiple languages
      {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100)
            onProgress(progress)
          }
        },
        // Tesseract configuration
        tessedit_pageseg_mode: psm,
        tessedit_ocr_engine_mode: oem,
        // Additional optimizations for medical documents
        tessedit_char_whitelist: '', // Empty = allow all characters
        preserve_interword_spaces: '1'
      }
    )

    const text = result.data.text.trim()
    const confidence = result.data.confidence

    console.log('✅ OCR completed:', {
      textLength: text.length,
      confidence: confidence.toFixed(2) + '%',
      words: result.data.words?.length || 0
    })

    return {
      success: true,
      text,
      confidence,
      words: result.data.words?.length || 0,
      language: languages[0]
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

