import { useEffect, useMemo, useRef, useState } from 'react'
import { areFriendsBetween, selfId } from '../lib/contactsStore'
import { initials } from '../lib/profileStore'
import {
  inhabitantsForWorld,
  kindLabel,
  listEnterableWorlds,
  shareEvent,
  surfDialLabel,
  type GraphWorld,
  type WorldInhabitant,
} from '../lib/network/worlds'
import { CardThumb } from './CardThumb'

const WALK_ACCEL = 1500
const THRUST_ACCEL = 1900
const DAMP = 0.88
const MAX_SPEED = 580
const CAM_FOLLOW = 0.14
const MIN_K = 0.48
const MAX_K = 2.35
const BASE_REACH = 168
const NEAR_REACH = 88
const ALL_REACH = 8000
const LINK_DIST = 210
const LIGHT_DIST = 54
const NODE_R = 8
const HERO_R = 10.4

type GravityMode = 'none' | 'event' | 'friends'
type VisibilityMode = 'reach' | 'all' | 'near'

const GRAVITY_MODES: GravityMode[] = ['none', 'event', 'friends']
const VISIBILITY_MODES: VisibilityMode[] = ['reach', 'all', 'near']

const GRAVITY_LABEL: Record<GravityMode, string> = {
  none: 'NONE',
  event: 'EVENT',
  friends: 'FRIENDS',
}

const VISIBILITY_LABEL: Record<VisibilityMode, string> = {
  reach: 'REACH',
  all: 'ALL',
  near: 'NEAR',
}

function cycleMode<T>(list: readonly T[], cur: T): T {
  const i = list.indexOf(cur)
  return list[(i + 1) % list.length]
}

/** Same stops as `.poly-edge` / Theme polychrome shine — hero is always polychrome. */
const POLY_STOPS = ['#ff0040', '#ffdd00', '#00ff80', '#00cfff', '#7b00ff', '#ff0040'] as const

function prefersReduceMotion() {
  return document.documentElement.dataset.reduceMotion === 'on'
}

function fillPolyStops(grad: CanvasGradient) {
  const n = POLY_STOPS.length - 1
  for (let i = 0; i <= n; i++) {
    grad.addColorStop(i / n, POLY_STOPS[i])
  }
}

function heroConic(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const start = prefersReduceMotion() ? 0 : (t * Math.PI * 0.7) % (Math.PI * 2)
  const grad = ctx.createConicGradient(start, x, y)
  fillPolyStops(grad)
  return grad
}

/** Plain circle, slightly larger than others, with Theme-like polychrome glow + shine. */
function drawHeroNode(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, t: number) {
  const reduce = prefersReduceMotion()
  const pulse = reduce ? 1 : 1 + 0.045 * Math.sin(t * 2.6)
  const r = HERO_R * pulse

  ctx.save()
  ctx.globalAlpha = 1

  const glowR = r * 2.55
  const glow = ctx.createRadialGradient(x, y, r * 0.15, x, y, glowR)
  glow.addColorStop(0, 'rgba(255, 0, 180, 0.5)')
  glow.addColorStop(0.32, 'rgba(0, 255, 213, 0.28)')
  glow.addColorStop(0.62, 'rgba(123, 0, 255, 0.14)')
  glow.addColorStop(1, 'rgba(123, 0, 255, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, glowR, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = heroConic(ctx, x, y, t)
  ctx.fill()

  const shineAng = reduce ? -0.7 : (t * 1.7) % (Math.PI * 2)
  const sx = x + Math.cos(shineAng) * r * 0.32
  const sy = y + Math.sin(shineAng) * r * 0.32
  const shine = ctx.createRadialGradient(sx, sy, 0, x, y, r)
  shine.addColorStop(0, 'rgba(255, 255, 255, 0.88)')
  shine.addColorStop(0.28, 'rgba(180, 230, 255, 0.32)')
  shine.addColorStop(0.62, 'rgba(255, 255, 255, 0.06)')
  shine.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = shine
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)'
  ctx.lineWidth = 1.15 / k
  ctx.stroke()

  ctx.restore()
}

function readThemeColor(el: Element | null, name: string, fallback: string) {
  if (!el) return fallback
  const v = getComputedStyle(el).getPropertyValue(name).trim()
  return v || fallback
}

const avatarImgCache = new Map<string, HTMLImageElement | 'err'>()

function avatarImage(url: string | undefined, onReady: () => void): HTMLImageElement | null {
  if (!url) return null
  const cached = avatarImgCache.get(url)
  if (cached === 'err') return null
  if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null
  const img = new Image()
  img.onload = () => onReady()
  img.onerror = () => {
    avatarImgCache.set(url, 'err')
  }
  img.src = url
  avatarImgCache.set(url, img)
  return null
}

function drawCirclePhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  img: HTMLImageElement,
  k: number,
  stroke: string,
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.clip()
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const scale = Math.max((r * 2) / iw, (r * 2) / ih)
  const dw = iw * scale
  const dh = ih * scale
  ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh)
  ctx.restore()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.15 / k
  ctx.stroke()
}

function distPointSeg(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-6) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function visibilityReach(mode: VisibilityMode, camK: number) {
  if (mode === 'all') return ALL_REACH
  if (mode === 'near') return NEAR_REACH / camK
  return BASE_REACH / camK
}

function placedPos(
  n: WorldInhabitant,
  world: GraphWorld | null,
  gravity: GravityMode,
  friends: Set<string>,
): { x: number; y: number } {
  if (!world || n.isSelf || gravity === 'none') return { x: n.x, y: n.y }
  const pull =
    gravity === 'event' ? world.participantIds.includes(n.id) : friends.has(n.id)
  if (!pull) return { x: n.x, y: n.y }
  const k = gravity === 'event' ? 0.42 : 0.3
  return { x: n.x * k, y: n.y * k }
}

export function NetworkGraph({
  selfName,
  selfAvatarUrl = '',
  onOpenSelfProfile,
  initialWorldId = null,
}: {
  selfName: string
  selfAvatarUrl?: string
  onOpenSelfProfile?: () => void
  initialWorldId?: string | null
}) {
  const worlds = listEnterableWorlds()
  const [worldId, setWorldId] = useState<string | null>(initialWorldId)
  const [linksOn, setLinksOn] = useState(true)
  const [gravity, setGravity] = useState<GravityMode>('none')
  const [visibility, setVisibility] = useState<VisibilityMode>('reach')
  const [panel, setPanel] = useState<WorldInhabitant | null>(null)
  const [lockedHint, setLockedHint] = useState<string | null>(null)
  const [reachUi, setReachUi] = useState(BASE_REACH)

  const world = worlds.find((w) => w.id === worldId) ?? null
  const people = useMemo(
    () => (world ? inhabitantsForWorld(world, selfName, selfId(), selfAvatarUrl) : []),
    [world, selfName, selfAvatarUrl],
  )

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const peopleRef = useRef<WorldInhabitant[]>([])
  const worldRef = useRef<GraphWorld | null>(null)
  const linksOnRef = useRef(true)
  const gravityRef = useRef<GravityMode>('none')
  const visibilityRef = useRef<VisibilityMode>('reach')
  const friendsRef = useRef<Set<string>>(new Set())
  const avatarRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const camRef = useRef({ x: 0, y: 0, k: 1 })
  const keysRef = useRef(new Set<string>())
  const pointerRef = useRef({
    down: false,
    thrusting: false,
    sx: 0,
    sy: 0,
    wx: 0,
    wy: 0,
    moved: false,
  })
  const hoverRef = useRef<WorldInhabitant | null>(null)
  const panelRef = useRef<WorldInhabitant | null>(null)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)

  peopleRef.current = people
  worldRef.current = world
  linksOnRef.current = linksOn
  gravityRef.current = gravity
  visibilityRef.current = visibility
  panelRef.current = panel

  const screenToWorld = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const { x: cx, y: cy, k } = camRef.current
    return {
      x: (clientX - rect.left - rect.width / 2) / k + cx,
      y: (clientY - rect.top - rect.height / 2) / k + cy,
    }
  }

  const reachNow = () => visibilityReach(visibilityRef.current, camRef.current.k)

  const nodeState = (n: WorldInhabitant) => {
    const you = avatarRef.current
    const placed = placedPos(n, worldRef.current, gravityRef.current, friendsRef.current)
    const nx = n.isSelf ? you.x : placed.x
    const ny = n.isSelf ? you.y : placed.y
    const dist = Math.hypot(nx - you.x, ny - you.y)
    const inReach = n.isSelf || dist <= reachNow()
    const full = n.allowed && inReach
    return { nx, ny, dist, inReach, full }
  }

  const findNode = (wx: number, wy: number, pad = 10) => {
    let hit: WorldInhabitant | null = null
    let best = Infinity
    for (const n of peopleRef.current) {
      const s = nodeState(n)
      const d = Math.hypot(s.nx - wx, s.ny - wy)
      const r = (n.isSelf ? HERO_R : NODE_R) + pad
      if (d <= r && d < best) {
        best = d
        hit = n
      }
    }
    return hit
  }

  const draw = () => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const fg = readThemeColor(wrap, '--fg', '#111')
    const fgDim = readThemeColor(wrap, '--fg-dim', '#666')
    const border = readThemeColor(wrap, '--border', '#999')
    const { x: cx, y: cy, k } = camRef.current
    const you = avatarRef.current
    const worldNow = worldRef.current
    const reach = reachNow()

    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(k, k)
    ctx.translate(-cx, -cy)

    ctx.beginPath()
    ctx.arc(you.x, you.y, reach > 2000 ? 0 : reach, 0, Math.PI * 2)
    ctx.strokeStyle = border
    ctx.globalAlpha = 0.28
    ctx.lineWidth = 1 / k
    ctx.setLineDash([4 / k, 6 / k])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    const states = new Map<string, ReturnType<typeof nodeState>>()
    for (const n of peopleRef.current) states.set(n.id, nodeState(n))

    if (linksOnRef.current && worldNow) {
      const list = peopleRef.current
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]
          const b = list[j]
          if (!shareEvent(worldNow, a, b)) continue
          const sa = states.get(a.id)
          const sb = states.get(b.id)
          if (!sa || !sb) continue
          if (!sa.full || !sb.full) continue
          const gap = Math.hypot(sa.nx - sb.nx, sa.ny - sb.ny)
          if (gap > LINK_DIST) continue
          const near = distPointSeg(you.x, you.y, sa.nx, sa.ny, sb.nx, sb.ny)
          const lit = near < LIGHT_DIST
          ctx.beginPath()
          ctx.moveTo(sa.nx, sa.ny)
          ctx.lineTo(sb.nx, sb.ny)
          ctx.strokeStyle = fg
          ctx.globalAlpha = lit ? 0.72 : 0.16
          ctx.lineWidth = (lit ? 1.6 : 1) / k
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
    }

    const hover = hoverRef.current
    for (const n of peopleRef.current) {
      const s = states.get(n.id)
      if (!s) continue
      const hot = hover?.id === n.id || n.isSelf
      if (n.isSelf) {
        drawHeroNode(ctx, s.nx, s.ny, k, performance.now() / 1000)
        continue
      }
      ctx.beginPath()
      ctx.arc(s.nx, s.ny, NODE_R, 0, Math.PI * 2)
      if (s.full) {
        const pic = avatarImage(n.imageUrl, draw)
        ctx.globalAlpha = hot ? 1 : 0.92
        if (pic) {
          drawCirclePhoto(ctx, s.nx, s.ny, NODE_R, pic, k, fg)
        } else {
          ctx.fillStyle = fg
          ctx.fill()
        }
      } else {
        ctx.strokeStyle = fgDim
        ctx.globalAlpha = 0.28
        ctx.lineWidth = 1.15 / k
        ctx.stroke()
      }
      if (s.full && (hot || s.dist < 70)) {
        ctx.globalAlpha = 0.85
        ctx.fillStyle = fg
        ctx.font = `${12 / k}px ui-monospace, monospace`
        ctx.fillText(initials(n.displayName), s.nx + 9, s.ny - 8)
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  useEffect(() => {
    if (!world) return
    avatarRef.current = { x: 0, y: 0, vx: 0, vy: 0 }
    camRef.current = { x: 0, y: 0, k: 1 }
    const me = selfId()
    friendsRef.current = new Set(
      people.filter((p) => !p.isSelf && areFriendsBetween(me, p.id)).map((p) => p.id),
    )
    setPanel(null)
    setLockedHint(null)
    setReachUi(visibilityReach(visibilityRef.current, 1))
    lastTsRef.current = 0

    const tick = (ts: number) => {
      const prev = lastTsRef.current || ts
      const dt = Math.min(0.04, (ts - prev) / 1000)
      lastTsRef.current = ts
      const you = avatarRef.current
      const keys = keysRef.current
      let ax = 0
      let ay = 0
      if (keys.has('KeyW') || keys.has('ArrowUp')) ay -= 1
      if (keys.has('KeyS') || keys.has('ArrowDown')) ay += 1
      if (keys.has('KeyA') || keys.has('ArrowLeft')) ax -= 1
      if (keys.has('KeyD') || keys.has('ArrowRight')) ax += 1
      if (ax || ay) {
        const m = Math.hypot(ax, ay) || 1
        you.vx += (ax / m) * WALK_ACCEL * dt
        you.vy += (ay / m) * WALK_ACCEL * dt
      }
      const ptr = pointerRef.current
      if (ptr.thrusting) {
        const dx = ptr.wx - you.x
        const dy = ptr.wy - you.y
        const m = Math.hypot(dx, dy)
        if (m > 4) {
          you.vx += (dx / m) * THRUST_ACCEL * dt
          you.vy += (dy / m) * THRUST_ACCEL * dt
        }
      }
      you.vx *= DAMP
      you.vy *= DAMP
      const sp = Math.hypot(you.vx, you.vy)
      if (sp > MAX_SPEED) {
        you.vx *= MAX_SPEED / sp
        you.vy *= MAX_SPEED / sp
      }
      you.x += you.vx * dt
      you.y += you.vy * dt

      const cam = camRef.current
      cam.x += (you.x - cam.x) * CAM_FOLLOW
      cam.y += (you.y - cam.y) * CAM_FOLLOW

      const r = reachNow()
      setReachUi((prevR) => (Math.abs(prevR - r) > 1.5 ? r : prevR))
      draw()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.code === 'Escape') {
        e.preventDefault()
        if (panelRef.current) setPanel(null)
        else setWorldId(null)
        return
      }
      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'KeyW' ||
        e.code === 'KeyA' ||
        e.code === 'KeyS' ||
        e.code === 'KeyD'
      ) {
        e.preventDefault()
        keysRef.current.add(e.code)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvasRef.current?.focus()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      keysRef.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId])

  useEffect(() => {
    for (const n of people) {
      if (n.imageUrl) avatarImage(n.imageUrl, draw)
    }
    draw()
  }, [people, linksOn, panel, gravity, visibility])

  const onPointerDown = (e: React.PointerEvent) => {
    canvasRef.current?.setPointerCapture(e.pointerId)
    const worldPt = screenToWorld(e.clientX, e.clientY)
    const hit = findNode(worldPt.x, worldPt.y)
    pointerRef.current = {
      down: true,
      thrusting: !hit,
      sx: e.clientX,
      sy: e.clientY,
      wx: worldPt.x,
      wy: worldPt.y,
      moved: false,
    }
    if (hit) {
      hoverRef.current = hit
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const worldPt = screenToWorld(e.clientX, e.clientY)
    const ptr = pointerRef.current
    ptr.wx = worldPt.x
    ptr.wy = worldPt.y
    if (ptr.down) {
      if (Math.hypot(e.clientX - ptr.sx, e.clientY - ptr.sy) > 6) ptr.moved = true
    }
    const hit = findNode(worldPt.x, worldPt.y)
    if (hit !== hoverRef.current) {
      hoverRef.current = hit
      draw()
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const ptr = pointerRef.current
    const worldPt = screenToWorld(e.clientX, e.clientY)
    const hit = findNode(worldPt.x, worldPt.y)
    ptr.down = false
    ptr.thrusting = false
    if (!ptr.moved && hit) {
      const s = nodeState(hit)
      if (hit.isSelf) {
        setLockedHint(null)
        setPanel(hit)
      } else if (!s.full) {
        setPanel(null)
        setLockedHint(
          !hit.allowed
            ? 'DIM / LOCKED — personal Chronicle privacy. No edges out.'
            : 'DIM / LOCKED — out of reach. Walk closer or wheel reach.',
        )
      } else {
        setLockedHint(null)
        setPanel(hit)
      }
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const cam = camRef.current
    const factor = e.deltaY < 0 ? 1.08 : 0.92
    cam.k = Math.min(MAX_K, Math.max(MIN_K, cam.k * factor))
    draw()
  }

  const open = worlds.filter((w) => w.kind === 'open')
  const priv = worlds.filter((w) => w.kind === 'private')

  const worldCard = (w: GraphWorld) => (
    <button key={w.id} type="button" className="world-card" onClick={() => setWorldId(w.id)}>
      <span className="world-card-kind">
        {kindLabel(w.kind)}
        {w.kind === 'private' ? ` · ${surfDialLabel(w.surfDial)}` : ''}
      </span>
      <span className="world-card-title">{w.title}</span>
      <span className="world-card-meta">
        {w.description || (w.kind === 'open' ? 'Surf without attending' : 'Private twin')}
      </span>
    </button>
  )

  if (!world) {
    return (
      <div className="net-root world-root">
        <p className="dim hz-lead">
          First pick a World to drop into. Gravity, Visibility, and Links appear after you enter.
          Privacy = reach. Not a global helicopter map.
        </p>
        <h3 className="profile-section-title">Open / community</h3>
        <div className="world-card-grid">{open.map(worldCard)}</div>
        <h3 className="profile-section-title">Private — you can enter</h3>
        <p className="dim hz-lead">
          Dial stub: Participants / Friends of participants (default) / Anyone. Dual privacy: event
          surf ≠ Chronicle “I attended.”
        </p>
        {priv.length ? (
          <div className="world-card-grid">{priv.map(worldCard)}</div>
        ) : (
          <p className="dim">None</p>
        )}
      </div>
    )
  }

  const reachShown = visibility === 'all' ? 'ALL' : String(Math.round(reachUi))

  return (
    <div className="net-root world-root">
      <div className="net-toolbar">
        <div className="net-toggles" role="group" aria-label="World">
          <button type="button" className="net-toggle" onClick={() => setWorldId(null)}>
            [ WORLDS ]
          </button>
          <span className="net-world-name">{world.title}</span>
        </div>
        <div className="net-toggles" role="group" aria-label="In-world layers">
          <button
            type="button"
            className="net-toggle on"
            onClick={() => setGravity((g) => cycleMode(GRAVITY_MODES, g))}
          >
            [ GRAVITY: {GRAVITY_LABEL[gravity]} ]
          </button>
          <button
            type="button"
            className="net-toggle on"
            onClick={() => setVisibility((v) => cycleMode(VISIBILITY_MODES, v))}
          >
            [ VISIBILITY: {VISIBILITY_LABEL[visibility]} ]
          </button>
          <button
            type="button"
            className={`net-toggle ${linksOn ? 'on' : ''}`}
            onClick={() => setLinksOn((v) => !v)}
          >
            [{linksOn ? '■' : '□'} LINKS ]
          </button>
        </div>
      </div>
      <div className="net-stage world-stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="net-canvas world-canvas"
          tabIndex={0}
          aria-label="World walk"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointerRef.current.down = false
            pointerRef.current.thrusting = false
          }}
          onWheel={onWheel}
        />
        {panel && (
          <aside className="world-panel" aria-label="Person">
            <div className="world-panel-head">
              <CardThumb src={panel.imageUrl} label={panel.displayName} shape="circle" />
              <div>
                <div className="net-tip-name">{panel.displayName}</div>
                <div className="net-tip-meta">
                  {panel.isSelf ? 'YOU · avatar' : panel.bio || 'Node in this World'}
                </div>
              </div>
            </div>
            {!panel.isSelf &&
              panel.skills.length > 0 &&
              panel.skills.join(' · ') !== panel.bio && (
                <div className="net-tip-meta">{panel.skills.slice(0, 3).join(' · ')}</div>
              )}
            <div className="world-panel-actions">
              {panel.isSelf && onOpenSelfProfile && (
                <button type="button" className="net-toggle on" onClick={onOpenSelfProfile}>
                  [ MY NODE ]
                </button>
              )}
              <button type="button" className="net-toggle" onClick={() => setPanel(null)}>
                [ CLOSE ]
              </button>
            </div>
          </aside>
        )}
        {lockedHint && !panel && <div className="world-locked-hint">{lockedHint}</div>}
      </div>
      <div className="net-legend dim">
        WASD / ARROWS WALK · HOLD EMPTY GROUND TO THRUST · WHEEL ZOOM/REACH {reachShown} · ESC
        WORLDS
      </div>
    </div>
  )
}
