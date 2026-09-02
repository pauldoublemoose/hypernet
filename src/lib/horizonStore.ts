/** Local Events + Horizons store (browser only — no auth rewrite). */

export type EventRole = 'guest' | 'co-creator' | 'sponsor' | 'admin'
export type AttendStatus = 'interested' | 'going'

export interface HyperEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  description: string
  externalUrl: string
  hostName: string
  createdAt: string
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

export function loadEvents(): HyperEvent[] {
  return readJson<HyperEvent[]>(EVENTS_KEY, [])
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
}): HyperEvent {
  const event: HyperEvent = {
    id: uid('evt'),
    title: input.title.trim(),
    date: input.date,
    description: input.description.trim(),
    externalUrl: input.externalUrl.trim(),
    hostName: input.hostName.trim() || 'You',
    createdAt: new Date().toISOString(),
  }
  const events = loadEvents()
  events.unshift(event)
  saveEvents(events)
  return event
}

export function getEvent(id: string): HyperEvent | undefined {
  return loadEvents().find((e) => e.id === id)
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
  return horizon.eventIds.map((id) => map.get(id)).filter(Boolean) as HyperEvent[]
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
