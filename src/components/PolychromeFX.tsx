import { useEffect, useRef } from 'react'
import { useUi } from '../ui'

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Lightweight polychrome FX: beams at random intervals + static holo layers. */
export function PolychromeFX() {
  const { theme } = useUi()
  const laserRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (theme !== 'polychrome') return

    let cancelled = false
    const timers: number[] = []

    const fire = (el: HTMLDivElement | null) => {
      if (!el || cancelled) return
      el.classList.remove('fire')
      // force reflow so the animation can restart
      void el.offsetWidth
      el.classList.add('fire')
    }

    const loop = (el: HTMLDivElement | null, minGap: number, maxGap: number) => {
      const tick = () => {
        if (cancelled) return
        fire(el)
        timers.push(window.setTimeout(tick, rand(minGap, maxGap)))
      }
      timers.push(window.setTimeout(tick, rand(200, minGap)))
    }

    loop(laserRef.current, 2200, 4500)
    loop(scanRef.current, 3200, 5800)

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [theme])

  if (theme !== 'polychrome') return null

  return (
    <>
      {/* card-level holographic layers */}
      <div className="poly-edge" aria-hidden />
      <div className="poly-holo" aria-hidden />
      <div className="poly-shine" aria-hidden />
      {/* screen beams — fixed angles, random intervals */}
      <div className="poly-laser" ref={laserRef} aria-hidden />
      <div className="poly-scan" ref={scanRef} aria-hidden />
    </>
  )
}
