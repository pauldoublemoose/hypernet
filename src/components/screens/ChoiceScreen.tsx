import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useKeys } from '../../hooks'
import type { InputMode } from '../TerminalFrame'

export interface ChoiceOption {
  id: string
  label: string
  desc?: string
}

function isPhoneUi() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 700px), (pointer: coarse)').matches
  )
}

export function ChoiceScreen({
  title,
  text,
  options,
  onSelect,
  onBack,
  setMode,
  children,
}: {
  title?: string
  text?: string
  options: ChoiceOption[]
  onSelect: (id: string) => void
  onBack?: () => void
  setMode: (m: InputMode) => void
  children?: ReactNode
}) {
  const [hl, setHl] = useState(0)

  useLayoutEffect(() => setMode('NAV'), [setMode])

  useKeys((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHl((h) => (h + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHl((h) => (h - 1 + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(options[hl].id)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      onBack?.()
    }
  })

  const onOptClick = (i: number) => {
    // Phone: tap only marks the option; ENTER confirms.
    // Desktop: click still confirms immediately.
    if (isPhoneUi()) setHl(i)
    else onSelect(options[i].id)
  }

  return (
    <div className="screen">
      {title && <div className="title">{title}</div>}
      {text && <div className="q-text">{text}</div>}
      {children}
      <div className="opts" role="listbox">
        {options.map((o, i) => (
          <div
            key={o.id}
            className={`opt ${i === hl ? 'hl' : ''}`}
            onMouseEnter={() => {
              if (!isPhoneUi()) setHl(i)
            }}
            onClick={() => onOptClick(i)}
            role="option"
            aria-selected={i === hl}
          >
            <div className="opt-label">
              {i === hl ? '> ' : '\u00a0\u00a0'}
              {o.label}
            </div>
            {o.desc && <div className="opt-desc">{o.desc}</div>}
          </div>
        ))}
      </div>
      {isPhoneUi() && (
        <div className="screen-hint">TAP to mark · ENTER to confirm</div>
      )}
    </div>
  )
}
