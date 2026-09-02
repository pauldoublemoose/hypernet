import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  acceptFriendRequest,
  saveLists,
  areFriends,
  createList,
  declineFriendRequest,
  ensureDefaultLists,
  followPerson,
  getPerson,
  isFollowing,
  listsForPerson,
  loadPeople,
  pendingIncoming,
  pendingOutgoing,
  relationshipLabel,
  sendFriendRequest,
  simulateIncomingRequest,
  unfollowPerson,
  type ContactList,
  type ContactPerson,
} from '../../lib/contactsStore'

type Tab = 'people' | 'lists' | 'requests'

export function ContactsScreen({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<Tab>('people')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listIds, setListIds] = useState<string[]>([])
  const [newListName, setNewListName] = useState('')
  const [q, setQ] = useState('')

  const refresh = () => setTick((n) => n + 1)

  const people = useMemo(() => {
    void tick
    return loadPeople()
  }, [tick])
  const lists = useMemo(() => {
    void tick
    return ensureDefaultLists()
  }, [tick])
  const incoming = useMemo(() => {
    void tick
    return pendingIncoming()
  }, [tick])

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (selectedId) setSelectedId(null)
    else onBack()
  })

  const filtered = people.filter((p) => {
    const s = q.trim().toLowerCase()
    if (!s) return true
    return (
      p.displayName.toLowerCase().includes(s) ||
      p.handle.toLowerCase().includes(s) ||
      (p.bio ?? '').toLowerCase().includes(s)
    )
  })

  const selected = selectedId ? getPerson(selectedId) : undefined

  const openPerson = (id: string) => {
    setSelectedId(id)
    setListIds(listsForPerson(id).map((l) => l.id))
  }

  const toggleList = (id: string) => {
    setListIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }


  if (selected) {
    const following = isFollowing(selected.id)
    const friends = areFriends(selected.id)
    const outgoing = pendingOutgoing(selected.id)
    return (
      <div className="screen hz-screen">
        <div className="title">C :: CONTACT</div>
        <h2 className="hz-heading">{selected.displayName}</h2>
        <p className="hz-meta dim">@{selected.handle}</p>
        {selected.bio ? <p className="profile-view-text">{selected.bio}</p> : null}
        <p className="hz-status">{relationshipLabel(selected.id) || 'No link yet'}</p>

        <section className="hz-panel">
          <h3 className="profile-section-title">Follow</h3>
          <p className="dim hz-lead">Asymmetric — no accept needed</p>
          <div className="btn-row">
            {following ? (
              <button
                type="button"
                className="btn dim"
                onClick={() => {
                  unfollowPerson(selected.id)
                  refresh()
                }}
              >
                Unfollow
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  followPerson(selected.id)
                  refresh()
                }}
              >
                Follow
              </button>
            )}
          </div>
        </section>

        <section className="hz-panel">
          <h3 className="profile-section-title">Friend</h3>
          <p className="dim hz-lead">Needs accept — request first</p>
          {friends ? (
            <p className="hz-status">You are friends</p>
          ) : outgoing ? (
            <p className="hz-status">Friend request sent · waiting</p>
          ) : (
            <div className="btn-row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  sendFriendRequest(selected.id)
                  refresh()
                }}
              >
                Send friend request
              </button>
            </div>
          )}
        </section>

        <section className="hz-panel">
          <h3 className="profile-section-title">Add to lists</h3>
          <p className="dim hz-lead">Pick one or more tags/lists for this person</p>
          <div className="hz-checks">
            {lists.map((l) => (
              <label key={l.id} className="hz-check">
                <input
                  type="checkbox"
                  checked={listIds.includes(l.id)}
                  onChange={() => toggleList(l.id)}
                />
                {l.name}
              </label>
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const all = ensureDefaultLists()
                saveLists(
                  all.map((l) => ({
                    ...l,
                    memberIds: listIds.includes(l.id)
                      ? Array.from(new Set([...l.memberIds.filter((id) => id !== selected.id), selected.id]))
                      : l.memberIds.filter((id) => id !== selected.id),
                  })),
                )
                refresh()
              }}
            >
              Save lists
            </button>
          </div>
        </section>

        <div className="profile-actions">
          <button type="button" className="btn dim" onClick={() => setSelectedId(null)}>
            Back to contacts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen hz-screen">
      <div className="title">C :: CONTACTS</div>
      <p className="dim hz-lead">
        Lists + Follow (no accept) + Friend (request → accept). Local demo people until real profiles.
      </p>

      <div className="btn-row hz-tabs">
        <button type="button" className={`privacy-btn${tab === 'people' ? ' is-on' : ''}`} onClick={() => setTab('people')}>
          People
        </button>
        <button type="button" className={`privacy-btn${tab === 'lists' ? ' is-on' : ''}`} onClick={() => setTab('lists')}>
          Lists
        </button>
        <button type="button" className={`privacy-btn${tab === 'requests' ? ' is-on' : ''}`} onClick={() => setTab('requests')}>
          Requests{incoming.length ? ` (${incoming.length})` : ''}
        </button>
      </div>

      {tab === 'people' && (
        <>
          <label className="hz-field">
            <span>Search</span>
            <input className="profile-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or handle" />
          </label>
          <ul className="hz-list">
            {filtered.map((p: ContactPerson) => (
              <li key={p.id}>
                <button type="button" className="hz-list-item" onClick={() => openPerson(p.id)}>
                  <span className="hz-list-title">{p.displayName}</span>
                  <span className="dim">{relationshipLabel(p.id) || `@${p.handle}`}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'lists' && (
        <>
          <label className="hz-field">
            <span>New list</span>
            <input className="profile-input" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="e.g. Sound team" />
          </label>
          <div className="btn-row">
            <button
              type="button"
              className="btn"
              disabled={!newListName.trim()}
              onClick={() => {
                createList(newListName)
                setNewListName('')
                refresh()
              }}
            >
              Create list
            </button>
          </div>
          <ul className="hz-list" style={{ marginTop: 12 }}>
            {lists.map((l: ContactList) => (
              <li key={l.id} className="hz-list-static">
                <span className="hz-list-title">{l.name}</span>
                <span className="dim">{l.memberIds.length} people</span>
              </li>
            ))}
          </ul>
          <p className="dim hz-lead">Open a person under People to assign lists.</p>
        </>
      )}

      {tab === 'requests' && (
        <>
          <p className="dim hz-lead">Incoming friend requests (accept / decline)</p>
          <div className="btn-row" style={{ marginBottom: 8 }}>
            <button
              type="button"
              className="btn dim"
              onClick={() => {
                const pool = loadPeople()
                const candidate = pool.find((p) => !areFriends(p.id) && !pendingOutgoing(p.id))
                if (candidate) {
                  simulateIncomingRequest(candidate.id)
                  refresh()
                }
              }}
            >
              Demo: simulate incoming request
            </button>
          </div>
          {incoming.length === 0 ? (
            <p className="profile-empty dim">No pending requests</p>
          ) : (
            <ul className="hz-list">
              {incoming.map((r) => {
                const from = getPerson(r.fromId)
                return (
                  <li key={r.id} className="hz-list-static" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="hz-list-title">{from?.displayName ?? r.fromId}</span>
                      <span className="dim">wants to be friends</span>
                    </div>
                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          acceptFriendRequest(r.id)
                          refresh()
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn dim"
                        onClick={() => {
                          declineFriendRequest(r.id)
                          refresh()
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
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