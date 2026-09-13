import { useEffect, useRef, useState } from 'react'
import { useUi } from './ui'

/**
 * Attach a keydown handler on window. Screens each register their own handler;
 * `active` lets a parent screen mute itself while a dialog is open.
 * Synthetic events (dispatched by the mobile BACK/ENTER buttons) also arrive here.
 * Muted automatically while the GRAPH overlay is open.
 */
export function useKeys(handler: (e: KeyboardEvent) => void, active = true) {
  const ref = useRef(handler)
  ref.current = handler
  const { graphOpen } = useUi()
  useEffect(() => {
    if (!active || graphOpen) return
    const fn = (e: KeyboardEvent) => ref.current(e)
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [active, graphOpen])
}

/** Reveal text a few characters at a time, retro teletype style. */
export function useTypewriter(text: string, msPerTick = 16, charsPerTick = 2) {
  const { reduceMotion } = useUi()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduceMotion) {
      setN(text.length)
      return
    }
    setN(0)
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id)
          return v
        }
        return v + charsPerTick
      })
    }, msPerTick)
    return () => window.clearInterval(id)
  }, [text, msPerTick, charsPerTick, reduceMotion])
  return {
    shown: text.slice(0, Math.min(n, text.length)),
    done: n >= text.length,
    finish: () => setN(text.length),
  }
}

/** Dispatch a synthetic key press, used by the on-screen mobile buttons. */
export function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
}

/** Keep the highlighted option visible when navigating long menus. */
export function useScrollHlIntoView(dep: unknown) {
  useEffect(() => {
    document.querySelector('.opt.hl')?.scrollIntoView({ block: 'nearest' })
  }, [dep])
}
