// End-to-end smoke test for the HYPERNET signup terminal.
// Requires the dev server on http://localhost:5173 (npm run dev).
// Run: node scripts/e2e.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173/'
const SHOTS = 'scripts/shots'
mkdirSync(SHOTS, { recursive: true })

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

const browser = await chromium.launch()

// ---------- Desktop keyboard flow (KNOWN COCREATOR) ------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(BASE)
  await page.waitForSelector('text=HYPERNET v0.1')

  // 0 :: welcome — finish typewriter, visit the about page, come back
  await page.keyboard.press('Enter')
  await page.waitForSelector('button:has-text("SIGN UP")')
  await page.screenshot({ path: `${SHOTS}/desktop-0-welcome.png` })
  await page.keyboard.press('ArrowUp') // highlight TELL ME MORE
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=What do you want to know?')
  await page.screenshot({ path: `${SHOTS}/desktop-0-about-menu.png` })
  await page.keyboard.press('Enter') // ORIGIN
  await page.waitForSelector('text=4-year art project')
  await page.screenshot({ path: `${SHOTS}/desktop-0-about-origin.png` })
  await page.keyboard.press('Enter') // finish typewriter if needed
  await page.waitForSelector('button:has-text("BACK TO INFO MENU")')
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=What do you want to know?')
  await page.keyboard.press('Backspace') // back to welcome
  await page.keyboard.press('Enter') // finish welcome typing again
  await page.waitForSelector('button:has-text("SIGN UP")')
  await page.keyboard.press('Enter') // SIGN UP (default highlight)

  // pre-status info
  await page.keyboard.press('Enter')
  await page.waitForSelector('button:has-text("OK")')
  await page.keyboard.press('Enter')

  // 1 :: status — no ADMIN option any more; pick KNOWN CO-CREATOR (3rd)
  await page.waitForSelector('text=IN WHAT CAPACITY ARE YOU JOINING HYPERNET?')
  if ((await page.locator('.opt').count()) !== 4) fail('expected 4 status options (admin removed)')
  await page.screenshot({ path: `${SHOTS}/desktop-1-status.png` })
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  // branch message
  await page.keyboard.press('Enter')
  await page.waitForSelector('button:has-text("CONTINUE")')
  await page.keyboard.press('Enter')

  // 2 :: contact — name
  await page.waitForSelector('text=YOUR FULL NAME:')
  if ((await page.locator('.mode-chip.txt').count()) !== 1) fail('TXT mode chip not shown on text screen')
  await page.keyboard.type('Test Node')
  await page.keyboard.press('Enter')

  // reachable channels — tick EMAIL and DISCORD
  await page.waitForSelector('text=HOW CAN YOU BE REACHED?')
  await page.screenshot({ path: `${SHOTS}/desktop-2-channels.png` })
  await page.keyboard.press('Space') // email
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Space') // discord
  await page.keyboard.press('Enter')

  // email — test the mouse BACK button dialog first, then fill
  await page.waitForSelector('text=EMAIL ADDRESS:')
  await page.locator('.back-btn').click()
  await page.waitForSelector('text=GO BACK TO PREVIOUS QUESTION?')
  await page.screenshot({ path: `${SHOTS}/desktop-2-dialog.png` })
  await page.locator('button:has-text("NO")').click()
  await page.waitForSelector('text=GO BACK TO PREVIOUS QUESTION?', { state: 'detached' })
  await page.mouse.move(5, 5) // park the mouse so hover doesn't steal the menu highlight
  await page.keyboard.type('test@example.com')
  await page.keyboard.press('Enter')

  // discord next (phone/facebook were not ticked)
  await page.waitForSelector('text=DISCORD TAG:')
  await page.keyboard.type('testnode#1234')
  await page.keyboard.press('Enter')

  // 2B :: location — Sweden / Stockholm, then add custom Iceland / Reykjavik
  await page.waitForSelector('text=Which country are you based in?')
  await page.screenshot({ path: `${SHOTS}/desktop-2b-location.png` })
  await page.keyboard.press('Enter') // SWEDEN (first)
  await page.waitForSelector('text=select a city')
  await page.keyboard.press('Enter') // STOCKHOLM
  await page.waitForSelector('text=CITIES REGISTERED')
  await page.keyboard.press('Enter') // + ADD ANOTHER CITY
  await page.waitForSelector('text=Which country are you based in?')
  await page.mouse.move(5, 5)
  await page.keyboard.press('ArrowUp') // wraps to "+ ADD A NEW COUNTRY"
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=NAME YOUR COUNTRY')
  await page.keyboard.type('Iceland')
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=name your city')
  await page.keyboard.type('Reykjavik')
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=CITIES REGISTERED')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter') // DONE

  // 3 :: attended — "projects" wording, Op. names — tick 2023 and 2025
  await page.waitForSelector('text=HYPERSTITION projects')
  await page.waitForSelector('text=OP. STRONG SIGNAL')
  await page.waitForSelector('text=DEEP STATE SPEAKEASY OP. C.R.I.C.K.E.T.S')
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Space')
  await page.screenshot({ path: `${SHOTS}/desktop-3-attended.png` })
  await page.keyboard.press('Enter')

  // 3a :: capacity (cocreator branch)
  await page.waitForSelector('text=In what capacity have you previously contributed')
  await page.keyboard.type('Built the strong signal antenna array.')
  await page.keyboard.press('Enter')

  // 4 :: skills — first category / first specialty + note
  await page.waitForSelector('text=Select a category')
  await page.keyboard.press('Enter') // BUILD & CONSTRUCTION
  await page.waitForSelector('text=select a specialty')
  await page.keyboard.press('Enter') // CARPENTRY
  await page.waitForSelector('text=Tell us more about')
  await page.keyboard.type('Ten years of stage carpentry.')
  await page.keyboard.press('Enter')

  // menu — add a custom category + specialty
  await page.waitForSelector('text=SKILLS REGISTERED')
  await page.keyboard.press('Enter') // + ADD A SKILL (highlighted first)
  await page.waitForSelector('text=Select a category')
  await page.keyboard.press('ArrowUp') // wraps to "+ ADD A NEW CATEGORY"
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=NAME YOUR NEW CATEGORY')
  await page.keyboard.type('Time Travel')
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=name your specialty')
  await page.keyboard.type('Chrononautics')
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=Tell us more about')
  await page.keyboard.press('Enter') // no note

  // menu — DONE
  await page.waitForSelector('text=SKILLS REGISTERED')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  // 5 :: anything else
  await page.waitForSelector('text=Anything else we should know')
  await page.keyboard.type('Ran a tea camp at three burns.')
  await page.keyboard.press('Enter')

  // 6 :: thanks — offline fallback, node animation, final copy
  await page.waitForSelector('text=TRANSMITTING NODE')
  await page.waitForSelector('text=UPLINK OFFLINE', { timeout: 10000 })
  await page.waitForSelector('button:has-text("RESET TERMINAL")', { timeout: 20000 })
  await page.screenshot({ path: `${SHOTS}/desktop-6-thanks.png` })

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hypernet_pending_signups') ?? '[]'),
  )
  if (stored.length !== 1) fail(`expected 1 cached signup, got ${stored.length}`)
  const row = stored[0]
  if (row.status !== 'cocreator') fail(`status: ${row.status}`)
  if (row.full_name !== 'Test Node') fail(`full_name: ${row.full_name}`)
  if (row.email !== 'test@example.com') fail(`email: ${row.email}`)
  if (row.discord !== 'testnode#1234') fail(`discord: ${row.discord}`)
  if (row.phone !== null) fail(`phone should be null, got ${row.phone}`)
  if (JSON.stringify(row.contact_prefs?.reachable) !== '["email","discord"]')
    fail(`reachable: ${JSON.stringify(row.contact_prefs)}`)
  if (
    JSON.stringify(row.locations) !==
    JSON.stringify([
      { country: 'SWEDEN', city: 'STOCKHOLM' },
      { country: 'ICELAND', city: 'REYKJAVIK' },
    ])
  )
    fail(`locations: ${JSON.stringify(row.locations)}`)
  if (JSON.stringify(row.attended_events) !== '["2023","2025"]')
    fail(`attended: ${JSON.stringify(row.attended_events)}`)
  if (row.contribution_history !== 'Built the strong signal antenna array.')
    fail(`capacity: ${row.contribution_history}`)
  if (row.skills?.length !== 2) fail(`skills length: ${row.skills?.length}`)
  if (row.skills?.[1]?.category !== 'TIME TRAVEL' || row.skills?.[1]?.subcategory !== 'CHRONONAUTICS')
    fail(`custom skill: ${JSON.stringify(row.skills?.[1])}`)
  if (row.other_info !== 'Ran a tea camp at three burns.') fail(`other: ${row.other_info}`)

  console.log('desktop flow: OK')
  await page.close()
}

// ---------- Mobile tap flow (SUBSCRIBER with whatsapp) ----------------------
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  await page.goto(BASE)
  await page.waitForSelector('text=HYPERNET v0.1')

  if (!(await page.locator('.back-btn').isVisible())) fail('BACK button not visible on mobile')
  if (!(await page.locator('.enter-btn').isVisible())) fail('ENTER button not visible on mobile')

  // welcome — tap text to finish typing, tap SIGN UP
  await page.locator('.tw').first().click()
  await page.locator('button:has-text("SIGN UP")').click()

  // pre-status info
  await page.locator('.tw').first().click()
  await page.locator('button:has-text("OK")').click()

  // status — tap to mark SUBSCRIBER, then ENTER to confirm
  await page.waitForSelector('text=IN WHAT CAPACITY ARE YOU JOINING HYPERNET?')
  await page.screenshot({ path: `${SHOTS}/mobile-1-status.png` })
  await page.locator('.opt').first().click()
  await page.locator('.enter-btn').click()

  // subscriber branch note
  await page.locator('.tw').first().click()
  await page.locator('button:has-text("CONTINUE")').click()

  // name, email, whatsapp via taps
  await page.waitForSelector('text=YOUR FULL NAME:')
  await page.locator('.prompt-row input').fill('Mobile Ghost')
  await page.locator('button:has-text("[ OK ]")').click()
  await page.waitForSelector('text=EMAIL ADDRESS:')
  await page.locator('.prompt-row input').fill('ghost@example.com')
  await page.locator('button:has-text("[ OK ]")').click()
  await page.waitForSelector('text=PHONE NUMBER (WHATSAPP):')
  await page.locator('.prompt-row input').fill('+46 70 123 45 67')
  await page.locator('button:has-text("[ OK ]")').click()

  // location — mark SKIP, then ENTER
  await page.waitForSelector('text=Which country are you based in?')
  await page.locator('.opt').last().click()
  await page.locator('.enter-btn').click()

  // subscriber goes to thanks after location
  await page.waitForSelector('text=TRANSMITTING NODE')
  await page.waitForSelector('button:has-text("RESET TERMINAL")', { timeout: 20000 })
  await page.screenshot({ path: `${SHOTS}/mobile-6-thanks.png` })

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('hypernet_pending_signups') ?? '[]'),
  )
  if (stored.length !== 1) fail(`mobile: expected 1 cached signup, got ${stored.length}`)
  if (stored[0].status !== 'subscriber') fail(`mobile status: ${stored[0].status}`)
  if (stored[0].email !== 'ghost@example.com') fail(`mobile email: ${stored[0].email}`)
  if (stored[0].phone !== '+46 70 123 45 67') fail(`mobile phone: ${stored[0].phone}`)
  if (JSON.stringify(stored[0].locations) !== '[]')
    fail(`mobile locations: ${JSON.stringify(stored[0].locations)}`)

  console.log('mobile flow: OK')
  await page.close()
}

await browser.close()
if (process.exitCode) {
  console.error('E2E FAILED')
} else {
  console.log('ALL E2E CHECKS PASSED')
}
