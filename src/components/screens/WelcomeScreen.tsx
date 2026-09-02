import { useLayoutEffect, useState } from 'react'
import { WELCOME_INTRO, WELCOME_JOIN } from '../../data/copy'
import { useKeys, useTypewriter } from '../../hooks'
import { hasSavedProfile } from '../../lib/profileStore'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

const FULL = `${WELCOME_INTRO}\n\n${WELCOME_JOIN}`

export function WelcomeScreen({
  onSignup,
  onSignIn,
  onAbout,
  onAdmin,
  setMode,
}: {
  onSignup: () => void
  onSignIn: () => void
  onAbout: () => void
  onAdmin: () => void
  setMode: (m: InputMode) => void
}) {
  const { shown, done, finish } = useTypewriter(FULL)
  const [hl, setHl] = useState<0 | 1 | 2>(() => (hasSavedProfile() ? 2 : 1))
  const [signInNote, setSignInNote] = useState('')
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  const introShown = shown.slice(0, Math.min(shown.length, WELCOME_INTRO.length))
  const introDone = shown.length >= WELCOME_INTRO.length
  const joinShown = shown.length > WELCOME_INTRO.length + 2 ? shown.slice(WELCOME_INTRO.length + 2) : ''

  const activate = (n: 0 | 1 | 2) => {
    if (n === 0) onAbout()
    else if (n === 1) {
      setSignInNote('')
      onSignup()
    } else if (hasSavedProfile()) {
      setSignInNote('')
      onSignIn()
    } else {
      setSignInNote('No account on this device yet — use Sign Up')
    }
  }

  useKeys((e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setHl((h) => ((h + 2) % 3) as 0 | 1 | 2)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setHl((h) => ((h + 1) % 3) as 0 | 1 | 2)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!done) finish()
      else activate(hl)
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
            onClick={() => activate(1)}
          >
            [ SIGN UP ]
          </button>
          <button
            className={`btn ${hl === 2 ? 'hl' : ''}`}
            onMouseEnter={() => setHl(2)}
            onClick={() => activate(2)}
          >
            [ SIGN IN ]
          </button>
        </div>
      )}
      {done && signInNote ? <p className="dim hz-lead">{signInNote}</p> : null}
    </div>
  )
}
