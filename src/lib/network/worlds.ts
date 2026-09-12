/**
 * Event-worlds for the ego-centric Network Graph MVP.
 * Helicopter / force-layout helpers in buildGraph.ts stay parked.
 *
 * Locked brief (2026-09-12): World picker + local walk. Stubs OK for the
 * private surf dial and rich data. Do not invent FoF × co-attendee matrices.
 */

import {
  areFriendsBetween,
  ensureSeedFriendshipGraph,
  ensureSeedPeople,
  getPerson,
  loadFriendships,
  loadPeople,
  saveFriendships,
  selfId,
  type ContactPerson,
} from '../contactsStore'
import {
  loadAttendance,
  loadEvents,
  normalizeEvent,
  saveEvents,
  type EventPrivacy,
  type HyperEvent,
} from '../horizonStore'
import { SEED_NODES } from './seed'

export type WorldKind = 'open' | 'private'
/** Private Worlds only. Default is friends of participants. */
export type SurfDial = 'participants' | 'friends_of_participants' | 'anyone'

export interface GraphWorld {
  id: string
  title: string
  kind: WorldKind
  surfDial: SurfDial
  description: string
  eventId: string
  /** Demo roster — people “in” this event twin. */
  participantIds: string[]
  /** Chronicle / “I attended” hidden — appear dim/locked even in reach. */
  attendanceHiddenIds: string[]
  /** Extra inhabitants for open public-square density (not all are participants). */
  extraIds: string[]
  spread: number
}

export interface WorldInhabitant {
  id: string
  displayName: string
  bio: string
  skills: string[]
  x: number
  y: number
  isSelf: boolean
  /** Allowed to appear full when in reach. */
  allowed: boolean
}

export const WORLD_IDS = {
  borderland: 'world-borderland-2026',
  burningMan: 'world-burning-man-2026',
  hyperstition: 'world-hyperstition-2026',
  dinner: 'world-camp-dinner',
  warehouse: 'world-warehouse',
} as const

const EVENT_IDS = {
  borderland: 'evt-world-borderland-2026',
  burningMan: 'evt-world-burning-man-2026',
  hyperstition: 'evt-world-hyperstition-2026',
  dinner: 'evt-world-camp-dinner',
  warehouse: 'evt-world-warehouse',
} as const

const FRIEND_GRANT_ID = 'p-anna'

function hash32(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function placeInWorld(id: string, spread: number): { x: number; y: number } {
  const h = hash32(id)
  const h2 = hash32(`${id}:b`)
  const ang = (h / 0xffffffff) * Math.PI * 2
  const r = 56 + (h2 / 0xffffffff) * spread
  return { x: Math.cos(ang) * r, y: Math.sin(ang) * r }
}

export function surfDialLabel(dial: SurfDial): string {
  switch (dial) {
    case 'participants':
      return 'Participants'
    case 'friends_of_participants':
      return 'Friends of participants'
    case 'anyone':
      return 'Anyone'
  }
}

export function kindLabel(kind: WorldKind): string {
  return kind === 'open' ? 'Open / community' : 'Private'
}

function demoEvent(partial: {
  id: string
  title: string
  date: string
  description: string
  privacy: EventPrivacy
  ownerIds: string[]
}): HyperEvent {
  return normalizeEvent({
    id: partial.id,
    title: partial.title,
    date: partial.date,
    description: partial.description,
    externalUrl: '',
    hostName: 'Hypernet',
    createdAt: '2026-09-12T00:00:00.000Z',
    ownerIds: partial.ownerIds,
    ownerGroupIds: [],
    privacy: partial.privacy,
    privacyListIds: [],
  })
}

/** Seed demo event twins + a friend edge so one private FoF World is enterable. */
export function ensureWorldDemoData() {
  ensureSeedPeople()
  ensureSeedFriendshipGraph()

  const me = selfId()
  const friends = loadFriendships()
  const hasGrant = friends.some(
    (f) =>
      (f.aId === me && f.bId === FRIEND_GRANT_ID) || (f.bId === me && f.aId === FRIEND_GRANT_ID),
  )
  if (!hasGrant) {
    friends.push({
      id: 'friend-world-grant-anna',
      aId: me,
      bId: FRIEND_GRANT_ID,
      createdAt: '2026-09-12T00:00:00.000Z',
    })
    saveFriendships(friends)
  }

  const events = loadEvents()
  const seeds: HyperEvent[] = [
    demoEvent({
      id: EVENT_IDS.borderland,
      title: 'Borderland 2026',
      date: '2026-07-20',
      description: 'Open community twin — public square. Surf irrespective of attendance.',
      privacy: 'everyone',
      ownerIds: [me],
    }),
    demoEvent({
      id: EVENT_IDS.burningMan,
      title: 'Burning Man 2026',
      date: '2026-08-30',
      description: 'Open community twin — BM-scale public square. No admin gate to enter.',
      privacy: 'everyone',
      ownerIds: [me],
    }),
    demoEvent({
      id: EVENT_IDS.hyperstition,
      title: 'Hyperstition 2026',
      date: '2026-06-12',
      description: 'Open community twin seeded from the Hyperstition years.',
      privacy: 'everyone',
      ownerIds: [me],
    }),
    demoEvent({
      id: EVENT_IDS.dinner,
      title: 'Camp kitchen dinner',
      date: '2026-07-22',
      description: 'Private twin. Surf dial: Friends of participants (default).',
      privacy: 'friends',
      ownerIds: [FRIEND_GRANT_ID],
    }),
    demoEvent({
      id: EVENT_IDS.warehouse,
      title: 'Warehouse session',
      date: '2026-09-04',
      description: 'Private twin. Surf dial: Participants (you are on the roster).',
      privacy: 'only_me',
      ownerIds: [me],
    }),
  ]
  let changed = false
  for (const s of seeds) {
    if (!events.some((e) => e.id === s.id)) {
      events.push(s)
      changed = true
    }
  }
  if (changed) saveEvents(events)
}

const CONTACT_EXTRAS = ['p-anna', 'p-rio', 'p-kai', 'p-mira', 'p-jon', 'p-sasha']
const SEED_IDS = SEED_NODES.map((n) => n.id)

function demoWorlds(): GraphWorld[] {
  return [
    {
      id: WORLD_IDS.borderland,
      title: 'Borderland 2026',
      kind: 'open',
      surfDial: 'anyone',
      description: 'Public square. Surf irrespective of attendance — no admin gate.',
      eventId: EVENT_IDS.borderland,
      participantIds: ['p-anna', 'p-rio', 'p-kai', 'p-mira', 'seed-1', 'seed-2', 'seed-3', 'seed-7', 'seed-8'],
      attendanceHiddenIds: ['seed-10'],
      extraIds: [...CONTACT_EXTRAS, ...SEED_IDS],
      spread: 540,
    },
    {
      id: WORLD_IDS.burningMan,
      title: 'Burning Man 2026',
      kind: 'open',
      surfDial: 'anyone',
      description: 'BM-scale public square. Walk a neighborhood, not the whole playa.',
      eventId: EVENT_IDS.burningMan,
      participantIds: ['p-sasha', 'p-jon', 'seed-4', 'seed-8', 'seed-11', 'seed-12', 'seed-5'],
      attendanceHiddenIds: ['seed-6'],
      extraIds: [...CONTACT_EXTRAS, ...SEED_IDS],
      spread: 620,
    },
    {
      id: WORLD_IDS.hyperstition,
      title: 'Hyperstition 2026',
      kind: 'open',
      surfDial: 'anyone',
      description: 'Open community twin. Hypernet-seeded; user events can appear here too.',
      eventId: EVENT_IDS.hyperstition,
      participantIds: SEED_IDS.filter((id) => {
        const n = SEED_NODES.find((s) => s.id === id)
        return !!n && (n.visited.includes('2026') || n.cocreated.includes('2026'))
      }).concat(['p-anna', 'p-rio']),
      attendanceHiddenIds: [],
      extraIds: SEED_IDS,
      spread: 480,
    },
    {
      id: WORLD_IDS.dinner,
      title: 'Camp kitchen dinner',
      kind: 'private',
      surfDial: 'friends_of_participants',
      description: 'Private. Friends of participants (default) — you can surf as Anna’s friend.',
      eventId: EVENT_IDS.dinner,
      participantIds: ['p-anna', 'p-rio', 'p-kai', 'p-jon'],
      attendanceHiddenIds: ['p-mira'],
      extraIds: [],
      spread: 200,
    },
    {
      id: WORLD_IDS.warehouse,
      title: 'Warehouse session',
      kind: 'private',
      surfDial: 'participants',
      description: 'Private. Participants only — you are on the roster.',
      eventId: EVENT_IDS.warehouse,
      participantIds: [selfId(), 'p-sasha', 'seed-2', 'seed-11'],
      attendanceHiddenIds: [],
      extraIds: [],
      spread: 180,
    },
  ]
}

function privacyToDial(privacy: EventPrivacy): { kind: WorldKind; surfDial: SurfDial } {
  switch (privacy) {
    case 'everyone':
      return { kind: 'open', surfDial: 'anyone' }
    case 'only_me':
      return { kind: 'private', surfDial: 'participants' }
    case 'friends':
    case 'contacts':
      return { kind: 'private', surfDial: 'friends_of_participants' }
    default:
      return { kind: 'open', surfDial: 'anyone' }
  }
}

function userEventWorld(event: HyperEvent): GraphWorld {
  const { kind, surfDial } = privacyToDial(event.privacy)
  const going = loadAttendance()
    .filter((a) => a.eventId === event.id && a.status === 'going')
    .map((a) => selfId())
  const participantIds = [...new Set([...event.ownerIds, ...going])]
  return {
    id: `evt-world-${event.id}`,
    title: event.title || 'Untitled event',
    kind,
    surfDial,
    description: event.description || 'User event twin.',
    eventId: event.id,
    participantIds,
    attendanceHiddenIds: [],
    extraIds: kind === 'open' ? [...CONTACT_EXTRAS] : [],
    spread: kind === 'open' ? 420 : 200,
  }
}

export function canSurfWorld(world: GraphWorld, viewerId: string = selfId()): boolean {
  if (world.kind === 'open') return true
  if (world.participantIds.includes(viewerId)) return true
  if (world.surfDial === 'anyone') return true
  if (world.surfDial === 'participants') return false
  return world.participantIds.some((pid) => areFriendsBetween(viewerId, pid))
}

export function isAttendanceHidden(world: GraphWorld, personId: string): boolean {
  return world.attendanceHiddenIds.includes(personId)
}

/** Full node only if allowed (not Chronicle-hidden) — reach is applied in the view. */
export function isNodeAllowed(world: GraphWorld, personId: string): boolean {
  if (personId === selfId()) return true
  if (isAttendanceHidden(world, personId)) return false
  return true
}

export function listAllWorlds(): GraphWorld[] {
  ensureWorldDemoData()
  const demo = demoWorlds()
  const demoEventIds = new Set(demo.map((w) => w.eventId))
  const extras = loadEvents()
    .filter((e) => !demoEventIds.has(e.id))
    .map(userEventWorld)
  return [...demo, ...extras]
}

export function listEnterableWorlds(viewerId: string = selfId()): GraphWorld[] {
  return listAllWorlds().filter((w) => canSurfWorld(w, viewerId))
}

export function getWorld(id: string): GraphWorld | undefined {
  return listAllWorlds().find((w) => w.id === id)
}

function catalogPerson(id: string): { displayName: string; bio: string; skills: string[] } | undefined {
  if (id === selfId()) return undefined
  const contact = getPerson(id) ?? loadPeople().find((p: ContactPerson) => p.id === id)
  if (contact) {
    return {
      displayName: contact.displayName,
      bio: contact.bio ?? '',
      skills: [],
    }
  }
  const seed = SEED_NODES.find((n) => n.id === id)
  if (seed) {
    return {
      displayName: seed.name,
      bio: '',
      skills: seed.skills,
    }
  }
  return undefined
}

export function inhabitantsForWorld(
  world: GraphWorld,
  selfName: string,
  viewerId: string = selfId(),
): WorldInhabitant[] {
  const ids = new Set<string>([viewerId, ...world.participantIds, ...world.extraIds, ...world.attendanceHiddenIds])
  const out: WorldInhabitant[] = []
  for (const id of ids) {
    if (id === viewerId) {
      out.push({
        id,
        displayName: selfName.trim() || 'You',
        bio: 'You in this World.',
        skills: [],
        x: 0,
        y: 0,
        isSelf: true,
        allowed: true,
      })
      continue
    }
    const info = catalogPerson(id)
    if (!info) continue
    const pos = placeInWorld(`${world.id}:${id}`, world.spread)
    out.push({
      id,
      displayName: info.displayName,
      bio: info.bio,
      skills: info.skills,
      x: pos.x,
      y: pos.y,
      isSelf: false,
      allowed: isNodeAllowed(world, id),
    })
  }
  return out
}

export function shareEvent(world: GraphWorld, a: WorldInhabitant, b: WorldInhabitant): boolean {
  if (a.id === b.id) return false
  const roster = new Set<string>([selfId(), ...world.participantIds])
  return roster.has(a.id) && roster.has(b.id)
}
