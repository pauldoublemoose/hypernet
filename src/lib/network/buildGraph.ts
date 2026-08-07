import type { Answers, ContactChannel, Status } from '../../types'
import { loadAdminSignups, type SignupRow } from '../adminStore'
import { SEED_NODES } from './seed'
import type { EdgeType, GraphData, GraphEdge, GraphNode, NodeRole } from './types'

function roleFromStatus(st: Status | undefined): NodeRole {
  if (st === 'legacy' || st === 'admin') return 'member'
  if (st === 'cocreator') return 'cocreator'
  if (st === 'prospect') return 'prospect'
  return 'subscriber'
}

function uniq(xs: string[]) {
  return [...new Set(xs.filter(Boolean))]
}

function answersToNode(a: Answers, id: string): GraphNode {
  const countries = uniq(a.locations.map((l) => l.country.toUpperCase()))
  const cities = uniq(
    a.locations
      .filter((l) => l.country && l.city)
      .map((l) => `${l.country.toUpperCase()}|${l.city.toUpperCase()}`),
  )
  const skills = uniq(
    a.skills.map((s) => `${s.category.toUpperCase()}/${s.subcategory.toUpperCase()}`),
  )
  const visited = a.attendedEvents.filter((e) => e !== 'none')
  const cocreated =
    a.status === 'legacy' || a.status === 'admin' || a.status === 'cocreator'
      ? a.years.length
        ? a.years
        : visited
      : []
  return {
    id,
    name: (a.fullName || 'ANON').toUpperCase(),
    role: roleFromStatus(a.status),
    countries,
    cities,
    skills,
    cocreated,
    visited,
  }
}

function pairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function sharedItems(a: string[], b: string[]): string[] {
  if (!a.length || !b.length) return []
  const set = new Set(a)
  return b.filter((x) => set.has(x))
}

/** Build edges for all layers from a node list (multi-value safe). */
export function buildEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = []
  const seen = new Set<string>()

  const add = (
    source: string,
    target: string,
    type: EdgeType,
    weight: number,
    events?: string[],
  ) => {
    if (source === target || weight <= 0) return
    const key = `${type}:${pairKey(source, target)}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ source, target, type, weight, events })
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const co = sharedItems(a.cocreated, b.cocreated)
      if (co.length) add(a.id, b.id, 'cocreated', co.length, co)
      const vis = sharedItems(a.visited, b.visited)
      if (vis.length) add(a.id, b.id, 'visited', vis.length, vis)
      const countries = sharedItems(a.countries, b.countries)
      if (countries.length) add(a.id, b.id, 'country', countries.length)
      const cities = sharedItems(a.cities, b.cities)
      if (cities.length) add(a.id, b.id, 'city', cities.length)
    }
  }
  return edges
}

function signupToAnswers(row: SignupRow): Answers {
  return {
    status: (row.status as Status | undefined) ?? undefined,
    fullName: row.full_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    discord: row.discord ?? undefined,
    facebook: row.facebook ?? undefined,
    contactChannels: (row.contact_prefs?.reachable ?? []) as ContactChannel[],
    locations: row.locations ?? [],
    customLocations: [],
    attendedEvents: row.attended_events ?? [],
    contributionHistory: row.contribution_history ?? undefined,
    years: row.hyperstition_years ?? [],
    skills: row.skills ?? [],
    customOptions: [],
    otherInfo: row.other_info ?? undefined,
  }
}

/** Same person as the live "you" node — avoid duplicating after archive. */
function isCurrentSignup(row: SignupRow, current: Answers): boolean {
  const emailA = (current.email ?? '').trim().toLowerCase()
  const emailR = (row.email ?? '').trim().toLowerCase()
  if (emailA && emailR && emailA === emailR) return true
  const phoneA = (current.phone ?? '').replace(/\D/g, '')
  const phoneR = (row.phone ?? '').replace(/\D/g, '')
  if (phoneA.length >= 7 && phoneA === phoneR) return true
  const nameA = (current.fullName ?? '').trim().toUpperCase()
  const nameR = (row.full_name ?? '').trim().toUpperCase()
  if (nameA && nameR && nameA === nameR && current.status === row.status) {
    const discordA = (current.discord ?? '').trim().toLowerCase()
    const discordR = (row.discord ?? '').trim().toLowerCase()
    if (discordA && discordR && discordA === discordR) return true
  }
  return false
}

/**
 * Merge seed + current signup + non-ghosted archived signups (+ optional extras).
 * Ghosted admin entries are excluded from every graph view.
 */
export function buildGraphData(current: Answers, extras: Answers[] = []): GraphData {
  const nodes: GraphNode[] = [...SEED_NODES]
  const you = answersToNode(current, 'you')
  nodes.push(you)

  const archived = loadAdminSignups().filter((r) => !r.ghosted)
  archived.forEach((row, i) => {
    if (isCurrentSignup(row, current)) return
    const id = row.id ? `arch-${row.id}` : `arch-${i}`
    nodes.push(answersToNode(signupToAnswers(row), id))
  })

  extras.forEach((a, i) => nodes.push(answersToNode(a, `extra-${i}`)))
  return { nodes, edges: buildEdges(nodes) }
}
