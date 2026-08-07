import type { Session } from '@supabase/supabase-js'
import type { SignupRow } from './adminStore'
import { supabase } from './supabase'

/**
 * Passwordless accounts (phase A): email OTP login, claim-your-node,
 * edit-your-own-entry. All data access is enforced by RLS; the client
 * only ever sees the caller's own rows.
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
