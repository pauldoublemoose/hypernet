import { useLayoutEffect, useState } from 'react'
import { useKeys, useScrollHlIntoView } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

export function ConfirmSubmitScreen({
  onSubmit,
  onDiscard,
  onBack,
  setMode,
}: {
  onSubmit: () => void
  onDiscard: () => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [hl, setHl] = useState<number | null>(null)
  const [nudge, setNudge] = useState(false)
  const { setEnterArmed } = useUi()
  const options = [
    { id: 'submit', label: '[ SUBMIT ]' },
    { id: 'discard', label: '[ DISCARD ]' },
  ]

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(false)
    return () => setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useLayoutEffect(() => {
    setEnterArmed(hl !== null)
  }, [hl, setEnterArmed])

  const confirm = () => {
    if (hl === null) {
      setNudge(true)
      return
    }
    if (options[hl].id === 'submit') onSubmit()
    else onDiscard()
  }

  useKeys((e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setNudge(false)
      setHl((h) => (h === null ? 0 : (h + 1) % options.length))
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setNudge(false)
      setHl((h) => (h === null ? options.length - 1 : (h - 1 + options.length) % options.length))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      confirm()
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      onBack()
    }
  })

  useScrollHlIntoView(hl)

  return (
    <div className="screen">
      <div className="title">5C :: CONFIRM</div>
      <div className="q-text">Do you wish to submit your answers to the database?</div>
      <div className="opts">
        {options.map((o, i) => (
          <div
            key={o.id}
            className={`opt ${hl === i ? 'hl' : ''} ${o.id === 'submit' ? 'review-submit' : ''}`}
            onMouseEnter={() => {
              if (window.matchMedia('(pointer: fine)').matches) setHl(i)
            }}
            onClick={() => {
              setNudge(false)
              setHl(i)
              if (window.matchMedia('(pointer: fine)').matches) {
                if (o.id === 'submit') onSubmit()
                else onDiscard()
              }
            }}
            role="option"
            aria-selected={hl === i}
          >
            <div className="opt-label">
              {hl === i ? '> ' : '\u00a0\u00a0'}
              {o.label}
            </div>
          </div>
        ))}
      </div>
      <div className="screen-hint">
        {nudge ? 'SELECT SUBMIT OR DISCARD' : 'MARK an option · ENTER to confirm'}
      </div>
    </div>
  )
}
