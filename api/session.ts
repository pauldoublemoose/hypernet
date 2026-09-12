/**
 * Server-held login session.
 *
 * The browser keeps its Supabase session in localStorage, which Safari's
 * tracking prevention deletes after seven days without a visit, and which
 * in-app browsers (Instagram, Facebook) often discard sooner. That cap
 * applies to script-written storage, not to cookies set by an HTTP response,
 * so this endpoint mirrors the refresh token into an HttpOnly cookie: a
 * visitor who comes back months later is signed straight back in, and an XSS
 * bug can no longer read the refresh token at rest.
 *
 *   POST   { refresh_token }  store the cookie
 *   GET                       trade the cookie for a fresh session
 *   DELETE                    drop the cookie (logout)
 */

declare const process: { env: Record<string, string | undefined> }

const COOKIE = 'hn_session'
const MAX_AGE = 60 * 60 * 24 * 365

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''

function readCookie(request: Request): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE && rest.length > 0) return decodeURIComponent(rest.join('='))
  }
  return null
}

/**
 * SameSite=Lax keeps the cookie off cross-site requests, so no other origin
 * can trade it for a session; the endpoint answers with no CORS headers
 * either, which stops a scripted read even if a browser sent it anyway.
 */
function setCookie(request: Request, value: string | null): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  const attrs = `Path=/; HttpOnly; SameSite=Lax${secure}`
  return value
    ? `${COOKIE}=${encodeURIComponent(value)}; ${attrs}; Max-Age=${MAX_AGE}`
    : `${COOKIE}=; ${attrs}; Max-Age=0`
}

function json(body: unknown, status: number, cookie?: string): Response {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    // A cached session response would hand one visitor another's tokens.
    'cache-control': 'no-store, private',
  }
  if (cookie) headers['set-cookie'] = cookie
  return new Response(JSON.stringify(body), { status, headers })
}

async function store(request: Request): Promise<Response> {
  let token = ''
  try {
    const body = (await request.json()) as { refresh_token?: unknown }
    if (typeof body.refresh_token === 'string') token = body.refresh_token
  } catch {
    /* malformed body falls through to the 400 below */
  }
  if (!token) return json({ ok: false }, 400)
  return json({ ok: true }, 200, setCookie(request, token))
}

async function restore(request: Request): Promise<Response> {
  const token = readCookie(request)
  if (!token) return json({ session: null }, 401)
  if (!SUPABASE_URL || !ANON_KEY) return json({ session: null }, 503)

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: ANON_KEY,
      authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ refresh_token: token }),
  })

  if (!res.ok) {
    // Revoked, already rotated past the reuse window, or the user is gone:
    // the cookie is dead weight, so clear it instead of retrying every visit.
    return json({ session: null }, 401, setCookie(request, null))
  }

  const data = (await res.json()) as { access_token?: string; refresh_token?: string }
  if (!data.access_token || !data.refresh_token) {
    return json({ session: null }, 401, setCookie(request, null))
  }
  // Rotation issued a new refresh token; the old one dies with this response.
  return json(
    { session: { access_token: data.access_token, refresh_token: data.refresh_token } },
    200,
    setCookie(request, data.refresh_token),
  )
}

export default {
  async fetch(request: Request): Promise<Response> {
    switch (request.method) {
      case 'GET':
        return restore(request)
      case 'POST':
        return store(request)
      case 'DELETE':
        return json({ ok: true }, 200, setCookie(request, null))
      default:
        return json({ error: 'method not allowed' }, 405)
    }
  },
}
