import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  createEvent,
  formatEventDate,
  getAttendance,
  loadHorizons,
  setAttendance,
  addEventToHorizon,
  updateEvent,
  visibleEvents,
  privacyLabel,
  type AttendStatus,
  type EventPrivacy,
  type EventRole,
  type HyperEvent,
} from '../../lib/horizonStore'
import {
  areFriends,
  ensureDefaultLists,
  ensureSeedFriendshipGraph,
  getPerson,
  loadPeople,
  selfId,
  type ContactList,
  type ContactPerson,
} from '../../lib/contactsStore'
import { loadProfile } from '../../lib/profileStore'
import type { Answers } from '../../types'

const ROLES: EventRole[] = ['guest', 'co-creator', 'sponsor', 'admin']

const PRIVACY_OPTIONS: { value: EventPrivacy; label: string; hint: string }[] = [
  { value: 'only_me', label: 'only me', hint: 'Owners only' },
  { value: 'friends', label: 'friends', hint: 'Owners or friends of an owner' },
  { value: 'contacts', label: 'contacts', hint: 'Owners or people on selected contact lists' },
  { value: 'everyone', label: 'everyone', hint: 'Everyone can see' },
]

function ownerCandidates(): ContactPerson[] {
  ensureSeedFriendshipGraph()
  const people = loadPeople()
  const friends = people.filter((p) => areFriends(p.id))
  const rest = people.filter((p) => !areFriends(p.id))
  // Prefer friends first, then other seed people (demo)
  return [...friends, ...rest]
}

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
    return visibleEvents()
  }, [tick])
  const people = useMemo(() => {
    void tick
    return ownerCandidates()
  }, [tick])
  const lists = useMemo(() => {
    void tick
    return ensureDefaultLists()
  }, [tick])

  const [viewId, setViewId] = useState<string | null>(initialEventId ?? null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [ownerIds, setOwnerIds] = useState<string[]>([selfId()])
  const [privacy, setPrivacy] = useState<EventPrivacy>('everyone')
  const [privacyListIds, setPrivacyListIds] = useState<string[]>([])
  const [role, setRole] = useState<EventRole>('guest')
  const [addHz, setAddHz] = useState('')

  useKeys((e: KeyboardEvent) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (creating) setCreating(false)
    else if (editing) setEditing(false)
    else if (viewId) setViewId(null)
    else onBack()
  })

  const refresh = () => setTick((n) => n + 1)
  const viewing = viewId ? events.find((e) => e.id === viewId) : undefined
  const attend = viewing ? getAttendance(viewing.id) : undefined
  const horizons = loadHorizons().filter((h) => !h.isPersonalDefault)
  const isOwner = viewing ? viewing.ownerIds.includes(selfId()) : false

  const resetForm = () => {
    setTitle('')
    setDate('')
    setDescription('')
    setExternalUrl('')
    setOwnerIds([selfId()])
    setPrivacy('everyone')
    setPrivacyListIds([])
  }

  const openCreate = () => {
    resetForm()
    setCreating(true)
  }

  const openEdit = (ev: HyperEvent) => {
    setTitle(ev.title)
    setDate(ev.date)
    setDescription(ev.description)
    setExternalUrl(ev.externalUrl)
    setOwnerIds(ev.ownerIds.length ? [...ev.ownerIds] : [selfId()])
    setPrivacy(ev.privacy)
    setPrivacyListIds([...ev.privacyListIds])
    setEditing(true)
  }

  const toggleOwner = (id: string) => {
    if (id === selfId()) return
    setOwnerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const togglePrivacyList = (id: string) => {
    setPrivacyListIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const submitCreate = () => {
    if (!title.trim()) return
    const ev = createEvent({
      title,
      date,
      description,
      externalUrl,
      hostName,
      ownerIds,
      privacy,
      privacyListIds: privacy === 'contacts' ? privacyListIds : [],
    })
    setCreating(false)
    resetForm()
    refresh()
    setViewId(ev.id)
  }

  const submitEdit = () => {
    if (!viewing || !title.trim()) return
    const next = updateEvent(viewing.id, {
      title,
      date,
      description,
      externalUrl,
      ownerIds,
      privacy,
      privacyListIds: privacy === 'contacts' ? privacyListIds : [],
    })
    setEditing(false)
    refresh()
    if (next) setViewId(next.id)
  }

  const mark = (status: AttendStatus) => {
    if (!viewing) return
    setAttendance(viewing.id, status, status === 'going' ? role : undefined, hostName)
    refresh()
  }

  const formBody = (mode: 'create' | 'edit') => (
    <>
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
        <textarea
          className="profile-input profile-textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="hz-field">
        <span>External URL</span>
        <input
          className="profile-input"
          placeholder="https://…"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
        />
      </label>

      <section className="hz-panel">
        <h3 className="profile-section-title">Owners</h3>
        <p className="dim hz-lead">You are always an owner. Add co-owners from Friends (seed people OK for demo).</p>
        <div className="hz-checks">
          <label className="hz-check">
            <input type="checkbox" checked disabled readOnly />
            <span>You (self) — always owner</span>
          </label>
          {people.map((p) => (
            <label key={p.id} className="hz-check">
              <input
                type="checkbox"
                checked={ownerIds.includes(p.id)}
                onChange={() => toggleOwner(p.id)}
              />
              <span>
                {p.displayName}
                {areFriends(p.id) ? ' · Friend' : ' · Seed'}
              </span>
            </label>
          ))}
        </div>
        <p className="dim hz-lead" style={{ marginTop: 8 }}>
          Groups as owners — locked for now (coming later).
        </p>
      </section>

      <section className="hz-panel">
        <h3 className="profile-section-title">Privacy</h3>
        <div className="hz-checks">
          {PRIVACY_OPTIONS.map((opt) => (
            <label key={opt.value} className="hz-check">
              <input
                type="radio"
                name={`event-privacy-${mode}`}
                checked={privacy === opt.value}
                onChange={() => setPrivacy(opt.value)}
              />
              <span>
                {opt.label}
                <span className="dim"> — {opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {privacy === 'contacts' ? (
          <div className="hz-checks" style={{ marginTop: 8 }}>
            <p className="dim hz-lead">Visible to members of these contact lists (and owners)</p>
            {lists.length === 0 ? (
              <p className="dim">No contact lists yet — create some in My Contacts</p>
            ) : (
              lists.map((l: ContactList) => (
                <label key={l.id} className="hz-check">
                  <input
                    type="checkbox"
                    checked={privacyListIds.includes(l.id)}
                    onChange={() => togglePrivacyList(l.id)}
                  />
                  <span>
                    {l.name} · {l.memberIds.length} members
                  </span>
                </label>
              ))
            )}
          </div>
        ) : null}
      </section>
    </>
  )

  if (creating) {
    return (
      <div className="screen hz-screen">
        <div className="title">E :: NEW EVENT</div>
        <p className="dim hz-lead">Hosted by your profile · owners + privacy · external ticket link OK</p>
        {formBody('create')}
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

  if (editing && viewing) {
    return (
      <div className="screen hz-screen">
        <div className="title">E :: EDIT EVENT</div>
        <p className="dim hz-lead">Update details, owners, and privacy</p>
        {formBody('edit')}
        <div className="profile-actions">
          <button type="button" className="btn" onClick={submitEdit} disabled={!title.trim()}>
            Save
          </button>
          <button type="button" className="btn dim" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (viewing) {
    const ownerNames = viewing.ownerIds
      .map((id) => (id === selfId() ? 'You' : getPerson(id)?.displayName ?? id))
      .join(', ')
    const listNames =
      viewing.privacy === 'contacts'
        ? lists
            .filter((l) => viewing.privacyListIds.includes(l.id))
            .map((l) => l.name)
            .join(', ') || 'none selected'
        : ''

    return (
      <div className="screen hz-screen">
        <div className="title">E :: EVENT</div>
        <h2 className="hz-heading">{viewing.title}</h2>
        <p className="hz-meta dim">
          {formatEventDate(viewing.date)} · host {viewing.hostName}
        </p>
        <p className="hz-meta dim">
          {privacyLabel(viewing.privacy)}
          {viewing.privacy === 'contacts' && listNames ? ` · ${listNames}` : ''}
          {' · '}
          owners: {ownerNames}
        </p>
        {viewing.description ? <p className="profile-view-text">{viewing.description}</p> : <p className="dim">No description</p>}
        {viewing.externalUrl ? (
          <p>
            <a className="hz-link" href={viewing.externalUrl} target="_blank" rel="noreferrer">
              External link
            </a>
          </p>
        ) : null}
        {isOwner ? (
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn dim" onClick={() => openEdit(viewing)}>
              Edit owners / privacy
            </button>
          </div>
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
          <p className="dim hz-lead">Horizons don’t yet mirror event owner/privacy — events first.</p>
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
      <p className="dim hz-lead">Create gatherings · owners + privacy · Interested / Going lands on your default Horizon</p>
      <div className="profile-actions">
        <button type="button" className="btn" onClick={openCreate}>
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
                <span className="dim">
                  {formatEventDate(e.date)} · {privacyLabel(e.privacy)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
