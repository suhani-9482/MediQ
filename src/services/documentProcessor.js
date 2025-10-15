import { extractTextFromImage, isImageFile } from './ocr.js'
import { extractTextFromPDF, isPDFFile } from './pdfExtractor.js'
import { analyzeText } from './textAnalysis.js'

/**
 * Process a document file (extract text and analyze)
 * @param {File} file - File to process
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} Processing results
 */
export const processDocument = async (file, onProgress = null) => {
  try {
    console.log('📋 Processing document:', file.name)

    let extractionResult = null
    let extractedText = ''
    let processingMethod = 'none'

    // Update progress
    if (onProgress) onProgress({ stage: 'extracting', progress: 0 })

    // Extract text based on file type
    if (isImageFile(file.type)) {
      processingMethod = 'ocr'
      extractionResult = await extractTextFromImage(file, (progress) => {
        if (onProgress) onProgress({ stage: 'extracting', progress })
      })
      extractedText = extractionResult.text || ''
    } else if (isPDFFile(file.type)) {
      processingMethod = 'pdf'
      extractionResult = await extractTextFromPDF(file, (progress) => {
        if (onProgress) onProgress({ stage: 'extracting', progress })
      })
      extractedText = extractionResult.text || ''
    }

    // Update progress
    if (onProgress) onProgress({ stage: 'analyzing', progress: 50 })

    // Analyze extracted text
    const analysis = analyzeText(extractedText)

    // Update progress
    if (onProgress) onProgress({ stage: 'complete', progress: 100 })

    console.log('✅ Document processing complete:', {
      method: processingMethod,
      textLength: extractedText.length,
      documentType: analysis.documentType,
      dates: analysis.dates.length,
      keywords: analysis.keywords.count
    })

    return {
      success: true,
      processingMethod,
      extractedText,
      analysis,
      extractionResult,
      metadata: {
        hasText: extractedText.length > 0,
        textLength: extractedText.length,
        wordCount: analysis.wordCount,
        documentType: analysis.documentType,
        dates: analysis.dates,
        keywords: analysis.keywords.all,
        ocrConfidence: extractionResult?.confidence || null,
        pageCount: extractionResult?.pages || null
      }
    }
  } catch (error) {
    console.error('❌ Document processing error:', error)
    return {
      success: false,
      error: error.message || 'Failed to process document',
      processingMethod: 'failed'
    }
  }
}

/**
 * Check if file can be processed
 * @param {string} fileType - MIME type
 * @returns {boolean}
 */
export const canProcessFile = (fileType) => {
  return isImageFile(fileType) || isPDFFile(fileType)
}

/**
 * Get processing method name
 * @param {string} fileType - MIME type
 * @returns {string}
 */
export const getProcessingMethod = (fileType) => {
  if (isImageFile(fileType)) return 'OCR (Optical Character Recognition)'
  if (isPDFFile(fileType)) return 'PDF Text Extraction'
  return 'Not Supported'
}

