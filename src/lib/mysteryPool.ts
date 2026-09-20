export type MysteryMatch = {
  alias: string
  reason: string
}

type Handset = {
  alias: string
  city: string
  event: string
}

const HANDSETS: Handset[] = [
  { alias: 'HANDSET 4', city: 'Stockholm', event: 'Deep Listening Lab' },
  { alias: 'HANDSET 9', city: 'Black Rock', event: 'Burning Man 2026' },
  { alias: 'HANDSET 2', city: 'Alingsås', event: 'Borderland 2026' },
  { alias: 'HANDSET 11', city: 'Stockholm', event: 'Hyperstition 2026' },
]

export const DEMO_SELF = { city: 'Stockholm', event: 'Deep Listening Lab' }

export const SESSION_MS = 15 * 60 * 1000

export function pairMystery(selfCity = DEMO_SELF.city, selfEvent = DEMO_SELF.event): MysteryMatch {
  const eventHit = HANDSETS.find((h) => h.event === selfEvent)
  if (eventHit) return { alias: eventHit.alias, reason: `shared signal · ${eventHit.event}` }
  const cityHit = HANDSETS.find((h) => h.city === selfCity)
  if (cityHit) return { alias: cityHit.alias, reason: `shared signal · ${cityHit.city}` }
  const h = HANDSETS[Math.floor(Math.random() * HANDSETS.length)]
  return { alias: h.alias, reason: 'open booth · random' }
}

export const PEER_LINES = [
  'the booth is humming.',
  'do not say names.',
  'fifteen minutes. the line is ours.',
]
