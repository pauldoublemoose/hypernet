import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  acceptFriendRequest,
  addPersonToLists,
  saveLists,
  areFriends,
  createList,
  declineFriendRequest,
  ensureDefaultLists,
  followPerson,
  getPerson,
  incomingInbox,
  isFollowing,
  listsForPerson,
  loadPeople,
  pendingIncoming,
  pendingOutgoing,
  relationshipLabel,
  sendFriendRequest,
  simulateIncomingRequest,
  undoAcceptFriendRequest,
  undoDeclineFriendRequest,
  unfollowPerson,
  type ContactList,
  type ContactPerson,
  type FriendRequest,
} from '../../lib/contactsStore'
import { CardThumb } from '../CardThumb'
import { CrtPopup } from '../CrtPopup'

type Tab = 'people' | 'lists' | 'requests'

export function ContactsScreen({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<Tab>('people')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listIds, setListIds] = useState<string[]>([])
  const [newListName, setNewListName] = useState('')
  const [q, setQ] = useState('')
  const [addToListId, setAddToListId] = useState<string | null>(null)
  const [addSearch, setAddSearch] = useState('')
  const [addReqFromId, setAddReqFromId] = useState<string | null>(null)

  const refresh = () => setTick((n) => n + 1)

  const people = useMemo(() => {
    void tick
    return loadPeople()
  }, [tick])
  const lists = useMemo(() => {
    void tick
    return ensureDefaultLists()
  }, [tick])
  const incomingPending = useMemo(() => {
    void tick
    return pendingIncoming()
  }, [tick])
  const inbox = useMemo(() => {
    void tick
    return incomingInbox()
  }, [tick])

  const popupOpen = Boolean(addToListId || addReqFromId)

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (popupOpen) {
      closePopups()
      return
    }
    if (selectedId) setSelectedId(null)
    else onBack()
  })

  const closePopups = () => {
    setAddToListId(null)
    setAddSearch('')
    setAddReqFromId(null)
  }

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

  const addToListNow = (listId: string, personId: string) => {
    addPersonToLists(personId, [listId])
    refresh()
  }

  const pickerPeople = people.filter((p) => {
    const s = addSearch.trim().toLowerCase()
    if (!s) return true
    return p.displayName.toLowerCase().includes(s) || p.handle.toLowerCase().includes(s)
  })

  const activeList = addToListId ? lists.find((l) => l.id === addToListId) : undefined
  const reqPerson = addReqFromId ? getPerson(addReqFromId) : undefined

  if (selected) {
    const following = isFollowing(selected.id)
    const friends = areFriends(selected.id)
    const outgoing = pendingOutgoing(selected.id)
    return (
      <div className="screen hz-screen">
        <div className="title">C :: CONTACT</div>
        <div className="hz-card-head">
          <CardThumb src={selected.imageUrl} label={selected.displayName} />
          <div>
            <h2 className="hz-heading">{selected.displayName}</h2>
            <p className="hz-meta dim">@{selected.handle}</p>
          </div>
        </div>
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
          <h3 className="profile-section-title">Add to contact lists</h3>
          <p className="dim hz-lead">Pick one or more contact lists for this person</p>
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
              Save contact lists
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
        Contact lists + Follow (no accept) + Friend (request → accept). Local demo people until real profiles.
      </p>

      <div className="btn-row hz-tabs">
        <button type="button" className={`privacy-btn${tab === 'people' ? ' is-on' : ''}`} onClick={() => setTab('people')}>
          People
        </button>
        <button type="button" className={`privacy-btn${tab === 'lists' ? ' is-on' : ''}`} onClick={() => setTab('lists')}>
          Contact lists
        </button>
        <button type="button" className={`privacy-btn${tab === 'requests' ? ' is-on' : ''}`} onClick={() => setTab('requests')}>
          Requests{incomingPending.length ? ` (${incomingPending.length})` : ''}
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
                <button type="button" className="hz-list-item has-thumb" onClick={() => openPerson(p.id)}>
                  <CardThumb src={p.imageUrl} label={p.displayName} />
                  <span className="hz-list-copy">
                    <span className="hz-list-title">{p.displayName}</span>
                    <span className="dim">{relationshipLabel(p.id) || `@${p.handle}`}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'lists' && (
        <>
          <label className="hz-field">
            <span>New contact list</span>
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
              Create contact list
            </button>
          </div>
          <ul className="hz-list" style={{ marginTop: 12 }}>
            {lists.map((l: ContactList) => (
              <li key={l.id} className="hz-list-static hz-list-row">
                <span className="hz-list-title">{l.name}</span>
                <span className="hz-list-row-end">
                  <span className="dim">{l.memberIds.length} people</span>
                  <button
                    type="button"
                    className="list-plus-btn"
                    aria-label={`Add someone to ${l.name}`}
                    title={`Add someone to ${l.name}`}
                    onClick={() => {
                      setAddSearch('')
                      setAddToListId(l.id)
                    }}
                  >
                    +
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="dim hz-lead">+ adds a person from your contacts directory. Or open a person under People.</p>
        </>
      )}

      {tab === 'requests' && (
        <>
          <p className="dim hz-lead">Incoming friend requests — accept, decline, undo, or add to a list first.</p>
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
          {inbox.length === 0 ? (
            <p className="profile-empty dim">No incoming requests</p>
          ) : (
            <ul className="hz-list">
              {inbox.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  onRefresh={refresh}
                  onAddToList={() => setAddReqFromId(r.fromId)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <div className="profile-actions">
        <button type="button" className="btn dim" onClick={onBack}>
          Back
        </button>
      </div>

      {activeList && (
        <CrtPopup
          title={`Add to ${activeList.name}`}
          lead="Search your contacts directory and tap a name to add them now."
          onClose={closePopups}
        >
          <label className="hz-field">
            <span>Search</span>
            <input
              className="profile-input"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Name or handle"
              autoFocus
            />
          </label>
          <ul className="hz-list crt-popup-list">
            {pickerPeople.length === 0 ? (
              <li className="hz-list-static">
                <span className="dim">No matches</span>
              </li>
            ) : (
              pickerPeople.map((p) => {
                const onList = activeList.memberIds.includes(p.id)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="hz-list-item has-thumb"
                      disabled={onList}
                      onClick={() => addToListNow(activeList.id, p.id)}
                    >
                      <CardThumb src={p.imageUrl} label={p.displayName} />
                      <span className="hz-list-copy">
                        <span className="hz-list-title">{p.displayName}</span>
                        <span className="dim">{onList ? 'already on list' : `@${p.handle}`}</span>
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </CrtPopup>
      )}

      {reqPerson && (
        <CrtPopup
          title={`Add ${reqPerson.displayName} to a list`}
          lead="Works before or after you accept / decline."
          onClose={closePopups}
        >
          <ul className="hz-list crt-popup-list">
            {lists.map((l) => {
              const onList = l.memberIds.includes(reqPerson.id)
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    className="hz-list-item"
                    disabled={onList}
                    onClick={() => addToListNow(l.id, reqPerson.id)}
                  >
                    <span className="hz-list-title">{l.name}</span>
                    <span className="dim">{onList ? 'already on list' : `${l.memberIds.length} people`}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </CrtPopup>
      )}
    </div>
  )
}

function RequestCard({
  request,
  onRefresh,
  onAddToList,
}: {
  request: FriendRequest
  onRefresh: () => void
  onAddToList: () => void
}) {
  const from = getPerson(request.fromId)
  const name = from?.displayName ?? request.fromId
  const pending = request.status === 'pending'
  const accepted = request.status === 'accepted'
  const declined = request.status === 'declined'
  const status = pending ? 'wants to be friends' : accepted ? 'Accepted · friends' : 'Declined'

  return (
    <li className="hz-list-static req-card">
      <div className="req-card-top">
        <CardThumb src={from?.imageUrl} label={name} />
        <span className="hz-list-copy">
          <span className="hz-list-title">{name}</span>
          <span className="dim">{status}</span>
        </span>
      </div>
      <div className="req-card-actions">
        <div className="btn-row">
          {pending && (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  acceptFriendRequest(request.id)
                  onRefresh()
                }}
              >
                Accept
              </button>
              <button
                type="button"
                className="btn dim"
                onClick={() => {
                  declineFriendRequest(request.id)
                  onRefresh()
                }}
              >
                Decline
              </button>
            </>
          )}
          {accepted && (
            <button
              type="button"
              className="btn dim"
              onClick={() => {
                undoAcceptFriendRequest(request.id)
                onRefresh()
              }}
            >
              Undo accept
            </button>
          )}
          {declined && (
            <button
              type="button"
              className="btn dim"
              onClick={() => {
                undoDeclineFriendRequest(request.id)
                onRefresh()
              }}
            >
              Undo decline
            </button>
          )}
        </div>
        <button type="button" className="btn" onClick={onAddToList}>
          + Add to List
        </button>
      </div>
    </li>
  )
}
