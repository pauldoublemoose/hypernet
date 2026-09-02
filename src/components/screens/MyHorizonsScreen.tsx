import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  createHorizon,
  ensureDefaultHorizon,
  eventsForHorizon,
  formatEventDate,
  getAttendance,
  loadHorizons,
  type Horizon,
} from '../../lib/horizonStore'
import { loadProfile } from '../../lib/profileStore'
import type { Answers } from '../../types'

export function MyHorizonsScreen({
  answers,
  onBack,
}: {
  answers: Answers
  onBack: () => void
}) {
  const ownerName = loadProfile(answers).displayName || answers.fullName || 'You'
  const [tick, setTick] = useState(0)
  const horizons = useMemo(() => {
    void tick
    ensureDefaultHorizon(ownerName)
    return loadHorizons()
  }, [tick, ownerName])
  const [viewId, setViewId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [publish, setPublish] = useState(true)

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace') return
    e.preventDefault()
    if (creating) setCreating(false)
    else if (viewId) setViewId(null)
    else onBack()
  })

  const viewing = viewId ? horizons.find((h) => h.id === viewId) : undefined

  if (creating) {
    return (
      <div className="screen hz-screen">
        <div className="title">MH :: NEW HORIZON</div>
        <label className="hz-field">
          <span>Name</span>
          <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="hz-field">
          <span>Description</span>
          <textarea className="profile-input profile-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="hz-check">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          Publish (show under HORIZONS)
        </label>
        <div className="profile-actions">
          <button
            type="button"
            className="btn"
            disabled={!name.trim()}
            onClick={() => {
              const h = createHorizon({ name, description, ownerName, isPublished: publish })
              setCreating(false)
              setName('')
              setDescription('')
              setTick((n) => n + 1)
              setViewId(h.id)
            }}
          >
            Save
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
        <div className="title">MH :: {viewing.isPersonalDefault ? 'DEFAULT' : 'HORIZON'}</div>
        <h2 className="hz-heading">{viewing.name}</h2>
        <p className="hz-meta dim">
          {viewing.isPersonalDefault
            ? 'Private personal default · Interested / Going land here'
            : viewing.isPublished
              ? 'Published'
              : 'Draft (not on public HORIZONS)'}
        </p>
        {viewing.description ? <p className="profile-view-text">{viewing.description}</p> : null}
        <h3 className="profile-section-title">Events</h3>
        {evs.length === 0 ? (
          <p className="dim">Empty — mark Interested/Going on an event, or add from event detail</p>
        ) : (
          <ul className="hz-list">
            {evs.map((e) => {
              const a = getAttendance(e.id)
              return (
                <li key={e.id} className="hz-list-static">
                  <span className="hz-list-title">{e.title}</span>
                  <span className="dim">
                    {formatEventDate(e.date)}
                    {a ? ` · ${a.status}` : ''}
                    {a?.role ? `/${a.role}` : ''}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <p className="dim hz-lead" style={{ marginTop: 12 }}>
          Chronicle: Going roles will feed your Chronicle after the event date (placeholder for now).
        </p>
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
      <div className="title">MH :: MY HORIZONS</div>
      <p className="dim hz-lead">Your default private list plus Horizons you create</p>
      <div className="profile-actions">
        <button type="button" className="btn" onClick={() => setCreating(true)}>
          New Horizon
        </button>
        <button type="button" className="btn dim" onClick={onBack}>
          Back
        </button>
      </div>
      <ul className="hz-list">
        {horizons.map((h: Horizon) => (
          <li key={h.id}>
            <button type="button" className="hz-list-item" onClick={() => setViewId(h.id)}>
              <span className="hz-list-title">
                {h.name}
                {h.isPersonalDefault ? ' ★' : ''}
              </span>
              <span className="dim">
                {h.eventIds.length} events
                {h.isPersonalDefault ? ' · private' : h.isPublished ? ' · published' : ' · draft'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
