import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

const COLORS = ['#c62828', '#d32f2f', '#e53935', '#ef5350', '#ef9a9a', '#b71c1c']

export default function Mobbing({ filteredData, allData, yearIds }) {
  const barData = useMemo(() => {
    if (!filteredData?.mobbing) return []
    const rows = filteredData.mobbing.filter(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
    )
    return rows
      .map(r => ({
        name: r.Spoersmaalgruppe,
        andel: parseNorwegianNumber(r.AndelMobbet),
        antall: parseNorwegianNumber(r.AntallBesvart),
      }))
      .filter(d => d.andel != null)
  }, [filteredData])

  const mobbingTypes = useMemo(() => {
    if (!allData?.mobbing) return []
    const set = new Set()
    allData.mobbing.forEach(r => {
      if (r.Spoersmaalgruppe && r.Spoersmaalnavn === 'Alle spørsmål' && r.Kjoenn === 'Alle kjønn') {
        set.add(r.Spoersmaalgruppe)
      }
    })
    return Array.from(set)
  }, [allData])

  const trendData = useMemo(() => {
    if (!allData?.mobbing || !yearIds.length) return []
    const sorted = sortYearIds(yearIds)
    return sorted.map(yId => {
      const yearLabel = yearIdToLabel(yId)
      const yearRows = allData.mobbing.filter(r =>
        r.Skoleaarnavn === yearLabel &&
        r.Kjoenn === 'Alle kjønn' &&
        r.Spoersmaalnavn === 'Alle spørsmål'
      )
      const point = { year: yearLabel }
      yearRows.forEach(r => {
        const name = r.Spoersmaalgruppe
        const andel = parseNorwegianNumber(r.AndelMobbet)
        if (andel != null && name) point[name] = andel
      })
      return point
    })
  }, [allData, yearIds])

  return (
    <div className="section">
      <h2>Mobbing</h2>

      {barData.length > 0 && (
        <div className="chart-container">
          <h3>Andel elever som opplever mobbing (%)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 12 }} interval={0} />
              <YAxis tick={{ fontSize: 13 }} unit="%" />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Andel mobbet']} />
              <Bar dataKey="andel" fill="#c62828" radius={[4, 4, 0, 0]} name="Andel mobbet" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {trendData.length > 0 && mobbingTypes.length > 0 && (
        <div className="chart-container">
          <h3>Mobbing over tid (%)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} unit="%" />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`]} />
              <Legend />
              {mobbingTypes.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {filteredData?.mobbing?.length > 0 && (
        <div className="data-table-container">
          <h3>Detaljerte resultater</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Sporsmal</th>
                <th>Trinn</th>
                <th>Kjønn</th>
                <th>Andel mobbet</th>
                <th>Antall besvart</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.mobbing.map((row, i) => (
                <tr key={i}>
                  <td>{row.Spoersmaalgruppe}</td>
                  <td>{row.Spoersmaalnavn}</td>
                  <td>{row.Trinnnavn}</td>
                  <td>{row.Kjoenn}</td>
                  <td className="num">
                    {parseNorwegianNumber(row.AndelMobbet) != null
                      ? `${parseNorwegianNumber(row.AndelMobbet).toFixed(1)}%`
                      : '-'}
                  </td>
                  <td className="num">{parseNorwegianNumber(row.AntallBesvart)?.toFixed(0) ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
