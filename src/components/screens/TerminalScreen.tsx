import { useLayoutEffect, useState } from 'react'
import { ABOUT_SECTIONS, WELCOME_INTRO, WELCOME_JOIN } from '../../data/copy'
import { useKeys } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type Tab = 'help' | 'log' | 'about'

const TABS: { id: Tab; label: string }[] = [
  { id: 'help', label: 'Help' },
  { id: 'log', label: 'Update log' },
  { id: 'about', label: 'About' },
]

const UPDATE_LOG = [
  {
    version: 'v0.1.10',
    date: '2026-09',
    notes: [
      'Desktop icons sit on a uniform grid (same icon + label cell). A/B/C/D columns stay locked.',
      'Network Graph: pick a World from cards first. Gravity, Visibility, and Links show only after you drop in. Walk/thrust is faster. Hero is a plain polychrome circle + shine (not faceted). Person cards use circular profile-pic placeholders.',
      'Looking for chips still out. 3D stays struck.',
    ],
  },
  {
    version: 'v0.1.9',
    date: '2026-09',
    notes: [
      'Network Graph hero / ego node is polychrome (rainbow/CRT) so you can spot yourself. Other nodes stay theme-normal.',
      '3D is struck from the product line — ego-centric 2D forever unless Sebastian reopens it. Not parked for later.',
      'Looking for chips still out.',
    ],
  },
  {
    version: 'v0.1.8',
    date: '2026-09',
    notes: [
      'Network Graph is an ego-centric World explorer: pick an event twin, walk as your avatar (WASD / thrust), click a node for a person panel. One shared-event link layer. Dim/locked = out of reach or Chronicle-hidden.',
      'Open/community twins (Borderland, Burning Man, Hyperstition) plus private Worlds you can enter (Friends of participants default, or Participants). Looking for chips still out.',
      'Desktop icons (Sebastian locked map): LEFT A near window = Global Announcements / Global Chat / Network Graph; LEFT B outer = Find Nodes / Events / Horizons / Clusters. RIGHT C near window = My Notifications / My Chats; RIGHT D outer = MY NODE / My Chronicle / My Contacts / My Clusters / MY HORIZONS. Theme / Admin / SETTINGS last, bottom-right. LOG left icon removed — My Chronicle sits under MY NODE.',
      'Find Nodes / Find Events / Find Horizons / Find Clusters — Find replaces the old Discover labels.',
    ],
  },
  {
    version: 'v0.1.7',
    date: '2026-09',
    notes: [
      'Desktop reorg (Sebastian Preview 2026-09-12): left discovery is Global Announcements, Global Chat, Network Graph, Find Nodes / Events / Horizons / Clusters. LOG stays locked at the bottom. Terminal icon removed from the strip.',
      'Right mine: My Notifications and My Chats stubs on top; Theme moved to bottom-right with Admin and SETTINGS.',
      'Global Chat and Global Updates left the Terminal tab bar — they are left-strip screens now. Sign In still lands on Terminal / Help; reopen via the header section badge.',
    ],
  },
  {
    version: 'v0.1.6',
    date: '2026-09',
    notes: [
      'Theme lives on the right desktop strip — click to cycle WHITE / BLACK / POLYCHROME. Chrome header no longer toggles theme.',
      'Contact lists: + opens a search popup to add someone from the directory.',
      'Friend requests stay on the card after Accept / Decline — undo, and + Add to a private list anytime.',
      'People / Clusters / Events cards show an image box (placeholder until upload).',
      'Camps/crews are Clusters. Left CLUSTERS = directory; right My Clusters = yours.',
      'Backlog: Event pages UI needs an upgrade (Sebastian) — not in this pass.',
      'Backlog: first-time tips with Don’t show again (lists stay secret / clusters are shared).',
    ],
  },
  {
    version: 'v0.1.5',
    date: '2026-09',
    notes: [
      'Thin Clusters: directory, create, join public, admin edit.',
      'Event owners can include a cluster you admin.',
      'Cluster pages list hosted events; admins can publish a cluster Horizon.',
    ],
  },
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
  const { setEnterArmed, setStatusCenter } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(false)
  }, [setMode, setEnterArmed])

  useLayoutEffect(() => {
    setStatusCenter(
      <div className="status-tabs" role="tablist" aria-label="Terminal sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`status-tab${tab === t.id ? ' is-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>,
    )
    return () => setStatusCenter(null)
  }, [tab, setStatusCenter])

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
      {tab === 'help' && (
        <>
          <h2 className="hz-heading">How to use Hypernet</h2>
          <p className="profile-view-text">
            Sign Up builds your Node. Sign In opens this Terminal (Help). There is no Terminal icon
            on the desktop — reopen Help from the header section badge, e.g. [ T :: TERMINAL ].
            Left side is two columns: near the window — Global Announcements, Global Chat, Network
            Graph; outer Find — Find Nodes, Find Events, Find Horizons, Find Clusters. Network Graph
            opens a World picker — drop into an event twin and walk; it is not a global helicopter
            map. Right side is two columns: near the window — My Notifications, My Chats; outer —
            MY NODE, My Chronicle, My Contacts, My Clusters, MY HORIZONS.
            Theme, Admin, and SETTINGS sit bottom-right (SETTINGS last). Theme cycles WHITE / BLACK
            / POLYCHROME. Locked icons show a tip and stay closed until unlocked.
          </p>
          <p className="profile-view-text">
            Switch Terminal sections with the tabs in the bottom status bar: Help (this page), the
            product Update log, and About. Esc or Backspace returns to the previous screen. Expand
            the window with the chrome control when you want a larger pane.
          </p>

          <h3 className="profile-section-title">Terminology</h3>
          <ul className="hz-list">
            <li className="hz-list-static">
              <span className="hz-list-title">Node / MY NODE</span>
              <span className="dim">You in the network — avatar, bio, skills, contact.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Horizon / Find Horizons / MY HORIZONS</span>
              <span className="dim">A shared calendar of events you can follow or publish.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">My Chronicle</span>
              <span className="dim">
                Personal event history, roles, and unconfirmed entries (Interested, past Horizons).
              </span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Cluster / Find Clusters / My Clusters</span>
              <span className="dim">
                A shared camp, crew, or collective — everyone in it can see they’re members together.
              </span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">World / Network Graph</span>
              <span className="dim">
                A place you drop into — often an event twin. Walk locally. Privacy = reach.
              </span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Find Events</span>
              <span className="dim">Gatherings you create or mark Interested / Going.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Find Nodes</span>
              <span className="dim">Search the network for people and nodes (placeholder).</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Global Announcements / Global Chat</span>
              <span className="dim">Network message board and network-wide chat (left strip).</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">My Notifications / My Chats</span>
              <span className="dim">Your alerts and private threads (right strip stubs).</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Contacts / Follow / Friend</span>
              <span className="dim">
                Follow is asymmetric; Friend needs a request and accept. Lists stay private to you.
              </span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Privacy</span>
              <span className="dim">Visibility ladder: only me → friends → contacts → everyone.</span>
            </li>
            <li className="hz-list-static">
              <span className="hz-list-title">Desktop icons</span>
              <span className="dim">
                Left A (global, near window) + left B (Find, outer) · right C (inbox, near window) +
                right D (mine, outer) · bottom-right = Theme / Admin / SETTINGS.
              </span>
            </li>
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

    </div>
  )
}