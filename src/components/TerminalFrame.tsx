import type { ReactNode } from 'react'
import { useUi } from '../ui'
import { PolychromeFX } from './PolychromeFX'

export type InputMode = 'NAV' | 'TXT'

export function TerminalFrame({
  section,
  onOpenTerminal,
  children,
}: {
  section: string
  mode: InputMode
  onOpenTerminal?: () => void
  children: ReactNode
}) {
  const { theme, cycleTheme, graphOpen, toggleGraph, expanded, toggleExpanded, statusCenter } =
    useUi()
  const poly = theme === 'polychrome'

  return (
    <div className={`chrome-frame${poly ? ' poly-card' : ''}${expanded ? ' is-expanded' : ''}`}>
      {poly && <PolychromeFX />}
      <div className="win-controls">
        <button
          type="button"
          className="win-btn"
          onClick={toggleExpanded}
          title={
            expanded
              ? 'Restore compact window'
              : 'Expand window — larger terminal (desktop shell comes later)'
          }
          aria-label={expanded ? 'Restore compact window' : 'Expand window'}
          aria-pressed={expanded}
        >
          <span className={`win-glyph ${expanded ? 'is-restore' : 'is-expand'}`} aria-hidden />
        </button>
      </div>
      <div className="terminal flicker">
        <div className="term-header">
          <span>HYPERNET v0.1 // PRE-ALPHA TERMINAL</span>
          <span className="header-right">
            <button
              type="button"
              className="theme-btn mobile-only"
              onClick={cycleTheme}
              title="Switch color mode (WHITE / BLACK / POLYCHROME)"
            >
              [{theme.toUpperCase()}]
            </button>
            {!statusCenter && (
              <button
                type="button"
                className={`theme-btn${graphOpen ? ' on' : ''}`}
                onClick={toggleGraph}
                title={graphOpen ? 'Return to form' : 'Drop into a World'}
              >
                [GRAPH]
              </button>
            )}
            <button
              type="button"
              className="section-badge dim"
              onClick={() => onOpenTerminal?.()}
              title="Open Terminal / Help"
            >
              [ {graphOpen ? 'N :: WORLD' : section} ]
            </button>
          </span>
        </div>
        {!graphOpen && statusCenter ? <div className="term-tabs">{statusCenter}</div> : null}
        <div className="term-body">{children}</div>
        <div className="crt" />
      </div>
    </div>
  )
}
