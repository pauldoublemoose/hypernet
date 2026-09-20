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

type DeskIcon = {
  id: IconId
  glyph: string
  label: string
  locked: boolean
  tip: string
}

type NavCategoryId = 'find' | 'global' | 'mine' | 'system'

type NavCategory = {
  id: NavCategoryId
  label: string
  items: DeskIcon[]
}

/** Global — network-wide. */
const LEFT_A: DeskIcon[] = [
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
    tip: 'Network Graph — drop into a World and walk. Privacy = reach.',
  },
]

/** Find — search the network. */
const LEFT_B: DeskIcon[] = [
  {
    id: 'notes',
    glyph: '※',
    label: 'Find Nodes',
    locked: false,
    tip: 'Find Nodes — search the network for people and nodes. Placeholder.',
  },
  {
    id: 'events',
    glyph: '▣',
    label: 'Find Events',
    locked: false,
    tip: 'Find Events — create gatherings and mark Interested / Going.',
  },
  {
    id: 'horizons',
    glyph: '◎',
    label: 'Find Horizons',
    locked: false,
    tip: 'Find Horizons — published shared calendars.',
  },
  {
    id: 'clusters',
    glyph: '▦',
    label: 'Find Clusters',
    locked: false,
    tip: 'Find Clusters — public directory of shared camps and crews.',
  },
]

/** Mine — inbox. */
const RIGHT_C: DeskIcon[] = [
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
]

/** Mine — personal. */
const RIGHT_D: DeskIcon[] = [
  {
    id: 'profile',
    glyph: '◉',
    label: 'MY NODE',
    locked: false,
    tip: 'My node — you in the network. Avatar, bio, skills, contact.',
  },
  {
    id: 'chronicle',
    glyph: '☰',
    label: 'My Chronicle',
    locked: false,
    tip: 'My Chronicle — personal event history, roles, and unconfirmed entries. Stub.',
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

/** System — theme, admin, settings. */
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

const NAV_CATEGORIES: NavCategory[] = [
  { id: 'find', label: 'Find', items: LEFT_B },
  { id: 'global', label: 'Global', items: LEFT_A },
  { id: 'mine', label: 'Mine', items: [...RIGHT_C, ...RIGHT_D] },
  { id: 'system', label: 'System', items: RIGHT_BOTTOM },
]

function IconButton({
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
      className={`desk-icon${item.locked ? ' is-locked' : ''}${on ? ' is-on' : ''}`}
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
  onChronicle,
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
}) {
  const { theme, cycleTheme } = useUi()
  const categories = NAV_CATEGORIES.map((cat) => {
    if (cat.id !== 'system') return cat
    return {
      ...cat,
      items: cat.items.map((item) =>
        item.id === 'theme'
          ? {
              ...item,
              tip: `Theme — now ${theme.toUpperCase()}. Click to cycle WHITE / BLACK / POLYCHROME.`,
            }
          : item,
      ),
    }
  })
  const open: Record<Exclude<IconId, 'theme'>, () => void> = {
    announcements: onAnnouncements,
    'global-chat': onGlobalChat,
    graph: onGraph,
    notes: onNotes,
    admin: onAdmin,
    profile: onProfile,
    settings: onSettings,
    events: onEvents,
    horizons: onHorizons,
    'my-horizons': onMyHorizons,
    contacts: onContacts,
    clusters: onClusters,
    'my-cluster': onMyClusters,
    notifications: onNotifications,
    'my-chats': onMyChats,
    chronicle: onChronicle,
  }
  const activate = (id: IconId, locked: boolean) => {
    if (locked) return
    if (id === 'theme') cycleTheme()
    else open[id]()
  }
  const jumpTo = (id: NavCategoryId) => {
    document.getElementById(`nav-${id}`)?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <>
      <header className="shell-topnav" data-shell="topnav" aria-label="Hypernet">
        <span className="shell-brand">HYPERNET</span>
        <nav className="shell-topnav-cats" aria-label="Sections">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="shell-topnav-link"
              onClick={() => jumpTo(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </header>
      <nav
        className="desktop-icons desktop-icons-left"
        data-shell="sidenav"
        aria-label="Hypernet navigation"
      >
        {categories.map((cat) => (
          <section
            key={cat.id}
            id={`nav-${cat.id}`}
            className="desk-cat"
            data-nav-cat={cat.id}
          >
            <h2 className="desk-cat-label">{cat.label}</h2>
            <div className="desk-cat-items">
              {cat.items.map((item) => (
                <IconButton key={item.id} item={item} active={active} onActivate={activate} />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </>
  )
}
