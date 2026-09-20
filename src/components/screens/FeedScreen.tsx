import { loadFeed } from '../../lib/feed'
import { useKeys } from '../../hooks'

export function FeedScreen({ onBack }: { onBack: () => void }) {
  const items = loadFeed()

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    onBack()
  })

  return (
    <div className="screen hz-screen" data-shell="feed-page">
      <div className="title">F :: FEED</div>
      <p className="dim hz-lead">Personalised events. Stub. Burns and network news for now.</p>
      <ul className="hz-list">
        {items.map((row) => (
          <li key={row.id} className="hz-list-static">
            <span className="hz-list-title">{row.title}</span>
            <span className="dim">{row.meta}</span>
            <span className="hz-lead">{row.body}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
