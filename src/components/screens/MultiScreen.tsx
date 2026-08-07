import { useLayoutEffect, useState } from 'react'
import { useKeys, useScrollHlIntoView } from '../../hooks'
import { useUi } from '../../ui'
import { ConfirmDialog } from '../ConfirmDialog'
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
  confirmIfSingle,
}: {
  title?: string
  text: string
  options: MultiOption[]
  initial: string[]
  onSubmit: (ids: string[]) => void
  onBack: () => void
  setMode: (m: InputMode) => void
  /** If true, submitting with exactly one tick asks for confirmation. */
  confirmIfSingle?: boolean
}) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(initial))
  const [hl, setHl] = useState(0)
  const [nudge, setNudge] = useState(false)
  const [confirmSingle, setConfirmSingle] = useState(false)
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  const toggle = (id: string) => {
    setNudge(false)
    setSel((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedIds = () => options.filter((o) => sel.has(o.id)).map((o) => o.id)

  const finish = () => onSubmit(selectedIds())

  const submit = () => {
    const ids = selectedIds()
    if (ids.length === 0) {
      setNudge(true)
      return
    }
    if (confirmIfSingle && ids.length === 1) {
      setConfirmSingle(true)
      return
    }
    finish()
  }

  useKeys(
    (e) => {
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
    },
    !confirmSingle,
  )

  useScrollHlIntoView(hl)

  return (
    <div className="screen">
      {title && <div className="title">{title}</div>}
      <div className="q-text">{text}</div>
      <div className="opts">
        {options.map((o, i) => (
          <div
            key={o.id}
            className={`opt ${i === hl ? 'hl' : ''}`}
            onMouseEnter={() => {
              if (window.matchMedia('(pointer: fine)').matches) setHl(i)
            }}
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
      <div className="screen-hint">
        {nudge
          ? 'SELECT AT LEAST ONE OPTION'
          : 'SPACE / CLICK to tick · ENTER to continue'}
      </div>
      {confirmSingle && (
        <ConfirmDialog
          question="ONLY ONE CHANNEL SELECTED. CONTINUE WITHOUT ADDING MORE?"
          onYes={() => {
            setConfirmSingle(false)
            finish()
          }}
          onNo={() => setConfirmSingle(false)}
        />
      )}
    </div>
  )
}
