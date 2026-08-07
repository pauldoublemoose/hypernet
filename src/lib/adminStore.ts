/** Local archive of signups for the password-gated admin table. */

const ARCHIVE_KEY = 'hypernet_signups_archive'
const PENDING_KEY = 'hypernet_pending_signups'
const GHOSTED_KEY = 'hypernet_ghosted_signups'

export type SignupRow = {
  id?: string | null
  status?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
  discord?: string | null
  facebook?: string | null
  contact_prefs?: { reachable?: string[] } | null
  attended_events?: string[] | null
  contribution_history?: string | null
  hyperstition_years?: string[] | null
  skills?: { category: string; subcategory: string; note?: string }[] | null
  locations?: { country: string; city: string }[] | null
  other_info?: string | null
  /** Soft-deactivated in the admin ledger (local). */
  ghosted?: boolean
}

/** Input columns only — no ids / timestamps. */
export const ADMIN_COLUMNS = [
  { id: 'status', label: 'STATUS' },
  { id: 'full_name', label: 'NAME' },
  { id: 'email', label: 'EMAIL' },
  { id: 'phone', label: 'PHONE' },
  { id: 'discord', label: 'DISCORD' },
  { id: 'facebook', label: 'FACEBOOK' },
  { id: 'reachable', label: 'REACHABLE' },
  { id: 'locations', label: 'LOCATIONS' },
  { id: 'attended_events', label: 'ATTENDED' },
  { id: 'contribution_history', label: 'CONTRIBUTION' },
  { id: 'hyperstition_years', label: 'MEMBER YEARS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'other_info', label: 'OTHER' },
] as const

export type AdminColumnId = (typeof ADMIN_COLUMNS)[number]['id']

function readList(key: string): SignupRow[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(raw) ? (raw as SignupRow[]) : []
  } catch {
    return []
  }
}

/** Stable key for matching the same signup across archive / pending. */
export function signupFingerprint(row: SignupRow): string {
  if (row.id) return `id:${row.id}`
  return JSON.stringify({
    status: row.status,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    discord: row.discord,
    facebook: row.facebook,
    other_info: row.other_info,
    skills: row.skills,
    locations: row.locations,
  })
}

function readGhosted(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(GHOSTED_KEY) ?? '[]')
    return new Set(Array.isArray(raw) ? (raw as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeGhosted(set: Set<string>) {
  try {
    localStorage.setItem(GHOSTED_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}

function writeList(key: string, rows: SignupRow[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rows))
  } catch {
    /* ignore */
  }
}

/** Persist every signup for admin viewing (online and offline). */
export function archiveSignup(row: Record<string, unknown>) {
  try {
    const existing = readList(ARCHIVE_KEY)
    existing.push(row as SignupRow)
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(existing))
  } catch {
    /* ignore */
  }
}

/** Merge archive + pending caches; newest last. Applies local ghost flags. */
export function loadAdminSignups(): SignupRow[] {
  const archive = readList(ARCHIVE_KEY)
  const pending = readList(PENDING_KEY)
  const ghosted = readGhosted()
  // Dedupe by a fingerprint of input fields (no id required)
  const seen = new Set<string>()
  const out: SignupRow[] = []
  for (const row of [...archive, ...pending]) {
    const fp = signupFingerprint(row)
    if (seen.has(fp)) continue
    seen.add(fp)
    out.push({ ...row, ghosted: ghosted.has(fp) || !!row.ghosted })
  }
  return out
}

/** Soft-deactivate (ghost) or restore a signup in the local admin ledger. */
export function setSignupGhosted(row: SignupRow, ghosted: boolean): SignupRow {
  const fp = signupFingerprint(row)
  const set = readGhosted()
  if (ghosted) set.add(fp)
  else set.delete(fp)
  writeGhosted(set)

  for (const key of [ARCHIVE_KEY, PENDING_KEY]) {
    const list = readList(key)
    let changed = false
    for (let i = 0; i < list.length; i++) {
      if (signupFingerprint(list[i]) === fp) {
        list[i] = { ...list[i], ghosted }
        changed = true
      }
    }
    if (changed) writeList(key, list)
  }

  return { ...row, ghosted }
}

export function cellValue(row: SignupRow, col: AdminColumnId): string {
  switch (col) {
    case 'status':
      return row.status ?? ''
    case 'full_name':
      return row.full_name ?? ''
    case 'email':
      return row.email ?? ''
    case 'phone':
      return row.phone ?? ''
    case 'discord':
      return row.discord ?? ''
    case 'facebook':
      return row.facebook ?? ''
    case 'reachable':
      return (row.contact_prefs?.reachable ?? []).join(', ')
    case 'locations':
      return (row.locations ?? [])
        .map((l) => (l.city ? `${l.city}, ${l.country}` : l.country))
        .join(' · ')
    case 'attended_events':
      return (row.attended_events ?? []).join(', ')
    case 'contribution_history':
      return row.contribution_history ?? ''
    case 'hyperstition_years':
      return (row.hyperstition_years ?? []).join(', ')
    case 'skills':
      return (row.skills ?? [])
        .map((s) => `${s.category}/${s.subcategory}${s.note ? ` (${s.note})` : ''}`)
        .join(' · ')
    case 'other_info':
      return row.other_info ?? ''
  }
}
