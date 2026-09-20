import { useState } from 'react'
import { loadFeed } from '../../lib/feed'
import type { StreamView } from '../../lib/stream'
import { useKeys } from '../../hooks'
import { Pane } from '../Pane'

export function FeedScreen({ onBack }: { onBack: () => void }) {
  const items = loadFeed()
  const [view, setView] = useState<StreamView>('row')

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    onBack()
  })

  return (
    <Pane
      title="FEED"
      data-shell="feed-page"
      view={view}
      onView={setView}
      mast={<p className="dim hz-lead">Personalised events. Stub. Burns and network news for now.</p>}
    >
      {view === 'row' ? (
        <ul className="stream-rows">
          {items.map((row) => (
            <li key={row.id} className="stream-row">
              <span className="stream-row-title">{row.title}</span>
              <span className="dim">{row.meta}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="stream-thumbs">
          {items.map((row) => (
            <article key={row.id} className="stream-thumb">
              <span className="stream-thumb-title">{row.title}</span>
              <span className="dim">{row.meta}</span>
            </article>
          ))}
        </div>
      )}
    </Pane>
  )
}
