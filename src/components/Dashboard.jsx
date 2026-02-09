import { useMemo } from 'react'
import ScoreCard from './ScoreCard'
import TrendChart from './TrendChart'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

export default function Dashboard({ filteredData, allData, yearIds, selectedYear }) {
  const keyScores = useMemo(() => {
    if (!filteredData?.indikatorer) return {}
    const rows = filteredData.indikatorer.filter(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
    )
    const scores = {}
    rows.forEach(r => {
      const group = r.Spoersmaalgruppe
      const score = parseNorwegianNumber(r.Score)
      if (group && score != null) {
        scores[group] = score
      }
    })
    return scores
  }, [filteredData])

  const deltakelse = useMemo(() => {
    if (!filteredData?.deltakelse) return null
    const rows = filteredData.deltakelse
    if (!rows.length) return null
    // Sum up or find an "alle trinn" row
    const alleRow = rows.find(r => r.Trinnnavn?.includes('Alle'))
    if (alleRow) {
      return parseNorwegianNumber(alleRow.AndelDeltatt)
    }
    // Average across trinn
    const andeler = rows
      .map(r => parseNorwegianNumber(r.AndelDeltatt))
      .filter(v => v != null)
    if (andeler.length === 0) return null
    return andeler.reduce((a, b) => a + b, 0) / andeler.length
  }, [filteredData])

  const mobbingAndel = useMemo(() => {
    if (!filteredData?.mobbing) return null
    const row = filteredData.mobbing.find(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål' &&
        r.Spoersmaalgruppe === 'Mobbing på skolen'
    ) || filteredData.mobbing.find(
      r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
    )
    if (!row) return null
    return parseNorwegianNumber(row.AndelMobbet)
  }, [filteredData])

  const trendData = useMemo(() => {
    if (!allData?.indikatorer || !yearIds.length) return []
    const sorted = sortYearIds(yearIds)
    const indicatorGroups = ['Trivsel', 'Mestring', 'Læringskultur', 'Motivasjon', 'Støtte fra lærerne', 'Vurdering for læring']

    return sorted.map(yId => {
      const yearLabel = yearIdToLabel(yId)
      const yearRows = allData.indikatorer.filter(r =>
        r.Skoleaarnavn === yearLabel &&
        r.Kjoenn === 'Alle kjønn' &&
        r.Spoersmaalnavn === 'Alle spørsmål'
      )
      const point = { year: yearLabel }
      yearRows.forEach(r => {
        const group = r.Spoersmaalgruppe
        if (indicatorGroups.includes(group)) {
          const score = parseNorwegianNumber(r.Score)
          if (score != null) point[group] = score
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
    <div className="dashboard">
      <div className="score-cards-grid">
        {keyScores['Trivsel'] != null && (
          <ScoreCard label="Trivsel" value={keyScores['Trivsel'].toFixed(1)} subtitle="av 5.0" />
        )}
        {keyScores['Mestring'] != null && (
          <ScoreCard label="Mestring" value={keyScores['Mestring'].toFixed(1)} subtitle="av 5.0" />
        )}
        {keyScores['Læringskultur'] != null && (
          <ScoreCard label="Laeringskultur" value={keyScores['Læringskultur'].toFixed(1)} subtitle="av 5.0" />
        )}
        {keyScores['Motivasjon'] != null && (
          <ScoreCard label="Motivasjon" value={keyScores['Motivasjon'].toFixed(1)} subtitle="av 5.0" />
        )}
        {mobbingAndel != null && (
          <ScoreCard label="Mobbing" value={`${mobbingAndel.toFixed(1)}%`} subtitle="andel mobbet" />
        )}
        {deltakelse != null && (
          <ScoreCard label="Deltakelse" value={`${deltakelse.toFixed(0)}%`} subtitle="svarprosent" />
        )}
      </div>

      {trendData.length > 0 && trendKeys.length > 0 && (
        <TrendChart
          data={trendData}
          title="Utvikling over tid - Hovedindikatorer"
          dataKeys={trendKeys}
        />
      )}

      {filteredData?.indikatorer?.length > 0 && (
        <div className="data-table-container">
          <h3>Alle indikatorer - {selectedYear ? yearIdToLabel(selectedYear) : ''}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Indikator</th>
                <th>Sporsmal</th>
                <th>Trinn</th>
                <th>Score</th>
                <th>Std.avvik</th>
                <th>Antall besvart</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.indikatorer
                .filter(r => r.Kjoenn === 'Alle kjønn')
                .map((row, i) => (
                  <tr key={i}>
                    <td>{row.Spoersmaalgruppe}</td>
                    <td>{row.Spoersmaalnavn}</td>
                    <td>{row.Trinnnavn}</td>
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
