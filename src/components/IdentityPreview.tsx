import type { SpaceRecord } from '../lib/space'
import { SpaceCard } from './SpaceCard'

export function IdentityPreview({
  space,
  onEnter,
  onLeave,
}: {
  space: SpaceRecord
  onEnter: () => void
  onLeave: () => void
}) {
  return (
    <aside
      className="identity-preview"
      data-shell="preview"
      aria-label={`Preview ${space.title}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <SpaceCard space={space} expr="thumb" />
    </aside>
  )
}
