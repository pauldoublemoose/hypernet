import { overlayLook } from '../lib/identity'
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
  const shown = overlayLook(space, expr)
  const shape = shown.kind === 'person' ? 'circle' : 'square'
  const thumbSize = expr === 'row' ? 'sm' : 'md'

  if (expr === 'page') {
    return (
      <article className="space-card is-page" data-space-expr="page" data-space-kind={shown.kind}>
        <CardThumb src={shown.imageUrl} label={shown.title} shape={shape} />
        <p className="space-kicker">{SPACE_KIND_LABEL[shown.kind]}</p>
        <h2 className="space-title">{shown.title}</h2>
        <p className="space-sub dim">{shown.subtitle}</p>
        <Expiry at={shown.expiresAt} />
        {shown.body ? <p className="space-body">{shown.body}</p> : null}
      </article>
    )
  }

  if (expr === 'thumb') {
    return (
      <button
        type="button"
        className={`space-card is-thumb${hot ? ' is-hot' : ''}`}
        data-space-expr="thumb"
        data-space-kind={shown.kind}
        onMouseEnter={() => onHover?.(shown)}
        onFocus={() => onHover?.(shown)}
        onMouseLeave={() => onHover?.(null)}
        onBlur={() => onHover?.(null)}
        onClick={() => onOpen?.(shown)}
      >
        <CardThumb src={shown.imageUrl} label={shown.title} shape={shape} size={thumbSize} />
        <span className="space-title">{shown.title}</span>
        <span className="space-sub dim">{shown.subtitle}</span>
        <Expiry at={shown.expiresAt} />
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`space-card is-row${hot ? ' is-hot' : ''}`}
      data-space-expr="row"
      data-space-kind={shown.kind}
      onMouseEnter={() => onHover?.(shown)}
      onFocus={() => onHover?.(shown)}
      onMouseLeave={() => onHover?.(null)}
      onBlur={() => onHover?.(null)}
      onClick={() => onOpen?.(shown)}
    >
      <CardThumb src={shown.imageUrl} label={shown.title} shape={shape} size="sm" />
      <span className="space-row-copy">
        <span className="space-title">{shown.title}</span>
        <span className="space-sub dim">{shown.subtitle}</span>
        <Expiry at={shown.expiresAt} />
      </span>
      <span className="space-kicker dim">{SPACE_KIND_LABEL[shown.kind]}</span>
    </button>
  )
}

