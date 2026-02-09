const BASE_URL = 'https://api.statistikkbanken.udir.no/api/rest/v2/Eksport'
const ORG_NR = '988602671'

export const TABLE_IDS = {
  INDIKATORER: 152,
  TEMAER: 153,
  MOBBING: 154,
  DELTAKELSE: 155,
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

export async function fetchAvailableYears() {
  const res = await fetch(
    `${BASE_URL}/152/filterStatus?filterId=TidID&filter=TidID(*)`
  )
  if (!res.ok) throw new Error(`Feil ved henting av tilgjengelige ar: ${res.status}`)
  const data = await res.json()
  return sortYearIds(data.TidID || [])
}

export async function fetchTableData(tableId, yearIds) {
  if (!yearIds.length) return []
  const yearFilter = yearIds.join('_')
  const url = `${BASE_URL}/${tableId}/data?filter=TidID(${yearFilter})_Organisasjonsnummer(${ORG_NR})&format=0&sideNummer=1&antallRader=10000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Feil ved henting av data fra tabell ${tableId}: ${res.status}`)
  const data = await res.json()
  return data.data || data || []
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
