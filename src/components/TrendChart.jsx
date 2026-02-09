import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#006241', '#00894d', '#4caf50', '#81c784', '#388e3c', '#1b5e20']

export default function TrendChart({ data, title, dataKeys, xKey = 'year' }) {
  if (!data || data.length === 0) return null

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 13 }} />
          <YAxis domain={[1, 5]} tick={{ fontSize: 13 }} />
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
