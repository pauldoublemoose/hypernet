import { useUi } from '../ui'

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

type DeskIcon = {
  id: IconId
  glyph: string
  label: string
  locked: boolean
  tip: string
}

const LEFT_TOP: DeskIcon[] = [
  {
    id: 'announcements',
    glyph: '⌁',
    label: 'Global Announcements',
    locked: false,
    tip: 'Global Announcements — network message board / updates feed.',
  },
  {
    id: 'global-chat',
    glyph: '▮',
    label: 'Global Chat',
    locked: false,
    tip: 'Global Chat — network-wide chat (stub).',
  },
  {
    id: 'graph',
    glyph: '◈',
    label: 'Network Graph',
    locked: false,
    tip: 'Network Graph — the community as nodes',
  },
  {
    id: 'notes',
    glyph: '※',
    label: 'Discover Notes',
    locked: false,
    tip: 'Discover Notes — search the network for people and notes. Placeholder.',
  },
  {
    id: 'events',
    glyph: '▣',
    label: 'Discover Events',
    locked: false,
    tip: 'Discover Events — create gatherings and mark Interested / Going.',
  },
  {
    id: 'horizons',
    glyph: '◎',
    label: 'Discover Horizons',
    locked: false,
    tip: 'Discover Horizons — published shared calendars.',
  },
  {
    id: 'clusters',
    glyph: '▦',
    label: 'Discover Clusters',
    locked: false,
    tip: 'Discover Clusters — public directory of shared camps and crews.',
  },
]

const LEFT_BOTTOM: DeskIcon[] = [
  {
    id: 'chronicle',
    glyph: '☰',
    label: 'LOG',
    locked: true,
    tip: 'Chronicle — your event history and roles. Coming soon.',
  },
]

const RIGHT_TOP: DeskIcon[] = [
  {
    id: 'notifications',
    glyph: '◷',
    label: 'My Notifications',
    locked: false,
    tip: 'My Notifications — personal alerts (stub).',
  },
  {
    id: 'my-chats',
    glyph: '◇',
    label: 'My Chats',
    locked: false,
    tip: 'My Chats — your private threads (stub).',
  },
  {
    id: 'profile',
    glyph: '◉',
    label: 'MY NODE',
    locked: false,
    tip: 'My node — you in the network. Avatar, bio, skills, contact.',
  },
  {
    id: 'contacts',
    glyph: '☷',
    label: 'My Contacts',
    locked: false,
    tip: 'My Contacts — contact lists, Follow, and Friend requests.',
  },
  {
    id: 'my-cluster',
    glyph: '▤',
    label: 'My Clusters',
    locked: false,
    tip: 'My Clusters — camps you join or admin. Create a cluster here.',
  },
  {
    id: 'my-horizons',
    glyph: '◌',
    label: 'MY HORIZONS',
    locked: false,
    tip: 'My horizons — your default list and calendars you create.',
  },
]

const RIGHT_BOTTOM: DeskIcon[] = [
  {
    id: 'theme',
    glyph: '◐',
    label: 'Theme',
    locked: false,
    tip: 'Theme — cycle WHITE / BLACK / POLYCHROME.',
  },
  {
    id: 'admin',
    glyph: '◆',
    label: 'ADMIN',
    locked: false,
    tip: 'Admin ledger — passphrase gate (already in the welcome screen)',
  },
  {
    id: 'settings',
    glyph: '⬡',
    label: 'SETTINGS',
    locked: false,
    tip: 'Settings — theme, notifications, privacy, account.',
  },
]

function IconButton({
  item,
  active,
  tipSide,
  onActivate,
}: {
  item: DeskIcon
  active: ShellFeature
  tipSide: 'left' | 'right'
  onActivate: (id: IconId, locked: boolean) => void
}) {
  const on = !item.locked && item.id === active
  return (
    <button
      type="button"
      className={`desk-icon tip-${tipSide}${item.locked ? ' is-locked' : ''}${on ? ' is-on' : ''}`}
      aria-current={on ? 'page' : undefined}
      aria-disabled={item.locked || undefined}
      aria-label={item.tip}
      data-tip={item.tip}
      data-theme-cycle={item.id === 'theme' ? 'true' : undefined}
      title={item.tip}
      onClick={() => onActivate(item.id, item.locked)}
    >
      <span className="desk-glyph" aria-hidden>
        {item.glyph}
        {item.locked && <span className="desk-lock" />}
      </span>
      <span className="desk-label">{item.label}</span>
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
}) {
  const { theme, cycleTheme } = useUi()
  const rightBottom = RIGHT_BOTTOM.map((item) =>
    item.id === 'theme'
      ? {
          ...item,
          tip: `Theme — now ${theme.toUpperCase()}. Click to cycle WHITE / BLACK / POLYCHROME.`,
        }
      : item,
  )
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
    else if (id === 'theme') cycleTheme()
  }

  return (
    <>
      <nav className="desktop-icons desktop-icons-left" aria-label="Hypernet discovery">
        <div className="desk-stack desk-stack-top">
          {LEFT_TOP.map((item) => (
            <IconButton key={item.id} item={item} active={active} tipSide="right" onActivate={activate} />
          ))}
        </div>
        <div className="desk-stack-spacer" aria-hidden />
        <div className="desk-stack desk-stack-bottom">
          {LEFT_BOTTOM.map((item) => (
            <IconButton key={item.id} item={item} active={active} tipSide="right" onActivate={activate} />
          ))}
        </div>
      </nav>
      <nav className="desktop-icons desktop-icons-right" aria-label="Hypernet mine">
        <div className="desk-stack desk-stack-top">
          {RIGHT_TOP.map((item) => (
            <IconButton key={item.id} item={item} active={active} tipSide="left" onActivate={activate} />
          ))}
        </div>
        <div className="desk-stack-spacer" aria-hidden />
        <div className="desk-stack desk-stack-bottom">
          {rightBottom.map((item) => (
            <IconButton key={item.id} item={item} active={active} tipSide="left" onActivate={activate} />
          ))}
        </div>
      </nav>
    </>
  )
}
