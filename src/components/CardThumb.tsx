/** Square image box for directory / list cards. Placeholder if no src. */
export function CardThumb({
  src,
  label,
  glyph,
}: {
  src?: string
  label: string
  /** Shown when there is no image (initials or a CRT glyph). */
  glyph?: string
}) {
  const initials = cardInitials(label)
  return (
    <span className="card-thumb" aria-hidden>
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="card-thumb-ph">{glyph ?? initials}</span>
      )}
    </span>
  )
}

export function cardInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
