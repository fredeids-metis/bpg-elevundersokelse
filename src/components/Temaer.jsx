import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TrendChart from './TrendChart'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

function getThemeName(row) {
  return row.Temanavn || row.Spoersmaalgruppe || row.Tema || 'Ukjent'
}

export default function Temaer({ filteredData, allData, yearIds }) {
  // For table 153, the data structure has Temanavn, Spoersmaalnavn, Score, AndelBesvart
  const summaryData = useMemo(() => {
    if (!filteredData?.temaer) return []
    // Group by Temanavn, get "Alle svar" rows
    const rows = filteredData.temaer.filter(
      r => r.Kjoenn === 'Alle kjønn' && r.SvaralternativNavn === 'Alle svar'
    )
    // Group by theme name
    const byTheme = {}
    rows.forEach(r => {
      const name = getThemeName(r)
      if (!byTheme[name]) byTheme[name] = []
      byTheme[name].push(r)
    })
    return Object.entries(byTheme).map(([name, themeRows]) => {
      const avgScore = themeRows
        .map(r => parseNorwegianNumber(r.Score))
        .filter(v => v != null)
      const totalBesvart = themeRows
        .map(r => parseNorwegianNumber(r.AntallBesvart))
        .filter(v => v != null)
      return {
        name,
        score: avgScore.length ? avgScore.reduce((a, b) => a + b, 0) / avgScore.length : null,
        antall: totalBesvart.length ? Math.max(...totalBesvart) : null,
      }
    }).filter(d => d.score != null)
  }, [filteredData])

  const themes = useMemo(() => {
    if (!allData?.temaer) return []
    const set = new Set()
    allData.temaer.forEach(r => {
      const name = getThemeName(r)
      if (name !== 'Ukjent' && r.SvaralternativNavn === 'Alle svar') {
        set.add(name)
      }
    })
    return Array.from(set)
  }, [allData])

  const trendData = useMemo(() => {
    if (!allData?.temaer || !yearIds.length || themes.length === 0) return []
    const sorted = sortYearIds(yearIds)
    return sorted.map(yId => {
      const yearLabel = yearIdToLabel(yId)
      const yearRows = allData.temaer.filter(r =>
        r.Skoleaarnavn === yearLabel &&
        r.Kjoenn === 'Alle kjønn' &&
        r.SvaralternativNavn === 'Alle svar'
      )
      const point = { year: yearLabel }
      // Group by theme and average
      const byTheme = {}
      yearRows.forEach(r => {
        const name = getThemeName(r)
        const score = parseNorwegianNumber(r.Score)
        if (score != null) {
          if (!byTheme[name]) byTheme[name] = []
          byTheme[name].push(score)
        }
      })
      Object.entries(byTheme).forEach(([name, scores]) => {
        point[name] = scores.reduce((a, b) => a + b, 0) / scores.length
      })
      return point
    })
  }, [allData, yearIds, themes])

  return (
    <div className="section">
      <h2>Temaresultater</h2>

      {summaryData.length > 0 && (
        <div className="chart-container">
          <h3>Oversikt over temaer</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={summaryData} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#006241" radius={[4, 4, 0, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {trendData.length > 0 && themes.length > 0 && (
        <TrendChart
          data={trendData}
          title="Utvikling over tid - Temaer"
          dataKeys={themes.slice(0, 6)}
        />
      )}

      {filteredData?.temaer?.length > 0 && (
        <div className="data-table-container">
          <h3>Detaljerte resultater</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tema</th>
                <th>Sporsmal</th>
                <th>Svaralternativ</th>
                <th>Trinn</th>
                <th>Kjønn</th>
                <th>Score</th>
                <th>Andel</th>
                <th>Antall</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.temaer
                .filter(r => r.Kjoenn === 'Alle kjønn')
                .slice(0, 200)
                .map((row, i) => (
                  <tr key={i}>
                    <td>{getThemeName(row)}</td>
                    <td className="wrap-cell">{row.Spoersmaalnavn}</td>
                    <td>{row.SvaralternativNavn}</td>
                    <td>{row.Trinnnavn}</td>
                    <td>{row.Kjoenn}</td>
                    <td className="num">{parseNorwegianNumber(row.Score)?.toFixed(1) ?? '-'}</td>
                    <td className="num">
                      {parseNorwegianNumber(row.AndelBesvart) != null
                        ? `${parseNorwegianNumber(row.AndelBesvart).toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="num">{parseNorwegianNumber(row.AntallBesvart)?.toFixed(0) ?? '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filteredData.temaer.filter(r => r.Kjoenn === 'Alle kjønn').length > 200 && (
            <p className="table-note">Viser de forste 200 radene av {filteredData.temaer.filter(r => r.Kjoenn === 'Alle kjønn').length} totalt.</p>
          )}
        </div>
      )}
    </div>
  )
}
