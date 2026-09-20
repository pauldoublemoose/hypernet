import { useState } from 'react'
import { useUi } from '../ui'
import { CardThumb } from './CardThumb'

export type ShellFeature =
  | 'terminal'
  | 'announcements'
  | 'global-chat'
  | 'graph'
  | 'notes'
  | 'admin'
  | 'profile'
  | 'settings'
  | 'events'
  | 'horizons'
  | 'my-horizons'
  | 'contacts'
  | 'clusters'
  | 'my-cluster'
  | 'notifications'
  | 'my-chats'
  | 'theme'
  | 'chronicle'

type IconId =
  | 'announcements'
  | 'global-chat'
  | 'graph'
  | 'notes'
  | 'clusters'
  | 'events'
  | 'horizons'
  | 'profile'
  | 'chronicle'
  | 'admin'
  | 'settings'
  | 'my-cluster'
  | 'my-horizons'
  | 'contacts'
  | 'theme'
  | 'notifications'
  | 'my-chats'
  | 'terminal'

type DeskIcon = {
  id: IconId
  label: string
  locked: boolean
  tip: string
}

type NavCategoryId = 'global' | 'mine'

type NavCategory = {
  id: NavCategoryId
  label: string
  items: DeskIcon[]
}

const GLOBAL: DeskIcon[] = [
  {
    id: 'announcements',
    label: 'Announcements',
    locked: false,
    tip: 'Global Announcements — network message board / updates feed.',
  },
  {
    id: 'global-chat',
    label: 'Global Chat',
    locked: false,
    tip: 'Global Chat — network-wide chat (stub).',
  },
  {
    id: 'graph',
    label: 'Network Graph',
    locked: false,
    tip: 'Network Graph — drop into a World and walk. Privacy = reach.',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    locked: false,
    tip: 'Terminal — feed, help, and about.',
  },
]

const MINE: DeskIcon[] = [
  {
    id: 'chronicle',
    label: 'My Chronicle',
    locked: false,
    tip: 'My Chronicle — personal event history, roles, and unconfirmed entries.',
  },
  {
    id: 'contacts',
    label: 'My Contacts',
    locked: false,
    tip: 'My Contacts — contact lists, Follow, and Friend requests.',
  },
  {
    id: 'my-cluster',
    label: 'My Clusters',
    locked: false,
    tip: 'My Clusters — camps you join or admin.',
  },
  {
    id: 'my-horizons',
    label: 'MY HORIZONS',
    locked: false,
    tip: 'My horizons — your default list and calendars you create.',
  },
]

const NAV_CATEGORIES: NavCategory[] = [
  { id: 'global', label: 'Global', items: GLOBAL },
  { id: 'mine', label: 'Mine', items: MINE },
]

function NavItem({
  item,
  active,
  onActivate,
}: {
  item: DeskIcon
  active: ShellFeature
  onActivate: (id: IconId, locked: boolean) => void
}) {
  const on = !item.locked && item.id === active
  return (
    <button
      type="button"
      className={`shell-item${item.locked ? ' is-locked' : ''}${on ? ' is-on' : ''}`}
      aria-current={on ? 'page' : undefined}
      aria-disabled={item.locked || undefined}
      title={item.tip}
      onClick={() => onActivate(item.id, item.locked)}
    >
      {item.label}
    </button>
  )
}

export function DesktopIcons({
  active,
  onAnnouncements,
  onGlobalChat,
  onGraph,
  onNotes,
  onAdmin,
  onProfile,
  onSettings,
  onEvents,
  onHorizons,
  onMyHorizons,
  onContacts,
  onClusters,
  onMyClusters,
  onNotifications,
  onMyChats,
  onChronicle,
  onTerminal,
  avatarSrc,
  avatarLabel,
}: {
  active: ShellFeature
  onAnnouncements: () => void
  onGlobalChat: () => void
  onGraph: () => void
  onNotes: () => void
  onAdmin: () => void
  onProfile: () => void
  onSettings: () => void
  onEvents: () => void
  onHorizons: () => void
  onMyHorizons: () => void
  onContacts: () => void
  onClusters: () => void
  onMyClusters: () => void
  onNotifications: () => void
  onMyChats: () => void
  onChronicle: () => void
  onTerminal: () => void
  avatarSrc?: string
  avatarLabel: string
}) {
  const { theme, cycleTheme } = useUi()
  const [open, setOpen] = useState<Record<NavCategoryId, boolean>>({
    global: false,
    mine: false,
  })

  const activate = (id: IconId, locked: boolean) => {
    if (locked) return
    if (id === 'announcements') onAnnouncements()
    else if (id === 'global-chat') onGlobalChat()
    else if (id === 'graph') onGraph()
    else if (id === 'notes') onNotes()
    else if (id === 'admin') onAdmin()
    else if (id === 'profile') onProfile()
    else if (id === 'settings') onSettings()
    else if (id === 'events') onEvents()
    else if (id === 'horizons') onHorizons()
    else if (id === 'my-horizons') onMyHorizons()
    else if (id === 'contacts') onContacts()
    else if (id === 'clusters') onClusters()
    else if (id === 'my-cluster') onMyClusters()
    else if (id === 'notifications') onNotifications()
    else if (id === 'my-chats') onMyChats()
    else if (id === 'chronicle') onChronicle()
    else if (id === 'terminal') onTerminal()
    else if (id === 'theme') cycleTheme()
  }

  return (
    <>
      <header className="shell-top" data-shell="top">
        <nav className="shell-nav" aria-label="Hypernet">
          <button
            type="button"
            className={`shell-find${active === 'notes' ? ' is-on' : ''}`}
            data-shell="find"
            onClick={onNotes}
          >
            Find
          </button>
          {NAV_CATEGORIES.map((cat) => {
            const expanded = open[cat.id]
            return (
              <div
                key={cat.id}
                className={`shell-cat${expanded ? ' is-open' : ''}`}
                data-cat={cat.id}
              >
                <button
                  type="button"
                  className="shell-cat-toggle"
                  aria-expanded={expanded}
                  onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                >
                  {cat.label}
                </button>
                {expanded ? (
                  <div className="shell-cat-items">
                    {cat.items.map((item) => (
                      <NavItem key={item.id} item={item} active={active} onActivate={activate} />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
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
            onClick={() => activate('theme', false)}
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
