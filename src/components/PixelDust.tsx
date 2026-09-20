import { useEffect, useRef } from 'react'
import { useUi } from '../ui'

type Speck = { x: number; y: number; vx: number; size: number; alpha: number }

export function PixelDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { reduceMotion, theme } = useUi()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let specks: Speck[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = reduceMotion ? 48 : 140
      specks = Array.from({ length: n }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0.15 + Math.random() * 0.55,
        size: Math.random() < 0.7 ? 1 : 2,
        alpha: 0.18 + Math.random() * 0.35,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const gray = theme === 'black' ? 200 : 90

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const s of specks) {
        if (!reduceMotion) {
          s.x += s.vx
          s.y += Math.sin(s.x * 0.01) * 0.12
          if (s.x > window.innerWidth + 4) {
            s.x = -4
            s.y = Math.random() * window.innerHeight
          }
        }
        ctx.fillStyle = `rgba(${gray},${gray},${gray},${s.alpha})`
        ctx.fillRect(s.x, s.y, s.size, s.size)
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduceMotion, theme])

  return <canvas ref={canvasRef} className="pixel-dust" data-shell="dust" aria-hidden />
}
