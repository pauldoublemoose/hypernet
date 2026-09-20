#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'

const STATE = '/tmp/hypernet-verify-run.json'
const EVIDENCE = '/tmp/hypernet-verify/evidence'
const DEFAULT_PORT = Number(process.env.VERIFY_PORT ?? 5179)
const ROOT = resolve(new URL('../../../../', import.meta.url).pathname)

function fail(msg) {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

function readState() {
  if (!existsSync(STATE)) return null
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'))
  } catch {
    return null
  }
}

function writeState(state) {
  writeFileSync(STATE, JSON.stringify(state, null, 2))
}

function pidAlive(pid) {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function baseUrl(port = readState()?.port ?? DEFAULT_PORT) {
  return `http://127.0.0.1:${port}/`
}

async function httpOk(url) {
  try {
    const res = await fetch(url)
    const text = await res.text()
    return { ok: res.ok, status: res.status, text }
  } catch (err) {
    return { ok: false, status: 0, text: String(err) }
  }
}

async function cmdLaunch() {
  const port = DEFAULT_PORT
  const existing = readState()
  if (existing && existing.port === port) {
    const probe = await httpOk(baseUrl(port))
    if (probe.ok && probe.text.includes('HYPERNET')) {
      if (existing.pid && !pidAlive(existing.pid)) {
        writeState({ ...existing, pid: existing.pid, port, startedByUs: false })
      }
      console.log(`already running ${baseUrl(port)}`)
      return
    }
  }

  const probe = await httpOk(baseUrl(port))
  if (probe.ok && probe.text.includes('HYPERNET')) {
    writeState({ pid: null, port, startedByUs: false, startedAt: Date.now() })
    console.log(`adopted existing server ${baseUrl(port)}`)
    return
  }

  const vite = resolve(ROOT, 'node_modules/.bin/vite')
  const child = spawn(vite, ['--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  writeState({ pid: child.pid, port, startedByUs: true, startedAt: Date.now() })

  for (let i = 0; i < 40; i++) {
    const ready = await httpOk(baseUrl(port))
    if (ready.ok && ready.text.includes('HYPERNET')) {
      console.log(`launched pid=${child.pid} ${baseUrl(port)}`)
      return
    }
    await sleep(250)
  }
  fail(`server did not become ready on ${baseUrl(port)}`)
}

async function cmdDoctor() {
  const state = readState()
  if (!state?.port) {
    fail(`no state at ${STATE} — run launch first`)
    return
  }
  if (state.startedByUs && state.pid && !pidAlive(state.pid)) {
    fail(`recorded pid ${state.pid} is not running`)
    return
  }
  const probe = await httpOk(baseUrl(state.port))
  if (!probe.ok) {
    fail(`GET ${baseUrl(state.port)} -> ${probe.status} ${probe.text}`)
    return
  }
  if (!probe.text.includes('HYPERNET')) {
    fail('response missing HYPERNET')
    return
  }
  try {
    await import('playwright')
  } catch (err) {
    fail(`playwright missing: ${err}`)
    return
  }
  console.log(`doctor ok ${baseUrl(state.port)} pid=${state.pid ?? 'external'}`)
}

function parseDriveFlags(argv) {
  const flags = { heading: 'How to use Hypernet', fillViewport: false, expectScroll: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--heading') flags.heading = argv[++i]
    else if (argv[i] === '--fill-viewport') flags.fillViewport = true
    else if (argv[i] === '--expect-scroll') flags.expectScroll = true
  }
  return flags
}

const PROFILE = {
  displayName: 'Verify Node',
  bio: '',
  skillsText: '',
  email: '',
  phone: '',
  discord: '',
  facebook: '',
  avatarDataUrl: '',
  privacy: {
    avatar: 'public',
    bio: 'public',
    skills: 'public',
    contact: 'public',
    chronicle: 'public',
  },
}

async function openPage(browser) {
  const state = readState()
  if (!state?.port) throw new Error('no launched instance')
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(baseUrl(state.port))
  await page.waitForSelector('[data-shell="onboarding"], [data-shell="search"], [data-shell="finder"]')
  return page
}

async function skipWelcome(page) {
  for (let i = 0; i < 6; i++) {
    if ((await page.locator('button:has-text("SIGN IN")').count()) > 0) return
    await page.keyboard.press('Enter')
    await sleep(80)
  }
  if ((await page.locator('button:has-text("HOW TO START")').count()) > 0) {
    await page.locator('button:has-text("HOW TO START")').click()
  }
  await page.waitForSelector('button:has-text("SIGN IN")')
}

async function enterDesert(page) {
  await page.evaluate(() => {
    localStorage.setItem('hypernet_onboarded', '1')
  })
  await page.reload()
  await page.waitForSelector('[data-shell="dust"]')
}

async function openTerminal(page) {
  const toggle = page.locator('.shell-cat-toggle', { hasText: 'Global' })
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click()
  await page.getByRole('button', { name: 'Terminal', exact: true }).click()
}

async function seedAndSignIn(page) {
  await page.evaluate((profile) => {
    localStorage.clear()
    localStorage.setItem('hypernet_profile', JSON.stringify(profile))
  }, PROFILE)
  await page.reload()
  await page.waitForSelector('[data-shell="onboarding"], [data-shell="search"]')
  await skipWelcome(page)
  await page.getByRole('button', { name: /SIGN IN/ }).click()
}

async function measureLayout(page) {
  return page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        top: r.top,
        bottom: r.bottom,
        height: r.height,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }
    }
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      chrome: box('.chrome-frame'),
      header: box('.term-header'),
      body: box('.term-body'),
      status: box('.term-status'),
    }
  })
}

function checkFill(layout) {
  if (!layout.chrome || !layout.status || !layout.header) return 'missing chrome/header/status boxes'
  if (layout.chrome.top > 90) return `chrome top ${layout.chrome.top} > 90`
  if (layout.viewport.height - layout.chrome.bottom > 80) {
    return `chrome bottom gap ${layout.viewport.height - layout.chrome.bottom} > 80`
  }
  if (Math.abs(layout.status.bottom - layout.chrome.bottom) > 40) {
    return 'status bar is not at the chrome footer'
  }
  return null
}

function writeEvidence(name, bytesOrText) {
  mkdirSync(EVIDENCE, { recursive: true })
  const path = `${EVIDENCE}/${name}`
  writeFileSync(path, bytesOrText)
  return path
}

async function driveWelcomeOnboarding(page) {
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('text=Welcome to the digital desert')
  if ((await page.locator('.chrome-frame').count()) !== 0) fail('onboarding must not mount a CRT')
  await page.keyboard.press('Enter')
  await page.waitForSelector('text=HYPERNET: Find co-creators, share events, build community.')
  await page.keyboard.press('Enter')
  await page.locator('button:has-text("HOW TO START")').click()
  await page.locator('button:has-text("ENTER THE DESERT")').click()
  await page.waitForSelector('[data-shell="desert"]')
  if ((await page.locator('.chrome-frame').count()) !== 0) fail('idle desert must not mount a CRT')
  if ((await page.locator('[data-shell="dust"]').count()) < 1) fail('pixel dust missing')
  await page.screenshot({ path: `${EVIDENCE}/welcome-onboarding.png` })
  console.log('welcome-onboarding: headlines + empty desert')
}

async function driveWelcomeSignin(page, flags) {
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('text=Welcome to the digital desert')
  await skipWelcome(page)
  await page.getByRole('button', { name: /SIGN IN/ }).click()
  if ((await page.locator('text=No account on this device yet').count()) < 1) {
    fail('empty profile should stay on Welcome with the Sign Up note')
    return
  }

  await seedAndSignIn(page)
  const heading = page.getByRole('heading', { name: flags.heading })
  if ((await heading.count()) < 1) {
    fail(`missing heading ${JSON.stringify(flags.heading)}`)
    return
  }
  const help = page.getByRole('tab', { name: 'Help' })
  if ((await help.getAttribute('aria-selected')) !== 'true') fail('Help tab should be selected')
  const layout = await measureLayout(page)
  writeEvidence('welcome-signin.layout.json', JSON.stringify(layout, null, 2))
  await page.screenshot({ path: `${EVIDENCE}/welcome-signin.png`, fullPage: false })
  console.log(`layout chrome.top=${layout.chrome?.top} chrome.bottom=${layout.chrome?.bottom} vh=${layout.viewport.height}`)
  if (flags.fillViewport) {
    const err = checkFill(layout)
    if (err) fail(err)
  }
  if (flags.expectScroll) {
    if (!layout.body || layout.body.scrollHeight <= layout.body.clientHeight) {
      fail('term-body does not overflow')
    }
  }
  console.log(`welcome-signin: heading ${JSON.stringify(flags.heading)}`)
}

async function driveTerminalTabs(page) {
  await seedAndSignIn(page)
  const help = page.getByRole('tab', { name: 'Help' })
  if ((await help.getAttribute('aria-selected')) !== 'true') fail('Help tab should be selected')
  await page.waitForSelector('text=How to use Hypernet')
  await page.getByRole('tab', { name: 'Help' }).click()
  await page.waitForSelector('text=How to use Hypernet')
  await page.screenshot({ path: `${EVIDENCE}/terminal-tabs-help.png` })
  await page.getByRole('tab', { name: 'Update log' }).click()
  await page.waitForSelector('text=Update log')
  if ((await page.locator('text=v0.1.10').count()) < 1) fail('update log missing v0.1.10')
  await page.screenshot({ path: `${EVIDENCE}/terminal-tabs-log.png` })
  await page.getByRole('tab', { name: 'About' }).click()
  await page.waitForSelector('text=About Hypernet')
  await page.screenshot({ path: `${EVIDENCE}/terminal-tabs-about.png` })
  console.log('terminal-tabs: Help / Update log / About')
}

async function driveDesktopChrome(page) {
  await enterDesert(page)
  if (!(await page.locator('[data-shell="top"]').isVisible())) fail('top bar hidden')
  if (!(await page.locator('[data-shell="bottom"]').isVisible())) fail('bottom bar hidden')
  if (!(await page.locator('[data-shell="pane"]').isVisible())) fail('left nav pane hidden')
  if (!(await page.locator('[data-shell="search"]').isVisible())) fail('SEARCH control missing')
  if ((await page.getByRole('button', { name: 'SEARCH', exact: true }).count()) < 1) fail('SEARCH label missing')
  if (!(await page.locator('[data-shell="avatar"]').isVisible())) fail('avatar missing')
  if ((await page.getByRole('button', { name: 'Chat', exact: true }).count()) < 1) fail('Chat missing')
  if ((await page.getByRole('button', { name: 'Notifications' }).count()) < 1) fail('Notifications missing')
  if ((await page.getByRole('button', { name: 'Settings' }).count()) < 1) fail('Settings missing')
  if ((await page.getByRole('button', { name: 'Chats', exact: true }).count()) < 1) fail('Chats missing')
  const explore = page.locator('[data-pane="explore"]')
  const create = page.locator('[data-pane="create"]')
  const manage = page.locator('[data-pane="manage"]')
  if ((await explore.getAttribute('aria-expanded')) !== 'false') fail('EXPLORE should start collapsed')
  await explore.click()
  if ((await explore.getAttribute('aria-expanded')) !== 'true') fail('EXPLORE did not expand')
  if ((await page.getByRole('button', { name: 'Global Spam Hell' }).count()) < 1) fail('Global Spam Hell missing')
  if ((await page.getByRole('button', { name: 'Moonwalker' }).count()) < 1) fail('Moonwalker missing')
  if ((await page.getByRole('button', { name: 'Bot Roulette' }).count()) < 1) fail('Bot Roulette missing')
  await page.screenshot({ path: `${EVIDENCE}/nav-explore.png` })
  await create.click()
  if ((await create.getAttribute('aria-expanded')) !== 'true') fail('CREATE did not expand')
  if ((await page.locator('[data-shell="create-soon"]').count()) < 1) fail('CREATE stub missing Coming soon')
  await page.screenshot({ path: `${EVIDENCE}/nav-create.png` })
  await manage.click()
  if ((await manage.getAttribute('aria-expanded')) !== 'true') fail('MANAGE did not expand')
  if ((await page.getByRole('button', { name: 'Contact lists' }).count()) < 1) fail('Contact lists missing')
  if ((await page.getByRole('button', { name: 'Event horizons' }).count()) < 1) fail('Event horizons missing')
  if ((await page.getByRole('button', { name: 'Groups' }).count()) < 1) fail('Groups missing')
  await page.screenshot({ path: `${EVIDENCE}/nav-manage.png` })
  await page.getByRole('button', { name: 'Bot Roulette' }).click()
  await page.locator('[data-shell="roulette"]').waitFor({ state: 'visible' })
  await page.locator('[data-shell="roulette-spin"]').click()
  await page.locator('[data-shell="roulette-win"]').waitFor({ state: 'visible' })
  await page.screenshot({ path: `${EVIDENCE}/bot-roulette.png` })
  const theme = page.locator('[data-theme-cycle="true"]')
  const app = page.locator('.app')
  if ((await app.getAttribute('data-theme')) !== 'white') fail('initial theme should be white')
  await theme.click()
  if ((await app.getAttribute('data-theme')) !== 'black') fail('theme should become black')
  await theme.click()
  if ((await app.getAttribute('data-theme')) !== 'polychrome') fail('theme should become polychrome')
  await theme.click()
  if ((await app.getAttribute('data-theme')) !== 'white') fail('theme should return to white')
  if ((await page.locator('.crt [data-shell="dust"]').count()) > 0) fail('pixel dust lives inside .crt')
  const dust = await page.locator('[data-shell="dust"]').evaluate((el) => {
    const s = getComputedStyle(el)
    return { z: s.zIndex, pos: s.position, parent: el.parentElement?.className ?? '' }
  })
  if (dust.z !== '0') fail(`pixel dust z-index ${dust.z} !== 0`)
  if (dust.pos !== 'fixed') fail(`pixel dust position ${dust.pos} !== fixed`)
  if (!/\bapp\b/.test(dust.parent)) fail(`pixel dust parent ${JSON.stringify(dust.parent)} is not .app`)
  await page.screenshot({ path: `${EVIDENCE}/desktop-chrome.png` })
  console.log('desktop-chrome: pane + collapse + theme')
}

async function driveIdentityPreview(page) {
  await enterDesert(page)
  const marker = page.locator('.identity-marker button').first()
  await marker.hover()
  const preview = page.locator('[data-shell="preview"]')
  await preview.waitFor({ state: 'visible' })
  const box = await preview.boundingBox()
  const vp = page.viewportSize()
  if (!box || !vp) fail('preview box missing')
  else {
    if (box.x + box.width / 2 < vp.width * 0.5) fail('preview is not in the right half')
    if (box.y + box.height / 2 > vp.height * 0.62) fail('preview is not in the top half')
  }
  await page.screenshot({ path: `${EVIDENCE}/identity-preview.png` })
  await page.mouse.move(8, 8)
  await sleep(250)
  if ((await preview.count()) > 0 && (await preview.isVisible())) fail('preview stayed after leave')
  console.log('identity-preview: hover in top-right then gone')
}

const FINDER_EXPR_KINDS = [
  { filter: 'people', space: 'person' },
  { filter: 'events', space: 'event' },
  { filter: 'groups', space: 'group' },
  { filter: 'calendars', space: 'calendar' },
]

async function driveFinder(page) {
  await enterDesert(page)
  await page.locator('[data-shell="search"]').click()
  await page.waitForSelector('h1.finder-title')
  if ((await page.locator('h1.finder-title').innerText()) !== 'SEARCH') fail('title must be SEARCH')
  const all = page.locator('[data-filter="all"]')
  const people = page.locator('[data-filter="people"]')
  if ((await all.getAttribute('aria-pressed')) !== 'true') fail('ALL should start on')
  await people.click()
  if ((await all.getAttribute('aria-pressed')) !== 'false') fail('ALL should deselect when PEOPLE is on')
  if ((await people.getAttribute('aria-pressed')) !== 'true') fail('PEOPLE should be on')
  await page.screenshot({ path: `${EVIDENCE}/finder-filter-people.png` })
  await all.click()
  if ((await all.getAttribute('aria-pressed')) !== 'true') fail('ALL should return on')
  if ((await people.getAttribute('aria-pressed')) !== 'false') fail('PEOPLE should drop when ALL is on')
  const search = page.locator('input[aria-label="Search"]')
  if ((await search.count()) < 1) fail('search bar missing')
  await search.fill('Anna')
  const searchRows = page.locator('[data-space-expr="row"]')
  const searchCount = await searchRows.count()
  if (searchCount < 1) fail('search Anna returned nothing')
  for (let i = 0; i < searchCount; i++) {
    const text = (await searchRows.nth(i).innerText()).toLowerCase()
    if (!text.includes('anna')) fail(`search leak: ${text}`)
  }
  await page.screenshot({ path: `${EVIDENCE}/finder-search.png` })
  await search.fill('')
  await page.locator('[data-view="list"]').click()
  const row = page.locator('[data-space-expr="row"]').first()
  await row.hover()
  await page.locator('[data-shell="preview"] [data-space-expr="thumb"]').waitFor({ state: 'visible' })
  await page.screenshot({ path: `${EVIDENCE}/finder-list-hover.png` })
  await page.locator('[data-view="thumbnail"]').click()
  if ((await page.locator('[data-space-expr="thumb"]').count()) < 1) fail('thumbnail view empty')
  await page.screenshot({ path: `${EVIDENCE}/finder-thumbs.png` })
  await page.locator('[data-space-expr="thumb"]').first().click()
  await page.locator('[data-space-expr="page"]').waitFor({ state: 'visible' })
  await page.screenshot({ path: `${EVIDENCE}/finder-page.png` })
  await page.locator('button:has-text("BACK TO RESULTS")').click()
  await page.waitForSelector('[data-space-expr="thumb"], [data-space-expr="row"]')

  for (const kind of FINDER_EXPR_KINDS) {
    await page.locator(`[data-filter="${kind.filter}"]`).click()
    if ((await all.getAttribute('aria-pressed')) !== 'false') fail(`ALL stayed on after ${kind.filter}`)
    await page.locator('[data-view="list"]').click()
    const kindRow = page.locator(`[data-space-expr="row"][data-space-kind="${kind.space}"]`).first()
    if ((await kindRow.count()) < 1) fail(`no ${kind.space} row`)
    await kindRow.hover()
    await page.locator('[data-shell="preview"] [data-space-expr="thumb"]').waitFor({ state: 'visible' })
    await page.screenshot({ path: `${EVIDENCE}/finder-${kind.filter}-row.png` })
    await page.locator('[data-view="thumbnail"]').click()
    const kindThumb = page.locator(`[data-space-expr="thumb"][data-space-kind="${kind.space}"]`).first()
    if ((await kindThumb.count()) < 1) fail(`no ${kind.space} thumb`)
    await page.screenshot({ path: `${EVIDENCE}/finder-${kind.filter}-thumb.png` })
    await kindThumb.click()
    await page.locator(`[data-space-expr="page"][data-space-kind="${kind.space}"]`).waitFor({ state: 'visible' })
    await page.screenshot({ path: `${EVIDENCE}/finder-${kind.filter}-page.png` })
    await page.locator('button:has-text("BACK TO RESULTS")').click()
    await page.locator('[data-filter="all"]').click()
  }
  console.log('finder: ALL mutex, search, list/thumb, hover preview, shared expressions')
}

async function cmdDrive(feature, argv) {
  mkdirSync(EVIDENCE, { recursive: true })
  const flags = parseDriveFlags(argv)
  const browser = await chromium.launch()
  try {
    const page = await openPage(browser)
    if (feature === 'welcome-signin') await driveWelcomeSignin(page, flags)
    else if (feature === 'welcome-onboarding') await driveWelcomeOnboarding(page)
    else if (feature === 'terminal-tabs') await driveTerminalTabs(page)
    else if (feature === 'desktop-chrome') await driveDesktopChrome(page)
    else if (feature === 'identity-preview') await driveIdentityPreview(page)
    else if (feature === 'finder') await driveFinder(page)
    else fail(`unknown feature ${feature}`)
  } finally {
    await browser.close()
  }
}

function cmdCleanup() {
  const state = readState()
  if (state?.startedByUs && pidAlive(state.pid)) {
    try {
      process.kill(state.pid, 'SIGTERM')
      console.log(`killed pid=${state.pid}`)
    } catch (err) {
      if (!err || typeof err !== 'object' || !('code' in err) || err.code !== 'ESRCH') throw err
      console.log(`pid=${state.pid} already gone`)
    }
  } else {
    console.log('no launched pid to kill')
  }
  if (existsSync(STATE)) rmSync(STATE)
  console.log(`evidence kept at ${EVIDENCE}`)
}

const [cmd, feature, ...rest] = process.argv.slice(2)
if (cmd === 'launch') await cmdLaunch()
else if (cmd === 'doctor') await cmdDoctor()
else if (cmd === 'drive') await cmdDrive(feature, rest)
else if (cmd === 'cleanup') cmdCleanup()
else {
  fail('usage: verify.mjs launch|doctor|drive <feature>|cleanup')
}

if (process.exitCode) process.exit(process.exitCode)
