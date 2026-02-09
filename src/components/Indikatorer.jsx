import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TrendChart from './TrendChart'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

export default function Indikatorer({ filteredData, allData, yearIds }) {
  const barData = useMemo(() => {
    if (!filteredData?.indikatorer) return []
    const rows = filteredData.indikatorer.filter(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
    )
    return rows
      .map(r => ({
        name: r.Spoersmaalgruppe,
        score: parseNorwegianNumber(r.Score),
      }))
      .filter(d => d.score != null)
  }, [filteredData])

  const groups = useMemo(() => {
    if (!allData?.indikatorer) return []
    const set = new Set()
    allData.indikatorer.forEach(r => {
      if (r.Spoersmaalgruppe && r.Spoersmaalnavn === 'Alle spørsmål' && r.Kjoenn === 'Alle kjønn') {
        set.add(r.Spoersmaalgruppe)
      }
    })
    return Array.from(set)
  }, [allData])

  const trendData = useMemo(() => {
    if (!allData?.indikatorer || !yearIds.length) return []
    const sorted = sortYearIds(yearIds)
    return sorted.map(yId => {
      const yearLabel = yearIdToLabel(yId)
      const yearRows = allData.indikatorer.filter(r =>
        (String(r.TidID) === String(yId) || r.Skoleaarnavn === yearLabel) &&
        r.Kjoenn === 'Alle kjønn' &&
        r.Spoersmaalnavn === 'Alle spørsmål'
      )
      const point = { year: yearLabel }
      yearRows.forEach(r => {
        const score = parseNorwegianNumber(r.Score)
        if (score != null) point[r.Spoersmaalgruppe] = score
      })
      return point
    })
  }, [allData, yearIds])

  return (
    <div className="section">
      <h2>Indikatorer - Læringsmiljø</h2>

      {barData.length > 0 && (
        <div className="chart-container">
          <h3>Oversikt over indikatorer</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#006241" radius={[4, 4, 0, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {trendData.length > 0 && groups.length > 0 && (
        <TrendChart
          data={trendData}
          title="Utvikling over tid"
          dataKeys={groups}
        />
      )}

      {filteredData?.indikatorer?.length > 0 && (
        <div className="data-table-container">
          <h3>Detaljerte resultater</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Indikator</th>
                <th>Sporsmal</th>
                <th>Trinn</th>
                <th>Kjønn</th>
                <th>Score</th>
                <th>Std.avvik</th>
                <th>Antall</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.indikatorer.map((row, i) => (
                <tr key={i}>
                  <td>{row.Spoersmaalgruppe}</td>
                  <td>{row.Spoersmaalnavn}</td>
                  <td>{row.Trinnnavn}</td>
                  <td>{row.Kjoenn}</td>
                  <td className="num">{parseNorwegianNumber(row.Score)?.toFixed(1) ?? '-'}</td>
                  <td className="num">{parseNorwegianNumber(row.Standardavvik)?.toFixed(2) ?? '-'}</td>
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
