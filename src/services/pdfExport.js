import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { formatReminderTime } from './reminders.js'

/**
 * Export reminder list to PDF
 * @param {array} reminders - List of reminders
 * @param {string} userName - User name or email
 * @returns {void}
 */
export const exportReminderListPDF = (reminders, userName = 'User') => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.setTextColor(37, 99, 235) // Blue
  doc.text('MediQ - Reminder List', 14, 22)
  
  // User info
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated for: ${userName}`, 14, 30)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36)
  
  // Prepare table data
  const tableData = reminders.map(reminder => [
    getReminderTypeIcon(reminder.reminder_type) + ' ' + reminder.title,
    reminder.medication_name || '-',
    reminder.dosage || '-',
    formatReminderTime(reminder.reminder_time),
    reminder.frequency,
    reminder.is_active ? 'Active' : 'Inactive'
  ])
  
  // Table
  doc.autoTable({
    startY: 45,
    head: [['Reminder', 'Medication', 'Dosage', 'Time', 'Frequency', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 }
    }
  })
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(150)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }
  
  // Save
  doc.save(`mediq-reminders-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Export adherence report to PDF
 * @param {object} stats - Adherence statistics
 * @param {array} logs - Reminder logs
 * @param {string} userName - User name or email
 * @param {number} days - Number of days in report
 * @returns {void}
 */
export const exportAdherenceReportPDF = (stats, logs, userName = 'User', days = 30) => {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.setTextColor(37, 99, 235)
  doc.text('MediQ - Adherence Report', 14, 22)
  
  // User info
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Patient: ${userName}`, 14, 30)
  doc.text(`Report Period: Last ${days} days`, 14, 36)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42)
  
  // Summary statistics
  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('Summary', 14, 55)
  
  const summaryData = [
    ['Overall Adherence Rate', `${stats.adherenceRate}%`],
    ['Total Reminders', stats.total],
    ['Successfully Taken', stats.taken],
    ['Missed', stats.missed],
    ['Skipped', stats.skipped],
    ['Snoozed', stats.snoozed]
  ]
  
  doc.autoTable({
    startY: 60,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 40, halign: 'right' }
    }
  })
  
  // Recent activity
  if (logs && logs.length > 0) {
    const finalY = doc.lastAutoTable.finalY || 120
    doc.setFontSize(14)
    doc.text('Recent Activity', 14, finalY + 15)
    
    const activityData = logs.slice(0, 20).map(log => [
      new Date(log.scheduled_time).toLocaleDateString(),
      new Date(log.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      getActionIcon(log.action) + ' ' + capitalizeFirst(log.action),
      log.action_time ? new Date(log.action_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'
    ])
    
    doc.autoTable({
      startY: finalY + 20,
      head: [['Date', 'Scheduled', 'Action', 'Actual Time']],
      body: activityData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    })
  }
  
  // Performance indicator
  const finalY2 = doc.lastAutoTable.finalY || 200
  if (finalY2 < 250) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    
    let performanceText = ''
    let performanceColor = [0, 0, 0]
    
    if (stats.adherenceRate >= 90) {
      performanceText = '✓ Excellent adherence! Keep up the great work.'
      performanceColor = [16, 185, 129] // Green
    } else if (stats.adherenceRate >= 75) {
      performanceText = '• Good adherence. Minor improvements needed.'
      performanceColor = [245, 158, 11] // Orange
    } else {
      performanceText = '⚠ Adherence needs improvement. Consider setting reminders.'
      performanceColor = [239, 68, 68] // Red
    }
    
    doc.setTextColor(...performanceColor)
    doc.text(performanceText, 14, finalY2 + 15)
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(150)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const footerText = `MediQ Health Management System | Page ${i} of ${pageCount}`
    doc.text(
      footerText,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }
  
  // Disclaimer
  doc.setPage(pageCount)
  const disclaimerY = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(7)
  doc.setTextColor(100)
  doc.text(
    'This report is for informational purposes only. Consult your healthcare provider for medical advice.',
    doc.internal.pageSize.getWidth() / 2,
    disclaimerY,
    { align: 'center', maxWidth: 180 }
  )
  
  // Save
  doc.save(`mediq-adherence-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Export monthly calendar to PDF
 * @param {array} reminders - Reminders for the month
 * @param {Date} month - Month to export
 * @param {string} userName - User name
 * @returns {void}
 */
export const exportMonthlyCalendarPDF = (reminders, month, userName = 'User') => {
  const doc = new jsPDF('landscape')
  
  const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Title
  doc.setFontSize(18)
  doc.setTextColor(37, 99, 235)
  doc.text(`MediQ - Reminder Calendar: ${monthName}`, 14, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(userName, 14, 28)
  
  // Create calendar grid
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  
  const calendarData = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Build calendar rows
  let week = new Array(7).fill('')
  let dayCounter = 1
  
  for (let i = 0; i < 6; i++) { // Max 6 weeks
    if (dayCounter > daysInMonth) break
    
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        week[j] = ''
      } else if (dayCounter <= daysInMonth) {
        // Count reminders for this day
        const dayReminders = reminders.filter(r => {
          // Simple check - would need more logic for weekly reminders
          return r.frequency === 'daily'
        })
        
        week[j] = dayCounter + (dayReminders.length > 0 ? ` (${dayReminders.length})` : '')
        dayCounter++
      } else {
        week[j] = ''
      }
    }
    
    calendarData.push([...week])
    week = new Array(7).fill('')
  }
  
  // Draw calendar
  doc.autoTable({
    startY: 35,
    head: [dayNames],
    body: calendarData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
      halign: 'center',
      minCellHeight: 25
    },
    columnStyles: {
      0: { fillColor: [252, 252, 252] }, // Sunday
      6: { fillColor: [252, 252, 252] }  // Saturday
    }
  })
  
  // Save
  doc.save(`mediq-calendar-${monthName.replace(' ', '-').toLowerCase()}.pdf`)
}

// Helper functions
const getReminderTypeIcon = (type) => {
  const icons = {
    medication: '💊',
    appointment: '🏥',
    lab_test: '🔬',
    refill: '📋'
  }
  return icons[type] || '⏰'
}

const getActionIcon = (action) => {
  const icons = {
    taken: '✓',
    missed: '✗',
    snoozed: '⏰',
    skipped: '⏭'
  }
  return icons[action] || '•'
}

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

