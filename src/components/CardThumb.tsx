import { getPerson, selfId } from '../lib/contactsStore'
import { resolveAvatarUrl } from '../lib/defaultAvatars'

/** Image box for directory / list cards. Placeholder if no src. People use circle. */
export function CardThumb({
  src,
  label,
  glyph,
  size = 'md',
  shape = 'square',
}: {
  src?: string
  label: string
  /** Shown when there is no image (initials or a CRT glyph). */
  glyph?: string
  size?: 'sm' | 'md'
  /** Circle for people; square for events / clusters. */
  shape?: 'square' | 'circle'
}) {
  const initials = cardInitials(label)
  return (
    <span
      className={`card-thumb${size === 'sm' ? ' is-sm' : ''}${shape === 'circle' ? ' is-circle' : ''}`}
      aria-hidden
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="card-thumb-ph">{glyph ?? initials}</span>
      )}
    </span>
  )
}

/** Overlapping member pics for cluster cards — not used on private lists. */
export function MemberStack({ ids, max = 4 }: { ids: string[]; max?: number }) {
  const shown = ids.slice(0, max)
  const extra = ids.length - shown.length
  return (
    <span className="member-stack" aria-hidden>
      {shown.map((id) => {
        const p = getPerson(id)
        const label = id === selfId() ? 'You' : (p?.displayName ?? id)
        return (
          <CardThumb
            key={id}
            src={resolveAvatarUrl(id, p?.imageUrl)}
            label={label}
            size="sm"
            shape="circle"
          />
        )
      })}
      {extra > 0 ? <span className="member-stack-more">+{extra}</span> : null}
    </span>
  )
}

export function cardInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
