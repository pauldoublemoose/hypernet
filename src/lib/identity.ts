import { type IdentityLooks, type SpaceExpr, type SpaceKind, type SpaceRecord } from './space'

export const IDENTITY_EXPRS: SpaceExpr[] = ['thumb', 'row', 'page']

export const IDENTITY_EXPR_LABEL: Record<SpaceExpr, string> = {
  thumb: 'Thumbnail',
  row: 'Bar',
  page: 'Page',
}

export type { IdentityLooks }

export type IdentityExtras = {
  findMe: string
  looks: IdentityLooks
}

export const FIND_ME_HINT: Record<SpaceKind, string> = {
  person: 'Skills, vibe, what you want to be found for.',
  event: 'Theme, vibe, who it is for.',
  calendar: 'Theme, seasons, what this calendar gathers.',
  group: 'Theme, camp vibe, what the crew is for.',
  callout: 'Skills you need, vibe of the ask.',
}

const STORE_KEY = 'hypernet_identity_extras'

export function emptyLooks(): IdentityLooks {
  return {
    thumb: { title: '', subtitle: '', imageUrl: '' },
    row: { title: '', subtitle: '', imageUrl: '' },
    page: { title: '', subtitle: '', imageUrl: '' },
  }
}

export function emptyIdentity(): IdentityExtras {
  return { findMe: '', looks: emptyLooks() }
}

function readAll(): Record<string, IdentityExtras> {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, IdentityExtras>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(next: Record<string, IdentityExtras>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
  } catch {
    /* quota */
  }
}

function normalize(raw: Partial<IdentityExtras> | undefined): IdentityExtras {
  const looks = emptyLooks()
  const src = raw?.looks
  if (src) {
    for (const expr of IDENTITY_EXPRS) {
      looks[expr] = {
        title: src[expr]?.title ?? '',
        subtitle: src[expr]?.subtitle ?? '',
        imageUrl: src[expr]?.imageUrl ?? '',
      }
    }
  }
  return { findMe: raw?.findMe ?? '', looks }
}

export function loadIdentity(kind: SpaceKind, id: string): IdentityExtras {
  return normalize(readAll()[`${kind}:${id}`])
}

export function saveIdentity(kind: SpaceKind, id: string, extras: IdentityExtras) {
  const all = readAll()
  all[`${kind}:${id}`] = normalize(extras)
  writeAll(all)
}

export function attachIdentity(space: SpaceRecord): SpaceRecord {
  const extras = loadIdentity(space.kind, space.id)
  return { ...space, findMe: extras.findMe, looks: extras.looks }
}

export function overlayLook(space: SpaceRecord, expr: SpaceExpr): SpaceRecord {
  const look = space.looks?.[expr]
  if (!look) return space
  return {
    ...space,
    title: look.title.trim() || space.title,
    subtitle: look.subtitle.trim() || space.subtitle,
    imageUrl: look.imageUrl.trim() || space.imageUrl,
  }
}
