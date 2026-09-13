import type { ReactNode } from 'react'

/** Small CRT overlay — search / pick lists without leaving the screen. */
export function CrtPopup({
  title,
  lead,
  onClose,
  children,
}: {
  title: string
  lead?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="dialog-backdrop crt-popup-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="dialog crt-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crt-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="crt-popup-title" className="dialog-q">
          {title}
        </div>
        {lead ? <p className="dim crt-popup-lead">{lead}</p> : null}
        <div className="crt-popup-body">{children}</div>
        <button type="button" className="btn dim" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
