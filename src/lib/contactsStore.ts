/**
 * Contacts / Follow / Friend — localStorage MVP.
 * Shaped for a later Supabase migration (stable ids, list membership, relationship rows).
 */

export type RelationshipKind = 'follow' | 'friend'

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

/** A person you can relate to (stub directory until real profiles/auth). */
export interface ContactPerson {
  id: string
  displayName: string
  handle: string
  bio?: string
}

export interface ContactList {
  id: string
  name: string
  createdAt: string
  /** Person ids in this list */
  memberIds: string[]
}

export interface FollowEdge {
  id: string
  /** You (local user) */
  followerId: string
  /** Them */
  followingId: string
  createdAt: string
}

export interface FriendRequest {
  id: string
  fromId: string
  toId: string
  status: FriendRequestStatus
  createdAt: string
  resolvedAt?: string
}

export interface Friendship {
  id: string
  aId: string
  bId: string
  createdAt: string
}

const PEOPLE_KEY = 'hypernet_contact_people'
const LISTS_KEY = 'hypernet_contact_lists'
const FOLLOWS_KEY = 'hypernet_follows'
const FRIEND_REQ_KEY = 'hypernet_friend_requests'
const FRIENDS_KEY = 'hypernet_friendships'
const SELF_ID = 'self'

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota */
  }
}

const SEED_PEOPLE: ContactPerson[] = [
  { id: 'p-anna', displayName: 'Anna Vale', handle: 'anna', bio: 'Sound + camp ops' },
  { id: 'p-rio', displayName: 'Rio Moss', handle: 'rio', bio: 'Lighting / AV' },
  { id: 'p-kai', displayName: 'Kai Okonkwo', handle: 'kai', bio: 'Kitchen lead' },
  { id: 'p-mira', displayName: 'Mira Chen', handle: 'mira', bio: 'Art installs' },
  { id: 'p-jon', displayName: 'Jon Hale', handle: 'jon', bio: 'Transport' },
  { id: 'p-sasha', displayName: 'Sasha Reed', handle: 'sasha', bio: 'Safety / rangers' },
]

export function selfId() {
  return SELF_ID
}

export function ensureSeedPeople(): ContactPerson[] {
  let people = readJson<ContactPerson[]>(PEOPLE_KEY, [])
  if (people.length === 0) {
    people = [...SEED_PEOPLE]
    writeJson(PEOPLE_KEY, people)
  }
  return people
}

export function loadPeople(): ContactPerson[] {
  return ensureSeedPeople()
}

export function getPerson(id: string): ContactPerson | undefined {
  return loadPeople().find((p) => p.id === id)
}

export function loadLists(): ContactList[] {
  return readJson<ContactList[]>(LISTS_KEY, [])
}

export function saveLists(lists: ContactList[]) {
  writeJson(LISTS_KEY, lists)
}

export function ensureDefaultLists(): ContactList[] {
  let lists = loadLists()
  if (lists.length === 0) {
    const now = new Date().toISOString()
    lists = [
      { id: 'list-crew', name: 'Camp crew', createdAt: now, memberIds: [] },
      { id: 'list-sound', name: 'Sound team', createdAt: now, memberIds: [] },
      { id: 'list-friends', name: 'Close friends', createdAt: now, memberIds: [] },
    ]
    saveLists(lists)
  }
  return lists
}

export function createList(name: string): ContactList {
  const list: ContactList = {
    id: uid('list'),
    name: name.trim() || 'Untitled list',
    createdAt: new Date().toISOString(),
    memberIds: [],
  }
  const lists = ensureDefaultLists()
  lists.push(list)
  saveLists(lists)
  return list
}

export function addPersonToLists(personId: string, listIds: string[]) {
  const lists = ensureDefaultLists().map((l) => {
    if (!listIds.includes(l.id)) return l
    if (l.memberIds.includes(personId)) return l
    return { ...l, memberIds: [...l.memberIds, personId] }
  })
  saveLists(lists)
}

export function removePersonFromList(personId: string, listId: string) {
  saveLists(
    ensureDefaultLists().map((l) =>
      l.id === listId ? { ...l, memberIds: l.memberIds.filter((id) => id !== personId) } : l,
    ),
  )
}

export function listsForPerson(personId: string): ContactList[] {
  return ensureDefaultLists().filter((l) => l.memberIds.includes(personId))
}

export function loadFollows(): FollowEdge[] {
  return readJson<FollowEdge[]>(FOLLOWS_KEY, [])
}

export function saveFollows(rows: FollowEdge[]) {
  writeJson(FOLLOWS_KEY, rows)
}

export function isFollowing(personId: string): boolean {
  const me = SELF_ID
  return loadFollows().some((f) => f.followerId === me && f.followingId === personId)
}

/** Asymmetric follow — no accept. */
export function followPerson(personId: string) {
  if (personId === SELF_ID || isFollowing(personId)) return
  const rows = loadFollows()
  rows.push({
    id: uid('follow'),
    followerId: SELF_ID,
    followingId: personId,
    createdAt: new Date().toISOString(),
  })
  saveFollows(rows)
}

export function unfollowPerson(personId: string) {
  saveFollows(loadFollows().filter((f) => !(f.followerId === SELF_ID && f.followingId === personId)))
}

export function loadFriendRequests(): FriendRequest[] {
  return readJson<FriendRequest[]>(FRIEND_REQ_KEY, [])
}

export function saveFriendRequests(rows: FriendRequest[]) {
  writeJson(FRIEND_REQ_KEY, rows)
}

export function loadFriendships(): Friendship[] {
  return readJson<Friendship[]>(FRIENDS_KEY, [])
}

export function saveFriendships(rows: Friendship[]) {
  writeJson(FRIENDS_KEY, rows)
}

export function areFriends(personId: string): boolean {
  const me = SELF_ID
  return loadFriendships().some(
    (f) => (f.aId === me && f.bId === personId) || (f.bId === me && f.aId === personId),
  )
}

export function pendingOutgoing(personId: string): FriendRequest | undefined {
  return loadFriendRequests().find(
    (r) => r.fromId === SELF_ID && r.toId === personId && r.status === 'pending',
  )
}

export function pendingIncoming(): FriendRequest[] {
  return loadFriendRequests().filter((r) => r.toId === SELF_ID && r.status === 'pending')
}

/** Friend = request → accept. */
export function sendFriendRequest(personId: string) {
  if (personId === SELF_ID || areFriends(personId) || pendingOutgoing(personId)) return
  // Demo: also allow incoming from seed by not auto-creating reverse
  const rows = loadFriendRequests()
  rows.push({
    id: uid('freq'),
    fromId: SELF_ID,
    toId: personId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
  saveFriendRequests(rows)
}

export function acceptFriendRequest(requestId: string) {
  const rows = loadFriendRequests()
  const req = rows.find((r) => r.id === requestId)
  if (!req || req.status !== 'pending') return
  req.status = 'accepted'
  req.resolvedAt = new Date().toISOString()
  saveFriendRequests(rows)
  if (!areFriends(req.fromId === SELF_ID ? req.toId : req.fromId)) {
    const other = req.fromId === SELF_ID ? req.toId : req.fromId
    const friends = loadFriendships()
    friends.push({
      id: uid('friend'),
      aId: SELF_ID,
      bId: other,
      createdAt: new Date().toISOString(),
    })
    saveFriendships(friends)
  }
}

export function declineFriendRequest(requestId: string) {
  const rows = loadFriendRequests()
  const req = rows.find((r) => r.id === requestId)
  if (!req || req.status !== 'pending') return
  req.status = 'declined'
  req.resolvedAt = new Date().toISOString()
  saveFriendRequests(rows)
}

/** Demo helper: simulate an incoming friend request from a seed person. */
export function simulateIncomingRequest(fromPersonId: string) {
  if (fromPersonId === SELF_ID) return
  const exists = loadFriendRequests().some(
    (r) => r.fromId === fromPersonId && r.toId === SELF_ID && r.status === 'pending',
  )
  if (exists || areFriends(fromPersonId)) return
  const rows = loadFriendRequests()
  rows.push({
    id: uid('freq'),
    fromId: fromPersonId,
    toId: SELF_ID,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
  saveFriendRequests(rows)
}

export function relationshipLabel(personId: string): string {
  const bits: string[] = []
  if (areFriends(personId)) bits.push('Friend')
  else if (pendingOutgoing(personId)) bits.push('Friend request sent')
  if (isFollowing(personId)) bits.push('Following')
  return bits.join(' · ') || 'No link yet'
}