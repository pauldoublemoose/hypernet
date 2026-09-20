import { SPACE_KIND_LABEL, type SpaceExpr, type SpaceRecord } from '../lib/space'
import { CardThumb } from './CardThumb'

function Expiry({ at }: { at?: string }) {
  if (!at) return null
  return (
    <span className="space-exp dim" data-space-exp={at}>
      EXP {at}
    </span>
  )
}

export function SpaceCard({
  space,
  expr,
  hot,
  onHover,
  onOpen,
}: {
  space: SpaceRecord
  expr: SpaceExpr
  hot?: boolean
  onHover?: (space: SpaceRecord | null) => void
  onOpen?: (space: SpaceRecord) => void
}) {
  const shape = space.kind === 'person' ? 'circle' : 'square'
  const thumbSize = expr === 'row' ? 'sm' : 'md'

  if (expr === 'page') {
    return (
      <article className="space-card is-page" data-space-expr="page" data-space-kind={space.kind}>
        <CardThumb src={space.imageUrl} label={space.title} shape={shape} />
        <p className="space-kicker">{SPACE_KIND_LABEL[space.kind]}</p>
        <h2 className="space-title">{space.title}</h2>
        <p className="space-sub dim">{space.subtitle}</p>
        <Expiry at={space.expiresAt} />
        {space.body ? <p className="space-body">{space.body}</p> : null}
      </article>
    )
  }

  if (expr === 'thumb') {
    return (
      <button
        type="button"
        className={`space-card is-thumb${hot ? ' is-hot' : ''}`}
        data-space-expr="thumb"
        data-space-kind={space.kind}
        onMouseEnter={() => onHover?.(space)}
        onFocus={() => onHover?.(space)}
        onMouseLeave={() => onHover?.(null)}
        onBlur={() => onHover?.(null)}
        onClick={() => onOpen?.(space)}
      >
        <CardThumb src={space.imageUrl} label={space.title} shape={shape} size={thumbSize} />
        <span className="space-title">{space.title}</span>
        <span className="space-sub dim">{space.subtitle}</span>
        <Expiry at={space.expiresAt} />
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`space-card is-row${hot ? ' is-hot' : ''}`}
      data-space-expr="row"
      data-space-kind={space.kind}
      onMouseEnter={() => onHover?.(space)}
      onFocus={() => onHover?.(space)}
      onMouseLeave={() => onHover?.(null)}
      onBlur={() => onHover?.(null)}
      onClick={() => onOpen?.(space)}
    >
      <CardThumb src={space.imageUrl} label={space.title} shape={shape} size="sm" />
      <span className="space-row-copy">
        <span className="space-title">{space.title}</span>
        <span className="space-sub dim">{space.subtitle}</span>
        <Expiry at={space.expiresAt} />
      </span>
      <span className="space-kicker dim">{SPACE_KIND_LABEL[space.kind]}</span>
    </button>
  )
}

