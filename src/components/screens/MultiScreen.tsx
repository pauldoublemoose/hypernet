import { useLayoutEffect, useState } from 'react'
import { useKeys } from '../../hooks'
import type { InputMode } from '../TerminalFrame'

export interface MultiOption {
  id: string
  label: string
}

export function MultiScreen({
  title,
  text,
  options,
  initial,
  onSubmit,
  onBack,
  setMode,
}: {
  title?: string
  text: string
  options: MultiOption[]
  initial: string[]
  onSubmit: (ids: string[]) => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(initial))
  const [hl, setHl] = useState(0)

  useLayoutEffect(() => setMode('NAV'), [setMode])

  const toggle = (id: string) =>
    setSel((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const submit = () => onSubmit(options.filter((o) => sel.has(o.id)).map((o) => o.id))

  useKeys((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHl((h) => (h + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHl((h) => (h - 1 + options.length) % options.length)
    } else if (e.key === ' ') {
      e.preventDefault()
      toggle(options[hl].id)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      onBack()
    }
  })

  return (
    <div className="screen">
      {title && <div className="title">{title}</div>}
      <div className="q-text">{text}</div>
      <div className="opts">
        {options.map((o, i) => (
          <div
            key={o.id}
            className={`opt ${i === hl ? 'hl' : ''}`}
            onMouseEnter={() => setHl(i)}
            onClick={() => toggle(o.id)}
          >
            <div className="opt-label">
              {i === hl ? '> ' : '\u00a0\u00a0'}
              [{sel.has(o.id) ? 'X' : '\u00a0'}] {o.label}
            </div>
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn" onClick={submit}>
          [ CONTINUE ]
        </button>
      </div>
      <div className="screen-hint">SPACE / CLICK to tick · ENTER to continue</div>
    </div>
  )
}
