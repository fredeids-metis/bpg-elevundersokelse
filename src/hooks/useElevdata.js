import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchAvailableYears, fetchAllData, fetchAllNationalData, fetchAllSchoolData, yearIdToLabel, getDataSource } from '../api'

export function useElevdata() {
  const [yearIds, setYearIds] = useState([])
  const [allData, setAllData] = useState(null)
  const [nationalData, setNationalData] = useState(null)
  const [comparisonSchool, setComparisonSchool] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSourceState, setDataSourceState] = useState('live')

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

        const [data, natData] = await Promise.all([
          fetchAllData(years),
          fetchAllNationalData(years),
        ])
        if (cancelled) return
        setAllData(data)
        setNationalData(natData)
        setDataSourceState(getDataSource())
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

  // Hent data for sammenligningsskole når den endres
  useEffect(() => {
    if (!comparisonSchool || !yearIds.length) {
      setComparisonData(null)
      return
    }
    let cancelled = false
    async function loadComparison() {
      const data = await fetchAllSchoolData(yearIds, comparisonSchool.orgNr)
      if (!cancelled) setComparisonData(data)
    }
    loadComparison()
    return () => { cancelled = true }
  }, [comparisonSchool, yearIds])

  const filterRows = useCallback((rows) => {
    if (!rows) return []
    return rows.filter(row => {
      if (selectedYear && row.Skoleaarnavn !== yearIdToLabel(selectedYear)) return false
      if (selectedTrinn !== 'Alle' && row.Trinnnavn && !row.Trinnnavn.includes(getTrinnFilter(selectedTrinn))) return false
      if (selectedKjoenn !== 'Alle' && row.Kjoenn && !row.Kjoenn.includes(selectedKjoenn)) return false
      return true
    })
  }, [selectedYear, selectedTrinn, selectedKjoenn])

  const filteredData = useMemo(() => {
    if (!allData) return null
    return {
      indikatorer: filterRows(allData.indikatorer),
      temaer: filterRows(allData.temaer),
      mobbing: filterRows(allData.mobbing),
      deltakelse: filterRows(allData.deltakelse),
    }
  }, [allData, filterRows])

  const filteredNationalData = useMemo(() => {
    if (!nationalData) return null
    return {
      indikatorer: filterRows(nationalData.indikatorer),
      temaer: filterRows(nationalData.temaer),
      mobbing: filterRows(nationalData.mobbing),
      deltakelse: filterRows(nationalData.deltakelse),
    }
  }, [nationalData, filterRows])

  const filteredComparisonData = useMemo(() => {
    if (!comparisonData) return null
    return {
      indikatorer: filterRows(comparisonData.indikatorer),
      temaer: filterRows(comparisonData.temaer),
      mobbing: filterRows(comparisonData.mobbing),
      deltakelse: filterRows(comparisonData.deltakelse),
    }
  }, [comparisonData, filterRows])

  return {
    yearIds,
    allData,
    filteredData,
    nationalData,
    filteredNationalData,
    comparisonSchool,
    setComparisonSchool,
    comparisonData,
    filteredComparisonData,
    loading,
    error,
    dataSource: dataSourceState,
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
