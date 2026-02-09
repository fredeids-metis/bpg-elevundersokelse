import { yearIdToLabel } from '../api'

export default function Filter({
  yearIds,
  selectedYear,
  onYearChange,
  selectedTrinn,
  onTrinnChange,
  selectedKjoenn,
  onKjoennChange,
}) {
  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label htmlFor="year-select">Skoleår</label>
        <select
          id="year-select"
          value={selectedYear || ''}
          onChange={e => onYearChange(Number(e.target.value))}
        >
          {yearIds.map(id => (
            <option key={id} value={id}>{yearIdToLabel(id)}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="trinn-select">Trinn</label>
        <select
          id="trinn-select"
          value={selectedTrinn}
          onChange={e => onTrinnChange(e.target.value)}
        >
          <option value="Alle">Alle trinn</option>
          <option value="Vg1">Vg1</option>
          <option value="Vg2">Vg2</option>
          <option value="Vg3">Vg3</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="kjoenn-select">Kjønn</label>
        <select
          id="kjoenn-select"
          value={selectedKjoenn}
          onChange={e => onKjoennChange(e.target.value)}
        >
          <option value="Alle">Alle kjønn</option>
          <option value="Gutt">Gutt</option>
          <option value="Jente">Jente</option>
        </select>
      </div>
    </div>
  )
}
