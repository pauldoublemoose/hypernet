/** Graph data types for the HYPERNET people network. */

export type NodeRole = 'subscriber' | 'prospect' | 'cocreator' | 'member'

export type EdgeType = 'cocreated' | 'visited' | 'country' | 'city'

export interface GraphNode {
  id: string
  name: string
  role: NodeRole
  /** One or more countries (uppercase). */
  countries: string[]
  /** Location keys as "COUNTRY|CITY" so city names don’t collide across countries. */
  cities: string[]
  /** Skill keys as "CATEGORY/SUBCATEGORY". */
  skills: string[]
  /** Event ids the person cocreated / was a member for */
  cocreated: string[]
  /** Event ids the person visited / attended */
  visited: string[]
}

export interface GraphEdge {
  source: string
  target: string
  type: EdgeType
  weight: number
  /** Shared event ids for cocreated / visited edges (filtered by H23–H26 toggles). */
  events?: string[]
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const EVENT_FILTERS = [
  { id: '2023', label: 'H23' },
  { id: '2024', label: 'H24' },
  { id: '2025', label: 'H25' },
  { id: '2026', label: 'H26' },
] as const

export type EventFilterId = (typeof EVENT_FILTERS)[number]['id']

export const EDGE_LAYERS: {
  id: EdgeType
  label: string
  defaultOn: boolean
  distance: number
  strength: number
  opacity: number
}[] = [
  // Strengths stay low: d3 link strength≈1 snaps nodes in one tick.
  { id: 'cocreated', label: 'COCREATED', defaultOn: false, distance: 48, strength: 0.08, opacity: 0.52 },
  { id: 'visited', label: 'VISITED', defaultOn: false, distance: 130, strength: 0.035, opacity: 0.14 },
  { id: 'country', label: 'COUNTRY', defaultOn: false, distance: 36, strength: 0.1, opacity: 0.14 },
  { id: 'city', label: 'CITY', defaultOn: false, distance: 22, strength: 0.12, opacity: 0.18 },
]

/** Display initials only (privacy-friendly hover). */
export function nameInitials(name: string): string {
  const parts = name
    .replace(/\./g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatLocations(countries: string[], cities: string[]): string {
  if (cities.length) {
    return cities
      .map((key) => {
        const [country, city] = key.split('|')
        return city ? `${city}, ${country}` : country
      })
      .join(' · ')
  }
  return countries.join(' · ')
}
