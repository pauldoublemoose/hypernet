import { loadPeople } from './contactsStore'
import { visibleGroups } from './groupsStore'
import {
  createEvent,
  createHorizon,
  publishedHorizons,
  visibleEvents,
} from './horizonStore'
import { type SpaceKind, type SpaceRecord } from './space'

export type FinderKind = 'people' | 'events' | 'calendars' | 'groups'

export const FINDER_KINDS: FinderKind[] = ['people', 'events', 'calendars', 'groups']

export const FINDER_KIND_LABEL: Record<FinderKind, string> = {
  people: 'PEOPLE',
  events: 'EVENTS',
  calendars: 'CALENDARS',
  groups: 'GROUPS',
}

export type FinderFilter = { mode: 'all' } | { mode: 'kinds'; kinds: FinderKind[] }

export type FinderView = 'thumbnail' | 'list'

const KIND_TO_SPACE: Record<FinderKind, SpaceKind> = {
  people: 'person',
  events: 'event',
  calendars: 'calendar',
  groups: 'group',
}

export function toggleFinderFilter(current: FinderFilter, next: 'all' | FinderKind): FinderFilter {
  if (next === 'all') return { mode: 'all' }
  if (current.mode === 'all') return { mode: 'kinds', kinds: [next] }
  const on = current.kinds.includes(next)
  const kinds = on ? current.kinds.filter((k) => k !== next) : [...current.kinds, next]
  if (kinds.length === 0) return { mode: 'all' }
  return { mode: 'kinds', kinds }
}

export function filterHasKind(filter: FinderFilter, kind: FinderKind): boolean {
  return filter.mode === 'all' || filter.kinds.includes(kind)
}

export function ensureFinderSeeds() {
  if (visibleEvents().length === 0) {
    createEvent({
      title: 'Deep Listening Lab',
      date: '2026-10-04',
      description: 'Quiet rooms, long tones, and a Stockholm basement.',
      externalUrl: '',
      hostName: 'Anna Vale',
      ownerIds: ['p-anna'],
      ownerGroupIds: ['g-baltic'],
      privacy: 'everyone',
      privacyListIds: [],
    })
  }
  if (publishedHorizons().length === 0) {
    createHorizon({
      name: 'Baltic Circuit',
      description: 'Shared calendar for the regional burn camp.',
      ownerName: 'Baltic Circuit',
      isPublished: true,
      ownerGroupId: 'g-baltic',
    })
  }
}

export function collectSpaces(): SpaceRecord[] {
  ensureFinderSeeds()
  const people: SpaceRecord[] = loadPeople().map((p) => ({
    kind: 'person',
    id: p.id,
    title: p.displayName,
    subtitle: `@${p.handle}`,
    body: p.bio ?? '',
    imageUrl: p.imageUrl,
  }))
  const events: SpaceRecord[] = visibleEvents().map((e) => ({
    kind: 'event',
    id: e.id,
    title: e.title,
    subtitle: e.date,
    body: e.description,
    imageUrl: e.imageUrl,
  }))
  const calendars: SpaceRecord[] = publishedHorizons().map((h) => ({
    kind: 'calendar',
    id: h.id,
    title: h.name,
    subtitle: h.ownerName,
    body: h.description,
  }))
  const groups: SpaceRecord[] = visibleGroups().map((g) => ({
    kind: 'group',
    id: g.id,
    title: g.name,
    subtitle: g.visibility,
    body: g.description,
    imageUrl: g.imageUrl,
  }))
  return [...people, ...events, ...calendars, ...groups]
}

export function querySpaces(filter: FinderFilter, q: string): SpaceRecord[] {
  const needle = q.trim().toLowerCase()
  return collectSpaces().filter((space) => {
    const kind = (Object.keys(KIND_TO_SPACE) as FinderKind[]).find((k) => KIND_TO_SPACE[k] === space.kind)
    if (!kind || !filterHasKind(filter, kind)) return false
    if (!needle) return true
    return `${space.title} ${space.subtitle} ${space.body}`.toLowerCase().includes(needle)
  })
}
