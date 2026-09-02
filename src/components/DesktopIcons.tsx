import { useUi } from '../ui'

export type ShellFeature = 'terminal' | 'graph' | 'admin' | 'profile'

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
  | 'theme'

type DeskIcon = {
  id: IconId
  glyph: string
  label: string
  locked: boolean
  tip: string
}

const ICONS: DeskIcon[] = [
  {
    id: 'terminal',
    glyph: '▮',
    label: 'TERM',
    locked: false,
    tip: 'Signup terminal — create your node',
  },
  {
    id: 'graph',
    glyph: '◈',
    label: 'NET',
    locked: false,
    tip: 'Network graph — the community as nodes',
  },
  {
    id: 'groups',
    glyph: '▦',
    label: 'GROUPS',
    locked: true,
    tip: 'Groups — a camp, crew, or collective. Coming soon.',
  },
  {
    id: 'events',
    glyph: '▣',
    label: 'EVENTS',
    locked: true,
    tip: 'Events — find and host gatherings. Coming soon.',
  },
  {
    id: 'horizons',
    glyph: '◎',
    label: 'HORIZON',
    locked: true,
    tip: 'Horizons — a shared calendar you can subscribe to. Coming soon.',
  },
  {
    id: 'profile',
    glyph: '◉',
    label: 'PROFILE',
    locked: false,
    tip: 'Profile — you in the network. Avatar, bio, skills, contact.',
  },
  {
    id: 'find',
    glyph: '※',
    label: 'Find the others',
    locked: true,
    tip: 'Find the others — search the network for people. Coming soon.',
  },
  {
    id: 'chronicle',
    glyph: '☰',
    label: 'LOG',
    locked: true,
    tip: 'Chronicle — your event history and roles. Coming soon.',
  },
  {
    id: 'admin',
    glyph: '◆',
    label: 'ADMIN',
    locked: false,
    tip: 'Admin ledger — passphrase gate (already in the welcome screen)',
  },
  {
    id: 'theme',
    glyph: '◐',
    label: 'THEME',
    locked: false,
    tip: 'Cycle color mode — WHITE / BLACK / POLYCHROME',
  },
]

export function DesktopIcons({
  active,
  onTerminal,
  onGraph,
  onAdmin,
  onProfile,
}: {
  active: ShellFeature
  onTerminal: () => void
  onGraph: () => void
  onAdmin: () => void
  onProfile: () => void
}) {
  const { theme, cycleTheme } = useUi()

  const activate = (id: IconId, locked: boolean) => {
    if (locked) return
    if (id === 'terminal') onTerminal()
    else if (id === 'graph') onGraph()
    else if (id === 'admin') onAdmin()
    else if (id === 'profile') onProfile()
    else if (id === 'theme') cycleTheme()
  }

  return (
    <nav className="desktop-icons" aria-label="Hypernet desktop">
      {ICONS.map((item) => {
        const on = item.id === active
        const tip =
          item.id === 'theme' ? `${item.tip} · now ${theme.toUpperCase()}` : item.tip
        return (
          <button
            key={item.id}
            type="button"
            className={`desk-icon${item.locked ? ' is-locked' : ''}${on ? ' is-on' : ''}`}
            aria-current={on ? 'page' : undefined}
            aria-disabled={item.locked || undefined}
            aria-label={item.tip}
            data-tip={tip}
            title={tip}
            onClick={() => activate(item.id, item.locked)}
          >
            <span className="desk-glyph" aria-hidden>
              {item.glyph}
              {item.locked && <span className="desk-lock" />}
            </span>
            <span className="desk-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
