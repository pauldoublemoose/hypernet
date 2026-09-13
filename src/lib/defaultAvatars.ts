/** Default circular profile pics from `public/default-avatars/` (Archivist pack). */

export const DEFAULT_AVATAR_FILES = [
  '01-1fb23706.jpg',
  '08-e422d079.jpg',
  '11-8e4e3b11.jpg',
  '33-dde65568.jpg',
  '35-93eef7ac.jpg',
  '36-3d72d5ea.jpg',
  '37-8e34b8a0.jpg',
  '42-3ce5c4e5.jpg',
  '43-8202db27.jpg',
  '49-87b39375.jpg',
  '50-510eeca0.jpg',
  '57-cd76bb51.jpg',
  '62-a6bc9bb4.jpg',
  '63-1be959ac.jpg',
  '72-d2e4cf94.jpg',
  '89-e4cb3987.jpg',
  '95-170154db.jpg',
  '98-3a4278a0.jpg',
  '99-2fbe3531.jpg',
  '102-4ca2d28a.jpg',
  '106-b01736e1.jpg',
  '109-ce6ceb59.jpg',
  '131-e015a7c2.jpg',
  '138-56129c79.jpg',
] as const

const DEFAULT_AVATAR_DIR = '/default-avatars'

/** Stable assignments for demo contacts + seed graph nodes. */
const ASSIGNED: Record<string, (typeof DEFAULT_AVATAR_FILES)[number]> = {
  'p-anna': '01-1fb23706.jpg',
  'p-rio': '08-e422d079.jpg',
  'p-kai': '11-8e4e3b11.jpg',
  'p-mira': '33-dde65568.jpg',
  'p-jon': '35-93eef7ac.jpg',
  'p-sasha': '36-3d72d5ea.jpg',
  'seed-1': '37-8e34b8a0.jpg',
  'seed-2': '42-3ce5c4e5.jpg',
  'seed-3': '43-8202db27.jpg',
  'seed-4': '49-87b39375.jpg',
  'seed-5': '50-510eeca0.jpg',
  'seed-6': '57-cd76bb51.jpg',
  'seed-7': '62-a6bc9bb4.jpg',
  'seed-8': '63-1be959ac.jpg',
  'seed-9': '72-d2e4cf94.jpg',
  'seed-10': '89-e4cb3987.jpg',
  'seed-11': '95-170154db.jpg',
  'seed-12': '98-3a4278a0.jpg',
}

function hash32(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function defaultAvatarFile(id: string): string {
  return ASSIGNED[id] ?? DEFAULT_AVATAR_FILES[hash32(id) % DEFAULT_AVATAR_FILES.length]
}

/** Public URL for a person id. Placeholders stay in UI only when this is empty/missing. */
export function avatarUrlFor(id: string): string {
  return `${DEFAULT_AVATAR_DIR}/${defaultAvatarFile(id)}`
}

/** Prefer a stored upload; otherwise the default pack. */
export function resolveAvatarUrl(id: string, stored?: string): string | undefined {
  const s = stored?.trim()
  if (s) return s
  if (!id) return undefined
  return avatarUrlFor(id)
}
