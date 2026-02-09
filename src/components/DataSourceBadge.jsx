export default function DataSourceBadge({ source }) {
  const isLive = source === 'live'
  return (
    <span className={`data-source-badge ${isLive ? 'live' : 'offline'}`}>
      <span className="badge-dot" />
      {isLive ? 'Live data' : 'Offline data'}
    </span>
  )
}
