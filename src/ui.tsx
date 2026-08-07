import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { pressKey } from './hooks'

export type Theme = 'white' | 'black' | 'polychrome'

const THEME_ORDER: Theme[] = ['white', 'black', 'polychrome']

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

interface UiCtx {
  enterArmed: boolean
  setEnterArmed: (v: boolean) => void
  theme: Theme
  cycleTheme: () => void
  /** True once the keyboard has been used for menu navigation. */
  navUsed: boolean
  /** Overlay graph view; form progress is preserved underneath. */
  graphOpen: boolean
  toggleGraph: () => void
  setGraphOpen: (v: boolean) => void
}

const UiContext = createContext<UiCtx | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [enterArmed, setEnterArmed] = useState(true)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [navUsed, setNavUsed] = useState(false)
  const [graphOpen, setGraphOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('hypernet_theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

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
        cycleTheme: () =>
          setTheme((t) => THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length]),
        navUsed,
        graphOpen,
        toggleGraph: () => setGraphOpen((g) => !g),
        setGraphOpen,
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
