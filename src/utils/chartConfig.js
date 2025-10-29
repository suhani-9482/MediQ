/**
 * Chart.js configuration and utilities
 */

/**
 * Default chart options
 */
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}

/**
 * Adherence chart configuration
 */
export const adherenceChartConfig = {
  type: 'line',
  options: {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Adherence Trend (Last 30 Days)'
      }
    }
  }
}

/**
 * Adherence rate chart (doughnut)
 */
export const adherenceRateChartConfig = {
  type: 'doughnut',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }
}

/**
 * Get color palette for charts
 */
export const chartColors = {
  primary: 'rgb(37, 99, 235)', // Blue
  success: 'rgb(16, 185, 129)', // Green
  warning: 'rgb(245, 158, 11)', // Orange
  danger: 'rgb(239, 68, 68)', // Red
  purple: 'rgb(139, 92, 246)', // Purple
  gray: 'rgb(156, 163, 175)' // Gray
}

/**
 * Get dataset configuration for adherence chart
 * @param {Array} takenData - Taken counts
 * @param {Array} missedData - Missed counts
 * @returns {Array}
 */
export const getAdherenceDatasets = (takenData, missedData) => [
  {
    label: 'Taken',
    data: takenData,
    borderColor: chartColors.success,
    backgroundColor: chartColors.success + '33', // 20% opacity
    fill: true,
    tension: 0.4
  },
  {
    label: 'Missed',
    data: missedData,
    borderColor: chartColors.danger,
    backgroundColor: chartColors.danger + '33',
    fill: true,
    tension: 0.4
  }
]

/**
 * Get dataset for adherence rate doughnut chart
 * @param {number} taken - Taken count
 * @param {number} missed - Missed count
 * @param {number} skipped - Skipped count
 * @returns {object}
 */
export const getAdherenceRateDataset = (taken, missed, skipped) => ({
  labels: ['Taken', 'Missed', 'Skipped'],
  datasets: [
    {
      data: [taken, missed, skipped],
      backgroundColor: [
        chartColors.success,
        chartColors.danger,
        chartColors.warning
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
})

/**
 * Get dataset for reminder type distribution
 * @param {object} counts - Counts by type
 * @returns {object}
 */
export const getReminderTypeDataset = (counts) => ({
  labels: ['Medication', 'Appointment', 'Lab Test', 'Refill'],
  datasets: [
    {
      data: [
        counts.medication || 0,
        counts.appointment || 0,
        counts.lab_test || 0,
        counts.refill || 0
      ],
      backgroundColor: [
        chartColors.primary,
        chartColors.success,
        chartColors.warning,
        chartColors.purple
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
})

