import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  ADMIN_COLUMNS,
  cellValue,
  loadAdminSignups,
  setSignupGhosted,
  signupFingerprint,
  type AdminColumnId,
  type SignupRow,
} from '../../lib/adminStore'
import { fetchAllSignups, setSignupGhostedRemote } from '../../lib/auth'
import { useKeys } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type Source = 'loading' | 'db' | 'local'

export function AdminTableScreen({
  onBack,
  setMode,
}: {
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [rows, setRows] = useState<SignupRow[]>([])
  const [source, setSource] = useState<Source>('loading')
  const [hidden, setHidden] = useState<Set<AdminColumnId>>(() => new Set())
  const [sortBy, setSortBy] = useState<AdminColumnId>('full_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showGhosted, setShowGhosted] = useState(true)
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

  // The database is the ledger; the local archive is only a fallback when
  // the uplink is down (it can only see this browser's signups).
  useEffect(() => {
    let alive = true
    fetchAllSignups().then((remote) => {
      if (!alive) return
      if (remote) {
        setRows(remote)
        setSource('db')
      } else {
        setRows(loadAdminSignups())
        setSource('local')
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const visible = ADMIN_COLUMNS.filter((c) => !hidden.has(c.id))
  const ghostCount = rows.filter((r) => r.ghosted).length
  const activeCount = rows.length - ghostCount

  const sorted = useMemo(() => {
    const copy = rows.filter((r) => showGhosted || !r.ghosted)
    copy.sort((a, b) => {
      // Active nodes first, then ghosted
      if (!!a.ghosted !== !!b.ghosted) return a.ghosted ? 1 : -1
      const av = cellValue(a, sortBy).toLowerCase()
      const bv = cellValue(b, sortBy).toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [rows, sortBy, sortDir, showGhosted])

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

  const toggleGhost = (row: SignupRow) => {
    const ghosted = !row.ghosted
    const fp = signupFingerprint(row)
    if (source === 'db' && row.id) {
      // Optimistic; revert if the update is rejected.
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ghosted } : r)))
      setSignupGhostedRemote(row.id, ghosted).then((ok) => {
        if (!ok) {
          setRows((prev) =>
            prev.map((r) => (r.id === row.id ? { ...r, ghosted: !ghosted } : r)),
          )
        }
      })
      return
    }
    const next = setSignupGhosted(row, ghosted)
    setRows((prev) => prev.map((r) => (signupFingerprint(r) === fp ? next : r)))
  }

  return (
    <div className="screen admin-screen">
      <div className="title">A :: LEDGER</div>
      <div className="q-text">
        {activeCount} ACTIVE · {ghostCount} GHOSTED · SORT BY [{sortBy.toUpperCase()}]{' '}
        {sortDir === 'asc' ? '↑' : '↓'}
        {source === 'local' ? ' · LOCAL CACHE (UPLINK DOWN)' : ''}
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
        <div className="admin-col-ctrl">
          <button
            type="button"
            className={`net-toggle ${showGhosted ? 'on' : ''}`}
            onClick={() => setShowGhosted((v) => !v)}
            title={showGhosted ? 'Hide ghosted rows' : 'Show ghosted rows'}
          >
            [{showGhosted ? '■' : '□'} SHOW GHOSTED]
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        {sorted.length === 0 ? (
          <div className="dim">
            {source === 'loading'
              ? 'RETRIEVING LEDGER…'
              : rows.length === 0
                ? 'NO SIGNUPS YET.'
                : 'NO ACTIVE NODES — TOGGLE SHOW GHOSTED.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-ghost-col">NODE</th>
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
              {sorted.map((row) => {
                const fp = signupFingerprint(row)
                const ghosted = !!row.ghosted
                return (
                  <tr key={fp} className={ghosted ? 'ghosted' : ''}>
                    <td className="admin-ghost-col">
                      <button
                        type="button"
                        className={`net-toggle admin-ghost-btn ${ghosted ? 'on' : ''}`}
                        onClick={() => toggleGhost(row)}
                        title={ghosted ? 'Restore this signup' : 'Ghost (deactivate) this signup'}
                      >
                        [{ghosted ? 'UNGHOST' : 'GHOST'}]
                      </button>
                    </td>
                    {visible.map((c) => (
                      <td key={c.id}>{cellValue(row, c.id) || '—'}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="btn-row">
        <button className="btn dim" onClick={onBack}>
          [ BACK ]
        </button>
      </div>
      <div className="screen-hint">
        GHOST deactivates a signup · TOGGLE columns · SORT sets order · BACKSPACE leaves
      </div>
    </div>
  )
}
