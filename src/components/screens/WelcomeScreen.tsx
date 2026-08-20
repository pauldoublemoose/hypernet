import { useLayoutEffect, useState } from 'react'
import { WELCOME_INTRO, WELCOME_JOIN } from '../../data/copy'
import { useKeys, useTypewriter } from '../../hooks'
import { useSession } from '../../lib/session'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

const FULL = `${WELCOME_INTRO}\n\n${WELCOME_JOIN}`

export function WelcomeScreen({
  onSignup,
  onQuickSignup,
  onAbout,
  onAdmin,
  onLogin,
  setMode,
}: {
  onSignup: () => void
  onQuickSignup: () => void
  onAbout: () => void
  onAdmin: () => void
  onLogin: () => void
  setMode: (m: InputMode) => void
}) {
  const { shown, done, finish } = useTypewriter(FULL)
  const [hl, setHl] = useState(1)
  const { status, email } = useSession()
  const authed = status === 'authed'
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  const introShown = shown.slice(0, Math.min(shown.length, WELCOME_INTRO.length))
  const introDone = shown.length >= WELCOME_INTRO.length
  const joinShown = shown.length > WELCOME_INTRO.length + 2 ? shown.slice(WELCOME_INTRO.length + 2) : ''

  useKeys((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHl((h) => (h + 3) % 4)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHl((h) => (h + 1) % 4)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!done) finish()
      else if (hl === 0) onAbout()
      else if (hl === 1) onSignup()
      else if (hl === 2) onQuickSignup()
      else onLogin()
    }
  })

  return (
    <div className="screen welcome-screen" onClick={() => !done && finish()}>
      <button
        type="button"
        className="admin-whisper"
        onClick={(e) => {
          e.stopPropagation()
          onAdmin()
        }}
        title="…"
        aria-label="Admin"
      >
        ·
      </button>
      <div className="tw">
        {introShown}
        {!introDone && <span className="caret">▮</span>}
      </div>
      {introDone && (
        <div className="btn-row">
          <button
            className={`btn ${done && hl === 0 ? 'hl' : ''}`}
            onMouseEnter={() => setHl(0)}
            onClick={onAbout}
          >
            [ TELL ME MORE ABOUT HYPERNET ]
          </button>
        </div>
      )}
      {introDone && (
        <div className="tw">
          {joinShown}
          {!done && <span className="caret">▮</span>}
        </div>
      )}
      {done && (
        <div className="btn-row">
          <button
            className={`btn ${hl === 1 ? 'hl' : ''}`}
            onMouseEnter={() => setHl(1)}
            onClick={onSignup}
          >
            [ SIGN UP ]
          </button>
          <button
            className={`btn ${hl === 2 ? 'hl' : ''}`}
            onMouseEnter={() => setHl(2)}
            onClick={onQuickSignup}
          >
            [ QUICK SIGN UP ]
          </button>
          <button
            className={`btn dim ${hl === 3 ? 'hl' : ''}`}
            onMouseEnter={() => setHl(3)}
            onClick={onLogin}
          >
            {authed ? '[ YOUR NODE ]' : '[ ACCESS YOUR NODE ]'}
          </button>
        </div>
      )}
      {done && authed && (
        <div className="screen-hint">SESSION ACTIVE — {email.toUpperCase()}</div>
      )}
    </div>
  )
}
