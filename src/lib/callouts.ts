export type Callout = {
  id: string
  title: string
  body: string
  expiresAt: string
  hostName: string
}

const SEED: Callout[] = [
  {
    id: 'co-sound',
    title: 'Sound engineer',
    body: 'Hey we are creating an event and we are looking for a sound engineer.',
    expiresAt: '2026-10-15',
    hostName: 'Anna Vale',
  },
  {
    id: 'co-kitchen',
    title: 'Kitchen lead',
    body: 'Camp kitchen needs a lead who can feed 80 on a two-burner stove.',
    expiresAt: '2026-11-01',
    hostName: 'Kai Okonkwo',
  },
]

let callouts: Callout[] | null = null

export function loadCallouts(): Callout[] {
  if (!callouts) callouts = [...SEED]
  return callouts
}

export function createCallout(input: {
  title: string
  body: string
  expiresAt: string
  hostName: string
}): Callout {
  const row: Callout = {
    id: `co-${Date.now()}`,
    title: input.title.trim() || 'Call out',
    body: input.body.trim(),
    expiresAt: input.expiresAt,
    hostName: input.hostName.trim() || 'You',
  }
  callouts = [...loadCallouts(), row]
  return row
}
