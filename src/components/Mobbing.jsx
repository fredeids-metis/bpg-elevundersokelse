import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

const COLORS = ['#c62828', '#d32f2f', '#e53935', '#ef5350', '#ef9a9a', '#b71c1c']
const NATIONAL_COLOR = '#9e9e9e'

function buildMobbingTrend(allData, yearIds, mobbingTypes) {
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
}

export default function Mobbing({ filteredData, allData, yearIds, filteredNationalData, nationalData }) {
  const barData = useMemo(() => {
    if (!filteredData?.mobbing) return []
    const rows = filteredData.mobbing.filter(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
    )
    const natRows = filteredNationalData?.mobbing?.filter(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
    ) || []

    return rows
      .map(r => {
        const natRow = natRows.find(nr => nr.Spoersmaalgruppe === r.Spoersmaalgruppe)
        return {
          name: r.Spoersmaalgruppe,
          'BPG': parseNorwegianNumber(r.AndelMobbet),
          'Nasjonalt': natRow ? parseNorwegianNumber(natRow.AndelMobbet) : null,
          antall: parseNorwegianNumber(r.AntallBesvart),
        }
      })
      .filter(d => d['BPG'] != null)
  }, [filteredData, filteredNationalData])

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

  const trendData = useMemo(() => buildMobbingTrend(allData, yearIds, mobbingTypes), [allData, yearIds, mobbingTypes])
  const nationalTrendData = useMemo(() => buildMobbingTrend(nationalData, yearIds, mobbingTypes), [nationalData, yearIds, mobbingTypes])

  return (
    <div className="section">
      <h2>Mobbing</h2>

      {barData.length > 0 && (
        <div className="chart-container">
          <h3>Andel elever som opplever mobbing (%) - BPG vs. Nasjonalt</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 12 }} interval={0} />
              <YAxis tick={{ fontSize: 13 }} unit="%" />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`]} />
              <Legend />
              <Bar dataKey="BPG" fill="#c62828" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Nasjonalt" fill="#9e9e9e" radius={[4, 4, 0, 0]} />
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
                <th>BPG</th>
                <th>Nasjonalt</th>
                <th>Diff</th>
                <th>Antall</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.mobbing.map((row, i) => {
                const andel = parseNorwegianNumber(row.AndelMobbet)
                const natRow = filteredNationalData?.mobbing?.find(
                  nr => nr.Spoersmaalgruppe === row.Spoersmaalgruppe &&
                    nr.Spoersmaalnavn === row.Spoersmaalnavn &&
                    nr.Kjoenn === row.Kjoenn
                )
                const natAndel = natRow ? parseNorwegianNumber(natRow.AndelMobbet) : null
                const diff = (andel != null && natAndel != null) ? andel - natAndel : null
                return (
                  <tr key={i}>
                    <td>{row.Spoersmaalgruppe}</td>
                    <td>{row.Spoersmaalnavn}</td>
                    <td>{row.Trinnnavn}</td>
                    <td>{row.Kjoenn}</td>
                    <td className="num">
                      {andel != null ? `${andel.toFixed(1)}%` : '-'}
                    </td>
                    <td className="num">
                      {natAndel != null ? `${natAndel.toFixed(1)}%` : '-'}
                    </td>
                    <td className={`num ${diff != null ? (diff <= 0 ? 'diff-positive' : 'diff-negative') : ''}`}>
                      {diff != null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}` : '-'}
                    </td>
                    <td className="num">{parseNorwegianNumber(row.AntallBesvart)?.toFixed(0) ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
