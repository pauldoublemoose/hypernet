import { useLayoutEffect, useMemo, useState } from 'react'
import {
  ADMIN_COLUMNS,
  cellValue,
  loadAdminSignups,
  type AdminColumnId,
} from '../../lib/adminStore'
import { useKeys } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

export function AdminTableScreen({
  onBack,
  setMode,
}: {
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const rows = useMemo(() => loadAdminSignups(), [])
  const [hidden, setHidden] = useState<Set<AdminColumnId>>(() => new Set())
  const [sortBy, setSortBy] = useState<AdminColumnId>('full_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      onBack()
    }
  })

  const visible = ADMIN_COLUMNS.filter((c) => !hidden.has(c.id))

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = cellValue(a, sortBy).toLowerCase()
      const bv = cellValue(b, sortBy).toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [rows, sortBy, sortDir])

  const toggleHide = (id: AdminColumnId) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      // keep at least one column visible
      if (ADMIN_COLUMNS.length - next.size <= 1) return prev
      next.add(id)
      if (sortBy === id) {
        const fallback = ADMIN_COLUMNS.find((c) => !next.has(c.id))
        if (fallback) setSortBy(fallback.id)
      }
      return next
    })
  }

  const cycleSort = (id: AdminColumnId) => {
    if (sortBy === id) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(id)
      setSortDir('asc')
    }
  }

  return (
    <div className="screen admin-screen">
      <div className="title">A :: LEDGER</div>
      <div className="q-text">
        {rows.length} NODE{rows.length === 1 ? '' : 'S'} · SORT BY [{sortBy.toUpperCase()}]{' '}
        {sortDir === 'asc' ? '↑' : '↓'}
      </div>

      <div className="admin-cols" role="group" aria-label="Columns">
        {ADMIN_COLUMNS.map((c) => {
          const isHidden = hidden.has(c.id)
          const isSort = sortBy === c.id
          return (
            <div key={c.id} className={`admin-col-ctrl ${isHidden ? 'off' : ''} ${isSort ? 'sort' : ''}`}>
              <button
                type="button"
                className="net-toggle"
                onClick={() => toggleHide(c.id)}
                title={isHidden ? 'Show column' : 'Hide column'}
              >
                [{isHidden ? '□' : '■'} {c.label}]
              </button>
              {!isHidden && (
                <button
                  type="button"
                  className={`net-toggle ${isSort ? 'on' : ''}`}
                  onClick={() => cycleSort(c.id)}
                  title="Sort by this column"
                >
                  [SORT{isSort ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}]
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="admin-table-wrap">
        {sorted.length === 0 ? (
          <div className="dim">NO SIGNUPS ARCHIVED YET.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {visible.map((c) => (
                  <th key={c.id}>
                    <button type="button" className="admin-th-btn" onClick={() => cycleSort(c.id)}>
                      {c.label}
                      {sortBy === c.id ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i}>
                  {visible.map((c) => (
                    <td key={c.id}>{cellValue(row, c.id) || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="btn-row">
        <button className="btn dim" onClick={onBack}>
          [ BACK ]
        </button>
      </div>
      <div className="screen-hint">TOGGLE columns · SORT sets order · BACKSPACE leaves</div>
    </div>
  )
}
