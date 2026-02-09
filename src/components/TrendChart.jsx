import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#006241', '#00894d', '#4caf50', '#81c784', '#388e3c', '#1b5e20']
const NATIONAL_COLOR = '#9e9e9e'

export default function TrendChart({ data, title, dataKeys, xKey = 'year', nationalData, nationalKeys, yDomain }) {
  if (!data || data.length === 0) return null

  // Slå sammen BPG-data og nasjonale data per år
  const mergedData = data.map(point => {
    const merged = { ...point }
    if (nationalData) {
      const natPoint = nationalData.find(np => np[xKey] === point[xKey])
      if (natPoint) {
        ;(nationalKeys || []).forEach(key => {
          merged[`${key} (nasj.)`] = natPoint[key]
        })
      }
    }
    return merged
  })

  const nationalLineKeys = nationalData && nationalKeys
    ? nationalKeys.map(k => `${k} (nasj.)`)
    : []

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={mergedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 13 }} />
          <YAxis domain={yDomain || [1, 5]} tick={{ fontSize: 13 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 'var(--metis-radius-md, 8px)',
              border: '1px solid #e0e0e0',
            }}
          />
          <Legend />
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
          {nationalLineKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={NATIONAL_COLOR}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={{ r: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
