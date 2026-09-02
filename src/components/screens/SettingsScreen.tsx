import { useLayoutEffect } from 'react'
import { useKeys } from '../../hooks'
import { THEME_ORDER, type Theme, useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

const THEME_LABEL: Record<Theme, string> = {
  white: 'WHITE',
  black: 'BLACK',
  polychrome: 'POLYCHROME',
}

function Toggle({
  value,
  onChange,
  onLabel,
  offLabel,
  labelledBy,
}: {
  value: boolean
  onChange: (v: boolean) => void
  onLabel: string
  offLabel: string
  labelledBy: string
}) {
  return (
    <div className="privacy-toggle" role="group" aria-labelledby={labelledBy}>
      <button
        type="button"
        className={`privacy-btn${value ? ' is-on' : ''}`}
        aria-pressed={value}
        onClick={() => onChange(true)}
      >
        {onLabel}
      </button>
      <button
        type="button"
        className={`privacy-btn${!value ? ' is-on' : ''}`}
        aria-pressed={!value}
        onClick={() => onChange(false)}
      >
        {offLabel}
      </button>
    </div>
  )
}

export function SettingsScreen({
  onBack,
  setMode,
}: {
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const { setEnterArmed, theme, setTheme, sound, setSound, reduceMotion, setReduceMotion } =
    useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(false)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key !== 'Backspace') return
    e.preventDefault()
    onBack()
  })

  return (
    <div className="screen settings-screen">
      <div className="title">S :: SETTINGS</div>
      <p className="profile-oneliner dim">Theme, sound, motion. Account later.</p>

      <section className="settings-row" aria-labelledby="set-theme">
        <div className="settings-copy">
          <h2 id="set-theme" className="profile-section-title">
            THEME
          </h2>
          <p className="profile-explain">Light / dark / polychrome. Same cycle as before.</p>
        </div>
        <div className="privacy-toggle settings-theme" role="group" aria-labelledby="set-theme">
          {THEME_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              className={`privacy-btn${theme === id ? ' is-on' : ''}`}
              aria-pressed={theme === id}
              onClick={() => setTheme(id)}
            >
              {THEME_LABEL[id]}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-row" aria-labelledby="set-sound">
        <div className="settings-copy">
          <h2 id="set-sound" className="profile-section-title">
            SOUND
          </h2>
          <p className="profile-explain">UI / CRT sounds. Off until we add them.</p>
        </div>
        <Toggle
          labelledBy="set-sound"
          value={sound}
          onChange={setSound}
          onLabel="ON"
          offLabel="OFF"
        />
      </section>

      <section className="settings-row" aria-labelledby="set-motion">
        <div className="settings-copy">
          <h2 id="set-motion" className="profile-section-title">
            REDUCE MOTION
          </h2>
          <p className="profile-explain">Less animation and polychrome flash.</p>
        </div>
        <Toggle
          labelledBy="set-motion"
          value={reduceMotion}
          onChange={setReduceMotion}
          onLabel="ON"
          offLabel="OFF"
        />
      </section>

      <section className="settings-row is-locked" aria-labelledby="set-account">
        <div className="settings-copy">
          <h2 id="set-account" className="profile-section-title">
            ACCOUNT
          </h2>
          <p className="profile-explain">Sign-in and node ownership. Coming soon.</p>
        </div>
        <span className="settings-soon">COMING SOON</span>
      </section>

      <section className="settings-row is-locked" aria-labelledby="set-notify">
        <div className="settings-copy">
          <h2 id="set-notify" className="profile-section-title">
            NOTIFICATIONS
          </h2>
          <p className="profile-explain">Alerts when something in the net moves.</p>
        </div>
        <span className="settings-soon">COMING SOON</span>
      </section>
    </div>
  )
}
