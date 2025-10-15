import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker - use local worker from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

/**
 * Extract text from a PDF file
 * @param {File|Blob} pdfFile - PDF file to process
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{success: boolean, text?: string, pages?: number, error?: string}>}
 */
export const extractTextFromPDF = async (pdfFile, onProgress = null) => {
  try {
    console.log('📄 Starting PDF text extraction:', pdfFile.name)

    // Convert file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer()

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages

    console.log(`📄 PDF loaded: ${numPages} pages`)

    let fullText = ''

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Combine text items with spaces
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
      
      fullText += pageText + '\n\n'

      // Update progress
      if (onProgress) {
        const progress = Math.round((pageNum / numPages) * 100)
        onProgress(progress)
      }
    }

    const cleanedText = fullText.trim()

    console.log('✅ PDF extraction completed:', {
      pages: numPages,
      textLength: cleanedText.length
    })

    return {
      success: true,
      text: cleanedText,
      pages: numPages,
      hasText: cleanedText.length > 0
    }
  } catch (error) {
    console.error('❌ PDF extraction error:', error)
    return {
      success: false,
      error: error.message || 'Failed to extract text from PDF'
    }
  }
}

/**
 * Check if file is a PDF
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
export const isPDFFile = (mimeType) => {
  return mimeType === 'application/pdf'
}

/**
 * Extract text from PDF or return info if it's an image-based PDF
 * @param {File} file - PDF file
 * @returns {Promise<object>}
 */
export const analyzePDF = async (file) => {
  const result = await extractTextFromPDF(file)
  
  if (result.success && result.text.length < 50) {
    return {
      ...result,
      isImageBased: true,
      message: 'This PDF appears to be image-based. Consider using OCR.'
    }
  }
  
  return result
}

