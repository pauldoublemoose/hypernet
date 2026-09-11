/**
 * Thin Groups — localStorage MVP.
 * Shaped for a later Supabase migration (stable ids, admin + member rows).
 */

import { getPerson, selfId } from './contactsStore'

export type GroupVisibility = 'public' | 'private'

export interface HyperGroup {
  id: string
  name: string
  description: string
  visibility: GroupVisibility
  adminIds: string[]
  memberIds: string[]
  createdAt: string
  /** Optional image stub — URL only, no upload pipeline. */
  imageUrl?: string
}

const GROUPS_KEY = 'hypernet_groups'

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

const SEED_GROUPS: HyperGroup[] = [
  {
    id: 'g-baltic',
    name: 'Baltic Circuit',
    description: 'Regional burn camp — sound, lights, and long nights on the ridge.',
    visibility: 'public',
    adminIds: ['p-anna'],
    memberIds: ['p-anna', 'p-rio', 'p-kai'],
    createdAt: '2026-06-01T12:00:00.000Z',
  },
  {
    id: 'g-kitchen',
    name: 'Night Kitchen',
    description: 'Late-service crew. Private planning circle; public face stays thin.',
    visibility: 'private',
    adminIds: ['p-kai'],
    memberIds: ['p-kai', 'p-mira', 'p-sasha'],
    createdAt: '2026-07-12T18:00:00.000Z',
  },
]

export function normalizeGroup(raw: Partial<HyperGroup> & Pick<HyperGroup, 'id' | 'name'>): HyperGroup {
  const visibility: GroupVisibility = raw.visibility === 'private' ? 'private' : 'public'
  const adminIds = [...new Set((raw.adminIds ?? []).filter(Boolean))]
  const memberIds = [...new Set([...(raw.memberIds ?? []), ...adminIds].filter(Boolean))]
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    visibility,
    adminIds,
    memberIds,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    imageUrl: raw.imageUrl?.trim() || undefined,
  }
}

export function loadGroups(): HyperGroup[] {
  return ensureSeedGroups()
}

export function saveGroups(groups: HyperGroup[]) {
  writeJson(GROUPS_KEY, groups)
}

export function ensureSeedGroups(): HyperGroup[] {
  const raw = readJson<Partial<HyperGroup>[]>(GROUPS_KEY, [])
  if (raw.length === 0) {
    writeJson(GROUPS_KEY, SEED_GROUPS)
    return SEED_GROUPS.map((g) => normalizeGroup(g))
  }
  const groups = raw
    .filter((g) => g && typeof g.id === 'string' && typeof g.name === 'string')
    .map((g) => normalizeGroup(g as Partial<HyperGroup> & Pick<HyperGroup, 'id' | 'name'>))
  return groups
}

export function getGroup(id: string): HyperGroup | undefined {
  return loadGroups().find((g) => g.id === id)
}

export function isGroupAdmin(groupId: string, personId: string = selfId()): boolean {
  const g = getGroup(groupId)
  return !!g && g.adminIds.includes(personId)
}

export function isGroupMember(groupId: string, personId: string = selfId()): boolean {
  const g = getGroup(groupId)
  return !!g && g.memberIds.includes(personId)
}

/** Public groups, plus private groups the viewer belongs to. */
export function canViewerSeeGroup(group: HyperGroup, viewerId: string = selfId()): boolean {
  if (group.visibility === 'public') return true
  return group.memberIds.includes(viewerId) || group.adminIds.includes(viewerId)
}

export function visibleGroups(viewerId: string = selfId()): HyperGroup[] {
  return loadGroups().filter((g) => canViewerSeeGroup(g, viewerId))
}

export function groupsIAdmin(personId: string = selfId()): HyperGroup[] {
  return loadGroups().filter((g) => g.adminIds.includes(personId))
}

export function groupsIBelongTo(personId: string = selfId()): HyperGroup[] {
  return loadGroups().filter((g) => g.memberIds.includes(personId) || g.adminIds.includes(personId))
}

export function createGroup(input: {
  name: string
  description: string
  visibility?: GroupVisibility
  imageUrl?: string
}): HyperGroup {
  const me = selfId()
  const group = normalizeGroup({
    id: uid('grp'),
    name: input.name.trim() || 'Untitled group',
    description: input.description.trim(),
    visibility: input.visibility === 'private' ? 'private' : 'public',
    adminIds: [me],
    memberIds: [me],
    createdAt: new Date().toISOString(),
    imageUrl: input.imageUrl,
  })
  const groups = loadGroups()
  groups.unshift(group)
  saveGroups(groups)
  return group
}

export function updateGroup(
  id: string,
  patch: Partial<Pick<HyperGroup, 'name' | 'description' | 'visibility' | 'imageUrl'>>,
  actorId: string = selfId(),
): HyperGroup | undefined {
  if (!isGroupAdmin(id, actorId)) return undefined
  const groups = loadGroups()
  const idx = groups.findIndex((g) => g.id === id)
  if (idx < 0) return undefined
  const prev = groups[idx]
  const next = normalizeGroup({
    ...prev,
    name: patch.name != null ? patch.name.trim() || prev.name : prev.name,
    description: patch.description != null ? patch.description.trim() : prev.description,
    visibility: patch.visibility ?? prev.visibility,
    imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : prev.imageUrl,
  })
  groups[idx] = next
  saveGroups(groups)
  return next
}

/** Open join for public groups (P1 join policies not implemented). */
export function joinGroup(id: string, personId: string = selfId()): HyperGroup | undefined {
  const groups = loadGroups()
  const idx = groups.findIndex((g) => g.id === id)
  if (idx < 0) return undefined
  const g = groups[idx]
  if (g.visibility !== 'public') return g
  if (g.memberIds.includes(personId)) return g
  const next = normalizeGroup({
    ...g,
    memberIds: [...g.memberIds, personId],
  })
  groups[idx] = next
  saveGroups(groups)
  return next
}

export function personLabel(id: string): string {
  if (id === selfId()) return 'You'
  return getPerson(id)?.displayName ?? id
}

export function visibilityLabel(v: GroupVisibility): string {
  return v === 'private' ? 'private' : 'public'
}
