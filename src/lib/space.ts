export type SpaceKind = 'person' | 'event' | 'calendar' | 'group' | 'callout'

export type SpaceExpr = 'row' | 'thumb' | 'page'

export type SpaceRecord = {
  kind: SpaceKind
  id: string
  title: string
  subtitle: string
  body: string
  imageUrl?: string
  expiresAt?: string
}

export const SPACE_KIND_LABEL: Record<SpaceKind, string> = {
  person: 'Node',
  event: 'Event',
  calendar: 'Calendar',
  group: 'Group',
  callout: 'Call out',
}

export function spaceKey(space: SpaceRecord): string {
  return `${space.kind}:${space.id}`
}
