// Regression: Thanks screen re-mount (desktop icon / header badge, then BACK)
// must not re-transmit the signup, and the mobile header theme toggle must exist.
// Requires the dev server on http://localhost:5173 (npm run dev).
import { chromium } from 'playwright'
const fail = (m) => { console.error('FAIL: ' + m); process.exitCode = 1 }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
let posts = 0
await page.route('**/rest/v1/**', (route) => {
  const m = route.request().method()
  if (m === 'GET' || m === 'HEAD') return route.continue()
  if (route.request().url().includes('/signups')) posts++
  return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' })
})
await page.goto('http://localhost:5173/')
// Seed a completed draft at the review screen and reload into it.
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('hypernet_signup_draft', JSON.stringify({
    savedAt: Date.now(), screen: 'review', history: ['welcome'],
    answers: { status: 'known_cocreator', fullName: 'Dup Test', email: 'dup@test.invalid',
      contactChannels: ['email'], locations: [], customLocations: [], attendedEvents: [], years: [], skills: [], customOptions: [] },
  }))
})
await page.reload()
await page.waitForSelector('.review-submit', { timeout: 10000 })
await page.locator('.review-submit').click()
await page.waitForSelector('text=Do you wish to submit your answers to the database?')
await page.locator('.opt', { hasText: 'SUBMIT' }).first().click()
await page.waitForSelector('text=TRANSMITTING NODE')
await page.waitForSelector('text=NODE REGISTERED')
const pending = () => page.evaluate(() => JSON.parse(localStorage.getItem('hypernet_pending_signups') ?? '[]').length)
console.log('after first submit: posts=%d pending=%d', posts, await pending())

// Navigate away via the header badge (opens Terminal) and come BACK.
await page.locator('.section-badge').click()
await page.waitForSelector('text=TERMINAL', { timeout: 5000 }).catch(() => {})
await page.locator('.back-btn').click()
await page.waitForTimeout(800)
const world = await page.locator('text=N :: WORLD').count()
console.log('after away+back: posts=%d pending=%d worldShown=%d', posts, await pending(), world)
if (posts !== 1) fail(`expected 1 signup POST, got ${posts}`)
if ((await pending()) !== 1) fail('expected 1 cached pending signup')
if (world < 1) fail('re-mounted Thanks should land on the World, not re-transmit')
await page.screenshot({ path: '/tmp/resubmit.png' })

// Mobile: header theme toggle must exist and cycle.
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
await m.goto('http://localhost:5173/')
await m.waitForSelector('text=HYPERNET v0.1')
const btn = m.locator('.theme-btn.mobile-only')
const vis = await btn.isVisible()
const t0 = await m.locator('.app').getAttribute('data-theme')
if (vis) await btn.click()
const t1 = await m.locator('.app').getAttribute('data-theme')
console.log('mobile theme btn visible=%s theme %s -> %s', vis, t0, t1)
if (!vis || t0 === t1) fail('mobile theme toggle missing or not cycling')
// Desktop: must be hidden.
const d = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await d.goto('http://localhost:5173/'); await d.waitForSelector('text=HYPERNET v0.1')
const dvis = await d.locator('.theme-btn.mobile-only').isVisible()
console.log('desktop mobile-only btn visible=%s', dvis)
if (dvis) fail('mobile-only theme button leaked onto desktop')
await browser.close()
console.log(process.exitCode ? 'RESULT: FAIL' : 'RESULT: PASS')
