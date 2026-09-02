/** Local Events + Horizons store (browser only — no auth rewrite). */

import {
  areFriendsBetween,
  ensureSeedFriendshipGraph,
  isFriendOfFriend,
  selfId,
  viewerOnAnyList,
} from './contactsStore'

export type EventRole = 'guest' | 'co-creator' | 'sponsor' | 'admin'
export type AttendStatus = 'interested' | 'going'
export type EventPrivacy = 'public' | 'private' | 'friends_of_friends' | 'lists'

export interface HyperEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  description: string
  externalUrl: string
  hostName: string
  createdAt: string
  /** Profile ids that own the event. Creator (`self`) always included. */
  ownerIds: string[]
  privacy: EventPrivacy
  /** When privacy === 'lists', one or more contact list ids. */
  privacyListIds: string[]
}

export interface Horizon {
  id: string
  name: string
  description: string
  /** Personal private default “liked/starred” list — one per profile. */
  isPersonalDefault: boolean
  /** Profile-owned publishable calendar. */
  isPublished: boolean
  ownerName: string
  eventIds: string[]
  createdAt: string
}

export interface Attendance {
  eventId: string
  status: AttendStatus
  role?: EventRole
}

const EVENTS_KEY = 'hypernet_events'
const HORIZONS_KEY = 'hypernet_horizons'
const ATTEND_KEY = 'hypernet_attendance'
const DEFAULT_HORIZON_ID = 'horizon-default'

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

/** Migrate legacy events missing owner/privacy fields. */
export function normalizeEvent(raw: Partial<HyperEvent> & Pick<HyperEvent, 'id' | 'title'>): HyperEvent {
  const privacy = (raw.privacy as EventPrivacy | undefined) ?? 'public'
  const valid: EventPrivacy[] = ['public', 'private', 'friends_of_friends', 'lists']
  return {
    id: raw.id,
    title: raw.title ?? '',
    date: raw.date ?? '',
    description: raw.description ?? '',
    externalUrl: raw.externalUrl ?? '',
    hostName: raw.hostName ?? 'You',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    ownerIds: raw.ownerIds?.length ? [...raw.ownerIds] : [selfId()],
    privacy: valid.includes(privacy) ? privacy : 'public',
    privacyListIds: Array.isArray(raw.privacyListIds) ? [...raw.privacyListIds] : [],
  }
}

function ensureCreatorOwner(ownerIds: string[]): string[] {
  const me = selfId()
  const ids = ownerIds.filter(Boolean)
  if (!ids.includes(me)) ids.unshift(me)
  return [...new Set(ids)]
}

export function loadEvents(): HyperEvent[] {
  const raw = readJson<Partial<HyperEvent>[]>((EVENTS_KEY), [])
  const events = raw
    .filter((e) => e && typeof e.id === 'string' && typeof e.title === 'string')
    .map((e) => normalizeEvent(e as Partial<HyperEvent> & Pick<HyperEvent, 'id' | 'title'>))
  // Persist migration when any event was missing fields
  const needsWrite = raw.some(
    (e) => !e?.ownerIds?.length || e.privacy == null || !Array.isArray(e.privacyListIds),
  )
  if (needsWrite && events.length) saveEvents(events)
  return events
}

export function saveEvents(events: HyperEvent[]) {
  writeJson(EVENTS_KEY, events)
}

export function loadHorizons(): Horizon[] {
  return readJson<Horizon[]>(HORIZONS_KEY, [])
}

export function saveHorizons(horizons: Horizon[]) {
  writeJson(HORIZONS_KEY, horizons)
}

export function loadAttendance(): Attendance[] {
  return readJson<Attendance[]>(ATTEND_KEY, [])
}

export function saveAttendance(rows: Attendance[]) {
  writeJson(ATTEND_KEY, rows)
}

/** Ensure the private personal default Horizon exists. */
export function ensureDefaultHorizon(ownerName: string): Horizon {
  const horizons = loadHorizons()
  let def = horizons.find((h) => h.isPersonalDefault || h.id === DEFAULT_HORIZON_ID)
  if (!def) {
    def = {
      id: DEFAULT_HORIZON_ID,
      name: 'My Horizon',
      description: 'Your private liked / starred events (personal default).',
      isPersonalDefault: true,
      isPublished: false,
      ownerName: ownerName || 'You',
      eventIds: [],
      createdAt: new Date().toISOString(),
    }
    horizons.unshift(def)
    saveHorizons(horizons)
  } else if (ownerName && def.ownerName !== ownerName) {
    def = { ...def, ownerName }
    saveHorizons(horizons.map((h) => (h.id === def!.id ? def! : h)))
  }
  return def
}

export function createEvent(input: {
  title: string
  date: string
  description: string
  externalUrl: string
  hostName: string
  ownerIds?: string[]
  privacy?: EventPrivacy
  privacyListIds?: string[]
}): HyperEvent {
  const privacy: EventPrivacy = input.privacy ?? 'public'
  const privacyListIds =
    privacy === 'lists' ? [...new Set((input.privacyListIds ?? []).filter(Boolean))] : []
  const event: HyperEvent = {
    id: uid('evt'),
    title: input.title.trim(),
    date: input.date,
    description: input.description.trim(),
    externalUrl: input.externalUrl.trim(),
    hostName: input.hostName.trim() || 'You',
    createdAt: new Date().toISOString(),
    ownerIds: ensureCreatorOwner(input.ownerIds ?? [selfId()]),
    privacy,
    privacyListIds,
  }
  const events = loadEvents()
  events.unshift(event)
  saveEvents(events)
  return event
}

export function updateEvent(
  id: string,
  patch: Partial<
    Pick<
      HyperEvent,
      'title' | 'date' | 'description' | 'externalUrl' | 'hostName' | 'ownerIds' | 'privacy' | 'privacyListIds'
    >
  >,
): HyperEvent | undefined {
  const events = loadEvents()
  const idx = events.findIndex((e) => e.id === id)
  if (idx < 0) return undefined
  const prev = events[idx]
  const privacy = patch.privacy ?? prev.privacy
  const next: HyperEvent = {
    ...prev,
    ...patch,
    title: patch.title != null ? patch.title.trim() : prev.title,
    description: patch.description != null ? patch.description.trim() : prev.description,
    externalUrl: patch.externalUrl != null ? patch.externalUrl.trim() : prev.externalUrl,
    hostName: patch.hostName != null ? (patch.hostName.trim() || prev.hostName) : prev.hostName,
    ownerIds: ensureCreatorOwner(patch.ownerIds ?? prev.ownerIds),
    privacy,
    privacyListIds:
      privacy === 'lists'
        ? [...new Set((patch.privacyListIds ?? prev.privacyListIds).filter(Boolean))]
        : [],
  }
  events[idx] = next
  saveEvents(events)
  return next
}

export function getEvent(id: string): HyperEvent | undefined {
  return loadEvents().find((e) => e.id === id)
}

/**
 * Best-effort localStorage privacy check. Viewer is local `self`.
 * Owners always see their events.
 *
 * Note: Horizons do not yet mirror owner/privacy — filter events first;
 * horizon calendars still list event ids without a separate privacy layer.
 */
export function canViewerSeeEvent(event: HyperEvent, viewerId: string = selfId()): boolean {
  ensureSeedFriendshipGraph()
  const e = normalizeEvent(event)
  if (e.ownerIds.includes(viewerId)) return true
  switch (e.privacy) {
    case 'public':
      return true
    case 'private':
      return false
    case 'friends_of_friends':
      return e.ownerIds.some((oid) => {
        if (oid === viewerId) return true
        if (areFriendsBetween(viewerId, oid)) return true
        return isFriendOfFriend(oid, viewerId)
      })
    case 'lists': {
      // Lists hold contact person ids; self is rarely a member — owners still see.
      return viewerOnAnyList(e.privacyListIds, viewerId)
    }
    default:
      return true
  }
}

export function visibleEvents(viewerId: string = selfId()): HyperEvent[] {
  return loadEvents().filter((e) => canViewerSeeEvent(e, viewerId))
}

export function createHorizon(input: {
  name: string
  description: string
  ownerName: string
  isPublished: boolean
}): Horizon {
  const horizon: Horizon = {
    id: uid('hz'),
    name: input.name.trim(),
    description: input.description.trim(),
    isPersonalDefault: false,
    isPublished: input.isPublished,
    ownerName: input.ownerName.trim() || 'You',
    eventIds: [],
    createdAt: new Date().toISOString(),
  }
  const horizons = loadHorizons()
  horizons.push(horizon)
  saveHorizons(horizons)
  return horizon
}

export function getHorizon(id: string): Horizon | undefined {
  return loadHorizons().find((h) => h.id === id)
}

export function addEventToHorizon(horizonId: string, eventId: string) {
  const horizons = loadHorizons()
  const next = horizons.map((h) => {
    if (h.id !== horizonId) return h
    if (h.eventIds.includes(eventId)) return h
    return { ...h, eventIds: [...h.eventIds, eventId] }
  })
  saveHorizons(next)
}

export function removeEventFromHorizon(horizonId: string, eventId: string) {
  const horizons = loadHorizons()
  saveHorizons(
    horizons.map((h) =>
      h.id === horizonId ? { ...h, eventIds: h.eventIds.filter((id) => id !== eventId) } : h,
    ),
  )
}

export function setAttendance(
  eventId: string,
  status: AttendStatus,
  role: EventRole | undefined,
  ownerName: string,
) {
  const def = ensureDefaultHorizon(ownerName)
  addEventToHorizon(def.id, eventId)
  const rows = loadAttendance().filter((a) => a.eventId !== eventId)
  rows.push({ eventId, status, role: status === 'going' ? role ?? 'guest' : undefined })
  saveAttendance(rows)
}

export function getAttendance(eventId: string): Attendance | undefined {
  return loadAttendance().find((a) => a.eventId === eventId)
}

export function eventsForHorizon(horizon: Horizon): HyperEvent[] {
  const map = new Map(loadEvents().map((e) => [e.id, e]))
  return horizon.eventIds
    .map((id) => map.get(id))
    .filter((e): e is HyperEvent => !!e && canViewerSeeEvent(e))
}

export function publishedHorizons(): Horizon[] {
  return loadHorizons().filter((h) => h.isPublished && !h.isPersonalDefault)
}

export function myHorizons(): Horizon[] {
  return loadHorizons().filter((h) => h.isPersonalDefault || !h.isPersonalDefault)
}

export function formatEventDate(isoDay: string): string {
  if (!isoDay) return 'Date TBD'
  try {
    const d = new Date(isoDay + 'T12:00:00')
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return isoDay
  }
}

export function privacyLabel(privacy: EventPrivacy): string {
  switch (privacy) {
    case 'public':
      return 'Public'
    case 'private':
      return 'Private (owners only)'
    case 'friends_of_friends':
      return 'Friends of friends'
    case 'lists':
      return 'Contact lists'
    default:
      return privacy
  }
}
