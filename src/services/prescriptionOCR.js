import { extractTextFromImage } from './ocr.js'
import { extractTextFromPDF } from './pdfExtractor.js'
import { autoPreprocess } from './imagePreprocessor.js'

/**
 * Extract medication information from prescription image or PDF
 * @param {File} file - Prescription image or PDF
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const extractPrescriptionData = async (file, onProgress = null) => {
  try {
    console.log('📋 Starting prescription processing...')
    
    const isPDF = file.type === 'application/pdf'
    let extractedText = ''
    let confidence = 0
    
    if (isPDF) {
      // Process PDF
      console.log('📄 Processing PDF prescription...')
      if (onProgress) onProgress({ stage: 'extracting', progress: 20 })
      
      const pdfResult = await extractTextFromPDF(file, (progress) => {
        if (onProgress) {
          onProgress({ stage: 'extracting', progress: 20 + (progress * 0.6) })
        }
      })
      
      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to extract text from PDF')
      }
      
      extractedText = pdfResult.text
      confidence = 95 // PDFs have high confidence since text is directly extracted
      
    } else {
      // Process Image
      console.log('🖼️ Processing image prescription...')
      if (onProgress) onProgress({ stage: 'preprocessing', progress: 10 })
      
      // Preprocess image
      const processedImage = await autoPreprocess(file)
      
      if (onProgress) onProgress({ stage: 'extracting', progress: 30 })
      
      // Extract text with OCR
      const ocrResult = await extractTextFromImage(processedImage, {
        languages: ['eng'],
        psm: 6, // Assume uniform block of text
        oem: 3,
        onProgress: (progress) => {
          if (onProgress) {
            onProgress({ stage: 'extracting', progress: 30 + (progress * 0.5) })
          }
        }
      })
      
      if (!ocrResult.success) {
        throw new Error(ocrResult.error)
      }
      
      extractedText = ocrResult.text
      confidence = ocrResult.confidence
    }
    
    if (onProgress) onProgress({ stage: 'analyzing', progress: 85 })
    
    // Parse extracted text
    const parsedData = parsePrescriptionText(extractedText)
    
    if (onProgress) onProgress({ stage: 'complete', progress: 100 })
    
    console.log('✅ Prescription processing complete')
    
    return {
      success: true,
      data: {
        extractedText,
        ...parsedData,
        confidence
      }
    }
  } catch (error) {
    console.error('❌ Prescription processing error:', error)
    return {
      success: false,
      error: error.message || 'Failed to process prescription'
    }
  }
}

/**
 * Parse prescription text to extract structured data
 * @param {string} text - OCR extracted text
 * @returns {object}
 */
const parsePrescriptionText = (text) => {
  const lowerText = text.toLowerCase()
  
  return {
    medications: extractMedications(text),
    dosages: extractDosages(text),
    frequencies: extractFrequencies(text),
    instructions: extractInstructions(text),
    doctorName: extractDoctorName(text),
    date: extractPrescriptionDate(text)
  }
}

/**
 * Extract medication names from text
 * @param {string} text - Text to parse
 * @returns {Array<string>}
 */
const extractMedications = (text) => {
  const medications = []
  
  // Common medication patterns
  const medicationPatterns = [
    // Generic patterns
    /(?:^|\n)\s*(?:rx:|medication:|drug:)\s*([a-z][a-z0-9\s-]+?)(?:\n|$|[0-9])/gi,
    // Capitalized words that look like drug names
    /\b([A-Z][a-z]+(?:ol|in|ide|one|ate|ine|ex|al))\b/g,
    // Common formats: "1. Medication Name"
    /(?:^|\n)\s*\d+[\.\)]\s*([A-Z][a-z]+[a-z\s-]+?)(?:\s+\d+|$|\n)/gm
  ]
  
  medicationPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const med = match[1].trim()
      if (med.length > 3 && med.length < 50 && !medications.includes(med)) {
        medications.push(med)
      }
    }
  })
  
  return medications
}

/**
 * Extract dosages from text
 * @param {string} text - Text to parse
 * @returns {Array<string>}
 */
const extractDosages = (text) => {
  const dosages = []
  
  // Dosage patterns
  const dosagePatterns = [
    /\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?|iu))\b/gi,
    /\b(\d+(?:\.\d+)?\s*milligrams?)\b/gi,
    /\b(\d+(?:\.\d+)?\s*micrograms?)\b/gi
  ]
  
  dosagePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const dosage = match[1].trim()
      if (!dosages.includes(dosage)) {
        dosages.push(dosage)
      }
    }
  })
  
  return dosages
}

/**
 * Extract frequency information
 * @param {string} text - Text to parse
 * @returns {Array<object>}
 */
const extractFrequencies = (text) => {
  const frequencies = []
  const lowerText = text.toLowerCase()
  
  const frequencyMap = {
    'once daily': { frequency: 'daily', times: 1 },
    'twice daily': { frequency: 'daily', times: 2 },
    'three times daily': { frequency: 'daily', times: 3 },
    'four times daily': { frequency: 'daily', times: 4 },
    'every 8 hours': { frequency: 'daily', times: 3 },
    'every 6 hours': { frequency: 'daily', times: 4 },
    'every 12 hours': { frequency: 'daily', times: 2 },
    'bid': { frequency: 'daily', times: 2 }, // Twice daily
    'tid': { frequency: 'daily', times: 3 }, // Three times daily
    'qid': { frequency: 'daily', times: 4 }, // Four times daily
    'qd': { frequency: 'daily', times: 1 },  // Once daily
    'weekly': { frequency: 'weekly', times: 1 },
    'as needed': { frequency: 'as_needed', times: 0 }
  }
  
  Object.entries(frequencyMap).forEach(([pattern, freq]) => {
    if (lowerText.includes(pattern)) {
      frequencies.push(freq)
    }
  })
  
  return frequencies
}

/**
 * Extract special instructions
 * @param {string} text - Text to parse
 * @returns {Array<string>}
 */
const extractInstructions = (text) => {
  const instructions = []
  const lowerText = text.toLowerCase()
  
  const instructionPatterns = [
    'take with food',
    'take with meals',
    'take on empty stomach',
    'take before bed',
    'take in the morning',
    'take before breakfast',
    'do not crush',
    'do not chew',
    'swallow whole',
    'with water',
    'avoid alcohol',
    'avoid dairy',
    'may cause drowsiness',
    'take at bedtime'
  ]
  
  instructionPatterns.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      instructions.push(pattern.charAt(0).toUpperCase() + pattern.slice(1))
    }
  })
  
  return instructions
}

/**
 * Extract doctor name from prescription
 * @param {string} text - Text to parse
 * @returns {string|null}
 */
const extractDoctorName = (text) => {
  // Look for "Dr." or "Doctor" followed by name
  const patterns = [
    /(?:Dr\.|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /Prescriber:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /Physician:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  return null
}

/**
 * Extract prescription date
 * @param {string} text - Text to parse
 * @returns {string|null}
 */
const extractPrescriptionDate = (text) => {
  // Date patterns
  const datePatterns = [
    /(?:Date|Dated?):\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

/**
 * Suggest reminder settings based on prescription data
 * @param {object} prescriptionData - Parsed prescription data
 * @returns {object}
 */
export const suggestReminderSettings = (prescriptionData) => {
  const suggestions = []
  
  const { medications, dosages, frequencies, instructions } = prescriptionData
  
  // Create a suggestion for each medication
  medications.forEach((medication, index) => {
    const dosage = dosages[index] || dosages[0] || ''
    const frequency = frequencies[index] || frequencies[0] || { frequency: 'daily', times: 1 }
    const instruction = instructions.join(', ')
    
    let times = []
    if (frequency.times === 1) {
      times = ['09:00']
    } else if (frequency.times === 2) {
      times = ['08:00', '20:00']
    } else if (frequency.times === 3) {
      times = ['08:00', '14:00', '20:00']
    } else if (frequency.times === 4) {
      times = ['06:00', '12:00', '18:00', '23:00']
    }
    
    suggestions.push({
      title: `Take ${medication}`,
      medication_name: medication,
      dosage: dosage,
      instructions: instruction || 'As directed',
      reminder_type: 'medication',
      frequency: frequency.frequency,
      suggested_times: times,
      start_date: new Date().toISOString().split('T')[0]
    })
  })
  
  return suggestions
}

