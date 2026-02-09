import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

export default function Deltakelse({ filteredData, allData, yearIds }) {
  const trendData = useMemo(() => {
    if (!allData?.deltakelse || !yearIds.length) return []
    const sorted = sortYearIds(yearIds)
    return sorted.map(yId => {
      const yearLabel = yearIdToLabel(yId)
      const yearRows = allData.deltakelse.filter(r =>
        r.Skoleaarnavn === yearLabel
      )
      const point = { year: yearLabel }
      yearRows.forEach(r => {
        const trinn = r.Trinnnavn || 'Ukjent'
        const andel = parseNorwegianNumber(r.AndelDeltatt)
        if (andel != null) {
          point[trinn] = andel
        }
      })
      return point
    })
  }, [allData, yearIds])

  const trendKeys = useMemo(() => {
    if (!trendData.length) return []
    const allKeys = new Set()
    trendData.forEach(p => Object.keys(p).forEach(k => { if (k !== 'year') allKeys.add(k) }))
    return Array.from(allKeys)
  }, [trendData])

  return (
    <div className="section">
      <h2>Deltakelse</h2>

      {trendData.length > 0 && trendKeys.length > 0 && (
        <div className="chart-container">
          <h3>Svarprosent over tid</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 13 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 13 }} unit="%" />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`]} />
              <Legend />
              {trendKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={['#006241', '#00894d', '#4caf50', '#81c784'][i % 4]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {filteredData?.deltakelse?.length > 0 && (
        <div className="data-table-container">
          <h3>Deltakelsesdata</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trinn</th>
                <th>Eierform</th>
                <th>Antall invitert</th>
                <th>Antall besvart</th>
                <th>Andel deltatt</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.deltakelse.map((row, i) => (
                <tr key={i}>
                  <td>{row.Trinnnavn}</td>
                  <td>{row.EierformNavn}</td>
                  <td className="num">{parseNorwegianNumber(row.AntallInvitert)?.toFixed(0) ?? '-'}</td>
                  <td className="num">{parseNorwegianNumber(row.AntallBesvart)?.toFixed(0) ?? '-'}</td>
                  <td className="num">
                    {parseNorwegianNumber(row.AndelDeltatt) != null
                      ? `${parseNorwegianNumber(row.AndelDeltatt).toFixed(1)}%`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
