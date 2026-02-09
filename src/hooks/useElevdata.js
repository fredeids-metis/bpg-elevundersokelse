import { useState, useEffect, useMemo } from 'react'
import { fetchAvailableYears, fetchAllData, yearIdToLabel } from '../api'

export function useElevdata() {
  const [yearIds, setYearIds] = useState([])
  const [allData, setAllData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedTrinn, setSelectedTrinn] = useState('Alle')
  const [selectedKjoenn, setSelectedKjoenn] = useState('Alle')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const years = await fetchAvailableYears()
        if (cancelled) return
        setYearIds(years)

        const data = await fetchAllData(years)
        if (cancelled) return
        setAllData(data)
        setSelectedYear(years[years.length - 1])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredData = useMemo(() => {
    if (!allData) return null

    function matchYear(row) {
      if (!selectedYear) return true
      return row.Skoleaarnavn === yearIdToLabel(selectedYear)
    }

    function matchTrinn(row) {
      if (selectedTrinn === 'Alle') return true
      if (!row.Trinnnavn) return true
      return row.Trinnnavn.includes(getTrinnFilter(selectedTrinn))
    }

    function matchKjoenn(row) {
      if (selectedKjoenn === 'Alle') return true
      if (!row.Kjoenn) return true // Some tables don't have Kjoenn
      return row.Kjoenn.includes(selectedKjoenn)
    }

    function filterRows(rows) {
      return rows.filter(row => matchYear(row) && matchTrinn(row) && matchKjoenn(row))
    }

    return {
      indikatorer: filterRows(allData.indikatorer),
      temaer: filterRows(allData.temaer),
      mobbing: filterRows(allData.mobbing),
      deltakelse: filterRows(allData.deltakelse),
    }
  }, [allData, selectedYear, selectedTrinn, selectedKjoenn])

  return {
    yearIds,
    allData,
    filteredData,
    loading,
    error,
    selectedYear,
    setSelectedYear,
    selectedTrinn,
    setSelectedTrinn,
    selectedKjoenn,
    setSelectedKjoenn,
  }
}

function getTrinnFilter(trinn) {
  switch (trinn) {
    case 'Vg1': return 'trinn 1'
    case 'Vg2': return 'trinn 2'
    case 'Vg3': return 'trinn 3'
    default: return ''
  }
}
