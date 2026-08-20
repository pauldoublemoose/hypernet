import type { ReactNode } from 'react'
import { pressKey } from '../hooks'
import { useUi } from '../ui'
import { PolychromeFX } from './PolychromeFX'

export type InputMode = 'NAV' | 'TXT'

export function TerminalFrame({
  section,
  mode,
  wide = false,
  children,
}: {
  section: string
  mode: InputMode
  /** Workspace mode: the frame grows to fill most of the viewport. */
  wide?: boolean
  children: ReactNode
}) {
  const { enterArmed, theme, cycleTheme, navUsed, graphOpen, toggleGraph } = useUi()
  const poly = theme === 'polychrome'

  return (
    <div className={`chrome-frame${wide ? ' wide' : ''}${poly ? ' poly-card' : ''}`}>
      {poly && <PolychromeFX />}
      <div className="terminal flicker">
        <div className="term-header">
          <span>HYPERNET v0.1 // PRE-ALPHA TERMINAL</span>
          <span className="header-right">
            <button
              type="button"
              className="theme-btn"
              onClick={cycleTheme}
              title="Switch color mode (WHITE / BLACK / POLYCHROME)"
            >
              [{theme.toUpperCase()}]
            </button>
            <button
              type="button"
              className={`theme-btn${graphOpen ? ' on' : ''}`}
              onClick={toggleGraph}
              title={graphOpen ? 'Return to form' : 'Open network graph'}
            >
              [GRAPH]
            </button>
            <span className="dim">[ {graphOpen ? '6 :: NETWORK' : section} ]</span>
          </span>
        </div>
        <div className="term-body">{children}</div>
        <div className={`term-status${navUsed || graphOpen ? '' : ' attn'}`}>
          <span className={`mode-chip ${mode === 'TXT' && !graphOpen ? 'txt' : ''}`}>
            {graphOpen ? '◆ NET' : mode === 'NAV' ? '◆ NAV' : '▮ TXT'}
          </span>
          <span className="hints">
            {graphOpen
              ? 'DRAG NODES · SCROLL/PINCH ZOOM · HOLD +HEAT · TOGGLE LAYERS'
              : mode === 'NAV'
                ? '↑↓ MOVE · SPACE SELECT · ENTER CONFIRM · BACKSPACE BACK'
                : 'TYPE · ENTER CONFIRM · BACKSPACE ON EMPTY = BACK'}
          </span>
          <span className="status-actions">
            <button
              className="mbtn back-btn"
              onClick={() => {
                if (graphOpen) toggleGraph()
                else pressKey('Backspace')
              }}
            >
              ◄ BACK
            </button>
            <button
              className={`mbtn enter-btn ${enterArmed && !graphOpen ? '' : 'disarmed'}`}
              disabled={!enterArmed || graphOpen}
              onClick={() => {
                if (enterArmed && !graphOpen) pressKey('Enter')
              }}
            >
              ENTER ▶
            </button>
          </span>
        </div>
        <div className="crt" />
      </div>
    </div>
  )
}
