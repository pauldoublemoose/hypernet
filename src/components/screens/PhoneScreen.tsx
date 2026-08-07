import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useKeys } from '../../hooks'
import { digitsOnly, joinPhone, splitPhone } from '../../lib/contact'
import { useUi } from '../../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import type { InputMode } from '../TerminalFrame'

export function PhoneScreen({
  title,
  question,
  initial,
  onSubmit,
  onBack,
  setMode,
}: {
  title?: string
  question: string
  initial?: string
  onSubmit: (value: string | undefined) => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const split = splitPhone(initial, '')
  const [code, setCode] = useState(split.code)
  const [number, setNumber] = useState(split.number)
  const [focusField, setFocusField] = useState<'code' | 'number'>('number')
  const [dialog, setDialog] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  const numberRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => setMode(dialog ? 'NAV' : 'TXT'), [dialog, setMode])

  const { setEnterArmed } = useUi()
  useLayoutEffect(() => {
    setEnterArmed(true)
  }, [setEnterArmed])

  useEffect(() => {
    if (dialog) {
      codeRef.current?.blur()
      numberRef.current?.blur()
      return
    }
    const id = window.setTimeout(() => {
      ;(focusField === 'code' ? codeRef : numberRef).current?.focus()
    }, 0)
    return () => window.clearTimeout(id)
  }, [dialog, focusField])

  const trySubmit = () => {
    const c = digitsOnly(code, 4)
    const n = digitsOnly(number, 15)
    if (!c && !n) {
      onSubmit(undefined)
      return
    }
    if (!c || !n) {
      setNudge('ENTER BOTH COUNTRY CODE AND NUMBER — OR SKIP')
      return
    }
    if (c.length < 1 || n.length < 4) {
      setNudge('NUMBER LOOKS TOO SHORT')
      return
    }
    onSubmit(joinPhone(c, n))
  }

  useKeys(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        trySubmit()
      } else if (e.key === 'Tab') {
        // Handled globally too, but keep focus cycling between the two fields.
        e.preventDefault()
        setFocusField((f) => (f === 'code' ? 'number' : 'code'))
        setNudge(null)
      } else if (e.key === 'Backspace') {
        const empty = code === '' && number === ''
        if (empty || !e.isTrusted) {
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
      <div className="phone-row">
        <div className={`phone-code ${focusField === 'code' ? 'focused' : ''}`}>
          <span className="phone-plus">+</span>
          <input
            ref={codeRef}
            inputMode="numeric"
            autoComplete="tel-country-code"
            spellCheck={false}
            maxLength={4}
            value={code}
            placeholder="46"
            onFocus={() => setFocusField('code')}
            onChange={(e) => {
              setNudge(null)
              setCode(digitsOnly(e.target.value, 4))
            }}
          />
        </div>
        <div className={`phone-number ${focusField === 'number' ? 'focused' : ''}`}>
          <input
            ref={numberRef}
            inputMode="tel"
            autoComplete="tel-national"
            spellCheck={false}
            maxLength={15}
            value={number}
            placeholder="701234567"
            onFocus={() => setFocusField('number')}
            onChange={(e) => {
              setNudge(null)
              setNumber(digitsOnly(e.target.value, 15))
            }}
          />
        </div>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={trySubmit}>
          [ OK ]
        </button>
        <button
          className="btn dim"
          onClick={() => {
            setCode('')
            setNumber('')
            onSubmit(undefined)
          }}
        >
          [ SKIP ]
        </button>
      </div>
      <div className="screen-hint">
        {nudge ?? 'COUNTRY CODE · NUMBER · TAB to switch · ENTER confirm · SKIP empty'}
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
