import { useState } from 'react'
import { createCallout, loadCallouts } from '../../lib/callouts'
import { useKeys } from '../../hooks'
import { Pane } from '../Pane'
import { IdentityEdit } from '../IdentityEdit'
import { emptyIdentity, saveIdentity } from '../../lib/identity'

export function CalloutsScreen({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState(() => loadCallouts())
  const [ask, setAsk] = useState('')
  const [expiresAt, setExpiresAt] = useState('2026-10-20')
  const [identity, setIdentity] = useState(emptyIdentity)

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
    const row = createCallout({ title, body: ask.trim(), expiresAt, hostName: 'You' })
    saveIdentity('callout', row.id, identity)
    setAsk('')
    setIdentity(emptyIdentity())
    setItems(loadCallouts())
  }

  return (
    <Pane
      title="CALL OUT"
      data-shell="callouts"
      mast={
        <p className="dim hz-lead">
          Recruitment asks tied to making things happen. Each call out expires. Stub data for now.
        </p>
      }
    >
      <ul className="stream-rows">
        {items.map((row) => (
          <li key={row.id} className="stream-row">
            <span className="stream-row-title">{row.title}</span>
            <span className="dim">EXP {row.expiresAt}</span>
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
      <IdentityEdit
        kind="callout"
        base={{
          kind: 'callout',
          id: 'draft',
          title: ask.trim().split('\n')[0]?.slice(0, 48) || 'Call out',
          subtitle: 'You',
          body: ask,
          expiresAt,
        }}
        value={identity}
        onChange={setIdentity}
      />
    </Pane>
  )
}
