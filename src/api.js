const BASE_URL = 'https://api.statistikkbanken.udir.no/api/rest/v2/Eksport'
const ORG_NR = '988602671'

export const TABLE_IDS = {
  INDIKATORER: 152,
  TEMAER: 153,
  MOBBING: 154,
  DELTAKELSE: 155,
}

// Tracks whether we're using live or fallback data
let dataSource = 'live'

export function getDataSource() {
  return dataSource
}

export function parseNorwegianNumber(value) {
  if (value == null || value === '') return null
  const cleaned = String(value).replace(/\s/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

export function yearIdToLabel(yearId) {
  const str = String(yearId)
  const year = parseInt(str.substring(0, 4), 10)
  const nextYear = String(year + 1).substring(2)
  return `${year}-${nextYear}`
}

export function sortYearIds(yearIds) {
  return [...yearIds].sort((a, b) => a - b)
}

async function fetchFallbackTable(tableId) {
  const res = await fetch(`${import.meta.env.BASE_URL}data/tabell_${tableId}.json`)
  if (!res.ok) throw new Error(`Kunne ikke laste fallback-data for tabell ${tableId}`)
  return res.json()
}

async function fetchFallbackYears() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/years.json`)
  if (!res.ok) throw new Error('Kunne ikke laste fallback years.json')
  const data = await res.json()
  return sortYearIds(data.TidID || [])
}

export async function fetchAvailableYears() {
  try {
    const res = await fetch(
      `${BASE_URL}/152/filterStatus?filterId=TidID&filter=TidID(*)`
    )
    if (!res.ok) throw new Error(`API-feil: ${res.status}`)
    const data = await res.json()
    dataSource = 'live'
    return sortYearIds(data.TidID || [])
  } catch (error) {
    console.warn('API feil ved henting av ar, bruker fallback:', error.message)
    dataSource = 'fallback'
    return fetchFallbackYears()
  }
}

export async function fetchTableData(tableId, yearIds) {
  if (!yearIds.length) return []
  try {
    const yearFilter = yearIds.join('_')
    const url = `${BASE_URL}/${tableId}/data?filter=TidID(${yearFilter})_Organisasjonsnummer(${ORG_NR})&format=0&sideNummer=1&antallRader=10000`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`API-feil: ${res.status}`)
    const data = await res.json()
    return data.data || data || []
  } catch (error) {
    console.warn(`API feil for tabell ${tableId}, bruker fallback:`, error.message)
    dataSource = 'fallback'
    return fetchFallbackTable(tableId)
  }
}

export async function fetchAllData(yearIds) {
  const [indikatorer, temaer, mobbing, deltakelse] = await Promise.all([
    fetchTableData(TABLE_IDS.INDIKATORER, yearIds),
    fetchTableData(TABLE_IDS.TEMAER, yearIds),
    fetchTableData(TABLE_IDS.MOBBING, yearIds),
    fetchTableData(TABLE_IDS.DELTAKELSE, yearIds),
  ])
  return { indikatorer, temaer, mobbing, deltakelse }
}
