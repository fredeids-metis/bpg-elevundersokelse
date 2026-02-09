import { useState } from 'react'
import { useElevdata } from './hooks/useElevdata'
import Filter from './components/Filter'
import Dashboard from './components/Dashboard'
import Indikatorer from './components/Indikatorer'
import Temaer from './components/Temaer'
import Mobbing from './components/Mobbing'
import Deltakelse from './components/Deltakelse'
import Loading from './components/Loading'
import ErrorMessage from './components/ErrorMessage'
import DataSourceBadge from './components/DataSourceBadge'
import './App.css'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'indikatorer', label: 'Indikatorer' },
  { id: 'temaer', label: 'Temaer' },
  { id: 'mobbing', label: 'Mobbing' },
  { id: 'deltakelse', label: 'Deltakelse' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const {
    yearIds,
    allData,
    filteredData,
    loading,
    error,
    dataSource,
    selectedYear,
    setSelectedYear,
    selectedTrinn,
    setSelectedTrinn,
    selectedKjoenn,
    setSelectedKjoenn,
  } = useElevdata()

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <h1>Bergen Private Gymnas</h1>
            <DataSourceBadge source={dataSource} />
          </div>
          <p className="header-subtitle">Elevundersokelsen</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <Filter
          yearIds={yearIds}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedTrinn={selectedTrinn}
          onTrinnChange={setSelectedTrinn}
          selectedKjoenn={selectedKjoenn}
          onKjoennChange={setSelectedKjoenn}
        />

        {activeTab === 'dashboard' && (
          <Dashboard
            filteredData={filteredData}
            allData={allData}
            yearIds={yearIds}
            selectedYear={selectedYear}
          />
        )}
        {activeTab === 'indikatorer' && (
          <Indikatorer
            filteredData={filteredData}
            allData={allData}
            yearIds={yearIds}
          />
        )}
        {activeTab === 'temaer' && (
          <Temaer
            filteredData={filteredData}
            allData={allData}
            yearIds={yearIds}
          />
        )}
        {activeTab === 'mobbing' && (
          <Mobbing
            filteredData={filteredData}
            allData={allData}
            yearIds={yearIds}
          />
        )}
        {activeTab === 'deltakelse' && (
          <Deltakelse
            filteredData={filteredData}
            allData={allData}
            yearIds={yearIds}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Data hentet fra <a href="https://www.udir.no/tall-og-forskning/brukerundersokelser/elevundersokelsen/" target="_blank" rel="noopener noreferrer">Utdanningsdirektoratets Elevundersokelse</a></p>
        <p>Bergen Private Gymnas - Metis Utdanning AS</p>
      </footer>
    </div>
  )
}
