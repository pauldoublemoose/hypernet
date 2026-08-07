import { useLayoutEffect, useState } from 'react'
import { WELCOME_INTRO, WELCOME_JOIN } from '../../data/copy'
import { useKeys, useTypewriter } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

const FULL = `${WELCOME_INTRO}\n\n${WELCOME_JOIN}`

export function WelcomeScreen({
  onSignup,
  onAbout,
  onAdmin,
  onLogin,
  setMode,
}: {
  onSignup: () => void
  onAbout: () => void
  onAdmin: () => void
  onLogin: () => void
  setMode: (m: InputMode) => void
}) {
  const { shown, done, finish } = useTypewriter(FULL)
  const [hl, setHl] = useState<0 | 1 | 2>(1)
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
      setHl((h) => ((h + 2) % 3) as 0 | 1 | 2)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHl((h) => ((h + 1) % 3) as 0 | 1 | 2)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!done) finish()
      else if (hl === 0) onAbout()
      else if (hl === 1) onSignup()
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
            className={`btn dim ${hl === 2 ? 'hl' : ''}`}
            onMouseEnter={() => setHl(2)}
            onClick={onLogin}
          >
            [ ACCESS YOUR NODE ]
          </button>
        </div>
      )}
    </div>
  )
}
