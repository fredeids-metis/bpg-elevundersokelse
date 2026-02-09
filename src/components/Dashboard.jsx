import { useMemo } from 'react'
import ScoreCard from './ScoreCard'
import TrendChart from './TrendChart'
import { parseNorwegianNumber, yearIdToLabel, sortYearIds } from '../api'

function extractIndicatorScores(data) {
  if (!data) return {}
  const rows = data.filter(
    r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
  )
  const scores = {}
  rows.forEach(r => {
    const group = r.Spoersmaalgruppe
    const score = parseNorwegianNumber(r.Score)
    if (group && score != null) scores[group] = score
  })
  return scores
}

function extractMobbingAndel(data) {
  if (!data) return null
  const row = data.find(
    r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål' &&
      r.Spoersmaalgruppe === 'Mobbing på skolen'
  ) || data.find(
    r => r.Kjoenn === 'Alle kjønn' && r.Spoersmaalnavn === 'Alle spørsmål'
  )
  if (!row) return null
  return parseNorwegianNumber(row.AndelMobbet)
}

function extractDeltakelse(data) {
  if (!data?.length) return null
  const alleRow = data.find(r => r.Trinnnavn?.includes('Alle'))
  if (alleRow) return parseNorwegianNumber(alleRow.AndelDeltatt)
  const andeler = data.map(r => parseNorwegianNumber(r.AndelDeltatt)).filter(v => v != null)
  if (andeler.length === 0) return null
  return andeler.reduce((a, b) => a + b, 0) / andeler.length
}

function buildTrendData(allData, yearIds, indicatorGroups) {
  if (!allData?.indikatorer || !yearIds.length) return []
  const sorted = sortYearIds(yearIds)
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
}

export default function Dashboard({ filteredData, allData, yearIds, selectedYear, filteredNationalData, nationalData, filteredComparisonData, comparisonSchool }) {
  const indicatorGroups = ['Trivsel', 'Mestring', 'Læringskultur', 'Motivasjon', 'Støtte fra lærerne', 'Vurdering for læring']

  const keyScores = useMemo(() => extractIndicatorScores(filteredData?.indikatorer), [filteredData])
  const nationalScores = useMemo(() => extractIndicatorScores(filteredNationalData?.indikatorer), [filteredNationalData])
  const comparisonScores = useMemo(() => extractIndicatorScores(filteredComparisonData?.indikatorer), [filteredComparisonData])

  const deltakelse = useMemo(() => extractDeltakelse(filteredData?.deltakelse), [filteredData])
  const mobbingAndel = useMemo(() => extractMobbingAndel(filteredData?.mobbing), [filteredData])
  const nationalMobbing = useMemo(() => extractMobbingAndel(filteredNationalData?.mobbing), [filteredNationalData])
  const comparisonMobbing = useMemo(() => extractMobbingAndel(filteredComparisonData?.mobbing), [filteredComparisonData])

  const trendData = useMemo(() => buildTrendData(allData, yearIds, indicatorGroups), [allData, yearIds])
  const nationalTrendData = useMemo(() => buildTrendData(nationalData, yearIds, indicatorGroups), [nationalData, yearIds])

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
          <ScoreCard
            label="Trivsel"
            value={keyScores['Trivsel'].toFixed(1)}
            subtitle="av 5.0"
            national={nationalScores['Trivsel']}
            comparison={comparisonScores['Trivsel']}
            comparisonLabel={comparisonSchool?.name}
          />
        )}
        {keyScores['Mestring'] != null && (
          <ScoreCard
            label="Mestring"
            value={keyScores['Mestring'].toFixed(1)}
            subtitle="av 5.0"
            national={nationalScores['Mestring']}
            comparison={comparisonScores['Mestring']}
            comparisonLabel={comparisonSchool?.name}
          />
        )}
        {keyScores['Læringskultur'] != null && (
          <ScoreCard
            label="Laeringskultur"
            value={keyScores['Læringskultur'].toFixed(1)}
            subtitle="av 5.0"
            national={nationalScores['Læringskultur']}
            comparison={comparisonScores['Læringskultur']}
            comparisonLabel={comparisonSchool?.name}
          />
        )}
        {keyScores['Motivasjon'] != null && (
          <ScoreCard
            label="Motivasjon"
            value={keyScores['Motivasjon'].toFixed(1)}
            subtitle="av 5.0"
            national={nationalScores['Motivasjon']}
            comparison={comparisonScores['Motivasjon']}
            comparisonLabel={comparisonSchool?.name}
          />
        )}
        {mobbingAndel != null && (
          <ScoreCard
            label="Mobbing"
            value={mobbingAndel.toFixed(1)}
            subtitle="andel mobbet"
            national={nationalMobbing}
            comparison={comparisonMobbing}
            comparisonLabel={comparisonSchool?.name}
            isPercentage
          />
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
          nationalData={nationalTrendData}
          nationalKeys={trendKeys}
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
                <th>BPG Score</th>
                <th>Nasjonalt</th>
                <th>Diff</th>
                <th>Std.avvik</th>
                <th>Antall</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.indikatorer
                .filter(r => r.Kjoenn === 'Alle kjønn')
                .map((row, i) => {
                  const score = parseNorwegianNumber(row.Score)
                  const natRow = filteredNationalData?.indikatorer?.find(
                    nr => nr.Spoersmaalgruppe === row.Spoersmaalgruppe &&
                      nr.Spoersmaalnavn === row.Spoersmaalnavn &&
                      nr.Kjoenn === 'Alle kjønn'
                  )
                  const natScore = natRow ? parseNorwegianNumber(natRow.Score) : null
                  const diff = (score != null && natScore != null) ? score - natScore : null
                  return (
                    <tr key={i}>
                      <td>{row.Spoersmaalgruppe}</td>
                      <td>{row.Spoersmaalnavn}</td>
                      <td>{row.Trinnnavn}</td>
                      <td className="num">{score?.toFixed(1) ?? '-'}</td>
                      <td className="num">{natScore?.toFixed(1) ?? '-'}</td>
                      <td className={`num ${diff != null ? (diff >= 0 ? 'diff-positive' : 'diff-negative') : ''}`}>
                        {diff != null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}` : '-'}
                      </td>
                      <td className="num">{parseNorwegianNumber(row.Standardavvik)?.toFixed(2) ?? '-'}</td>
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
