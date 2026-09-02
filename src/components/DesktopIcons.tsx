export type ShellFeature = 'terminal' | 'graph' | 'admin' | 'profile' | 'settings' | 'events' | 'horizons' | 'my-horizons' | 'contacts'

type IconId =
  | 'terminal'
  | 'graph'
  | 'groups'
  | 'events'
  | 'horizons'
  | 'profile'
  | 'find'
  | 'chronicle'
  | 'admin'
  | 'settings'
  | 'my-group'
  | 'my-horizons'
  | 'contacts'

type DeskIcon = {
  id: IconId
  glyph: string
  label: string
  locked: boolean
  tip: string
}

/* TERM future tabs (no UI yet): 1 Global Chat, 2 Global Updates, 3 Update log (Hypernet), 4 About */

const LEFT_ICONS: DeskIcon[] = [
  {
    id: 'groups',
    glyph: '▦',
    label: 'GROUPS',
    locked: true,
    tip: 'Groups — a camp, crew, or collective. Coming soon.',
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
  {
    id: 'terminal',
    glyph: '▮',
    label: 'TERM',
    locked: true,
    tip: 'TERM locked for now. Later tabs: Global Chat, Global Updates, Update log, About.',
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
    label: 'CONTACTS',
    locked: false,
    tip: 'Contacts — lists, Follow, and Friend requests.',
  },
  {
    id: 'my-group',
    glyph: '▤',
    label: 'MY GROUP',
    locked: true,
    tip: 'My group — your camp or crew hub. Coming soon.',
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
}) {
  void onTerminal // TERM locked — optional for App compatibility
  const activate = (id: IconId, locked: boolean) => {
    if (locked) return
    if (id === 'graph') onGraph()
    else if (id === 'admin') onAdmin()
    else if (id === 'profile') onProfile()
    else if (id === 'settings') onSettings()
    else if (id === 'events') onEvents()
    else if (id === 'horizons') onHorizons()
    else if (id === 'my-horizons') onMyHorizons()
    else if (id === 'contacts') onContacts()
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
          {RIGHT_TOP.map((item) => (
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