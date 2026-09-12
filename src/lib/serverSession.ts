/**
 * Client half of the HttpOnly session cookie held by api/session.ts.
 *
 * Every call is best-effort: plain `vite dev` serves no functions, and a
 * missing endpoint must degrade to localStorage-only rather than break a
 * login. Failures are silent by design.
 */

const ENDPOINT = '/api/session'

export interface ServerSession {
  access_token: string
  refresh_token: string
}

/** Set once the endpoint proves absent, so dev stops retrying every call. */
let unavailable = false
/** Last token handed to the server, so repeat events cost no request. */
let pushed: string | null = null

async function call(init: RequestInit): Promise<Response | null> {
  if (unavailable) return null
  try {
    const res = await fetch(ENDPOINT, {
      ...init,
      credentials: 'same-origin',
      headers: { accept: 'application/json', ...(init.headers ?? {}) },
    })
    // No function behind this path: `vite dev`, or a build without api/.
    if (res.status === 404 || res.status === 405) {
      unavailable = true
      return null
    }
    return res
  } catch {
    return null
  }
}

/** A session rebuilt from the cookie, or null when there is nothing to restore. */
export async function pullServerSession(): Promise<ServerSession | null> {
  const res = await call({ method: 'GET' })
  if (!res) return null
  // A dev server answering with the SPA shell is not an endpoint.
  if (!res.headers.get('content-type')?.includes('application/json')) {
    unavailable = true
    return null
  }
  if (!res.ok) return null
  try {
    const body = (await res.json()) as { session?: ServerSession | null }
    const s = body.session
    if (!s || typeof s.access_token !== 'string' || typeof s.refresh_token !== 'string') return null
    pushed = s.refresh_token
    return s
  } catch {
    return null
  }
}

/** Hand the current refresh token to the server so the cookie stays live. */
export async function pushServerSession(refreshToken: string): Promise<void> {
  if (!refreshToken || refreshToken === pushed) return
  pushed = refreshToken
  const res = await call({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  // Let a failed store be retried by the next refresh event.
  if (!res?.ok) pushed = null
}

export async function clearServerSession(): Promise<void> {
  pushed = null
  await call({ method: 'DELETE' })
}
