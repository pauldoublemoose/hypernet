import { useLayoutEffect, useState } from 'react'
import {
  DESERT_HEADLINE,
  HYPERNET_HEADLINE,
  ONBOARDING_STEPS,
  type OnboardingStepId,
  writeOnboarded,
} from '../../lib/onboarding'
import { useKeys } from '../../hooks'
import { hasSavedProfile } from '../../lib/profileStore'
import { useSession } from '../../lib/session'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type Highlight = 0 | 1 | 2 | 3

export function WelcomeScreen({
  onSignup,
  onSignIn,
  onAbout,
  onAdmin,
  onLogin,
  onEnterDesert,
  setMode,
}: {
  onSignup: () => void
  onSignIn: () => void
  onAbout: () => void
  onAdmin: () => void
  onLogin: () => void
  onEnterDesert: () => void
  setMode: (m: InputMode) => void
}) {
  const { status, email } = useSession()
  const authed = status === 'authed'
  const hasProfile = hasSavedProfile()
  const [step, setStep] = useState<OnboardingStepId>('desert')
  const [hl, setHl] = useState<Highlight>(0)
  const [signInNote, setSignInNote] = useState('')
  const { setEnterArmed } = useUi()
  const stepIndex = ONBOARDING_STEPS.indexOf(step)
  const atStart = step === 'start'

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  const finishOnboarding = () => {
    writeOnboarded()
    onEnterDesert()
  }

  const activate = (n: Highlight) => {
    if (n === 0) finishOnboarding()
    else if (n === 1) {
      writeOnboarded()
      onEnterDesert()
      onSignup()
    } else if (n === 2) {
      if (hasProfile) {
        writeOnboarded()
        onEnterDesert()
        onSignIn()
      } else {
        setSignInNote('No account on this device yet — use Sign Up')
      }
    } else {
      writeOnboarded()
      onEnterDesert()
      onLogin()
    }
  }

  useKeys((e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (stepIndex > 0) setStep(ONBOARDING_STEPS[stepIndex - 1])
      return
    }
    if (!atStart && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
      e.preventDefault()
      setStep(ONBOARDING_STEPS[stepIndex + 1])
      return
    }
    if (e.key === 'ArrowLeft' && stepIndex > 0) {
      e.preventDefault()
      setStep(ONBOARDING_STEPS[stepIndex - 1])
      return
    }
    if (!atStart) return
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setHl((h) => ((h + 3) % 4) as Highlight)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setHl((h) => ((h + 1) % 4) as Highlight)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      activate(hl)
    }
  })

  return (
    <div className="screen welcome-screen welcome-journey" data-shell="onboarding">
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

      {step === 'desert' && (
        <div className="journey-pane">
          <h1 className="display-headline">{DESERT_HEADLINE}</h1>
          <p className="journey-hint">ENTER to continue</p>
        </div>
      )}

      {step === 'hypernet' && (
        <div className="journey-pane">
          <h1 className="display-headline">{HYPERNET_HEADLINE}</h1>
          <p className="journey-hint">ENTER to continue</p>
        </div>
      )}

      {step === 'purpose' && (
        <div className="journey-pane">
          <h1 className="display-headline display-headline-sm">How this place works</h1>
          <ul className="journey-beats">
            <li>
              <span className="journey-kicker">Find co-creators</span>
              Search nodes — you in the network — by what they can make.
            </li>
            <li>
              <span className="journey-kicker">Share events</span>
              Publish gatherings and mark Interested or Going. A Horizon is a shared calendar.
            </li>
            <li>
              <span className="journey-kicker">Build community</span>
              Clusters are camps and crews. Worlds are places you drop into on the graph.
            </li>
          </ul>
          <div className="btn-row">
            <button type="button" className="btn hl" onClick={() => setStep('start')}>
              [ HOW TO START ]
            </button>
            <button type="button" className="btn dim" onClick={onAbout}>
              [ TELL ME MORE ABOUT HYPERNET ]
            </button>
          </div>
        </div>
      )}

      {step === 'start' && (
        <div className="journey-pane">
          <h1 className="display-headline display-headline-sm">Start wherever you are</h1>
          <p className="journey-lead">
            The desert stays empty until you open something. Hover a person to peek. Click nav to
            go in.
          </p>
          <div className="btn-row">
            <button
              type="button"
              className={`btn ${hl === 0 ? 'hl' : ''}`}
              onMouseEnter={() => setHl(0)}
              onClick={() => activate(0)}
            >
              [ ENTER THE DESERT ]
            </button>
            <button
              type="button"
              className={`btn ${hl === 1 ? 'hl' : ''}`}
              onMouseEnter={() => setHl(1)}
              onClick={() => activate(1)}
            >
              [ SIGN UP ]
            </button>
            <button
              type="button"
              className={`btn ${hl === 2 ? 'hl' : ''}`}
              onMouseEnter={() => setHl(2)}
              onClick={() => activate(2)}
            >
              [ SIGN IN ]
            </button>
            <button
              type="button"
              className={`btn dim ${hl === 3 ? 'hl' : ''}`}
              onMouseEnter={() => setHl(3)}
              onClick={() => activate(3)}
            >
              {authed ? '[ YOUR NODE ]' : '[ ACCESS YOUR NODE ]'}
            </button>
          </div>
          {signInNote ? <p className="dim hz-lead">{signInNote}</p> : null}
          {authed ? <div className="screen-hint">SESSION ACTIVE — {email.toUpperCase()}</div> : null}
        </div>
      )}
    </div>
  )
}
