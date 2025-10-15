/**
 * Text Analysis Service
 * Handles date detection, keyword extraction, and text processing
 */

/**
 * Medical keywords for classification
 */
const MEDICAL_KEYWORDS = {
  conditions: ['diabetes', 'hypertension', 'asthma', 'cancer', 'arthritis', 'allergy', 'infection', 'disease', 'syndrome', 'disorder'],
  medications: ['medication', 'prescription', 'drug', 'tablet', 'capsule', 'dose', 'mg', 'ml', 'antibiotic', 'vaccine'],
  procedures: ['surgery', 'operation', 'procedure', 'treatment', 'therapy', 'examination', 'test', 'scan', 'xray', 'mri', 'ct scan'],
  vitals: ['blood pressure', 'heart rate', 'temperature', 'weight', 'height', 'bmi', 'pulse', 'oxygen', 'glucose'],
  documents: ['report', 'prescription', 'invoice', 'receipt', 'referral', 'lab', 'laboratory', 'pathology', 'radiology']
}

/**
 * Extract dates from text using multiple patterns
 * @param {string} text - Text to analyze
 * @returns {Array<{date: string, format: string, raw: string}>}
 */
export const extractDates = (text) => {
  if (!text) return []

  const dates = []
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    {
      regex: /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
      format: 'MM/DD/YYYY'
    },
    // DD/MM/YYYY or DD-MM-YYYY
    {
      regex: /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
      format: 'DD/MM/YYYY'
    },
    // Month DD, YYYY
    {
      regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
      format: 'Month DD, YYYY'
    },
    // DD Month YYYY
    {
      regex: /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi,
      format: 'DD Month YYYY'
    },
    // YYYY-MM-DD (ISO format)
    {
      regex: /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g,
      format: 'YYYY-MM-DD'
    }
  ]

  patterns.forEach(({ regex, format }) => {
    let match
    while ((match = regex.exec(text)) !== null) {
      dates.push({
        date: match[0],
        format,
        raw: match[0]
      })
    }
  })

  // Remove duplicates
  const uniqueDates = Array.from(new Set(dates.map(d => d.date)))
    .map(date => dates.find(d => d.date === date))

  return uniqueDates
}

/**
 * Extract keywords from text based on medical context
 * @param {string} text - Text to analyze
 * @returns {object} Categorized keywords
 */
export const extractKeywords = (text) => {
  if (!text) return { all: [], categorized: {} }

  const lowerText = text.toLowerCase()
  const foundKeywords = {
    conditions: [],
    medications: [],
    procedures: [],
    vitals: [],
    documents: [],
    other: []
  }

  // Search for medical keywords
  Object.entries(MEDICAL_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords[category].push(keyword)
      }
    })
  })

  // Extract additional important words (capitalized words, potential names)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
  const uniqueCapitalized = [...new Set(capitalizedWords)]
    .filter(word => word.length > 3 && !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(word))
    .slice(0, 10)

  foundKeywords.other = uniqueCapitalized

  // Flatten all keywords
  const allKeywords = Object.values(foundKeywords).flat()

  return {
    all: [...new Set(allKeywords)],
    categorized: foundKeywords,
    count: allKeywords.length
  }
}

/**
 * Detect document type based on content
 * @param {string} text - Text to analyze
 * @returns {string} Detected document type
 */
export const detectDocumentType = (text) => {
  if (!text) return 'Unknown'

  const lowerText = text.toLowerCase()

  const types = {
    'Lab Report': ['lab', 'laboratory', 'test result', 'pathology', 'specimen'],
    'Prescription': ['prescription', 'rx', 'medication', 'take as directed', 'refill'],
    'Medical Report': ['diagnosis', 'patient', 'medical history', 'examination'],
    'Invoice/Receipt': ['invoice', 'receipt', 'amount', 'total', 'payment', 'bill'],
    'Radiology': ['radiology', 'x-ray', 'xray', 'ct scan', 'mri', 'ultrasound'],
    'Vaccination Record': ['vaccination', 'vaccine', 'immunization', 'dose'],
    'Referral': ['referral', 'referred to', 'specialist', 'consultation']
  }

  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return type
    }
  }

  return 'Medical Document'
}

/**
 * Analyze text comprehensively
 * @param {string} text - Text to analyze
 * @returns {object} Complete analysis results
 */
export const analyzeText = (text) => {
  if (!text || text.length < 10) {
    return {
      hasContent: false,
      dates: [],
      keywords: { all: [], categorized: {}, count: 0 },
      documentType: 'Unknown',
      textLength: 0,
      wordCount: 0
    }
  }

  const dates = extractDates(text)
  const keywords = extractKeywords(text)
  const documentType = detectDocumentType(text)
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length

  return {
    hasContent: true,
    dates,
    keywords,
    documentType,
    textLength: text.length,
    wordCount,
    summary: generateSummary(text, dates, keywords, documentType)
  }
}

/**
 * Generate a brief summary of the analysis
 * @param {string} text - Original text
 * @param {Array} dates - Extracted dates
 * @param {object} keywords - Extracted keywords
 * @param {string} documentType - Detected document type
 * @returns {string} Summary text
 */
const generateSummary = (text, dates, keywords, documentType) => {
  const parts = []

  parts.push(`Type: ${documentType}`)

  if (dates.length > 0) {
    parts.push(`${dates.length} date(s) found`)
  }

  if (keywords.count > 0) {
    parts.push(`${keywords.count} keyword(s) detected`)
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  parts.push(`${wordCount} words`)

  return parts.join(' • ')
}

/**
 * Search text for a query
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {boolean} Whether query was found
 */
export const searchText = (text, query) => {
  if (!text || !query) return false
  return text.toLowerCase().includes(query.toLowerCase())
}

/**
 * Highlight search terms in text
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} Text with highlights
 */
export const highlightSearchTerms = (text, query) => {
  if (!text || !query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

