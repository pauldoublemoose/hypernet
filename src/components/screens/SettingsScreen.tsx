import { useLayoutEffect, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  loadPrivacyDefault,
  savePrivacyDefault,
  type Visibility,
} from '../../lib/profileStore'
import { THEME_ORDER, type Theme, useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

const THEME_LABEL: Record<Theme, string> = {
  white: 'WHITE',
  black: 'BLACK',
  polychrome: 'POLYCHROME',
}

function desktopNotifySupport(): 'ok' | 'denied' | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  return 'ok'
}

function Toggle({
  value,
  onChange,
  onLabel,
  offLabel,
  labelledBy,
  disabled,
}: {
  value: boolean
  onChange: (v: boolean) => void
  onLabel: string
  offLabel: string
  labelledBy: string
  disabled?: boolean
}) {
  return (
    <div className="privacy-toggle" role="group" aria-labelledby={labelledBy}>
      <button
        type="button"
        className={`privacy-btn${value ? ' is-on' : ''}`}
        aria-pressed={value}
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        {onLabel}
      </button>
      <button
        type="button"
        className={`privacy-btn${!value ? ' is-on' : ''}`}
        aria-pressed={!value}
        disabled={disabled}
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
  const {
    setEnterArmed,
    theme,
    setTheme,
    sound,
    setSound,
    notifyEmail,
    setNotifyEmail,
    notifyDesktop,
    setNotifyDesktop,
  } = useUi()
  const [privacyDefault, setPrivacyDefault] = useState<Visibility>(loadPrivacyDefault)
  const [desktopStatus, setDesktopStatus] = useState(desktopNotifySupport)

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(false)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key !== 'Backspace') return
    e.preventDefault()
    onBack()
  })

  const setPrivacy = (value: Visibility) => {
    setPrivacyDefault(value)
    savePrivacyDefault(value)
  }

  const setDesktop = async (on: boolean) => {
    if (!on) {
      setNotifyDesktop(false)
      return
    }
    if (typeof Notification === 'undefined') {
      setDesktopStatus('unsupported')
      setNotifyDesktop(false)
      return
    }
    let perm = Notification.permission
    if (perm === 'default') {
      try {
        perm = await Notification.requestPermission()
      } catch {
        perm = 'denied'
      }
    }
    setDesktopStatus(perm === 'denied' ? 'denied' : 'ok')
    setNotifyDesktop(perm === 'granted')
  }

  const desktopBlocked = desktopStatus !== 'ok'
  const desktopNote =
    desktopStatus === 'unsupported'
      ? 'This browser has no notification API.'
      : desktopStatus === 'denied'
        ? 'Browser blocked notifications. Enable them in site settings.'
        : 'Browser notifications when this tab isn’t focused.'

  return (
    <div className="screen settings-screen">
      <div className="title">S :: SETTINGS</div>
      <p className="profile-oneliner dim">Theme, how we reach you, privacy, account.</p>

      <section className="settings-row" aria-labelledby="set-theme">
        <div className="settings-copy">
          <h2 id="set-theme" className="profile-section-title">
            THEME
          </h2>
          <p className="profile-explain">Light / dark / polychrome.</p>
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

      <section className="settings-block" aria-labelledby="set-notify">
        <div className="settings-copy">
          <h2 id="set-notify" className="profile-section-title">
            NOTIFICATIONS
          </h2>
          <p className="profile-explain">
            People won’t live in this app. In-app-only isn’t enough — pick how we reach you.
          </p>
        </div>

        <div className="settings-row" aria-labelledby="set-notify-email">
          <div className="settings-copy">
            <h3 id="set-notify-email" className="settings-sub">
              EMAIL
            </h3>
            <p className="profile-explain">No mail backend yet. Preference is saved on this device.</p>
          </div>
          <Toggle
            labelledBy="set-notify-email"
            value={notifyEmail}
            onChange={setNotifyEmail}
            onLabel="ON"
            offLabel="OFF"
          />
        </div>

        <div className="settings-row" aria-labelledby="set-notify-desktop">
          <div className="settings-copy">
            <h3 id="set-notify-desktop" className="settings-sub">
              DESKTOP
            </h3>
            <p className="profile-explain">{desktopNote}</p>
          </div>
          {desktopStatus === 'unsupported' ? (
            <span className="settings-soon">NOT AVAILABLE</span>
          ) : (
            <Toggle
              labelledBy="set-notify-desktop"
              value={notifyDesktop && !desktopBlocked}
              onChange={(v) => {
                void setDesktop(v)
              }}
              onLabel="ON"
              offLabel="OFF"
            />
          )}
        </div>

        <div className="settings-row is-locked" aria-labelledby="set-notify-discord">
          <div className="settings-copy">
            <h3 id="set-notify-discord" className="settings-sub">
              DISCORD
            </h3>
            <p className="profile-explain">Future channel. Not wired.</p>
          </div>
          <span className="settings-soon">COMING SOON</span>
        </div>
      </section>

      <section className="settings-row" aria-labelledby="set-privacy">
        <div className="settings-copy">
          <h2 id="set-privacy" className="profile-section-title">
            PRIVACY DEFAULTS
          </h2>
          <p className="profile-explain">
            New profile fields start {privacyDefault === 'public' ? 'public' : 'private'}. Existing
            fields keep their own toggles.
          </p>
        </div>
        <div className="privacy-toggle" role="group" aria-labelledby="set-privacy">
          <button
            type="button"
            className={`privacy-btn${privacyDefault === 'public' ? ' is-on' : ''}`}
            aria-pressed={privacyDefault === 'public'}
            onClick={() => setPrivacy('public')}
          >
            PUBLIC
          </button>
          <button
            type="button"
            className={`privacy-btn${privacyDefault === 'private' ? ' is-on' : ''}`}
            aria-pressed={privacyDefault === 'private'}
            onClick={() => setPrivacy('private')}
          >
            PRIVATE
          </button>
        </div>
      </section>

      <section className="settings-row" aria-labelledby="set-account">
        <div className="settings-copy">
          <h2 id="set-account" className="profile-section-title">
            ACCOUNT
          </h2>
          <p className="profile-explain">No sign-in yet. Sign-out waits on real auth.</p>
        </div>
        <button type="button" className="btn dim" disabled title="Coming soon — no auth yet">
          [ SIGN OUT ]
        </button>
      </section>

      <section className="settings-row" aria-labelledby="set-sound">
        <div className="settings-copy">
          <h2 id="set-sound" className="profile-section-title">
            SOUND
          </h2>
          <p className="profile-explain">UI / CRT sounds. Off until we add them.</p>
        </div>
        <Toggle labelledBy="set-sound" value={sound} onChange={setSound} onLabel="ON" offLabel="OFF" />
      </section>
    </div>
  )
}
