import { useState } from 'react'
import { useUi } from '../ui'
import { CardThumb } from './CardThumb'

export type ShellFeature =
  | 'terminal'
  | 'announcements'
  | 'global-chat'
  | 'graph'
  | 'notes'
  | 'feed'
  | 'admin'
  | 'profile'
  | 'settings'
  | 'events'
  | 'horizons'
  | 'my-horizons'
  | 'contacts'
  | 'clusters'
  | 'my-cluster'
  | 'callouts'
  | 'notifications'
  | 'my-chats'
  | 'theme'
  | 'chronicle'
  | 'bot-roulette'

type IconId =
  | 'global-chat'
  | 'graph'
  | 'notes'
  | 'feed'
  | 'bot-roulette'
  | 'events'
  | 'horizons'
  | 'clusters'
  | 'contacts'
  | 'my-horizons'
  | 'my-cluster'
  | 'callouts'
  | 'admin'
  | 'settings'
  | 'theme'
  | 'notifications'
  | 'my-chats'
  | 'profile'
  | 'terminal'

type NavLeaf = { id: IconId; label: string; tip: string }

type PaneId = 'create' | 'manage' | 'gimmicks'

const CREATE: NavLeaf[] = [
  { id: 'events', label: 'event', tip: 'Create an event.' },
  { id: 'horizons', label: 'event horizon', tip: 'Create a shared calendar.' },
  { id: 'clusters', label: 'group', tip: 'Create a group or camp.' },
  { id: 'callouts', label: 'call out', tip: 'Create a recruitment call out.' },
]

const MANAGE: NavLeaf[] = [
  {
    id: 'contacts',
    label: 'Contact lists',
    tip: 'Contact lists — Follow, Friend, and private lists.',
  },
  {
    id: 'my-horizons',
    label: 'Event horizons',
    tip: 'Event horizons — calendars you keep.',
  },
  {
    id: 'my-cluster',
    label: 'Groups',
    tip: 'Groups — camps you join or admin.',
  },
]

const GIMMICKS: NavLeaf[] = [
  {
    id: 'global-chat',
    label: 'Global Spam Hell',
    tip: 'Global Spam Hell — network-wide chat (stub).',
  },
  {
    id: 'graph',
    label: 'Moonwalker',
    tip: 'Moonwalker — drop into a World and walk.',
  },
  {
    id: 'bot-roulette',
    label: 'Bot Roulette',
    tip: 'Bot Roulette — robot-face slots.',
  },
]

function Leaf({
  item,
  active,
  onActivate,
}: {
  item: NavLeaf
  active: ShellFeature
  onActivate: (id: IconId) => void
}) {
  const on = item.id === active
  return (
    <button
      type="button"
      className={`shell-item${on ? ' is-on' : ''}`}
      aria-current={on ? 'page' : undefined}
      title={item.tip}
      onClick={() => onActivate(item.id)}
    >
      {item.label}
    </button>
  )
}

export function DesktopIcons({
  active,
  onGlobalChat,
  onGraph,
  onNotes,
  onFeed,
  onBotRoulette,
  onEvents,
  onHorizons,
  onClusters,
  onAdmin,
  onProfile,
  onSettings,
  onMyHorizons,
  onContacts,
  onMyClusters,
  onCallouts,
  onNotifications,
  onMyChats,
  onTerminal,
  avatarSrc,
  avatarLabel,
}: {
  active: ShellFeature
  onGlobalChat: () => void
  onGraph: () => void
  onNotes: () => void
  onFeed: () => void
  onBotRoulette: () => void
  onEvents: () => void
  onHorizons: () => void
  onClusters: () => void
  onAdmin: () => void
  onProfile: () => void
  onSettings: () => void
  onMyHorizons: () => void
  onContacts: () => void
  onMyClusters: () => void
  onCallouts: () => void
  onNotifications: () => void
  onMyChats: () => void
  onTerminal: () => void
  avatarSrc?: string
  avatarLabel: string
}) {
  const { theme, cycleTheme } = useUi()
  const [open, setOpen] = useState<Record<PaneId, boolean>>({
    create: false,
    manage: false,
    gimmicks: false,
  })

  const activate = (id: IconId) => {
    if (id === 'global-chat') onGlobalChat()
    else if (id === 'graph') onGraph()
    else if (id === 'notes') onNotes()
    else if (id === 'feed') onFeed()
    else if (id === 'bot-roulette') onBotRoulette()
    else if (id === 'events') onEvents()
    else if (id === 'horizons') onHorizons()
    else if (id === 'clusters') onClusters()
    else if (id === 'admin') onAdmin()
    else if (id === 'profile') onProfile()
    else if (id === 'settings') onSettings()
    else if (id === 'my-horizons') onMyHorizons()
    else if (id === 'contacts') onContacts()
    else if (id === 'my-cluster') onMyClusters()
    else if (id === 'callouts') onCallouts()
    else if (id === 'notifications') onNotifications()
    else if (id === 'my-chats') onMyChats()
    else if (id === 'terminal') onTerminal()
    else if (id === 'theme') cycleTheme()
  }

  const toggle = (id: PaneId) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  return (
    <>
      <header className="shell-top" data-shell="top">
        <nav className="shell-nav" aria-label="Hypernet utilities">
          <span className="shell-wordmark">HYPERNET</span>
        </nav>
        <div className="shell-utils">
          <button
            type="button"
            className={`shell-util${active === 'global-chat' ? ' is-on' : ''}`}
            onClick={onGlobalChat}
          >
            Chat
          </button>
          <button
            type="button"
            className={`shell-util${active === 'notifications' ? ' is-on' : ''}`}
            onClick={onNotifications}
          >
            Notifications
          </button>
          <button
            type="button"
            className={`shell-avatar${active === 'profile' ? ' is-on' : ''}`}
            data-shell="avatar"
            aria-label="My profile"
            title="My profile"
            onClick={onProfile}
          >
            <CardThumb src={avatarSrc} label={avatarLabel} size="sm" shape="circle" />
          </button>
        </div>
      </header>
      <nav className="shell-pane" data-shell="pane" aria-label="Main">
        <button
          type="button"
          className={`shell-find${active === 'feed' ? ' is-on' : ''}`}
          data-shell="feed"
          onClick={onFeed}
        >
          FEED
        </button>
        <button
          type="button"
          className={`shell-find${active === 'notes' ? ' is-on' : ''}`}
          data-shell="search"
          onClick={onNotes}
        >
          SEARCH
        </button>
        <div className={`shell-cat${open.create ? ' is-open' : ''}`} data-cat="create">
          <button
            type="button"
            className="shell-cat-toggle"
            aria-expanded={open.create}
            data-pane="create"
            onClick={() => toggle('create')}
          >
            CREATE
          </button>
          {open.create ? (
            <div className="shell-cat-items">
              {CREATE.map((item) => (
                <Leaf key={item.id} item={item} active={active} onActivate={activate} />
              ))}
            </div>
          ) : null}
        </div>
        <div className={`shell-cat${open.manage ? ' is-open' : ''}`} data-cat="manage">
          <button
            type="button"
            className="shell-cat-toggle"
            aria-expanded={open.manage}
            data-pane="manage"
            onClick={() => toggle('manage')}
          >
            MANAGE
          </button>
          {open.manage ? (
            <div className="shell-cat-items">
              {MANAGE.map((item) => (
                <Leaf key={item.id} item={item} active={active} onActivate={activate} />
              ))}
            </div>
          ) : null}
        </div>
        <div className={`shell-cat${open.gimmicks ? ' is-open' : ''}`} data-cat="gimmicks">
          <button
            type="button"
            className="shell-cat-toggle"
            aria-expanded={open.gimmicks}
            data-pane="gimmicks"
            onClick={() => toggle('gimmicks')}
          >
            GIMMICKS
          </button>
          {open.gimmicks ? (
            <div className="shell-cat-items">
              {GIMMICKS.map((item) => (
                <Leaf key={item.id} item={item} active={active} onActivate={activate} />
              ))}
            </div>
          ) : null}
        </div>
      </nav>
      <footer className="shell-bottom" data-shell="bottom">
        <div className="shell-bottom-left">
          <button
            type="button"
            className={`shell-dock${active === 'settings' ? ' is-on' : ''}`}
            onClick={onSettings}
          >
            Settings
          </button>
          <button
            type="button"
            className="shell-dock"
            data-theme-cycle="true"
            title={`Theme — now ${theme.toUpperCase()}. Click to cycle WHITE / BLACK / POLYCHROME.`}
            onClick={() => activate('theme')}
          >
            Theme
          </button>
        </div>
        <div className="shell-bottom-right">
          <button
            type="button"
            className={`shell-dock${active === 'admin' ? ' is-on' : ''}`}
            onClick={onAdmin}
          >
            Admin
          </button>
          <button
            type="button"
            className={`shell-dock${active === 'my-chats' ? ' is-on' : ''}`}
            onClick={onMyChats}
          >
            Chats
          </button>
        </div>
      </footer>
    </>
  )
}
