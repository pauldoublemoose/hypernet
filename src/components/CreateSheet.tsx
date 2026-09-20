import { useState, type ReactNode } from 'react'
import { Pane } from './Pane'

export function CreateSheet({
  title,
  shell,
  onClose,
  ctaLabel,
  ctaDisabled,
  onCta,
  children,
}: {
  title: string
  shell: string
  onClose: () => void
  ctaLabel: string
  ctaDisabled: boolean
  onCta: () => void
  children: ReactNode
}) {
  return (
    <Pane
      title={title}
      data-shell={shell}
      headerEnd={
        <button type="button" className="create-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      }
    >
      <div className="create-sheet">
        {children}
        <button
          type="button"
          className="btn create-cta"
          data-shell="create-cta"
          disabled={ctaDisabled}
          onClick={onCta}
        >
          {ctaLabel}
        </button>
      </div>
    </Pane>
  )
}

export function CreateCover({ url, onUrl }: { url: string; onUrl: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`create-cover${url ? ' has-image' : ''}`}
      data-shell="create-cover"
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    >
      <button
        type="button"
        className="create-cover-add"
        data-shell="create-cover-add"
        onClick={() => setOpen((o) => !o)}
      >
        Add
      </button>
      {open ? (
        <label className="create-cover-field">
          <span className="visually-hidden">Cover image URL</span>
          <input
            className="profile-input"
            value={url}
            onChange={(e) => onUrl(e.target.value)}
            placeholder="Cover image URL"
            aria-label="Cover image URL"
          />
        </label>
      ) : null}
    </div>
  )
}

export function CreateAccord({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`create-accord${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="create-accord-btn"
        data-accord={id}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      {open ? <div className="create-accord-body">{children}</div> : null}
    </div>
  )
}
