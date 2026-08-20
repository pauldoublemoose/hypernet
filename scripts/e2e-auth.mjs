// End-to-end checks for sticky logins.
//
// Run against `vercel dev` (default http://localhost:3000/) so the real
// /api/session function answers; `BASE=http://localhost:5173/ node
// scripts/e2e-auth.mjs` exercises the degraded path where no function exists.
// Run: node scripts/e2e-auth.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:3000/'
const EMAIL = 'authcheck@example.com'
const USER_ID = '00000000-0000-4000-8000-00000000beef'

let failures = 0
const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  failures++
}
const pass = (msg) => console.log(`ok: ${msg}`)

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
/** An unexpired access token; nothing here checks the signature. */
function accessToken() {
  const now = Math.floor(Date.now() / 1000)
  return [
    b64({ alg: 'HS256', typ: 'JWT' }),
    b64({
      sub: USER_ID,
      email: EMAIL,
      aud: 'authenticated',
      role: 'authenticated',
      session_id: '00000000-0000-4000-8000-00000000cafe',
      iat: now,
      exp: now + 3600,
    }),
    'test-signature',
  ].join('.')
}

const USER = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: EMAIL,
  email_confirmed_at: '2026-01-01T00:00:00Z',
  phone: '',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  identities: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const json = (body, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

/** Stub every call the account path makes, so assertions stay deterministic. */
async function stubSupabase(context) {
  // Telemetry must never reach the real table from a test run.
  await context.route('**/rest/v1/telemetry_events*', (r) => r.fulfill(json([], 201)))
  await context.route('**/auth/v1/user*', (r) => r.fulfill(json(USER)))
  await context.route('**/rest/v1/rpc/claim_signups*', (r) => r.fulfill(json(0)))
  await context.route('**/rest/v1/rpc/is_admin*', (r) => r.fulfill(json(false)))
  await context.route('**/rest/v1/signups*', (r) => r.fulfill(json([])))
  // The account workspace renders the network graph; keep it off the network.
  await context.route('**/rest/v1/graph_signups*', (r) => r.fulfill(json([])))
}

const browser = await chromium.launch()

// ---------- 1. No session anywhere: the real endpoint answers 401 ----------
{
  const context = await browser.newContext()
  await stubSupabase(context)
  const page = await context.newPage()
  const calls = []
  page.on('request', (r) => {
    if (r.url().includes('/api/session')) calls.push(r.method())
  })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto(BASE)
  await page.waitForSelector('text=HYPERNET v0.1')
  await page.keyboard.press('Enter') // skip the typewriter
  await page.waitForSelector('text=[ SIGN UP ]')

  if (!calls.includes('GET')) fail('boot should ask /api/session for a session')
  else pass('boot asks the server cookie for a session')
  if (await page.locator('text=SESSION ACTIVE').count()) fail('signed out visitor shown as active')
  else pass('signed out visitor shows no session line')
  if (!(await page.locator('text=[ ACCESS YOUR NODE ]').count())) {
    fail('signed out visitor should be offered login')
  } else pass('signed out visitor is offered login')
  if (errors.length) fail(`console errors: ${errors.join(' | ')}`)
  else pass('no console errors while signed out')
  await context.close()
}

// ---------- 2. Cookie survives an emptied localStorage ----------
{
  const context = await browser.newContext()
  await stubSupabase(context)
  // Stand in for a cookie the server would trade for a fresh session — the
  // case where Safari has evicted localStorage between visits.
  await context.route('**/api/session', (r) =>
    r.request().method() === 'GET'
      ? r.fulfill(json({ session: { access_token: accessToken(), refresh_token: 'rt-rotated' } }))
      : r.fulfill(json({ ok: true })),
  )
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto(BASE)
  await page.waitForSelector('text=HYPERNET v0.1')
  // A restored session skips the pitch and lands straight on the node.
  await page.waitForSelector('text=L :: YOUR NODE')
  pass('restored session lands directly on the node screen')
  await page.waitForSelector(`text=LOGGED IN AS ${EMAIL.toUpperCase()}`)
  pass('account screen opens straight to the restored node')
  if (await page.locator('text=NO ACTIVE SESSION').count()) {
    fail('account screen flashed a signed-out state')
  } else pass('account screen never claims there is no session')

  // Going BACK reaches the welcome screen (no auto-jump loop), which still
  // knows about the session.
  await page.locator('text=[ BACK ]').click()
  await page.waitForSelector('text=HYPERNET v0.1')
  await page.keyboard.press('Enter') // skip the typewriter
  await page.waitForSelector('text=[ SIGN UP ]')
  const line = page.locator(`text=SESSION ACTIVE — ${EMAIL.toUpperCase()}`)
  if (!(await line.count())) fail('welcome (via BACK) should show the live session')
  else pass('welcome (via BACK) shows the live session, no jump loop')
  if (!(await page.locator('text=[ YOUR NODE ]').count())) {
    fail('welcome (via BACK) should not ask to log in again')
  } else pass('welcome (via BACK) skips the login prompt')

  const stored = await page.evaluate(() =>
    Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.includes('auth-token')),
  )
  if (!stored) fail('restored session should be written back to localStorage')
  else pass('restored session is written back to localStorage')
  if (errors.length) fail(`console errors: ${errors.join(' | ')}`)
  else pass('no console errors while restoring')
  await context.close()
}

// ---------- 3. A live localStorage session costs no rotation ----------
{
  const context = await browser.newContext()
  await stubSupabase(context)
  // Phase 1 hands the app a session so it writes its own storage key; phase 2
  // reloads and watches whether it asks the server for one it already has.
  let phase = 1
  const calls = []
  await context.route('**/api/session', (r) => {
    if (phase === 2) calls.push(r.request().method())
    if (r.request().method() !== 'GET') return r.fulfill(json({ ok: true }))
    return phase === 1
      ? r.fulfill(json({ session: { access_token: accessToken(), refresh_token: 'rt-rotated' } }))
      : r.fulfill(json({ session: null }, 401))
  })
  const page = await context.newPage()
  await page.goto(BASE)
  await page.waitForSelector('text=HYPERNET v0.1')
  await page.waitForSelector(`text=LOGGED IN AS ${EMAIL.toUpperCase()}`)

  phase = 2
  await page.reload()
  await page.waitForSelector('text=HYPERNET v0.1')
  await page.waitForSelector(`text=LOGGED IN AS ${EMAIL.toUpperCase()}`)

  if (calls.includes('GET')) {
    fail('a live local session should not spend a refresh-token rotation')
  } else pass('a live local session spends no refresh-token rotation')
  if (!calls.includes('POST')) fail('the live session should be mirrored to the cookie')
  else pass('the live session is mirrored to the cookie')
  await context.close()
}

await browser.close()
console.log(failures === 0 ? '\nAUTH E2E PASS' : `\nAUTH E2E FAIL (${failures})`)
process.exitCode = failures === 0 ? 0 : 1
