import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  createHorizon,
  eventsForHorizon,
  formatEventDate,
  publishedHorizons,
  loadHorizons,
  type Horizon,
} from '../../lib/horizonStore'
import { loadProfile } from '../../lib/profileStore'
import type { Answers } from '../../types'

export function HorizonsScreen({
  answers,
  onBack,
}: {
  answers: Answers
  onBack: () => void
}) {
  const ownerName = loadProfile(answers).displayName || answers.fullName || 'You'
  const [tick, setTick] = useState(0)
  const list = useMemo(() => {
    void tick
    return publishedHorizons()
  }, [tick])
  const [viewId, setViewId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace') return
    e.preventDefault()
    if (creating) setCreating(false)
    else if (viewId) setViewId(null)
    else onBack()
  })

  const viewing = viewId ? loadHorizons().find((h) => h.id === viewId) : undefined

  if (creating) {
    return (
      <div className="screen hz-screen">
        <div className="title">H :: PUBLISH HORIZON</div>
        <p className="dim hz-lead">A shared calendar others can follow · profile-owned</p>
        <label className="hz-field">
          <span>Name</span>
          <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="hz-field">
          <span>Description</span>
          <textarea className="profile-input profile-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="profile-actions">
          <button
            type="button"
            className="btn"
            disabled={!name.trim()}
            onClick={() => {
              const h = createHorizon({ name, description, ownerName, isPublished: true })
              setCreating(false)
              setName('')
              setDescription('')
              setTick((n) => n + 1)
              setViewId(h.id)
            }}
          >
            Publish
          </button>
          <button type="button" className="btn dim" onClick={() => setCreating(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (viewing) {
    const evs = eventsForHorizon(viewing)
    return (
      <div className="screen hz-screen">
        <div className="title">H :: HORIZON</div>
        <h2 className="hz-heading">{viewing.name}</h2>
        <p className="hz-meta dim">by {viewing.ownerName} · published</p>
        {viewing.description ? <p className="profile-view-text">{viewing.description}</p> : null}
        <h3 className="profile-section-title">Events on this Horizon</h3>
        {evs.length === 0 ? (
          <p className="dim">No events yet — open an event and “Add to Horizon”</p>
        ) : (
          <ul className="hz-list">
            {evs.map((e) => (
              <li key={e.id} className="hz-list-static">
                <span className="hz-list-title">{e.title}</span>
                <span className="dim">{formatEventDate(e.date)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="profile-actions">
          <button type="button" className="btn dim" onClick={() => setViewId(null)}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen hz-screen">
      <div className="title">H :: HORIZONS</div>
      <p className="dim hz-lead">Published calendars from the network · create your own</p>
      <div className="profile-actions">
        <button type="button" className="btn" onClick={() => setCreating(true)}>
          Publish Horizon
        </button>
        <button type="button" className="btn dim" onClick={onBack}>
          Back
        </button>
      </div>
      {list.length === 0 ? (
        <p className="profile-empty dim">No published Horizons yet</p>
      ) : (
        <ul className="hz-list">
          {list.map((h: Horizon) => (
            <li key={h.id}>
              <button type="button" className="hz-list-item" onClick={() => setViewId(h.id)}>
                <span className="hz-list-title">{h.name}</span>
                <span className="dim">{h.eventIds.length} events</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
