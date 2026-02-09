export default function ScoreCard({ label, value, subtitle, trend }) {
  return (
    <div className="score-card">
      <div className="score-card-label">{label}</div>
      <div className="score-card-value">{value ?? '-'}</div>
      {subtitle && <div className="score-card-subtitle">{subtitle}</div>}
      {trend != null && (
        <div className={`score-card-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}
        </div>
      )}
    </div>
  )
}
