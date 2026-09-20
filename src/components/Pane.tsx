import type { ReactNode } from 'react'
import type { StreamView } from '../lib/stream'

export function Pane({
  title,
  mast,
  view,
  onView,
  headerEnd,
  children,
  ...rest
}: {
  title: string
  mast?: ReactNode
  view?: StreamView
  onView?: (v: StreamView) => void
  headerEnd?: ReactNode
  children: ReactNode
  'data-shell'?: string
}) {
  return (
    <div className="pane" {...rest}>
      <div className="pane-header-row">
        <h1 className="pane-header">{title}</h1>
        {headerEnd}
      </div>
      <div className="pane-stream">
        {mast || onView ? (
          <div className="pane-mast" data-shell="mast">
            {mast}
            {onView ? (
              <div className="pane-views" role="group" aria-label="Feed view">
                <button
                  type="button"
                  className={`finder-chip${view === 'row' ? ' is-on' : ''}`}
                  aria-pressed={view === 'row'}
                  data-view="row"
                  onClick={() => onView('row')}
                >
                  Rows
                </button>
                <button
                  type="button"
                  className={`finder-chip${view === 'thumb' ? ' is-on' : ''}`}
                  aria-pressed={view === 'thumb'}
                  data-view="thumbnail"
                  onClick={() => onView('thumb')}
                >
                  Thumbnails
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="pane-feed">{children}</div>
      </div>
    </div>
  )
}
