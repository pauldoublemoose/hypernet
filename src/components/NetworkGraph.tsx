import { useEffect, useMemo, useRef, useState } from 'react'
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

const WALK_ACCEL = 520
const THRUST_ACCEL = 680
const DAMP = 0.86
const MAX_SPEED = 220
const CAM_FOLLOW = 0.1
const MIN_K = 0.48
const MAX_K = 2.35
const BASE_REACH = 168
const LINK_DIST = 210
const LIGHT_DIST = 54

/** Same stops as `.poly-edge` / polychrome titles — hero is always polychrome. */
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

function heroDiamondPath(ctx: CanvasRenderingContext2D, x: number, y: number, hy: number, hx: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - hy)
  ctx.lineTo(x + hx, y)
  ctx.lineTo(x, y + hy)
  ctx.lineTo(x - hx, y)
  ctx.closePath()
}

function drawHeroNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  k: number,
  t: number,
) {
  const reduce = prefersReduceMotion()
  const pulse = reduce ? 1 : 1 + 0.06 * Math.sin(t * 3.2)
  const hy = 16 * pulse
  const hx = 13 * pulse
  const facet = ['#ff0040', '#ffdd00', '#00ff80', '#00cfff'] as const
  const rot = reduce ? 0 : Math.floor(t * 2.4) % facet.length

  ctx.save()
  ctx.globalAlpha = 1

  const glowR = 28 * pulse
  const glow = ctx.createRadialGradient(x, y, 3, x, y, glowR)
  glow.addColorStop(0, 'rgba(255, 0, 180, 0.35)')
  glow.addColorStop(0.45, 'rgba(0, 255, 213, 0.18)')
  glow.addColorStop(1, 'rgba(123, 0, 255, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, glowR, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x, y, 20 * pulse, 0, Math.PI * 2)
  ctx.strokeStyle = heroConic(ctx, x, y, t)
  ctx.lineWidth = 2.6 / k
  ctx.stroke()

  const tris: [number, number][][] = [
    [
      [x, y],
      [x, y - hy],
      [x + hx, y],
    ],
    [
      [x, y],
      [x + hx, y],
      [x, y + hy],
    ],
    [
      [x, y],
      [x, y + hy],
      [x - hx, y],
    ],
    [
      [x, y],
      [x - hx, y],
      [x, y - hy],
    ],
  ]
  for (let i = 0; i < 4; i++) {
    const pts = tris[i]
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    ctx.lineTo(pts[1][0], pts[1][1])
    ctx.lineTo(pts[2][0], pts[2][1])
    ctx.closePath()
    ctx.fillStyle = facet[(i + rot) % facet.length]
    ctx.fill()
  }

  heroDiamondPath(ctx, x, y, hy, hx)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.lineWidth = 1.15 / k
  ctx.stroke()

  ctx.save()
  heroDiamondPath(ctx, x, y, hy, hx)
  ctx.clip()
  const hatch = reduce ? 0 : (t * 16) % 3
  ctx.globalAlpha = 0.16
  ctx.fillStyle = '#ffffff'
  for (let i = -hy; i <= hy; i += 2) {
    ctx.fillRect(x - hx, y + i + hatch - hy, hx * 2, 1 / k)
  }
  ctx.restore()

  const labelH = 15 / k
  const labelGrad = ctx.createLinearGradient(x + 16, y - 18, x + 52, y - 18)
  fillPolyStops(labelGrad)
  ctx.font = `700 ${labelH}px ui-monospace, monospace`
  ctx.fillStyle = labelGrad
  ctx.globalAlpha = 1
  ctx.fillText('YOU', x + 16, y - 12)
  ctx.restore()
}

function readThemeColor(el: Element | null, name: string, fallback: string) {
  if (!el) return fallback
  const v = getComputedStyle(el).getPropertyValue(name).trim()
  return v || fallback
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

export function NetworkGraph({
  selfName,
  onOpenSelfProfile,
  initialWorldId = null,
}: {
  selfName: string
  onOpenSelfProfile?: () => void
  initialWorldId?: string | null
}) {
  const worlds = listEnterableWorlds()
  const [worldId, setWorldId] = useState<string | null>(initialWorldId)
  const [linksOn, setLinksOn] = useState(true)
  const [panel, setPanel] = useState<WorldInhabitant | null>(null)
  const [lockedHint, setLockedHint] = useState<string | null>(null)
  const [reachUi, setReachUi] = useState(BASE_REACH)

  const world = worlds.find((w) => w.id === worldId) ?? null
  const people = useMemo(
    () => (world ? inhabitantsForWorld(world, selfName) : []),
    [world, selfName],
  )

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const peopleRef = useRef<WorldInhabitant[]>([])
  const worldRef = useRef<GraphWorld | null>(null)
  const linksOnRef = useRef(true)
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
  panelRef.current = panel

  const screenToWorld = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const { x: cx, y: cy, k } = camRef.current
    return {
      x: (clientX - rect.left - rect.width / 2) / k + cx,
      y: (clientY - rect.top - rect.height / 2) / k + cy,
    }
  }

  const reachNow = () => BASE_REACH / camRef.current.k

  const findNode = (wx: number, wy: number, pad = 10) => {
    const you = avatarRef.current
    let hit: WorldInhabitant | null = null
    let best = Infinity
    for (const n of peopleRef.current) {
      const nx = n.isSelf ? you.x : n.x
      const ny = n.isSelf ? you.y : n.y
      const d = Math.hypot(nx - wx, ny - wy)
      const r = (n.isSelf ? 18 : 7) + pad
      if (d <= r && d < best) {
        best = d
        hit = n
      }
    }
    return hit
  }

  const nodeState = (n: WorldInhabitant) => {
    const you = avatarRef.current
    const nx = n.isSelf ? you.x : n.x
    const ny = n.isSelf ? you.y : n.y
    const dist = Math.hypot(nx - you.x, ny - you.y)
    const inReach = n.isSelf || dist <= reachNow()
    const full = n.allowed && inReach
    return { nx, ny, dist, inReach, full }
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
    ctx.arc(you.x, you.y, reach, 0, Math.PI * 2)
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
      ctx.arc(s.nx, s.ny, 6.5, 0, Math.PI * 2)
      if (s.full) {
        ctx.fillStyle = fg
        ctx.globalAlpha = hot ? 1 : 0.92
        ctx.fill()
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
    setPanel(null)
    setLockedHint(null)
    setReachUi(BASE_REACH)
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

      const r = BASE_REACH / cam.k
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
    draw()
  }, [people, linksOn, panel])

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

  const worldRow = (w: GraphWorld) => (
    <button key={w.id} type="button" className="hz-list-item" onClick={() => setWorldId(w.id)}>
      <span className="hz-list-copy">
        <span className="hz-list-title">{w.title}</span>
        <span className="dim">
          {kindLabel(w.kind)}
          {w.kind === 'private' ? ` · ${surfDialLabel(w.surfDial)}` : ' · surf without attending'}
        </span>
      </span>
    </button>
  )

  if (!world) {
    return (
      <div className="net-root world-root">
        <p className="dim hz-lead">
          A World is a place you drop into — often an event twin. Privacy = reach. Not a global
          helicopter map.
        </p>
        <h3 className="profile-section-title">Open / community</h3>
        <ul className="hz-list">{open.map(worldRow)}</ul>
        <h3 className="profile-section-title">Private — you can enter</h3>
        <p className="dim hz-lead">
          Dial stub: Participants / Friends of participants (default) / Anyone. Dual privacy: event
          surf ≠ Chronicle “I attended.”
        </p>
        <ul className="hz-list">{priv.length ? priv.map(worldRow) : <li className="dim">None</li>}</ul>
      </div>
    )
  }

  return (
    <div className="net-root world-root">
      <div className="net-toolbar">
        <div className="net-toggles" role="group" aria-label="World">
          <button type="button" className="net-toggle" onClick={() => setWorldId(null)}>
            [ WORLDS ]
          </button>
          <span className="net-world-name">{world.title}</span>
        </div>
        <div className="net-toggles" role="group" aria-label="Link layer">
          <button
            type="button"
            className={`net-toggle ${linksOn ? 'on' : ''}`}
            onClick={() => setLinksOn((v) => !v)}
          >
            [{linksOn ? '■' : '□'} SHARED EVENT]
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
            <div className="net-tip-name">{panel.displayName}</div>
            <div className="net-tip-meta">
              {panel.isSelf ? 'YOU · avatar' : panel.bio || 'Node in this World'}
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
        WASD / ARROWS WALK · HOLD EMPTY GROUND TO THRUST · WHEEL ZOOM/REACH {Math.round(reachUi)} ·
        ESC WORLDS
      </div>
    </div>
  )
}
