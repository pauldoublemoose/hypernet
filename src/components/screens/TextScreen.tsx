import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useKeys } from '../../hooks'
import { isValidEmail, normalizeEmail } from '../../lib/contact'
import { useUi } from '../../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import type { InputMode } from '../TerminalFrame'

export function TextScreen({
  title,
  question,
  hint,
  multiline,
  initial,
  kind,
  required,
  onDraftChange,
  onSubmit,
  onBack,
  setMode,
}: {
  title?: string
  question: string
  hint?: string
  multiline?: boolean
  initial?: string
  /** When 'email', non-empty values must pass a light format check. */
  kind?: 'text' | 'email'
  /** Disallow empty submissions and hide the SKIP button. */
  required?: boolean
  /** Live value updates while typing (uncommitted), e.g. for draft autosave. */
  onDraftChange?: (value: string) => void
  onSubmit: (value: string) => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [val, setVal] = useState(initial ?? '')
  const [dialog, setDialog] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useLayoutEffect(() => setMode(dialog ? 'NAV' : 'TXT'), [dialog, setMode])

  const { setEnterArmed } = useUi()
  useLayoutEffect(() => {
    setEnterArmed(true)
  }, [setEnterArmed])

  useEffect(() => {
    if (dialog) {
      inputRef.current?.blur()
      return
    }
    // Defer: closing the dialog can leave focus on BODY after the button unmounts.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [dialog])

  const trySubmit = (raw: string) => {
    const trimmed = raw.trim()
    if (required && !trimmed) {
      setNudge(kind === 'email' ? 'AN EMAIL IS REQUIRED HERE' : 'THIS FIELD IS REQUIRED')
      return
    }
    if (kind === 'email') {
      if (trimmed && !isValidEmail(trimmed)) {
        setNudge(required ? 'EMAIL LOOKS INCOMPLETE — PLEASE FIX IT' : 'EMAIL LOOKS INCOMPLETE — FIX IT OR SKIP')
        return
      }
      onSubmit(trimmed ? normalizeEmail(trimmed) : '')
      return
    }
    onSubmit(trimmed)
  }

  useKeys(
    (e) => {
      if (e.key === 'Enter') {
        if (multiline && e.shiftKey) return // shift+enter = newline in textarea
        e.preventDefault()
        trySubmit(val)
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

  const onChange = (next: string) => {
    setNudge(null)
    // Friendly email constraint: no spaces; keep typing case, normalize on submit.
    const cleaned = kind === 'email' ? next.replace(/\s/g, '').slice(0, 254) : next
    setVal(cleaned)
    onDraftChange?.(cleaned)
  }

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
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            autoFocus
            type={kind === 'email' ? 'email' : 'text'}
            inputMode={kind === 'email' ? 'email' : undefined}
            autoComplete={kind === 'email' ? 'email' : undefined}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
          />
        )}
      </div>
      <div className="btn-row">
        <button className="btn" onClick={() => trySubmit(val)}>
          [ OK ]
        </button>
        {!required && (
          <button className="btn dim" onClick={() => onSubmit('')}>
            [ SKIP ]
          </button>
        )}
      </div>
      <div className="screen-hint">
        {nudge ?? hint ?? null}
      </div>
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
