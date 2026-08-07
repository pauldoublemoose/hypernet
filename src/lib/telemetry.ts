import { supabase } from './supabase'

/**
 * Anonymous usage telemetry. A random id per browser session (sessionStorage)
 * links events into funnels — no cookies, no personal data, ever. Failures
 * are swallowed: telemetry must never affect the app.
 */

const SESSION_KEY = 'hypernet_telemetry_session'
const VISIT_FLAG = 'hypernet_telemetry_visited'
const START_FLAG = 'hypernet_telemetry_started'

/** Signup-flow screens; first one seen in a session marks the signup start. */
const FLOW_SCREENS = new Set([
  'preStatus',
  'status',
  'branch',
  'name',
  'channels',
  'email',
  'phone',
  'discord',
  'facebook',
  'location',
  'attended',
  'capacity',
  'years',
  'skills',
  'other',
  'review',
  'confirm',
])

function sessionId(): string | null {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

export function track(event: string, screen?: string, meta?: Record<string, unknown>) {
  try {
    if (!supabase) return
    const id = sessionId()
    if (!id) return
    void supabase
      .from('telemetry_events')
      .insert({ session_id: id, event, screen: screen ?? null, meta: meta ?? {} })
      .then(
        () => {},
        () => {},
      )
  } catch {
    /* never let telemetry break the app */
  }
}

/** Once per browser session. */
export function trackVisit() {
  try {
    if (sessionStorage.getItem(VISIT_FLAG)) return
    sessionStorage.setItem(VISIT_FLAG, '1')
  } catch {
    return
  }
  track('visit')
}

export interface TelemetrySummary {
  days: number
  visits: number
  signup_starts: number
  signup_completions: number
  graph_opens: number
  draft_restores: number
  median_completion_secs: number | null
  p90_completion_secs: number | null
  drop_off: Record<string, number>
  daily: { day: string; visits: number; starts: number; completions: number }[]
}

/** Aggregated stats (RPC is admin-only; returns null when not permitted). */
export async function fetchTelemetrySummary(days: number): Promise<TelemetrySummary | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('telemetry_summary', { days })
  if (error || !data) return null
  return data as TelemetrySummary
}

/**
 * Screen change. Also emits signup_started the first time a flow screen is
 * seen this session (covers both fresh starts and restored drafts).
 */
export function trackScreen(screen: string) {
  track('screen', screen)
  if (!FLOW_SCREENS.has(screen)) return
  try {
    if (sessionStorage.getItem(START_FLAG)) return
    sessionStorage.setItem(START_FLAG, '1')
  } catch {
    return
  }
  track('signup_started', screen)
}
