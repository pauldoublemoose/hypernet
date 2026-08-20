import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { restoreSession, signOut as endSession, startSessionSync } from './auth'
import { supabase } from './supabase'
import { track } from './telemetry'

/**
 * One shared answer to "is anyone logged in?".
 *
 * Screens used to each ask Supabase on mount, so a live session was invisible
 * until you opened the screen that happened to check, and a login in one tab
 * never reached another. The provider resolves the session once at boot —
 * local storage first, the server cookie second — and every screen reads the
 * result.
 */

export type SessionStatus = 'loading' | 'authed' | 'anon'

interface SessionCtx {
  status: SessionStatus
  session: Session | null
  /** Verified login address, uppercase-ready; '' when signed out. */
  email: string
  signOut: () => Promise<void>
}

const Ctx = createContext<SessionCtx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<SessionStatus>(supabase ? 'loading' : 'anon')
  const booted = useRef(false)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    const stopSync = startSessionSync()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!alive) return
      // Until the boot restore has answered, a null session is not yet proof
      // of being signed out — the cookie may still produce one.
      if (!next && !booted.current) return
      booted.current = true
      setSession(next)
      setStatus(next ? 'authed' : 'anon')
    })

    void restoreSession().then(({ session: restored, source }) => {
      if (!alive) return
      booted.current = true
      setSession(restored)
      setStatus(restored ? 'authed' : 'anon')
      // Measures how much of the stickiness work is actually paying off.
      if (source === 'server') track('session_restored', undefined, { source })
    })

    return () => {
      alive = false
      stopSync()
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: SessionCtx = {
    status,
    session,
    email: session?.user.email ?? '',
    signOut: async () => {
      await endSession()
      booted.current = true
      setSession(null)
      setStatus('anon')
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
