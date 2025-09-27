import './LoadingSpinner.css'

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '',
  text = '' 
}) => {
  const sizeClass = `loading-spinner--${size}`
  const colorClass = `loading-spinner--${color}`

  return (
    <div className={`loading-spinner ${sizeClass} ${colorClass} ${className}`}>
      <div className="loading-spinner__circle">
        <div className="loading-spinner__inner"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
