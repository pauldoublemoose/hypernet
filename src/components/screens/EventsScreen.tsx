import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  createEvent,
  formatEventDate,
  getAttendance,
  loadEvents,
  loadHorizons,
  setAttendance,
  addEventToHorizon,
  type AttendStatus,
  type EventRole,
  type HyperEvent,
} from '../../lib/horizonStore'
import { loadProfile } from '../../lib/profileStore'
import type { Answers } from '../../types'

const ROLES: EventRole[] = ['guest', 'co-creator', 'sponsor', 'admin']

export function EventsScreen({
  answers,
  onBack,
  initialEventId,
}: {
  answers: Answers
  onBack: () => void
  initialEventId?: string
}) {
  const hostName = loadProfile(answers).displayName || answers.fullName || 'You'
  const [tick, setTick] = useState(0)
  const events = useMemo(() => {
    void tick
    return loadEvents()
  }, [tick])
  const [viewId, setViewId] = useState<string | null>(initialEventId ?? null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [role, setRole] = useState<EventRole>('guest')
  const [addHz, setAddHz] = useState('')

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace') return
    e.preventDefault()
    if (creating) setCreating(false)
    else if (viewId) setViewId(null)
    else onBack()
  })

  const refresh = () => setTick((n) => n + 1)
  const viewing = viewId ? events.find((e) => e.id === viewId) : undefined
  const attend = viewing ? getAttendance(viewing.id) : undefined
  const horizons = loadHorizons().filter((h) => !h.isPersonalDefault)

  const submitCreate = () => {
    if (!title.trim()) return
    const ev = createEvent({ title, date, description, externalUrl, hostName })
    setCreating(false)
    setTitle('')
    setDate('')
    setDescription('')
    setExternalUrl('')
    refresh()
    setViewId(ev.id)
  }

  const mark = (status: AttendStatus) => {
    if (!viewing) return
    setAttendance(viewing.id, status, status === 'going' ? role : undefined, hostName)
    refresh()
  }

  if (creating) {
    return (
      <div className="screen hz-screen">
        <div className="title">E :: NEW EVENT</div>
        <p className="dim hz-lead">Hosted by your profile · external ticket link OK</p>
        <label className="hz-field">
          <span>Title</span>
          <input className="profile-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="hz-field">
          <span>Date</span>
          <input className="profile-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="hz-field">
          <span>Description</span>
          <textarea className="profile-input profile-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="hz-field">
          <span>External URL</span>
          <input className="profile-input" placeholder="https://…" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
        </label>
        <div className="profile-actions">
          <button type="button" className="btn" onClick={submitCreate} disabled={!title.trim()}>
            Create
          </button>
          <button type="button" className="btn dim" onClick={() => setCreating(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (viewing) {
    return (
      <div className="screen hz-screen">
        <div className="title">E :: EVENT</div>
        <h2 className="hz-heading">{viewing.title}</h2>
        <p className="hz-meta dim">
          {formatEventDate(viewing.date)} · host {viewing.hostName}
        </p>
        {viewing.description ? <p className="profile-view-text">{viewing.description}</p> : <p className="dim">No description</p>}
        {viewing.externalUrl ? (
          <p>
            <a className="hz-link" href={viewing.externalUrl} target="_blank" rel="noreferrer">
              External link
            </a>
          </p>
        ) : null}
        <section className="hz-panel">
          <h3 className="profile-section-title">Interested / Going</h3>
          <p className="dim hz-lead">Both add this event to your private default Horizon. Going asks for a role (Chronicle later).</p>
          {attend ? (
            <p className="hz-status">
              You marked <strong>{attend.status.toUpperCase()}</strong>
              {attend.role ? ` · ${attend.role}` : ''}
            </p>
          ) : (
            <p className="dim">Not saved yet</p>
          )}
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn" onClick={() => mark('interested')}>
              Interested
            </button>
          </div>
          <div className="hz-field" style={{ marginTop: 10 }}>
            <span>Role if Going</span>
            <select className="profile-input" value={role} onChange={(e) => setRole(e.target.value as EventRole)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => mark('going')}>
              Going
            </button>
          </div>
        </section>
        <section className="hz-panel">
          <h3 className="profile-section-title">Add to a Horizon</h3>
          <div className="hz-field">
            <select className="profile-input" value={addHz} onChange={(e) => setAddHz(e.target.value)}>
              <option value="">Select horizon…</option>
              {horizons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                  {h.isPublished ? '' : ' (draft)'}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn dim"
            disabled={!addHz}
            onClick={() => {
              if (!addHz) return
              addEventToHorizon(addHz, viewing.id)
              refresh()
            }}
          >
            Add to Horizon
          </button>
        </section>
        <div className="profile-actions">
          <button type="button" className="btn dim" onClick={() => setViewId(null)}>
            Back to list
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen hz-screen">
      <div className="title">E :: EVENTS</div>
      <p className="dim hz-lead">Create gatherings · mark Interested or Going · they land on your default Horizon</p>
      <div className="profile-actions">
        <button type="button" className="btn" onClick={() => setCreating(true)}>
          New event
        </button>
        <button type="button" className="btn dim" onClick={onBack}>
          Back
        </button>
      </div>
      {events.length === 0 ? (
        <p className="profile-empty dim">No events yet — create the first one</p>
      ) : (
        <ul className="hz-list">
          {events.map((e: HyperEvent) => (
            <li key={e.id}>
              <button type="button" className="hz-list-item" onClick={() => setViewId(e.id)}>
                <span className="hz-list-title">{e.title}</span>
                <span className="dim">{formatEventDate(e.date)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
