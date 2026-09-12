import { useEffect, useLayoutEffect, useState } from 'react'
import { useKeys } from '../../hooks'
import { fetchTelemetrySummary, type TelemetrySummary } from '../../lib/telemetry'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

const WINDOWS = [7, 30, 90] as const

function pct(part: number, whole: number): string {
  if (!whole) return '—'
  return `${Math.round((part / whole) * 100)}%`
}

function fmtSecs(secs: number | null): string {
  if (secs == null) return '—'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return m > 0 ? `${m}M ${s}S` : `${s}S`
}

export function TelemetryScreen({
  onBack,
  setMode,
}: {
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [days, setDays] = useState<number>(30)
  const [data, setData] = useState<TelemetrySummary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
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

  useEffect(() => {
    let alive = true
    setState('loading')
    fetchTelemetrySummary(days).then((summary) => {
      if (!alive) return
      if (summary) {
        setData(summary)
        setState('ready')
      } else {
        setState('error')
      }
    })
    return () => {
      alive = false
    }
  }, [days])

  const dropOff = data
    ? Object.entries(data.drop_off).sort((a, b) => b[1] - a[1])
    : []
  const abandoned = dropOff.reduce((sum, [, n]) => sum + n, 0)

  return (
    <div className="screen admin-screen">
      <div className="title">A :: TELEMETRY</div>

      <div className="admin-cols" role="group" aria-label="Time window">
        {WINDOWS.map((w) => (
          <button
            key={w}
            type="button"
            className={`net-toggle ${days === w ? 'on' : ''}`}
            onClick={() => setDays(w)}
          >
            [{days === w ? '■' : '□'} {w}D]
          </button>
        ))}
      </div>

      {state === 'loading' && <div className="term-log">&gt; AGGREGATING SIGNALS…</div>}
      {state === 'error' && (
        <div className="term-log">&gt; TELEMETRY UPLINK FAILED — ADMIN SESSION REQUIRED.</div>
      )}

      {state === 'ready' && data && (
        <>
          <div className="term-log">
            <div>&gt; VISITS: {data.visits}</div>
            <div>
              &gt; SIGNUP STARTS: {data.signup_starts} ({pct(data.signup_starts, data.visits)}{' '}
              OF VISITS)
            </div>
            <div>
              &gt; SIGNUP COMPLETIONS: {data.signup_completions} (
              {pct(data.signup_completions, data.signup_starts)} OF STARTS ·{' '}
              {pct(data.signup_completions, data.visits)} OF VISITS)
            </div>
            <div>
              &gt; COMPLETION TIME: MEDIAN {fmtSecs(data.median_completion_secs)} · P90{' '}
              {fmtSecs(data.p90_completion_secs)}
            </div>
            <div>&gt; GRAPH OPENS: {data.graph_opens} SESSIONS</div>
            <div>&gt; DRAFTS RESTORED: {data.draft_restores} SESSIONS</div>
          </div>

          <div className="q-text">DROP-OFF — LAST SCREEN BEFORE ABANDONING ({abandoned} SESSIONS)</div>
          <div className="admin-table-wrap">
            {dropOff.length === 0 ? (
              <div className="dim">NO ABANDONED SIGNUPS IN THIS WINDOW.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SCREEN</th>
                    <th>SESSIONS</th>
                    <th>SHARE</th>
                  </tr>
                </thead>
                <tbody>
                  {dropOff.map(([screen, n]) => (
                    <tr key={screen}>
                      <td>{screen.toUpperCase()}</td>
                      <td>{n}</td>
                      <td>{pct(n, abandoned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="q-text">DAILY ({Math.min(data.daily.length, 14)} MOST RECENT)</div>
          <div className="admin-table-wrap">
            {data.daily.length === 0 ? (
              <div className="dim">NO EVENTS IN THIS WINDOW.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>DAY</th>
                    <th>VISITS</th>
                    <th>STARTS</th>
                    <th>DONE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily.slice(0, 14).map((d) => (
                    <tr key={d.day}>
                      <td>{d.day}</td>
                      <td>{d.visits}</td>
                      <td>{d.starts}</td>
                      <td>{d.completions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <div className="btn-row">
        <button className="btn dim" onClick={onBack}>
          [ BACK ]
        </button>
      </div>
      <div className="screen-hint">
        ANONYMOUS SESSION IDS ONLY — NO PERSONAL DATA · BACKSPACE LEAVES
      </div>
    </div>
  )
}
