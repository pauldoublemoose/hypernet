import { loadPeople } from '../lib/contactsStore'
import { type SpaceRecord } from '../lib/space'
import { SpaceCard } from './SpaceCard'

const MARKS: { id: string; x: number; y: number }[] = [
  { id: 'p-anna', x: 14, y: 28 },
  { id: 'p-rio', x: 38, y: 58 },
  { id: 'p-kai', x: 62, y: 22 },
  { id: 'p-mira', x: 78, y: 64 },
  { id: 'p-sasha', x: 22, y: 72 },
]

function personSpace(id: string): SpaceRecord | null {
  const p = loadPeople().find((row) => row.id === id)
  if (!p) return null
  return {
    kind: 'person',
    id: p.id,
    title: p.displayName,
    subtitle: `@${p.handle}`,
    body: p.bio ?? '',
    imageUrl: p.imageUrl,
  }
}

export function DesertField({
  hoverId,
  onHover,
}: {
  hoverId: string | null
  onHover: (space: SpaceRecord | null) => void
}) {
  return (
    <div className="desert-field" data-shell="desert">
      {MARKS.map((m) => {
        const space = personSpace(m.id)
        if (!space) return null
        return (
          <div
            key={space.id}
            className="identity-marker"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            <SpaceCard
              space={space}
              expr="thumb"
              hot={hoverId === space.id}
              onHover={onHover}
            />
          </div>
        )
      })}
    </div>
  )
}
