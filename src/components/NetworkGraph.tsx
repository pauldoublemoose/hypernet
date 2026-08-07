import {
  forceCenter,
  forceCollide,
  forceLink,
  forceSimulation,
  type Simulation,
  type SimulationNodeDatum,
} from 'd3-force'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EDGE_LAYERS,
  EVENT_FILTERS,
  formatLocations,
  nameInitials,
  type EdgeType,
  type EventFilterId,
  type GraphData,
  type GraphNode,
  type NodeRole,
} from '../lib/network/types'

interface SimNode extends SimulationNodeDatum {
  id: string
  name: string
  role: NodeRole
  countries: string[]
  cities: string[]
  skills: string[]
  cocreated: string[]
  visited: string[]
  appear: number
}

interface SimLink {
  source: string | SimNode
  target: string | SimNode
  type: EdgeType
  weight: number
  events?: string[]
}

const BASE_MAX_SPEED = 2.2
const POP_MAX_SPEED = 6
const INTRO_MS = 2200
const JOIN_MS = 1600
/** At T=0: one pop somewhere in the graph every ~3s */
const BASE_POP_INTERVAL_S = 3
/** Seconds of hold to reach max heat */
const HEAT_UP_S = 15
/** Soft inverse-square repulsion coefficient at T=0 */
const REPEL_BASE = 420

function roleRadius(role: NodeRole): number {
  switch (role) {
    case 'subscriber':
      return 3.5
    case 'prospect':
      return 5
    case 'cocreator':
      return 4
    case 'member':
      return 5.5
  }
}

function roleFilled(role: NodeRole): boolean {
  return role === 'cocreator' || role === 'member'
}

function readThemeColor(el: Element | null, name: string, fallback: string) {
  if (!el) return fallback
  const v = getComputedStyle(el).getPropertyValue(name).trim()
  return v || fallback
}

function clampVelocities(
  nodes: SimNode[],
  maxSpeed: number,
  popUntil: Map<string, number>,
  now: number,
) {
  for (const n of nodes) {
    const boosted = (popUntil.get(n.id) ?? 0) > now
    const cap = boosted ? POP_MAX_SPEED : maxSpeed
    const vx = n.vx ?? 0
    const vy = n.vy ?? 0
    const sp = Math.hypot(vx, vy)
    if (sp > cap) {
      const s = cap / sp
      n.vx = vx * s
      n.vy = vy * s
    }
  }
}

/** Coulomb-style repulsion: F ∝ 1/r² along the separation vector. */
function forceRepelInverseSquare(getStrength: () => number) {
  let nodes: SimNode[] = []
  const force = (alpha: number) => {
    const k = getStrength() * alpha
    const n = nodes.length
    for (let i = 0; i < n; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j]
        let dx = (a.x ?? 0) - (b.x ?? 0)
        let dy = (a.y ?? 0) - (b.y ?? 0)
        let d2 = dx * dx + dy * dy
        if (d2 < 1e-4) {
          dx = Math.random() - 0.5
          dy = Math.random() - 0.5
          d2 = dx * dx + dy * dy
        }
        const d = Math.sqrt(d2)
        const f = k / Math.max(d2, 16)
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        a.vx = (a.vx ?? 0) + fx
        a.vy = (a.vy ?? 0) + fy
        b.vx = (b.vx ?? 0) - fx
        b.vy = (b.vy ?? 0) - fy
      }
    }
  }
  force.initialize = (init: SimNode[]) => {
    nodes = init
  }
  return force
}

export function NetworkGraph({
  data,
  newNodeId = 'you',
  /** Skip join intro (used when peeking from the form). */
  preview = false,
}: {
  data: GraphData
  newNodeId?: string
  preview?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null)
  const allNodesRef = useRef<SimNode[]>([])
  const nodesRef = useRef<SimNode[]>([])
  const linksRef = useRef<SimLink[]>([])
  const transformRef = useRef({ x: 0, y: 0, k: 1 })
  const dragRef = useRef<{ id: string; pointerId: number } | null>(null)
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const pinchRef = useRef<{ dist: number; k: number } | null>(null)
  const hoverRef = useRef<SimNode | null>(null)
  const layersRef = useRef<Record<EdgeType, boolean>>({
    cocreated: false,
    visited: false,
    country: false,
    city: false,
  })
  const eventsRef = useRef<Record<EventFilterId, boolean>>({
    '2023': true,
    '2024': true,
    '2025': true,
    '2026': true,
  })
  const rafRef = useRef(0)
  const pulseRef = useRef(0)
  const introRef = useRef<'solo' | 'joining' | 'full'>('solo')
  const tempRef = useRef(0)
  const vibRef = useRef(0)
  const heatingRef = useRef(false)
  const lastTickRef = useRef(performance.now())
  const popFlashRef = useRef<{ id: string; t: number } | null>(null)
  const popUntilRef = useRef(new Map<string, number>())
  const physicsDirtyRef = useRef(true)
  /** 0→1 after a layer toggle so new springs ease in instead of snapping. */
  const linkRampRef = useRef(1)
  const linkRampTargetRef = useRef(1)

  const [layers, setLayers] = useState<Record<EdgeType, boolean>>({
    cocreated: false,
    visited: false,
    country: false,
    city: false,
  })
  const [events, setEvents] = useState<Record<EventFilterId, boolean>>({
    '2023': true,
    '2024': true,
    '2025': true,
    '2026': true,
  })
  const [tempUi, setTempUi] = useState(0)
  const [heatingUi, setHeatingUi] = useState(false)
  const [introPhase, setIntroPhase] = useState<'solo' | 'joining' | 'full'>('solo')
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    node: GraphNode
  } | null>(null)

  const layerMeta = useMemo(() => {
    const m = {} as Record<EdgeType, (typeof EDGE_LAYERS)[number]>
    for (const l of EDGE_LAYERS) m[l.id] = l
    return m
  }, [])

  layersRef.current = layers
  eventsRef.current = events
  introRef.current = introPhase

  const eventWeight = (l: SimLink) => {
    if (l.type !== 'cocreated' && l.type !== 'visited') return l.weight
    if (!l.events?.length) return 0
    let n = 0
    for (const e of l.events) {
      if (eventsRef.current[e as EventFilterId]) n++
    }
    return n
  }

  const activeLinks = () => {
    if (introRef.current === 'solo') return []
    return linksRef.current.filter((l) => {
      if (!layersRef.current[l.type]) return false
      if ((l.type === 'cocreated' || l.type === 'visited') && eventWeight(l) <= 0) return false
      if (introRef.current === 'joining') {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        return s === newNodeId || t === newNodeId
      }
      return true
    })
  }

  const applyForces = (sim: Simulation<SimNode, SimLink>) => {
    const T = tempRef.current
    // Heat is ~10× more impactful; at high T repulsion dominates springs.
    const H = T * 10
    const links = activeLinks()
    // Soft springs + heat livens them; ramp prevents toggle-snaps.
    const elasticity = (1.15 + H * 0.55) * linkRampRef.current

    sim.force(
      'charge',
      forceRepelInverseSquare(() => REPEL_BASE * (1 + tempRef.current * 10 * 8)),
    )
    sim.force(
      'link',
      forceLink<SimNode, SimLink>(links)
        .id((d) => d.id)
        .distance((d) => {
          const w = Math.max(1, eventWeight(d) || d.weight)
          return (layerMeta[d.type].distance / Math.sqrt(w)) * (1 - T * 0.1)
        })
        .strength((d) => {
          const w = Math.max(1, eventWeight(d) || d.weight)
          // Keep well below 1 so pull is gradual / oscillatory
          return Math.min(0.28, layerMeta[d.type].strength * Math.sqrt(w) * elasticity)
        }),
    )
    sim.force('center', forceCenter(0, 0).strength(0.04 * (1 - T * 0.92)))
    physicsDirtyRef.current = false
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
    const fgDim = readThemeColor(wrap, '--fg-dim', fg)
    const { x: tx, y: ty, k } = transformRef.current
    ctx.save()
    ctx.translate(tx, ty)
    ctx.scale(k, k)

    const byId = new Map(nodesRef.current.map((n) => [n.id, n]))
    const you = byId.get(newNodeId)
    const now = performance.now()

    if (you && you.x != null && you.y != null && introRef.current !== 'full') {
      for (let i = 0; i < 3; i++) {
        const phase = (now / 900 + i * 0.33) % 1
        ctx.beginPath()
        ctx.arc(you.x, you.y, 8 + phase * 48, 0, Math.PI * 2)
        ctx.strokeStyle = fg
        ctx.globalAlpha = (1 - phase) * 0.45
        ctx.lineWidth = 1.25 / k
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    } else if (you && you.x != null && you.y != null && pulseRef.current > 0) {
      const age = 1 - pulseRef.current
      for (let i = 0; i < 2; i++) {
        const phase = (age + i * 0.4) % 1
        ctx.beginPath()
        ctx.arc(you.x, you.y, 10 + phase * 36, 0, Math.PI * 2)
        ctx.strokeStyle = fg
        ctx.globalAlpha = (1 - phase) * 0.25 * pulseRef.current
        ctx.lineWidth = 1 / k
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    // pop flash ring
    const flash = popFlashRef.current
    if (flash) {
      const node = byId.get(flash.id)
      const age = (now - flash.t) / 420
      if (node && node.x != null && node.y != null && age < 1) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 6 + age * 28, 0, Math.PI * 2)
        ctx.strokeStyle = fg
        ctx.globalAlpha = (1 - age) * 0.7
        ctx.lineWidth = 1.6 / k
        ctx.stroke()
      } else {
        popFlashRef.current = null
      }
    }

    for (const link of activeLinks()) {
      const s = typeof link.source === 'object' ? link.source : byId.get(link.source)
      const tNode = typeof link.target === 'object' ? link.target : byId.get(link.target)
      if (!s || !tNode || s.x == null || tNode.x == null || s.y == null || tNode.y == null) continue
      const appear = Math.min(s.appear, tNode.appear)
      if (appear <= 0.02) continue
      const wgt = eventWeight(link) || link.weight
      const meta = layerMeta[link.type]
      // Visited: quiet lines; weight barely changes opacity.
      const weightFade =
        link.type === 'visited'
          ? 0.9 + Math.min(0.1, wgt * 0.02)
          : Math.min(1, 0.55 + wgt * 0.15)
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(tNode.x, tNode.y)
      ctx.strokeStyle = fg
      ctx.globalAlpha = meta.opacity * appear * weightFade
      ctx.lineWidth = 1 / k
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    const hover = hoverRef.current
    for (const n of nodesRef.current) {
      if (n.x == null || n.y == null || n.appear <= 0.02) continue
      const r = roleRadius(n.role) * (n.id === newNodeId && introRef.current === 'solo' ? 1.35 : 1)
      const filled = roleFilled(n.role)
      const isHot =
        hover?.id === n.id || dragRef.current?.id === n.id || n.id === newNodeId || flash?.id === n.id
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      if (filled) {
        ctx.fillStyle = fg
        ctx.globalAlpha = (isHot ? 1 : 0.92) * n.appear
        ctx.fill()
      } else {
        ctx.strokeStyle = fg
        ctx.globalAlpha = (isHot ? 1 : 0.9) * n.appear
        ctx.lineWidth = (n.role === 'prospect' ? 1.5 : 1.15) / k
        ctx.stroke()
      }
      if (isHot) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, r + 3.5, 0, Math.PI * 2)
        ctx.strokeStyle = fgDim
        ctx.globalAlpha = 0.45 * n.appear
        ctx.lineWidth = 1 / k
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  const scheduleDraw = () => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      draw()
    })
  }

  useEffect(() => {
    const all: SimNode[] = data.nodes.map((n) => ({
      ...n,
      appear: preview || n.id === newNodeId ? 1 : 0,
      x: n.id === newNodeId ? 0 : (Math.random() - 0.5) * (preview ? 160 : 80),
      y: n.id === newNodeId ? 0 : (Math.random() - 0.5) * (preview ? 160 : 80),
    }))
    allNodesRef.current = all
    linksRef.current = data.edges.map((e) => ({ ...e }))

    if (preview) {
      nodesRef.current = all
      introRef.current = 'full'
      setIntroPhase('full')
      pulseRef.current = 0
    } else {
      const solo = all.filter((n) => n.id === newNodeId)
      nodesRef.current = solo.length ? solo : all.slice(0, 1)
      introRef.current = 'solo'
      setIntroPhase('solo')
      pulseRef.current = 1
    }

    const wrap = wrapRef.current
    transformRef.current = {
      x: (wrap?.clientWidth ?? 600) / 2,
      y: (wrap?.clientHeight ?? 400) / 2,
      k: preview ? 0.85 : 1,
    }
    tempRef.current = 0
    vibRef.current = 0
    lastTickRef.current = performance.now()

    const onTick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - lastTickRef.current) / 1000)
      lastTickRef.current = now

      // —— temperature: ~15s hold to max; cools slower ——
      if (heatingRef.current) {
        tempRef.current = Math.min(1, tempRef.current + dt / HEAT_UP_S)
      } else {
        tempRef.current = Math.max(0, tempRef.current - dt / 6)
      }
      const T = tempRef.current
      const H = T * 10 // heat impact multiplier

      // —— vibration: default 0; heat is very loud ——
      const vibTarget = Math.min(2.5, H * 1.8)
      if (vibRef.current < vibTarget) vibRef.current = vibTarget
      else vibRef.current = Math.max(0, vibRef.current - dt * 0.22)
      const vib = vibRef.current

      // Ease new springs in after a toggle (elastic pull, not a teleport)
      if (linkRampRef.current < linkRampTargetRef.current) {
        linkRampRef.current = Math.min(1, linkRampRef.current + dt * 0.85)
        physicsDirtyRef.current = true
      }

      if (
        physicsDirtyRef.current ||
        heatingRef.current ||
        T > 0.01 ||
        linkRampRef.current < 1
      ) {
        const sim = simRef.current
        if (sim) applyForces(sim)
      }

      // brownian vibration — heat dominates (~10×)
      if (vib > 0.001 && introRef.current !== 'solo') {
        const amp = (0.8 + H * 1.6) * vib
        for (const n of nodesRef.current) {
          if (n.fx != null) continue
          n.vx = (n.vx ?? 0) + (Math.random() - 0.5) * amp
          n.vy = (n.vy ?? 0) + (Math.random() - 0.5) * amp
        }
      }

      // random pops — fling a node hard in a random direction
      if (introRef.current === 'full' && nodesRef.current.length > 0) {
        const interval = BASE_POP_INTERVAL_S / (1 + H * 0.9)
        const pGraph = dt / interval
        if (Math.random() < pGraph) {
          const alive = nodesRef.current.filter((n) => n.appear > 0.5 && n.fx == null)
          if (alive.length) {
            const n = alive[(Math.random() * alive.length) | 0]
            const ang = Math.random() * Math.PI * 2
            const kick = 28 + H * 14 + Math.random() * (12 + H * 10)
            n.vx = Math.cos(ang) * kick
            n.vy = Math.sin(ang) * kick
            // brief positional shove so the pop is visible even under damping
            n.x = (n.x ?? 0) + Math.cos(ang) * (10 + H * 4)
            n.y = (n.y ?? 0) + Math.sin(ang) * (10 + H * 4)
            popUntilRef.current.set(n.id, now + 400)
            popFlashRef.current = { id: n.id, t: now }
            simRef.current?.alpha(Math.max(simRef.current.alpha(), 0.35)).restart()
          }
        }
      }

      clampVelocities(nodesRef.current, BASE_MAX_SPEED, popUntilRef.current, now)

      if (introRef.current === 'joining' || introRef.current === 'full') {
        for (const n of nodesRef.current) {
          if (n.id === newNodeId) n.appear = 1
          else n.appear = Math.min(1, n.appear + 0.04)
        }
        if (pulseRef.current > 0) pulseRef.current = Math.max(0, pulseRef.current - 0.012)
      }

      // throttle React temp readout
      setTempUi((prev) => (Math.abs(prev - T) > 0.02 ? T : prev))
      scheduleDraw()
    }

    const sim = forceSimulation<SimNode>(nodesRef.current)
      .force('collide', forceCollide<SimNode>().radius((d) => roleRadius(d.role) + 4).strength(0.45))
      .alphaDecay(0.008)
      .velocityDecay(0.08)
      .on('tick', onTick)

    applyForces(sim)
    simRef.current = sim
    scheduleDraw()

    let pulseRaf = 0
    const pulseLoop = () => {
      if (
        introRef.current === 'solo' ||
        pulseRef.current > 0 ||
        tempRef.current > 0.01 ||
        vibRef.current > 0.01 ||
        popFlashRef.current ||
        heatingRef.current
      ) {
        // keep sim / draw alive while warm even if alpha ~ 0
        if ((tempRef.current > 0.02 || vibRef.current > 0.02 || heatingRef.current) && simRef.current) {
          if ((simRef.current.alpha() ?? 0) < 0.08) simRef.current.alpha(0.12).restart()
        }
        scheduleDraw()
      }
      pulseRaf = requestAnimationFrame(pulseLoop)
    }
    pulseRaf = requestAnimationFrame(pulseLoop)

    let joinId = 0
    let fullId = 0
    if (!preview) {
      joinId = window.setTimeout(() => {
        introRef.current = 'joining'
        setIntroPhase('joining')
        nodesRef.current = allNodesRef.current
        const youN = nodesRef.current.find((x) => x.id === newNodeId)
        for (const n of nodesRef.current) {
          if (n.id !== newNodeId) {
            n.appear = 0
            const ang = Math.random() * Math.PI * 2
            const dist = 40 + Math.random() * 70
            n.x = (youN?.x ?? 0) + Math.cos(ang) * dist
            n.y = (youN?.y ?? 0) + Math.sin(ang) * dist
            n.vx = 0
            n.vy = 0
          }
        }
        sim.nodes(nodesRef.current)
        physicsDirtyRef.current = true
        applyForces(sim)
        sim.alpha(0.45).restart()
      }, INTRO_MS)

      fullId = window.setTimeout(() => {
        introRef.current = 'full'
        setIntroPhase('full')
        physicsDirtyRef.current = true
        applyForces(sim)
        sim.alpha(0.35).restart()
      }, INTRO_MS + JOIN_MS)
    }

    const onResize = () => scheduleDraw()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (joinId) window.clearTimeout(joinId)
      if (fullId) window.clearTimeout(fullId)
      cancelAnimationFrame(pulseRaf)
      sim.stop()
      simRef.current = null
      cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, newNodeId, preview])

  useEffect(() => {
    const sim = simRef.current
    if (!sim || introRef.current === 'solo') return
    // Soft restart: keep momentum, ease springs in, keep the pot simmering
    linkRampRef.current = 0.04
    linkRampTargetRef.current = 1
    physicsDirtyRef.current = true
    applyForces(sim)
    sim.velocityDecay(0.08)
    sim.alphaDecay(0.006)
    sim.alphaTarget(0.12).alpha(0.55).restart()
    const settle = window.setTimeout(() => {
      sim.alphaTarget(0)
      sim.alphaDecay(0.008)
    }, 2200)
    scheduleDraw()
    return () => window.clearTimeout(settle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, events])

  const screenToWorld = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const { x, y, k } = transformRef.current
    return {
      x: (clientX - rect.left - x) / k,
      y: (clientY - rect.top - y) / k,
    }
  }

  const findNode = (wx: number, wy: number) => {
    let hit: SimNode | null = null
    let best = Infinity
    for (const n of nodesRef.current) {
      if (n.x == null || n.y == null || n.appear < 0.3) continue
      const d = Math.hypot(n.x - wx, n.y - wy)
      const r = roleRadius(n.role) + 6
      if (d <= r && d < best) {
        best = d
        hit = n
      }
    }
    return hit
  }

  const showTip = (n: SimNode, clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect()
    setTooltip({
      x: clientX - rect.left,
      y: clientY - rect.top,
      node: {
        id: n.id,
        name: n.name,
        role: n.role,
        countries: n.countries,
        cities: n.cities,
        skills: n.skills,
        cocreated: n.cocreated,
        visited: n.visited,
      },
    })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    canvasRef.current!.setPointerCapture(e.pointerId)
    const world = screenToWorld(e.clientX, e.clientY)
    const hit = findNode(world.x, world.y)
    if (hit) {
      dragRef.current = { id: hit.id, pointerId: e.pointerId }
      hit.fx = hit.x
      hit.fy = hit.y
      simRef.current?.alphaTarget(0.2).restart()
      showTip(hit, e.clientX, e.clientY)
      return
    }
    setTooltip(null)
    panRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: transformRef.current.x,
      ty: transformRef.current.y,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag && drag.pointerId === e.pointerId) {
      const world = screenToWorld(e.clientX, e.clientY)
      const node = nodesRef.current.find((n) => n.id === drag.id)
      if (node) {
        node.fx = world.x
        node.fy = world.y
        showTip(node, e.clientX, e.clientY)
      }
      scheduleDraw()
      return
    }
    if (panRef.current) {
      const p = panRef.current
      transformRef.current.x = p.tx + (e.clientX - p.x)
      transformRef.current.y = p.ty + (e.clientY - p.y)
      scheduleDraw()
      return
    }
    if (window.matchMedia('(pointer: fine)').matches) {
      const world = screenToWorld(e.clientX, e.clientY)
      const hit = findNode(world.x, world.y)
      if (hit !== hoverRef.current) {
        hoverRef.current = hit
        scheduleDraw()
      }
      if (hit) showTip(hit, e.clientX, e.clientY)
      else setTooltip(null)
    }
  }

  const endDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag && drag.pointerId === e.pointerId) {
      const node = nodesRef.current.find((n) => n.id === drag.id)
      if (node) {
        node.fx = null
        node.fy = null
      }
      dragRef.current = null
      // leave energy in the system so springs keep bouncing
      const sim = simRef.current
      if (sim) {
        sim.velocityDecay(0.08)
        sim.alphaTarget(0.08).alpha(0.7).restart()
        window.setTimeout(() => sim.alphaTarget(0), 1800)
      }
    }
    panRef.current = null
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const t = transformRef.current
    const factor = e.deltaY < 0 ? 1.08 : 0.92
    const nextK = Math.min(4, Math.max(0.08, t.k * factor))
    const wx = (mx - t.x) / t.k
    const wy = (my - t.y) / t.k
    t.k = nextK
    t.x = mx - wx * nextK
    t.y = my - wy * nextK
    scheduleDraw()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { dist: Math.hypot(dx, dy), k: transformRef.current.k }
      panRef.current = null
      dragRef.current = null
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      transformRef.current.k = Math.min(
        4,
        Math.max(0.08, pinchRef.current.k * (dist / pinchRef.current.dist)),
      )
      scheduleDraw()
    }
  }

  const setHeat = (on: boolean) => {
    heatingRef.current = on
    setHeatingUi(on)
    if (on) simRef.current?.alpha(0.2).restart()
  }

  const locLine = tooltip ? formatLocations(tooltip.node.countries, tooltip.node.cities) : ''
  const tempDisplay = Math.round(tempUi * 1000)
  const tempBarPct = tempUi * 100

  return (
    <div className="net-root">
      <div className="net-toolbar">
        <div className="net-toggles" role="group" aria-label="Edge layers">
          {EDGE_LAYERS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`net-toggle ${layers[l.id] ? 'on' : ''}`}
              onClick={() => setLayers((prev) => ({ ...prev, [l.id]: !prev[l.id] }))}
              disabled={introPhase === 'solo'}
            >
              [{layers[l.id] ? '■' : '□'} {l.label}]
            </button>
          ))}
        </div>
      </div>

      <div className="net-toolbar">
        <div className="net-toggles" role="group" aria-label="Event filters">
          {EVENT_FILTERS.map((ev) => (
            <button
              key={ev.id}
              type="button"
              className={`net-toggle ${events[ev.id] ? 'on' : ''}`}
              onClick={() => setEvents((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}
              disabled={introPhase === 'solo'}
              title={`Toggle ${ev.label} event edges`}
            >
              [{events[ev.id] ? '■' : '□'} {ev.label}]
            </button>
          ))}
        </div>
        <div className="net-heat">
          <div className="net-temp" title="Temperature">
            <span className="net-temp-label">TEMP</span>
            <span className="net-temp-bar">
              <span className="net-temp-fill" style={{ width: `${tempBarPct}%` }} />
            </span>
            <span className="net-temp-val">{tempDisplay}</span>
          </div>
          <button
            type="button"
            className={`net-toggle net-heat-btn ${heatingUi || tempUi > 0.05 ? 'on' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault()
              setHeat(true)
            }}
            onPointerUp={() => setHeat(false)}
            onPointerLeave={() => setHeat(false)}
            onPointerCancel={() => setHeat(false)}
            disabled={introPhase === 'solo'}
          >
            [ + HEAT ]
          </button>
        </div>
      </div>

      <div className="net-stage" ref={wrapRef}>
        {introPhase === 'solo' && <div className="net-join-banner">NODE JOINING…</div>}
        <canvas
          ref={canvasRef}
          className="net-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => {
            pinchRef.current = null
          }}
        />
        {tooltip && (
          <div
            className="net-tip"
            style={{
              left: Math.min(tooltip.x + 12, (wrapRef.current?.clientWidth ?? 0) - 160),
              top: tooltip.y + 12,
            }}
          >
            <div className="net-tip-name">{nameInitials(tooltip.node.name)}</div>
            <div className="net-tip-meta">
              {tooltip.node.role.toUpperCase()}
              {locLine ? ` · ${locLine}` : ''}
            </div>
            <div className="net-tip-meta">
              COCREATED {tooltip.node.cocreated.length} · VISITED {tooltip.node.visited.length}
              {tooltip.node.skills.length ? ` · SKILLS ${tooltip.node.skills.length}` : ''}
            </div>
          </div>
        )}
      </div>
      <div className="net-legend dim">
        ○ SUB · ○ PROSPECT · ● COCREATOR · ● MEMBER · HOLD +HEAT · H23–H26 FILTER EVENTS
      </div>
    </div>
  )
}
