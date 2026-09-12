import { useUi } from '../ui'

export type ShellFeature =
  | 'terminal'
  | 'graph'
  | 'admin'
  | 'profile'
  | 'settings'
  | 'events'
  | 'horizons'
  | 'my-horizons'
  | 'contacts'
  | 'clusters'
  | 'my-cluster'
  | 'theme'

type IconId =
  | 'terminal'
  | 'graph'
  | 'clusters'
  | 'events'
  | 'horizons'
  | 'profile'
  | 'find'
  | 'chronicle'
  | 'admin'
  | 'settings'
  | 'my-cluster'
  | 'my-horizons'
  | 'contacts'
  | 'theme'

type DeskIcon = {
  id: IconId
  glyph: string
  label: string
  locked: boolean
  tip: string
}

const LEFT_ICONS: DeskIcon[] = [
  {
    id: 'terminal',
    glyph: '▮',
    label: 'Terminal',
    locked: false,
    tip: 'Terminal — Help, Global Chat, Updates, Update log, About.',
  },
  {
    id: 'clusters',
    glyph: '▦',
    label: 'CLUSTERS',
    locked: false,
    tip: 'Clusters — public directory of shared camps and crews.',
  },
  {
    id: 'horizons',
    glyph: '◎',
    label: 'HORIZONS',
    locked: false,
    tip: 'Horizons — published shared calendars.',
  },
  {
    id: 'graph',
    glyph: '◈',
    label: 'NET',
    locked: false,
    tip: 'Network graph — the community as nodes',
  },
  {
    id: 'find',
    glyph: '※',
    label: 'Find the others',
    locked: true,
    tip: 'Find the others — search the network for people. Coming soon.',
  },
  {
    id: 'events',
    glyph: '▣',
    label: 'EVENTS',
    locked: false,
    tip: 'Events — create gatherings and mark Interested / Going.',
  },
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
  {
    id: 'theme',
    glyph: '◐',
    label: 'Theme',
    locked: false,
    tip: 'Theme — cycle WHITE / BLACK / POLYCHROME.',
  },
]

const RIGHT_BOTTOM: DeskIcon[] = [
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
  onTerminal,
  onGraph,
  onAdmin,
  onProfile,
  onSettings,
  onEvents,
  onHorizons,
  onMyHorizons,
  onContacts,
  onClusters,
  onMyClusters,
}: {
  active: ShellFeature
  onTerminal?: () => void
  onGraph: () => void
  onAdmin: () => void
  onProfile: () => void
  onSettings: () => void
  onEvents: () => void
  onHorizons: () => void
  onMyHorizons: () => void
  onContacts: () => void
  onClusters: () => void
  onMyClusters: () => void
}) {
  const { theme, cycleTheme } = useUi()
  const rightTop = RIGHT_TOP.map((item) =>
    item.id === 'theme'
      ? {
          ...item,
          tip: `Theme — now ${theme.toUpperCase()}. Click to cycle WHITE / BLACK / POLYCHROME.`,
        }
      : item,
  )
  const activate = (id: IconId, locked: boolean) => {
    if (locked) return
    if (id === 'terminal') onTerminal?.()
    else if (id === 'graph') onGraph()
    else if (id === 'admin') onAdmin()
    else if (id === 'profile') onProfile()
    else if (id === 'settings') onSettings()
    else if (id === 'events') onEvents()
    else if (id === 'horizons') onHorizons()
    else if (id === 'my-horizons') onMyHorizons()
    else if (id === 'contacts') onContacts()
    else if (id === 'clusters') onClusters()
    else if (id === 'my-cluster') onMyClusters()
    else if (id === 'theme') cycleTheme()
  }

  return (
    <>
      <nav className="desktop-icons desktop-icons-left" aria-label="Hypernet discovery">
        {LEFT_ICONS.map((item) => (
          <IconButton key={item.id} item={item} active={active} tipSide="right" onActivate={activate} />
        ))}
      </nav>
      <nav className="desktop-icons desktop-icons-right" aria-label="Hypernet mine">
        <div className="desk-stack desk-stack-top">
          {rightTop.map((item) => (
            <IconButton key={item.id} item={item} active={active} tipSide="left" onActivate={activate} />
          ))}
        </div>
        <div className="desk-stack-spacer" aria-hidden />
        <div className="desk-stack desk-stack-bottom">
          {RIGHT_BOTTOM.map((item) => (
            <IconButton key={item.id} item={item} active={active} tipSide="left" onActivate={activate} />
          ))}
        </div>
      </nav>
    </>
  )
}
