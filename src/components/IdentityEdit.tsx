import { useState } from 'react'
import {
  FIND_ME_HINT,
  IDENTITY_EXPR_LABEL,
  IDENTITY_EXPRS,
  overlayLook,
  type IdentityExtras,
} from '../lib/identity'
import type { SpaceExpr, SpaceKind, SpaceRecord } from '../lib/space'
import { SpaceCard } from './SpaceCard'

export function IdentityEdit({
  kind,
  base,
  value,
  onChange,
}: {
  kind: SpaceKind
  base: SpaceRecord
  value: IdentityExtras
  onChange: (next: IdentityExtras) => void
}) {
  const [expr, setExpr] = useState<SpaceExpr>('thumb')
  const look = value.looks[expr]
  const preview = overlayLook({ ...base, looks: value.looks, findMe: value.findMe }, expr)

  const patchLook = (partial: Partial<typeof look>) => {
    onChange({
      ...value,
      looks: { ...value.looks, [expr]: { ...look, ...partial } },
    })
  }

  return (
    <section className="identity-edit" data-shell="identity-edit">
      <h2 className="profile-section-title">Find Me</h2>
      <p className="dim hz-lead">{FIND_ME_HINT[kind]}</p>
      <label className="hz-field">
        <span>Find Me</span>
        <textarea
          className="profile-input profile-textarea"
          rows={2}
          value={value.findMe}
          onChange={(e) => onChange({ ...value, findMe: e.target.value })}
          placeholder="Freeform terms SEARCH should match"
          aria-label="Find Me"
          data-shell="find-me"
        />
      </label>
      <h2 className="profile-section-title">Look</h2>
      <p className="dim hz-lead">Thumbnail, bar, and page are three expressions of the same identity.</p>
      <div className="pane-views" role="tablist" aria-label="Identity expression">
        {IDENTITY_EXPRS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            className={`finder-chip${expr === id ? ' is-on' : ''}`}
            aria-selected={expr === id}
            data-expr-edit={id}
            onClick={() => setExpr(id)}
          >
            {IDENTITY_EXPR_LABEL[id]}
          </button>
        ))}
      </div>
      <label className="hz-field">
        <span>{IDENTITY_EXPR_LABEL[expr]} title</span>
        <input
          className="profile-input"
          value={look.title}
          onChange={(e) => patchLook({ title: e.target.value })}
          placeholder={base.title || 'Uses the identity title'}
        />
      </label>
      <label className="hz-field">
        <span>{IDENTITY_EXPR_LABEL[expr]} subtitle</span>
        <input
          className="profile-input"
          value={look.subtitle}
          onChange={(e) => patchLook({ subtitle: e.target.value })}
          placeholder={base.subtitle || 'Uses the identity subtitle'}
        />
      </label>
      <label className="hz-field">
        <span>{IDENTITY_EXPR_LABEL[expr]} image URL</span>
        <input
          className="profile-input"
          value={look.imageUrl}
          onChange={(e) => patchLook({ imageUrl: e.target.value })}
          placeholder="https://… (optional stub)"
        />
      </label>
      <div className="identity-preview-slot" data-shell="identity-preview">
        <SpaceCard space={preview} expr={expr} />
      </div>
    </section>
  )
}
