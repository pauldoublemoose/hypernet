import type { Answers, Status } from '../../types'
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

/** Merge seed + current signup (+ optional extras) into graph JSON. */
export function buildGraphData(current: Answers, extras: Answers[] = []): GraphData {
  const nodes: GraphNode[] = [...SEED_NODES]
  const you = answersToNode(current, 'you')
  nodes.push(you)
  extras.forEach((a, i) => nodes.push(answersToNode(a, `extra-${i}`)))
  return { nodes, edges: buildEdges(nodes) }
}
