import { useLayoutEffect, useState } from 'react'
import { ABOUT_SECTIONS, WELCOME_INTRO, WELCOME_JOIN } from '../../data/copy'
import { useKeys } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type Tab = 'help' | 'chat' | 'updates' | 'log' | 'about'

const TABS: { id: Tab; label: string }[] = [
  { id: 'help', label: 'Help' },
  { id: 'chat', label: 'Global Chat' },
  { id: 'updates', label: 'Global Updates' },
  { id: 'log', label: 'Update log' },
  { id: 'about', label: 'About' },
]

const GLOBAL_UPDATES = [
  { when: 'just now', text: 'New user joined the network — welcome, @signal.' },
  { when: '12m ago', text: 'New event published: Deep Listening Lab · Stockholm.' },
  { when: '1h ago', text: 'Horizon “Baltic Circuit” added three dates.' },
  { when: 'yesterday', text: '@nova and @ember are now Friends.' },
  { when: '2d ago', text: 'New Group pending (locked) — camps unlock later.' },
]

const UPDATE_LOG = [
  {
    version: 'v0.1.4',
    date: '2026-09',
    notes: ['Terminal unlocked with Help / Chat / Updates / Log / About tabs.', 'Sign In lands on Terminal.'],
  },
  {
    version: 'v0.1.3',
    date: '2026-08',
    notes: ['Contacts: Follow + Friend requests (local demo).', 'Events privacy: only me → everyone.'],
  },
  {
    version: 'v0.1.2',
    date: '2026-08',
    notes: ['Horizons + My Horizons calendars.', 'Desktop shell: left discovery / right mine.'],
  },
  {
    version: 'v0.1.0',
    date: '2026-07',
    notes: ['Pre-alpha signup terminal.', 'Network graph preview.'],
  },
]

export function TerminalScreen({
  onBack,
  setMode,
}: {
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [tab, setTab] = useState<Tab>('help')
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(false)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    onBack()
  })

  return (
    <div className="screen hz-screen">
      <div className="title">T :: TERMINAL</div>
      <p className="dim hz-lead">Help, chat, network pulse, product log, and About — Esc / Backspace to leave.</p>

      <div className="btn-row hz-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`privacy-btn${tab === t.id ? ' is-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'help' && (
        <>
          <h2 className="hz-heading">How to use Hypernet</h2>
          <p className="profile-view-text">
            Sign Up builds your Node. Sign In opens Terminal. Desktop icons on the left are discovery
            (shared places); icons on the right are yours (MY NODE, contacts, calendars, settings).
            Locked icons show a tip and stay closed until unlocked.
          </p>
          <p className="profile-view-text">
            From Terminal, use the tabs for Help (this page), Global Chat, Global Updates, the product
            Update log, and About. Esc or Backspace returns to the previous screen. Expand the window
            with the chrome control when you want a larger pane.
          </p>

          <h3 className="profile-section-title">Terminology</h3>
          <ul className="hz-list">
            <li className="hz-list-static">
              <span className="hz-list-title">Node / MY NODE</span>
              <span className="dim">You in the network — avatar, bio, skills, contact.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Horizon</span>
              <span className="dim">A shared calendar of events you can follow or publish.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Chronicle / LOG</span>
              <span className="dim">Your personal event history and roles (coming soon).</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Group</span>
              <span className="dim">A camp, crew, or collective hub (coming soon).</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Events</span>
              <span className="dim">Gatherings you create or mark Interested / Going.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Contacts / Follow / Friend</span>
              <span className="dim">Follow is asymmetric; Friend needs a request and accept.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Privacy</span>
              <span className="dim">Visibility ladder: only me → friends → contacts → everyone.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Desktop icons</span>
              <span className="dim">Left strip = discovery · right strip = mine.</span>
            </li>
          </ul>
        </>
      )}

      {tab === 'chat' && (
        <>
          <h2 className="hz-heading">Global Chat</h2>
          <p className="dim hz-lead">Network-wide chat is not live yet. Stub UI only.</p>
          <section className="hz-panel">
            <ul className="hz-list">
              <li className="hz-list-static">
                <span className="dim">No messages yet — coming soon.</span>
              </li>
            </ul>
            <label className="hz-field" style={{ marginTop: 12 }}>
              <span>Message</span>
              <input className="profile-input" disabled placeholder="Global Chat coming soon" value="" readOnly />
            </label>
            <div className="btn-row">
              <button type="button" className="btn dim" disabled>
                Send (coming soon)
              </button>
            </div>
          </section>
        </>
      )}

      {tab === 'updates' && (
        <>
          <h2 className="hz-heading">Global Updates</h2>
          <p className="dim hz-lead">Local demo feed — placeholder network pulse.</p>
          <ul className="hz-list">
            {GLOBAL_UPDATES.map((u) => (
              <li key={u.text} className="hz-list-static">
                <span className="hz-list-title">{u.text}</span>
                <span className="dim">{u.when}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'log' && (
        <>
          <h2 className="hz-heading">Update log</h2>
          <p className="dim hz-lead">Hypernet product changelog (stub).</p>
          {UPDATE_LOG.map((entry) => (
            <section key={entry.version} className="hz-panel" style={{ marginBottom: 12 }}>
              <h3 className="profile-section-title">
                {entry.version} <span className="dim">· {entry.date}</span>
              </h3>
              <ul className="hz-list">
                {entry.notes.map((n) => (
                  <li key={n} className="hz-list-static">
                    <span className="hz-list-title">{n}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      {tab === 'about' && (
        <>
          <h2 className="hz-heading">About Hypernet</h2>
          <p className="profile-view-text">{WELCOME_INTRO}</p>
          <p className="profile-view-text">{WELCOME_JOIN}</p>
          {ABOUT_SECTIONS.map((s) => (
            <section key={s.id} className="hz-panel" style={{ marginBottom: 12 }}>
              <h3 className="profile-section-title">{s.header}</h3>
              <p className="profile-view-text" style={{ whiteSpace: 'pre-wrap' }}>
                {s.body}
              </p>
            </section>
          ))}
        </>
      )}

      <div className="profile-actions">
        <button type="button" className="btn dim" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}
