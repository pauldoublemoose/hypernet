import { useEffect, useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  getCluster,
  clustersIBelongTo,
  isClusterAdmin,
  isClusterMember,
  joinCluster,
  leaveCluster,
  personLabel,
  updateCluster,
  visibilityLabel,
  visibleClusters,
  type Cluster,
  type ClusterVisibility,
} from '../../lib/groupsStore'
import {
  createHorizon,
  eventsHostedByGroup,
  formatEventDate,
  horizonsOwnedByGroup,
  type Horizon,
  type HyperEvent,
} from '../../lib/horizonStore'
import type { Answers } from '../../types'
import { CardThumb, MemberStack } from '../CardThumb'
import { CreateGroupSheet } from '../CreateGroupSheet'
import { IdentityEdit } from '../IdentityEdit'
import { emptyIdentity, loadIdentity, saveIdentity } from '../../lib/identity'

export type ClustersTab = 'directory' | 'mine'

const CLUSTER_HELPER =
  'A shared space. Everyone in the cluster can see they’re members together.'

export function ClustersScreen({
  answers,
  onBack,
  initialTab = 'directory',
  startCreate = false,
}: {
  answers: Answers
  onBack: () => void
  initialTab?: ClustersTab
  startCreate?: boolean
}) {
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<ClustersTab>(initialTab)
  const [viewId, setViewId] = useState<string | null>(null)
  const [creating, setCreating] = useState(Boolean(startCreate))
  const [editing, setEditing] = useState(false)
  const [creatingHorizon, setCreatingHorizon] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<ClusterVisibility>('public')
  const [imageUrl, setImageUrl] = useState('')
  const [hzName, setHzName] = useState('')
  const [hzDescription, setHzDescription] = useState('')
  const [identity, setIdentity] = useState(emptyIdentity)

  const refresh = () => setTick((n) => n + 1)

  const directory = useMemo(() => {
    void tick
    return visibleClusters()
  }, [tick])
  const mine = useMemo(() => {
    void tick
    return clustersIBelongTo()
  }, [tick])

  useEffect(() => {
    setTab(initialTab)
    setViewId(null)
    setCreating(Boolean(startCreate))
    setEditing(false)
    setCreatingHorizon(false)
  }, [initialTab, startCreate])

  useKeys((e: KeyboardEvent) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (creatingHorizon) setCreatingHorizon(false)
    else if (creating) startCreate ? onBack() : setCreating(false)
    else if (editing) setEditing(false)
    else if (viewId) setViewId(null)
    else onBack()
  })

  const viewing = viewId ? getCluster(viewId) : undefined
  const hosted = viewing ? eventsHostedByGroup(viewing.id) : []
  const clusterHorizons = viewing ? horizonsOwnedByGroup(viewing.id) : []
  const admin = viewing ? isClusterAdmin(viewing.id) : false
  const member = viewing ? isClusterMember(viewing.id) : false
  const soleAdmin = viewing ? viewing.adminIds.length === 1 && admin : false

  const resetForm = () => {
    setName('')
    setDescription('')
    setVisibility('public')
    setImageUrl('')
    setIdentity(emptyIdentity())
  }

  const openCreate = () => {
    resetForm()
    setCreating(true)
  }

  const openEdit = (c: Cluster) => {
    setName(c.name)
    setDescription(c.description)
    setVisibility(c.visibility)
    setImageUrl(c.imageUrl ?? '')
    setIdentity(loadIdentity('group', c.id))
    setEditing(true)
  }

  const submitEdit = () => {
    if (!viewing || !name.trim()) return
    const next = updateCluster(viewing.id, { name, description, visibility, imageUrl })
    saveIdentity('group', viewing.id, identity)
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

  const doJoin = (id: string) => {
    joinCluster(id)
    refresh()
  }

  const doLeave = (cluster: Cluster) => {
    leaveCluster(cluster.id)
    refresh()
    if (cluster.visibility === 'private') setViewId(null)
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
              name="cluster-visibility"
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
              name="cluster-visibility"
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
      <IdentityEdit
        kind="group"
        base={{
          kind: 'group',
          id: viewing?.id ?? 'draft',
          title: name,
          subtitle: visibility,
          body: description,
          imageUrl,
        }}
        value={identity}
        onChange={setIdentity}
      />
    </>
  )

  const clusterCard = (c: Cluster) => {
    const isMember = isClusterMember(c.id)
    const isAdmin = isClusterAdmin(c.id)
    const lastAdmin = isAdmin && c.adminIds.length === 1
    const canJoin = c.visibility === 'public' && !isMember
    const canLeave = isMember && !lastAdmin
    return (
      <li key={c.id}>
        <div className="cluster-card">
          <button type="button" className="cluster-card-main" onClick={() => setViewId(c.id)}>
            <CardThumb src={c.imageUrl} label={c.name} glyph="▦" />
            <span className="cluster-card-body">
              <span className="hz-list-title">{c.name}</span>
              <MemberStack ids={c.memberIds} />
              <span className="dim">
                Shared with {c.memberIds.length} {c.memberIds.length === 1 ? 'person' : 'people'}
                {' · '}
                {visibilityLabel(c.visibility)}
              </span>
            </span>
          </button>
          <div className="cluster-card-actions">
            {canJoin ? (
              <button
                type="button"
                className="btn"
                onClick={() => doJoin(c.id)}
              >
                Join
              </button>
            ) : null}
            {canLeave ? (
              <button type="button" className="btn dim" onClick={() => doLeave(c)}>
                Leave
              </button>
            ) : null}
            {lastAdmin ? <span className="dim">you admin</span> : null}
          </div>
        </div>
      </li>
    )
  }

  if (creating) {
    return (
      <CreateGroupSheet
        answers={answers}
        onCancel={() => (startCreate ? onBack() : setCreating(false))}
        onCreated={(id) => {
          setCreating(false)
          refresh()
          setTab('mine')
          setViewId(id)
        }}
      />
    )
  }

  if (editing && viewing) {
    return (
      <div className="screen hz-screen">
        <div className="title">CL :: EDIT CLUSTER</div>
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
        <div className="title">CL :: CLUSTER HORIZON</div>
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
        <div className="title">CL :: CLUSTER</div>
        <div className="hz-card-head">
          <CardThumb src={viewing.imageUrl} label={viewing.name} glyph="▦" />
          <div>
            <h2 className="hz-heading">{viewing.name}</h2>
            <MemberStack ids={viewing.memberIds} />
          </div>
        </div>
        <p className="hz-meta dim">
          Shared with {viewing.memberIds.length} {viewing.memberIds.length === 1 ? 'person' : 'people'}
          {' · '}
          {visibilityLabel(viewing.visibility)}
          {admin ? ' · you admin' : member ? ' · you member' : ''}
        </p>
        <p className="dim hz-lead">{CLUSTER_HELPER}</p>
        {viewing.imageUrl ? (
          <p className="hz-meta dim">
            Image stub:{' '}
            <a className="hz-link" href={viewing.imageUrl} target="_blank" rel="noreferrer">
              {viewing.imageUrl}
            </a>
          </p>
        ) : null}
        {viewing.location ? <p className="hz-meta dim">{viewing.location}</p> : null}
        {viewing.description ? (
          <p className="profile-view-text">{viewing.description}</p>
        ) : (
          <p className="dim">No description</p>
        )}

        {viewing.visibility === 'public' && !member ? (
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn" onClick={() => doJoin(viewing.id)}>
              Join
            </button>
          </div>
        ) : null}

        {member && !soleAdmin ? (
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn dim" onClick={() => doLeave(viewing)}>
              Leave
            </button>
          </div>
        ) : null}

        {admin ? (
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn dim" onClick={() => openEdit(viewing)}>
              Edit cluster
            </button>
            <button type="button" className="btn dim" onClick={() => setCreatingHorizon(true)}>
              Publish cluster Horizon
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
          <p className="dim hz-lead">Events that list this cluster as an owner / host.</p>
          {hosted.length === 0 ? (
            <p className="dim">None yet — assign this cluster as an event owner if you admin it.</p>
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
          <h3 className="profile-section-title">Cluster Horizons</h3>
          {clusterHorizons.length === 0 ? (
            <p className="dim">No cluster-owned Horizon yet.</p>
          ) : (
            <ul className="hz-list">
              {clusterHorizons.map((h: Horizon) => (
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
      <div className="title">{tab === 'mine' ? 'CL :: MY CLUSTERS' : 'CL :: CLUSTERS'}</div>
      <p className="dim hz-lead">{CLUSTER_HELPER}</p>
      <p className="dim hz-lead">
        Directory to browse. My Clusters to create and admin. Join is open on public clusters.
        Private contact lists live under My Contacts — not here.
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
          My Clusters
        </button>
      </div>

      {tab === 'directory' && (
        <>
          {directory.length === 0 ? (
            <p className="profile-empty dim">
              No clusters in the directory yet. Clusters are shared spaces — everyone in one can see
              they’re members together.
            </p>
          ) : (
            <ul className="hz-list cluster-card-list">{directory.map(clusterCard)}</ul>
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
            <p className="profile-empty dim">
              You have not joined or created a cluster yet. A cluster is a shared space, not a
              private list.
            </p>
          ) : (
            <ul className="hz-list cluster-card-list">{mine.map(clusterCard)}</ul>
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
