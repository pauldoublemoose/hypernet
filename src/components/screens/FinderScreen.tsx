import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import {
  FINDER_KIND_LABEL,
  FINDER_KINDS,
  filterHasKind,
  querySpaces,
  toggleFinderFilter,
  type FinderFilter,
  type FinderView,
} from '../../lib/finder'
import { spaceKey, type SpaceRecord } from '../../lib/space'
import { SpaceCard } from '../SpaceCard'

export function FinderScreen({
  onBack,
  hover,
  onHover,
  onClearHover,
}: {
  onBack: () => void
  hover: SpaceRecord | null
  onHover: (space: SpaceRecord | null) => void
  onClearHover: () => void
}) {
  const [filter, setFilter] = useState<FinderFilter>({ mode: 'all' })
  const [view, setView] = useState<FinderView>('list')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<SpaceRecord | null>(null)
  const results = useMemo(() => querySpaces(filter, q), [filter, q])

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (open) {
      setOpen(null)
      return
    }
    onBack()
  })

  const openSpace = (space: SpaceRecord) => {
    onClearHover()
    setOpen(space)
  }

  if (open) {
    return (
      <div className="screen finder-screen" data-shell="finder">
        <h1 className="finder-title">SEARCH</h1>
        <div className="btn-row">
          <button type="button" className="btn dim" onClick={() => setOpen(null)}>
            [ BACK TO RESULTS ]
          </button>
        </div>
        <SpaceCard space={open} expr="page" />
      </div>
    )
  }

  return (
    <div className="screen finder-screen" data-shell="finder">
      <h1 className="finder-title">SEARCH</h1>
      <div className="finder-filters" role="group" aria-label="Search filters">
        <button
          type="button"
          className={`finder-chip${filter.mode === 'all' ? ' is-on' : ''}`}
          aria-pressed={filter.mode === 'all'}
          data-filter="all"
          onClick={() => setFilter(toggleFinderFilter(filter, 'all'))}
        >
          ALL
        </button>
        {FINDER_KINDS.map((kind) => {
          const on = filter.mode !== 'all' && filterHasKind(filter, kind)
          return (
            <button
              key={kind}
              type="button"
              className={`finder-chip${on ? ' is-on' : ''}`}
              aria-pressed={on}
              data-filter={kind}
              onClick={() => setFilter(toggleFinderFilter(filter, kind))}
            >
              {FINDER_KIND_LABEL[kind]}
            </button>
          )
        })}
      </div>
      <label className="hz-field finder-search">
        <span>Search</span>
        <input
          className="profile-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search names"
          aria-label="Search"
        />
      </label>
      <div className="finder-views" role="group" aria-label="Result view">
        <button
          type="button"
          className={`finder-chip${view === 'list' ? ' is-on' : ''}`}
          aria-pressed={view === 'list'}
          data-view="list"
          onClick={() => setView('list')}
        >
          List
        </button>
        <button
          type="button"
          className={`finder-chip${view === 'thumbnail' ? ' is-on' : ''}`}
          aria-pressed={view === 'thumbnail'}
          data-view="thumbnail"
          onClick={() => setView('thumbnail')}
        >
          Thumbnail
        </button>
      </div>
      {view === 'list' ? (
        <div className="finder-list">
          {results.map((space) => (
            <SpaceCard
              key={spaceKey(space)}
              space={space}
              expr="row"
              hot={hover ? spaceKey(hover) === spaceKey(space) : false}
              onHover={onHover}
              onOpen={openSpace}
            />
          ))}
        </div>
      ) : (
        <div className="finder-thumbs">
          {results.map((space) => (
            <SpaceCard
              key={spaceKey(space)}
              space={space}
              expr="thumb"
              hot={hover ? spaceKey(hover) === spaceKey(space) : false}
              onHover={onHover}
              onOpen={openSpace}
            />
          ))}
        </div>
      )}
      {results.length === 0 ? <p className="dim hz-lead">Nothing matches.</p> : null}
    </div>
  )
}
