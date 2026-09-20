export type FeedNews = {
  when: string
  text: string
}

export const FEED_NEWS: FeedNews[] = [
  { when: 'just now', text: 'New user joined the network — welcome, @signal.' },
  { when: '12m ago', text: 'New event published: Deep Listening Lab · Stockholm.' },
  { when: '1h ago', text: 'Horizon “Baltic Circuit” added three dates.' },
  { when: 'yesterday', text: '@nova and @ember are now Friends.' },
  { when: 'just now', text: 'Clusters unlocked — browse the directory or create a camp.' },
  { when: '2d ago', text: 'New Cluster pending (locked) — camps unlock later.' },
]

export type FeedEvent = {
  id: string
  title: string
  date: string
  body: string
  why: string
}

const FEED_EVENTS: FeedEvent[] = [
  {
    id: 'fe-borderland',
    title: 'Borderland 2026',
    date: '2026-07-20',
    body: 'Open community twin — public square. Surf irrespective of attendance.',
    why: 'Because you walk this World',
  },
  {
    id: 'fe-bm',
    title: 'Burning Man 2026',
    date: '2026-08-30',
    body: 'Open community twin — BM-scale public square. No admin gate to enter.',
    why: 'Because you follow burn culture',
  },
  {
    id: 'fe-hyper',
    title: 'Hyperstition 2026',
    date: '2026-06-12',
    body: 'Open community twin seeded from the Hyperstition years.',
    why: 'Because you are in this camp',
  },
  {
    id: 'fe-listen',
    title: 'Deep Listening Lab',
    date: '2026-10-04',
    body: 'Quiet rooms, long tones, and a Stockholm basement.',
    why: 'Because you follow Anna Vale',
  },
]

export type FeedRow = {
  id: string
  title: string
  meta: string
  body: string
}

export function loadFeed(): FeedRow[] {
  const events: FeedRow[] = FEED_EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    meta: `${e.date} · ${e.why}`,
    body: e.body,
  }))
  const news: FeedRow[] = FEED_NEWS.map((n, i) => ({
    id: `fn-${i}`,
    title: n.text,
    meta: n.when,
    body: 'Network update',
  }))
  return [...events, ...news]
}
