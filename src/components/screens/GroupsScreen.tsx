import { useEffect, useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  createGroup,
  getGroup,
  groupsIBelongTo,
  isGroupAdmin,
  isGroupMember,
  joinGroup,
  personLabel,
  updateGroup,
  visibilityLabel,
  visibleGroups,
  type GroupVisibility,
  type HyperGroup,
} from '../../lib/groupsStore'
import {
  createHorizon,
  eventsHostedByGroup,
  formatEventDate,
  horizonsOwnedByGroup,
  type Horizon,
  type HyperEvent,
} from '../../lib/horizonStore'
import { CardThumb } from '../CardThumb'

export type GroupsTab = 'directory' | 'mine'

export function GroupsScreen({
  onBack,
  initialTab = 'directory',
}: {
  onBack: () => void
  initialTab?: GroupsTab
}) {
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<GroupsTab>(initialTab)
  const [viewId, setViewId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [creatingHorizon, setCreatingHorizon] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<GroupVisibility>('public')
  const [imageUrl, setImageUrl] = useState('')
  const [hzName, setHzName] = useState('')
  const [hzDescription, setHzDescription] = useState('')

  const refresh = () => setTick((n) => n + 1)

  const directory = useMemo(() => {
    void tick
    return visibleGroups()
  }, [tick])
  const mine = useMemo(() => {
    void tick
    return groupsIBelongTo()
  }, [tick])

  useEffect(() => {
    setTab(initialTab)
    setViewId(null)
    setCreating(false)
    setEditing(false)
    setCreatingHorizon(false)
  }, [initialTab])

  useKeys((e: KeyboardEvent) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (creatingHorizon) setCreatingHorizon(false)
    else if (creating) setCreating(false)
    else if (editing) setEditing(false)
    else if (viewId) setViewId(null)
    else onBack()
  })

  const viewing = viewId ? getGroup(viewId) : undefined
  const hosted = viewing ? eventsHostedByGroup(viewing.id) : []
  const groupHorizons = viewing ? horizonsOwnedByGroup(viewing.id) : []
  const admin = viewing ? isGroupAdmin(viewing.id) : false
  const member = viewing ? isGroupMember(viewing.id) : false

  const resetForm = () => {
    setName('')
    setDescription('')
    setVisibility('public')
    setImageUrl('')
  }

  const openCreate = () => {
    resetForm()
    setCreating(true)
  }

  const openEdit = (g: HyperGroup) => {
    setName(g.name)
    setDescription(g.description)
    setVisibility(g.visibility)
    setImageUrl(g.imageUrl ?? '')
    setEditing(true)
  }

  const submitCreate = () => {
    if (!name.trim()) return
    const g = createGroup({ name, description, visibility, imageUrl })
    setCreating(false)
    resetForm()
    refresh()
    setTab('mine')
    setViewId(g.id)
  }

  const submitEdit = () => {
    if (!viewing || !name.trim()) return
    const next = updateGroup(viewing.id, { name, description, visibility, imageUrl })
    setEditing(false)
    refresh()
    if (next) setViewId(next.id)
  }

  const submitHorizon = () => {
    if (!viewing || !hzName.trim()) return
    createHorizon({
      name: hzName,
      description: hzDescription,
      ownerName: viewing.name,
      isPublished: true,
      ownerGroupId: viewing.id,
    })
    setCreatingHorizon(false)
    setHzName('')
    setHzDescription('')
    refresh()
  }

  const formBody = () => (
    <>
      <label className="hz-field">
        <span>Name</span>
        <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} />
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
      <section className="hz-panel">
        <h3 className="profile-section-title">Visibility</h3>
        <div className="hz-checks">
          <label className="hz-check">
            <input
              type="radio"
              name="group-visibility"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
            />
            <span>
              public<span className="dim"> — listed in the directory; anyone can join</span>
            </span>
          </label>
          <label className="hz-check">
            <input
              type="radio"
              name="group-visibility"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
            />
            <span>
              private<span className="dim"> — visible to members only (no open join)</span>
            </span>
          </label>
        </div>
      </section>
      <label className="hz-field">
        <span>Image URL (stub)</span>
        <input
          className="profile-input"
          placeholder="https://… (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </label>
    </>
  )

  const groupRow = (g: HyperGroup) => (
    <li key={g.id}>
      <button type="button" className="hz-list-item has-thumb" onClick={() => setViewId(g.id)}>
        <CardThumb src={g.imageUrl} label={g.name} glyph="▦" />
        <span className="hz-list-copy">
          <span className="hz-list-title">{g.name}</span>
          <span className="dim">
            {g.memberIds.length} members · {visibilityLabel(g.visibility)}
          </span>
        </span>
      </button>
    </li>
  )

  if (creating) {
    return (
      <div className="screen hz-screen">
        <div className="title">G :: NEW GROUP</div>
        <p className="dim hz-lead">You become admin and member. Thin camp / crew page — not a full social graph.</p>
        {formBody()}
        <div className="profile-actions">
          <button type="button" className="btn" onClick={submitCreate} disabled={!name.trim()}>
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
        <div className="title">G :: EDIT GROUP</div>
        <p className="dim hz-lead">Admins can update name, description, and visibility.</p>
        {formBody()}
        <div className="profile-actions">
          <button type="button" className="btn" onClick={submitEdit} disabled={!name.trim()}>
            Save
          </button>
          <button type="button" className="btn dim" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (creatingHorizon && viewing) {
    return (
      <div className="screen hz-screen">
        <div className="title">G :: GROUP HORIZON</div>
        <p className="dim hz-lead">Publish a calendar owned by {viewing.name}.</p>
        <label className="hz-field">
          <span>Name</span>
          <input className="profile-input" value={hzName} onChange={(e) => setHzName(e.target.value)} />
        </label>
        <label className="hz-field">
          <span>Description</span>
          <textarea
            className="profile-input profile-textarea"
            rows={3}
            value={hzDescription}
            onChange={(e) => setHzDescription(e.target.value)}
          />
        </label>
        <div className="profile-actions">
          <button type="button" className="btn" onClick={submitHorizon} disabled={!hzName.trim()}>
            Publish
          </button>
          <button type="button" className="btn dim" onClick={() => setCreatingHorizon(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (viewing) {
    return (
      <div className="screen hz-screen">
        <div className="title">G :: GROUP</div>
        <div className="hz-card-head">
          <CardThumb src={viewing.imageUrl} label={viewing.name} glyph="▦" />
          <h2 className="hz-heading">{viewing.name}</h2>
        </div>
        <p className="hz-meta dim">
          {visibilityLabel(viewing.visibility)} · {viewing.memberIds.length} members
          {admin ? ' · you admin' : member ? ' · you member' : ''}
        </p>
        {viewing.imageUrl ? (
          <p className="hz-meta dim">
            Image stub:{' '}
            <a className="hz-link" href={viewing.imageUrl} target="_blank" rel="noreferrer">
              {viewing.imageUrl}
            </a>
          </p>
        ) : null}
        {viewing.description ? (
          <p className="profile-view-text">{viewing.description}</p>
        ) : (
          <p className="dim">No description</p>
        )}

        {viewing.visibility === 'public' && !member ? (
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                joinGroup(viewing.id)
                refresh()
              }}
            >
              Join
            </button>
          </div>
        ) : null}

        {admin ? (
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn dim" onClick={() => openEdit(viewing)}>
              Edit group
            </button>
            <button type="button" className="btn dim" onClick={() => setCreatingHorizon(true)}>
              Publish group Horizon
            </button>
          </div>
        ) : null}

        <section className="hz-panel">
          <h3 className="profile-section-title">Admins</h3>
          <ul className="hz-list">
            {viewing.adminIds.map((id) => (
              <li key={id} className="hz-list-static">
                <span className="hz-list-title">{personLabel(id)}</span>
                <span className="dim">admin</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="hz-panel">
          <h3 className="profile-section-title">Members</h3>
          <ul className="hz-list">
            {viewing.memberIds.map((id) => (
              <li key={id} className="hz-list-static">
                <span className="hz-list-title">{personLabel(id)}</span>
                <span className="dim">{viewing.adminIds.includes(id) ? 'admin' : 'member'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="hz-panel">
          <h3 className="profile-section-title">Hosted events</h3>
          <p className="dim hz-lead">Events that list this group as an owner / host.</p>
          {hosted.length === 0 ? (
            <p className="dim">None yet — assign this group as an event owner if you admin it.</p>
          ) : (
            <ul className="hz-list">
              {hosted.map((e: HyperEvent) => (
                <li key={e.id} className="hz-list-static has-thumb">
                  <CardThumb src={e.imageUrl} label={e.title} glyph="▣" />
                  <span className="hz-list-copy">
                    <span className="hz-list-title">{e.title}</span>
                    <span className="dim">{formatEventDate(e.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="hz-panel">
          <h3 className="profile-section-title">Group Horizons</h3>
          {groupHorizons.length === 0 ? (
            <p className="dim">No group-owned Horizon yet.</p>
          ) : (
            <ul className="hz-list">
              {groupHorizons.map((h: Horizon) => (
                <li key={h.id} className="hz-list-static">
                  <span className="hz-list-title">{h.name}</span>
                  <span className="dim">
                    {h.eventIds.length} events
                    {h.isPublished ? ' · published' : ' · draft'}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
      <div className="title">G :: GROUPS</div>
      <p className="dim hz-lead">
        Thin camps / crews. Directory to browse, My Groups to create and admin. Join is open on public groups.
      </p>

      <div className="btn-row hz-tabs">
        <button
          type="button"
          className={`privacy-btn${tab === 'directory' ? ' is-on' : ''}`}
          onClick={() => setTab('directory')}
        >
          Directory
        </button>
        <button
          type="button"
          className={`privacy-btn${tab === 'mine' ? ' is-on' : ''}`}
          onClick={() => setTab('mine')}
        >
          My Groups
        </button>
      </div>

      {tab === 'directory' && (
        <>
          {directory.length === 0 ? (
            <p className="profile-empty dim">No groups in the directory yet</p>
          ) : (
            <ul className="hz-list">{directory.map(groupRow)}</ul>
          )}
        </>
      )}

      {tab === 'mine' && (
        <>
          <div className="profile-actions">
            <button type="button" className="btn" onClick={openCreate}>
              Create group
            </button>
          </div>
          {mine.length === 0 ? (
            <p className="profile-empty dim">You have not joined or created a group yet</p>
          ) : (
            <ul className="hz-list">{mine.map(groupRow)}</ul>
          )}
        </>
      )}

      <div className="profile-actions">
        <button type="button" className="btn dim" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}
