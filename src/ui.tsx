import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { pressKey } from './hooks'

export type Theme = 'white' | 'black' | 'polychrome'

export const THEME_ORDER: Theme[] = ['white', 'black', 'polychrome']

function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem('hypernet_theme')
    // migrate old names
    if (raw === 'dark' || raw === 'black') return 'black'
    if (raw === 'polychrome') return 'polychrome'
    return 'white'
  } catch {
    return 'white'
  }
}

function loadFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (raw === '1' || raw === 'true' || raw === 'on') return true
    if (raw === '0' || raw === 'false' || raw === 'off') return false
  } catch {
    /* ignore */
  }
  return fallback
}

function osPrefersReduceMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

interface UiCtx {
  enterArmed: boolean
  setEnterArmed: (v: boolean) => void
  theme: Theme
  setTheme: (t: Theme) => void
  cycleTheme: () => void
  /** UI/CRT sounds preference. No sounds wired yet; state is stored. */
  sound: boolean
  setSound: (v: boolean) => void
  /** Email notification preference. No mail backend; state is stored. */
  notifyEmail: boolean
  setNotifyEmail: (v: boolean) => void
  /** Browser desktop notification preference. */
  notifyDesktop: boolean
  setNotifyDesktop: (v: boolean) => void
  /** OS prefers-reduced-motion. No Settings row — used to quiet FX. */
  reduceMotion: boolean
  /** True once the keyboard has been used for menu navigation. */
  navUsed: boolean
  /** Overlay graph view; form progress is preserved underneath. */
  graphOpen: boolean
  toggleGraph: () => void
  setGraphOpen: (v: boolean) => void
  /** Desktop-only: enlarge the CRT window. Default remains the compact frame. */
  expanded: boolean
  toggleExpanded: () => void
  /** Optional center slot in the terminal status bar (e.g. Terminal tabs). */
  statusCenter: ReactNode | null
  setStatusCenter: (n: ReactNode | null) => void
}

const UiContext = createContext<UiCtx | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [enterArmed, setEnterArmed] = useState(true)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [sound, setSound] = useState(() => loadFlag('hypernet_sound', true))
  const [notifyEmail, setNotifyEmail] = useState(() => loadFlag('hypernet_notify_email', true))
  const [notifyDesktop, setNotifyDesktop] = useState(() => loadFlag('hypernet_notify_desktop', false))
  const [reduceMotion, setReduceMotion] = useState(osPrefersReduceMotion)
  const [navUsed, setNavUsed] = useState(false)
  const [graphOpen, setGraphOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [statusCenter, setStatusCenter] = useState<ReactNode | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('hypernet_theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.sound = sound ? 'on' : 'off'
    try {
      localStorage.setItem('hypernet_sound', sound ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }, [sound])

  useEffect(() => {
    try {
      localStorage.setItem('hypernet_notify_email', notifyEmail ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }, [notifyEmail])

  useEffect(() => {
    try {
      localStorage.setItem('hypernet_notify_desktop', notifyDesktop ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }, [notifyDesktop])

  useEffect(() => {
    const apply = (on: boolean) => {
      setReduceMotion(on)
      document.documentElement.dataset.reduceMotion = on ? 'on' : 'off'
    }
    apply(osPrefersReduceMotion())
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onChange = () => apply(mq.matches)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Trap Tab so focus never escapes the terminal.
      if (e.key === 'Tab') {
        e.preventDefault()
        if (graphOpen) return
        const tag = (e.target as HTMLElement | null)?.tagName
        // Inside text fields: leave Tab to the screen (e.g. phone code ↔ number).
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        // In menus: Tab / Shift+Tab = arrow nav.
        pressKey(e.shiftKey ? 'ArrowUp' : 'ArrowDown')
        return
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setNavUsed(true)
    }
    // Release focus after button clicks so a later ENTER/SPACE keypress
    // doesn't re-activate the button instead of the current screen.
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('button')) (document.activeElement as HTMLElement | null)?.blur()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [graphOpen])

  return (
    <UiContext.Provider
      value={{
        enterArmed,
        setEnterArmed,
        theme,
        setTheme,
        cycleTheme: () =>
          setTheme((t) => THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length]),
        sound,
        setSound,
        notifyEmail,
        setNotifyEmail,
        notifyDesktop,
        setNotifyDesktop,
        reduceMotion,
        navUsed,
        graphOpen,
        toggleGraph: () => setGraphOpen((g) => !g),
        setGraphOpen,
        expanded,
        toggleExpanded: () => setExpanded((v) => !v),
        statusCenter,
        setStatusCenter,
      }}
    >
      {children}
    </UiContext.Provider>
  )
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi outside UiProvider')
  return ctx
}
