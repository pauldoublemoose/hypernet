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
  const existing = readState()
  if (existing && pidAlive(existing.pid) && existing.port) {
    const probe = await httpOk(baseUrl(existing.port))
    if (probe.ok && probe.text.includes('HYPERNET')) {
      console.log(`already running pid=${existing.pid} ${baseUrl(existing.port)}`)
      return
    }
  }

  const port = DEFAULT_PORT
  const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  writeState({ pid: child.pid, port, startedByUs: true, startedAt: Date.now() })

  for (let i = 0; i < 40; i++) {
    const probe = await httpOk(baseUrl(port))
    if (probe.ok && probe.text.includes('HYPERNET')) {
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
  if (state.startedByUs && !pidAlive(state.pid)) {
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
  const flags = { heading: 'Hypernet feed', fillViewport: false, expectScroll: false }
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
  await page.waitForSelector('text=HYPERNET v0.1')
  return page
}

async function skipWelcome(page) {
  await page.keyboard.press('Enter')
  await page.waitForSelector('button:has-text("SIGN IN")')
}

async function seedAndSignIn(page) {
  await page.evaluate((profile) => {
    localStorage.clear()
    localStorage.setItem('hypernet_profile', JSON.stringify(profile))
  }, PROFILE)
  await page.reload()
  await page.waitForSelector('text=HYPERNET v0.1')
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
  if (layout.chrome.top > 24) return `chrome top ${layout.chrome.top} > 24`
  if (layout.viewport.height - layout.chrome.bottom > 48) {
    return `chrome bottom gap ${layout.viewport.height - layout.chrome.bottom} > 48`
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

async function driveWelcomeSignin(page, flags) {
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('text=HYPERNET v0.1')
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
  const feed = page.getByRole('tab', { name: 'Feed' })
  if ((await feed.getAttribute('aria-selected')) !== 'true') fail('Feed tab should be selected')
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
  const feed = page.getByRole('tab', { name: 'Feed' })
  if ((await feed.getAttribute('aria-selected')) !== 'true') fail('Feed tab should be selected')
  await page.waitForSelector('text=Hypernet feed')
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
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForSelector('text=HYPERNET v0.1')
  const left = page.getByRole('navigation', { name: 'Hypernet discovery' })
  const right = page.getByRole('navigation', { name: 'Hypernet mine' })
  if (!(await left.isVisible())) fail('left discovery dock hidden')
  if (!(await right.isVisible())) fail('right mine dock hidden')
  if ((await page.locator('.desk-label', { hasText: 'Global Announcements' }).count()) < 1) {
    fail('Global Announcements label missing')
  }
  if ((await page.locator('.desk-label', { hasText: 'SETTINGS' }).count()) < 1) fail('SETTINGS label missing')
  const theme = page.locator('[data-theme-cycle="true"]')
  const app = page.locator('.app')
  if ((await app.getAttribute('data-theme')) !== 'white') fail('initial theme should be white')
  await theme.click()
  if ((await app.getAttribute('data-theme')) !== 'black') fail('theme should become black')
  await theme.click()
  if ((await app.getAttribute('data-theme')) !== 'polychrome') fail('theme should become polychrome')
  await theme.click()
  if ((await app.getAttribute('data-theme')) !== 'white') fail('theme should return to white')
  await page.screenshot({ path: `${EVIDENCE}/desktop-chrome.png` })
  console.log('desktop-chrome: docks + theme cycle')
}

async function cmdDrive(feature, argv) {
  mkdirSync(EVIDENCE, { recursive: true })
  const flags = parseDriveFlags(argv)
  const browser = await chromium.launch()
  try {
    const page = await openPage(browser)
    if (feature === 'welcome-signin') await driveWelcomeSignin(page, flags)
    else if (feature === 'terminal-tabs') await driveTerminalTabs(page)
    else if (feature === 'desktop-chrome') await driveDesktopChrome(page)
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
    } catch {
      /* already gone */
    }
    console.log(`killed pid=${state.pid}`)
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
