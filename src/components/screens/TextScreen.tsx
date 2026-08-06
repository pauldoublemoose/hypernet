import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useKeys } from '../../hooks'
import { ConfirmDialog } from '../ConfirmDialog'
import type { InputMode } from '../TerminalFrame'

export function TextScreen({
  title,
  question,
  hint,
  multiline,
  initial,
  onSubmit,
  onBack,
  setMode,
}: {
  title?: string
  question: string
  hint?: string
  multiline?: boolean
  initial?: string
  onSubmit: (value: string) => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [val, setVal] = useState(initial ?? '')
  const [dialog, setDialog] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useLayoutEffect(() => setMode(dialog ? 'NAV' : 'TXT'), [dialog, setMode])

  useEffect(() => {
    if (!dialog) inputRef.current?.focus()
    else inputRef.current?.blur()
  }, [dialog])

  useKeys(
    (e) => {
      if (e.key === 'Enter') {
        if (multiline && e.shiftKey) return // shift+enter = newline in textarea
        e.preventDefault()
        onSubmit(val.trim())
      } else if (e.key === 'Backspace') {
        // Trusted backspace with content edits the field normally.
        // On an empty field (or from the mobile BACK button) it means "go back".
        if (val === '' || !e.isTrusted) {
          e.preventDefault()
          setDialog(true)
        }
      }
    },
    !dialog,
  )

  return (
    <div className="screen">
      {title && <div className="title">{title}</div>}
      <div className="q-text">{question}</div>
      <div className="prompt-row">
        <span className="prompt">&gt;</span>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            autoFocus
            rows={4}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            spellCheck={false}
          />
        )}
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => onSubmit(val.trim())}>
          [ OK ]
        </button>
        <button className="btn dim" onClick={() => onSubmit('')}>
          [ SKIP ]
        </button>
      </div>
      {hint && <div className="screen-hint">{hint}</div>}
      {dialog && (
        <ConfirmDialog
          question="GO BACK TO PREVIOUS QUESTION?"
          onYes={() => {
            setDialog(false)
            onBack()
          }}
          onNo={() => setDialog(false)}
        />
      )}
    </div>
  )
}
