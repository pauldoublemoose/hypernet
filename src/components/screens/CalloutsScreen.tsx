import { useMemo, useState } from 'react'
import { createCallout, loadCallouts } from '../../lib/callouts'
import { useKeys } from '../../hooks'

export function CalloutsScreen({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0)
  const [ask, setAsk] = useState('')
  const [expiresAt, setExpiresAt] = useState('2026-10-20')
  const items = useMemo(() => {
    void tick
    return loadCallouts()
  }, [tick])

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    onBack()
  })

  const post = () => {
    if (!ask.trim() || !expiresAt) return
    const title = ask.trim().split('\n')[0]?.slice(0, 48) || 'Call out'
    createCallout({ title, body: ask.trim(), expiresAt, hostName: 'You' })
    setAsk('')
    setTick((n) => n + 1)
  }

  return (
    <div className="screen hz-screen" data-shell="callouts">
      <div className="title">CO :: CALL OUT</div>
      <p className="dim hz-lead">
        Recruitment asks tied to making things happen. Each call out expires. Stub data for now.
      </p>
      <ul className="hz-list">
        {items.map((row) => (
          <li key={row.id} className="hz-list-static">
            <span className="hz-list-title">{row.title}</span>
            <span className="dim">EXP {row.expiresAt}</span>
            <span className="hz-lead">{row.body}</span>
          </li>
        ))}
      </ul>
      <section className="hz-panel" style={{ marginTop: 16 }}>
        <label className="hz-field">
          <span>Ask</span>
          <textarea
            className="profile-input"
            rows={3}
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Hey we are creating an event and we are looking for a sound engineer."
          />
        </label>
        <label className="hz-field">
          <span>Expires</span>
          <input
            className="profile-input"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>
        <div className="btn-row">
          <button type="button" className="btn" onClick={post} disabled={!ask.trim() || !expiresAt}>
            [ POST CALL OUT ]
          </button>
        </div>
      </section>
    </div>
  )
}
