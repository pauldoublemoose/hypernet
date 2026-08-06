import type { ReactNode } from 'react'
import { pressKey } from '../hooks'

export type InputMode = 'NAV' | 'TXT'

export function TerminalFrame({
  section,
  mode,
  children,
}: {
  section: string
  mode: InputMode
  children: ReactNode
}) {
  return (
    <div className="chrome-frame">
      <div className="terminal flicker">
        <div className="term-header">
          <span>HYPERNET v0.1 // PRE-ALPHA TERMINAL</span>
          <span className="dim">[ {section} ]</span>
        </div>
        <div className="term-body">{children}</div>
        <div className="term-status">
          <span className={`mode-chip ${mode === 'TXT' ? 'txt' : ''}`}>
            {mode === 'NAV' ? '◆ NAV' : '▮ TXT'}
          </span>
          <span className="hints">
            {mode === 'NAV'
              ? '↑↓ MOVE · SPACE SELECT · ENTER CONFIRM · BACKSPACE BACK'
              : 'TYPE · ENTER CONFIRM · BACKSPACE ON EMPTY = BACK'}
          </span>
          <span className="status-actions">
            <button className="mbtn back-btn" onClick={() => pressKey('Backspace')}>
              ◄ BACK
            </button>
            <button className="mbtn enter-btn" onClick={() => pressKey('Enter')}>
              ENTER ▶
            </button>
          </span>
        </div>
        <div className="crt" />
      </div>
    </div>
  )
}
