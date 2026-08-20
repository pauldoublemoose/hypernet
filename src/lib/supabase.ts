import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Answers } from '../types'
import { archiveSignup } from './adminStore'
import { authStorage } from './authStorage'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // Spelled out rather than left to defaults: a login that outlives the
          // tab is the whole point, and a future default flip must not silently
          // sign everyone out. The storage key stays at the library default so
          // sessions from before this change keep working.
          storage: authStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Implicit, not PKCE: the emailed link has to work when the mail app
          // opens it in a different browser than the one that asked for the
          // code, and a PKCE verifier never leaves the browser that started the
          // login.
          flowType: 'implicit',
        },
      })
    : null

export interface RemoteSkillOption {
  category: string
  subcategory: string | null
}

export interface RemoteLocationOption {
  country: string
  city: string | null
}

/** Row from the graph_signups view — initials only, no contact data. */
export interface GraphSignupRow {
  id: string
  status: string | null
  initials: string | null
  attended_events: string[] | null
  hyperstition_years: string[] | null
  skills: { category: string; subcategory: string; note?: string }[] | null
  locations: { country: string; city: string }[] | null
}

export async function fetchGraphSignups(): Promise<GraphSignupRow[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('graph_signups')
      .select('id, status, initials, attended_events, hyperstition_years, skills, locations')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function fetchSkillOptions(): Promise<RemoteSkillOption[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('skill_options')
      .select('category, subcategory')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function fetchLocationOptions(): Promise<RemoteLocationOption[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('location_options')
      .select('country, city')
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

function cacheLocally(row: Record<string, unknown>) {
  try {
    const key = 'hypernet_pending_signups'
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[]
    existing.push(row)
    localStorage.setItem(key, JSON.stringify(existing))
  } catch {
    // storage unavailable; nothing more we can do in the pre-alpha
  }
}

function answersToRow(a: Answers) {
  return {
    status: a.status,
    full_name: a.fullName ?? null,
    email: a.email ?? null,
    phone: a.phone ?? null,
    discord: a.discord ?? null,
    facebook: a.facebook ?? null,
    contact_prefs: { reachable: a.contactChannels },
    attended_events: a.attendedEvents,
    contribution_history: a.contributionHistory ?? null,
    hyperstition_years: a.years,
    skills: a.skills,
    locations: a.locations,
    other_info: a.otherInfo ?? null,
  }
}

/** Custom skills/locations become selectable options for later visitors. */
async function insertCustomOptions(a: Answers, signupId: string) {
  if (!supabase) return
  if (a.customOptions.length > 0) {
    await supabase.from('skill_options').insert(
      a.customOptions.map((c) => ({
        category: c.category,
        subcategory: c.subcategory ?? null,
        added_by_signup: signupId,
      })),
    )
  }
  if (a.customLocations.length > 0) {
    await supabase.from('location_options').insert(
      a.customLocations.map((c) => ({
        country: c.country,
        city: c.city ?? null,
        added_by_signup: signupId,
      })),
    )
  }
}

export async function submitSignup(a: Answers): Promise<{ offline: boolean }> {
  const id = crypto.randomUUID()
  const row = { id, ...answersToRow(a) }

  // Always keep a local copy for the password-gated admin table.
  archiveSignup(row)

  if (!supabase) {
    cacheLocally(row)
    return { offline: true }
  }

  try {
    const { error } = await supabase.from('signups').insert(row)
    if (error) throw error
    await insertCustomOptions(a, id)
    return { offline: false }
  } catch {
    cacheLocally(row)
    return { offline: true }
  }
}

/** Update a claimed signup in place (RLS restricts this to the owner). */
export async function updateSignup(id: string, a: Answers): Promise<{ ok: boolean }> {
  if (!supabase) return { ok: false }
  try {
    const { error } = await supabase.from('signups').update(answersToRow(a)).eq('id', id)
    if (error) throw error
    await insertCustomOptions(a, id)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
