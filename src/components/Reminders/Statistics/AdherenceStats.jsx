import { useState, useEffect } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { getAdherenceChartData } from '../../../utils/dateHelpers.js'
import { 
  adherenceChartConfig, 
  adherenceRateChartConfig,
  getAdherenceDatasets,
  getAdherenceRateDataset 
} from '../../../utils/chartConfig.js'
import { exportAdherenceReportPDF } from '../../../services/pdfExport.js'
import './AdherenceStats.css'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AdherenceStats = ({ logs, userName, days = 30 }) => {
  const [stats, setStats] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    skipped: 0,
    snoozed: 0,
    adherenceRate: 0
  })

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })

  const [doughnutData, setDoughnutData] = useState({
    labels: [],
    datasets: []
  })

  useEffect(() => {
    calculateStats()
  }, [logs, days])

  useEffect(() => {
    prepareChartData()
  }, [stats, logs, days])

  const calculateStats = () => {
    if (!logs || logs.length === 0) {
      setStats({
        total: 0,
        taken: 0,
        missed: 0,
        skipped: 0,
        snoozed: 0,
        adherenceRate: 0
      })
      return
    }

    const taken = logs.filter(log => log.action === 'taken').length
    const missed = logs.filter(log => log.action === 'missed').length
    const skipped = logs.filter(log => log.action === 'skipped').length
    const snoozed = logs.filter(log => log.action === 'snoozed').length
    const total = logs.length

    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0

    setStats({
      total,
      taken,
      missed,
      skipped,
      snoozed,
      adherenceRate
    })
  }

  const prepareChartData = () => {
    const { labels, takenData, missedData } = getAdherenceChartData(logs, days)
    
    setChartData({
      labels,
      datasets: getAdherenceDatasets(takenData, missedData)
    })

    setDoughnutData(getAdherenceRateDataset(stats.taken, stats.missed, stats.skipped))
  }

  const handleExportPDF = () => {
    exportAdherenceReportPDF(stats, logs, userName, days)
  }

  const getAdherenceLevel = () => {
    if (stats.adherenceRate >= 90) return { text: 'Excellent', color: 'green' }
    if (stats.adherenceRate >= 75) return { text: 'Good', color: 'blue' }
    if (stats.adherenceRate >= 60) return { text: 'Fair', color: 'orange' }
    return { text: 'Needs Improvement', color: 'red' }
  }

  const adherenceLevel = getAdherenceLevel()

  return (
    <div className="adherence-stats">
      <div className="adherence-stats__header">
        <h2>Adherence Statistics</h2>
        <button 
          onClick={handleExportPDF}
          className="adherence-stats__export-btn"
          aria-label="Export report as PDF"
        >
          📄 Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="adherence-stats__summary">
        <div className="adherence-stats__card adherence-stats__card--large">
          <div className="adherence-stats__card-icon adherence-stats__card-icon--blue">
            📊
          </div>
          <div className="adherence-stats__card-content">
            <div className="adherence-stats__card-value">{stats.adherenceRate}%</div>
            <div className="adherence-stats__card-label">Overall Adherence</div>
            <div className={`adherence-stats__card-badge adherence-stats__card-badge--${adherenceLevel.color}`}>
              {adherenceLevel.text}
            </div>
          </div>
        </div>

        <div className="adherence-stats__card">
          <div className="adherence-stats__card-icon adherence-stats__card-icon--green">
            ✓
          </div>
          <div className="adherence-stats__card-content">
            <div className="adherence-stats__card-value">{stats.taken}</div>
            <div className="adherence-stats__card-label">Taken</div>
          </div>
        </div>

        <div className="adherence-stats__card">
          <div className="adherence-stats__card-icon adherence-stats__card-icon--red">
            ✗
          </div>
          <div className="adherence-stats__card-content">
            <div className="adherence-stats__card-value">{stats.missed}</div>
            <div className="adherence-stats__card-label">Missed</div>
          </div>
        </div>

        <div className="adherence-stats__card">
          <div className="adherence-stats__card-icon adherence-stats__card-icon--orange">
            ⏭
          </div>
          <div className="adherence-stats__card-content">
            <div className="adherence-stats__card-value">{stats.skipped}</div>
            <div className="adherence-stats__card-label">Skipped</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="adherence-stats__charts">
        <div className="adherence-stats__chart-container adherence-stats__chart-container--wide">
          <h3>Adherence Trend (Last {days} Days)</h3>
          <div className="adherence-stats__chart">
            {chartData.labels.length > 0 ? (
              <Line data={chartData} options={adherenceChartConfig.options} />
            ) : (
              <div className="adherence-stats__no-data">
                <p>No data available yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="adherence-stats__chart-container">
          <h3>Distribution</h3>
          <div className="adherence-stats__chart adherence-stats__chart--doughnut">
            {stats.total > 0 ? (
              <Doughnut data={doughnutData} options={adherenceRateChartConfig.options} />
            ) : (
              <div className="adherence-stats__no-data">
                <p>No data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {stats.total > 0 && (
        <div className="adherence-stats__insights">
          <h3>Insights & Recommendations</h3>
          <div className="adherence-stats__insight-list">
            {stats.adherenceRate >= 90 && (
              <div className="adherence-stats__insight adherence-stats__insight--success">
                <span className="adherence-stats__insight-icon">🎉</span>
                <p>Excellent job! You're maintaining great medication adherence.</p>
              </div>
            )}
            
            {stats.missed > stats.taken * 0.2 && (
              <div className="adherence-stats__insight adherence-stats__insight--warning">
                <span className="adherence-stats__insight-icon">⚠️</span>
                <p>You've missed more than 20% of your medications. Consider enabling more reminders.</p>
              </div>
            )}
            
            {stats.snoozed > 5 && (
              <div className="adherence-stats__insight adherence-stats__insight--info">
                <span className="adherence-stats__insight-icon">💡</span>
                <p>You frequently snooze reminders. Try adjusting reminder times to match your schedule.</p>
              </div>
            )}
            
            {stats.total < 5 && (
              <div className="adherence-stats__insight adherence-stats__insight--info">
                <span className="adherence-stats__insight-icon">📊</span>
                <p>Keep logging your medications to see more detailed statistics and trends.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdherenceStats

