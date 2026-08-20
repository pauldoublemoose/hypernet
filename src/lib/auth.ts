import type { Session } from '@supabase/supabase-js'
import type { SignupRow } from './adminStore'
import { clearServerSession, pullServerSession, pushServerSession } from './serverSession'
import { supabase } from './supabase'

/**
 * Passwordless accounts (phase A): email OTP login, claim-your-node,
 * edit-your-own-entry. All data access is enforced by RLS; the client
 * only ever sees the caller's own rows.
 *
 * A login is meant to outlive the visit: the session lives in local storage
 * and is mirrored into an HttpOnly cookie (api/session.ts) that browser
 * storage eviction cannot touch.
 */

export async function requestLoginCode(email: string): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: 'UPLINK OFFLINE — TRY AGAIN LATER' }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  if (error) return { ok: false, message: error.message.toUpperCase() }
  return { ok: true }
}

export async function verifyLoginCode(
  email: string,
  code: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: 'UPLINK OFFLINE — TRY AGAIN LATER' }
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
  if (error) return { ok: false, message: error.message.toUpperCase() }
  return { ok: true }
}

/** Link unowned signups matching the verified login email; returns count. */
export async function claimSignups(): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await supabase.rpc('claim_signups')
  if (error) return 0
  return typeof data === 'number' ? data : 0
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
  await clearServerSession()
}

export type RestoreSource = 'local' | 'server' | null

/**
 * Sign the visitor back in without them typing anything.
 *
 * Local storage wins when it has a session: it is free, and it is what the
 * client refreshes from anyway. The cookie is only consulted when storage
 * came up empty — a fresh browser, or one that evicted the session between
 * visits — because reading it spends a refresh-token rotation.
 */
export async function restoreSession(): Promise<{ session: Session | null; source: RestoreSource }> {
  if (!supabase) return { session: null, source: null }
  const existing = await getSession()
  if (existing) return { session: existing, source: 'local' }

  const stored = await pullServerSession()
  if (!stored) return { session: null, source: null }
  const { data, error } = await supabase.auth.setSession(stored)
  if (error || !data.session) return { session: null, source: null }
  return { session: data.session, source: 'server' }
}

/**
 * Keep the cookie in step with the client session, including the new refresh
 * token minted by every hourly rotation. Returns an unsubscribe function.
 */
export function startSessionSync(): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      void clearServerSession()
      return
    }
    if (session?.refresh_token) void pushServerSession(session.refresh_token)
  })
  return () => data.subscription.unsubscribe()
}

/** The caller's newest claimed signup, or null. */
export async function fetchMySignup(): Promise<(SignupRow & { id: string }) | null> {
  if (!supabase) return null
  const session = await getSession()
  const uid = session?.user.id
  if (!uid) return null
  // Explicit owner filter: admins can read every row, so RLS alone
  // would let this return someone else's signup.
  const { data, error } = await supabase
    .from('signups')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return data
}

/** Whether the current session belongs to an admin. */
export async function isAdmin(): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('is_admin')
  return !error && data === true
}

/** Every signup in the database (RLS: admins only), newest first. */
export async function fetchAllSignups(): Promise<(SignupRow & { id: string })[] | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('signups')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return null
  return data
}

/** Ghost/unghost a signup in the database (RLS: admins only). */
export async function setSignupGhostedRemote(id: string, ghosted: boolean): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('signups').update({ ghosted }).eq('id', id)
  return !error
}
