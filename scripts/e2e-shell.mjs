#!/usr/bin/env node
// Desktop shell layout check: top nav, categorized left nav, dual windows, left shift.
// Requires the app on BASE (default http://127.0.0.1:5173/).
// Run: node scripts/e2e-shell.mjs
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.VERIFY_URL ?? 'http://127.0.0.1:5173/'
const SHOTS = 'scripts/shots'
mkdirSync(SHOTS, { recursive: true })

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(BASE)
await page.evaluate(() => localStorage.clear())
await page.reload()
await page.waitForSelector('text=HYPERNET v0.1')

const top = page.locator('[data-shell="topnav"]')
const side = page.locator('[data-shell="sidenav"]')
const preview = page.locator('[data-shell="preview"]')
if (!(await top.isVisible())) fail('top nav hidden')
if (!(await side.isVisible())) fail('left nav hidden')
if (!(await preview.isVisible())) fail('preview pane hidden')

for (const label of ['Find', 'Global', 'Mine', 'System']) {
  const cat = page.locator('.desk-cat-label', { hasText: label })
  if ((await cat.count()) < 1) fail(`missing category ${label}`)
  const topLink = page.locator('.shell-topnav-link', { hasText: label })
  if ((await topLink.count()) < 1) fail(`missing top nav ${label}`)
}

const destinations = [
  'Find Nodes',
  'Find Events',
  'Find Horizons',
  'Find Clusters',
  'Global Announcements',
  'Global Chat',
  'Network Graph',
  'My Notifications',
  'My Chats',
  'MY NODE',
  'My Chronicle',
  'My Contacts',
  'My Clusters',
  'MY HORIZONS',
  'Theme',
  'ADMIN',
  'SETTINGS',
]
for (const label of destinations) {
  if ((await page.locator('.desk-label', { hasText: label }).count()) < 1) {
    fail(`missing destination ${label}`)
  }
}

if ((await page.locator('.chrome-frame').count()) !== 2) fail('expected two chrome frames')

const layout = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, width: r.width, height: r.height }
  }
  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    topnav: box(document.querySelector('[data-shell="topnav"]')),
    sidenav: box(document.querySelector('[data-shell="sidenav"]')),
    primary: box(document.querySelector('.shell-windows .chrome-frame:not(.chrome-preview)')),
    preview: box(document.querySelector('[data-shell="preview"]')),
  }
})
writeFileSync(`${SHOTS}/shell-layout.json`, JSON.stringify(layout, null, 2))
console.log(
  `primary.left=${layout.primary?.left} center=${(layout.primary?.left ?? 0) + (layout.primary?.width ?? 0) / 2} preview.left=${layout.preview?.left}`,
)

if (!layout.primary) fail('primary chrome missing')
else {
  const center = layout.primary.left + layout.primary.width / 2
  if (layout.primary.left > 230) fail(`primary left ${layout.primary.left} should sit beside the left nav`)
  if (center >= 600) fail(`primary center ${center} is not left of viewport center`)
}
if (!layout.preview) fail('preview chrome missing')
else if (layout.preview.left < (layout.primary?.right ?? 0) - 8) {
  fail('preview should sit to the right of the primary window')
}

const themeBtn = page.locator('[data-theme-cycle="true"]')
const appTheme = () => page.locator('.app').getAttribute('data-theme')
if ((await themeBtn.count()) !== 1) fail('Theme desktop icon missing')
if ((await appTheme()) !== 'white') fail('initial theme should be white')
await themeBtn.click()
if ((await appTheme()) !== 'black') fail('theme should cycle to black')
await themeBtn.click()
if ((await appTheme()) !== 'polychrome') fail('theme should cycle to polychrome')
await themeBtn.click()
if ((await appTheme()) !== 'white') fail('theme should cycle back to white')

await page.screenshot({ path: `${SHOTS}/shell-desktop.png` })

await page.getByRole('button', { name: 'Find Nodes — search the network for people and nodes. Placeholder.' }).click()
await page.waitForSelector('text=FN :: NODES')
await page.screenshot({ path: `${SHOTS}/shell-find-nodes.png` })

if (await preview.isVisible()) {
  const stub = page.locator('[data-shell="preview"]')
  if ((await stub.locator('text=PREVIEW').count()) < 1) fail('preview stub title missing')
}

await browser.close()
if (process.exitCode) process.exit(process.exitCode)
console.log('PASS: shell top nav, categorized left nav, dual windows, left shift')
