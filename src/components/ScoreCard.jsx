export default function ScoreCard({ label, value, subtitle, trend, national, comparison, comparisonLabel, isPercentage }) {
  const diff = (value != null && national != null) ? (parseFloat(value) - national) : null

  return (
    <div className="score-card">
      <div className="score-card-label">{label}</div>
      <div className="score-card-value">{value ?? '-'}{isPercentage ? '%' : ''}</div>
      {subtitle && <div className="score-card-subtitle">{subtitle}</div>}
      {trend != null && (
        <div className={`score-card-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}
        </div>
      )}
      {national != null && (
        <div className="score-card-comparison">
          <span className="comparison-label">Nasjonalt:</span>
          <span className="comparison-value">{national.toFixed(1)}{isPercentage ? '%' : ''}</span>
          {diff != null && (
            <span className={`comparison-diff ${diff >= 0 ? (isPercentage ? 'negative' : 'positive') : (isPercentage ? 'positive' : 'negative')}`}>
              {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
            </span>
          )}
        </div>
      )}
      {comparison != null && comparisonLabel && (
        <div className="score-card-comparison">
          <span className="comparison-label">{comparisonLabel}:</span>
          <span className="comparison-value">{comparison.toFixed(1)}{isPercentage ? '%' : ''}</span>
        </div>
      )}
    </div>
  )
}
