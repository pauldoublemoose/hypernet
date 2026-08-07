import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useKeys } from '../../hooks'
import { claimSignups, requestLoginCode, verifyLoginCode } from '../../lib/auth'
import { isValidEmail, normalizeEmail } from '../../lib/contact'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type Stage = 'email' | 'code'

export function LoginScreen({
  onSuccess,
  onBack,
  setMode,
}: {
  onSuccess: () => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [val, setVal] = useState('')
  const [busy, setBusy] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => setMode('TXT'), [setMode])
  const { setEnterArmed } = useUi()
  useLayoutEffect(() => {
    setEnterArmed(true)
  }, [setEnterArmed])

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [stage])

  const sendCode = async () => {
    const addr = normalizeEmail(val.trim())
    if (!isValidEmail(addr)) {
      setNudge('EMAIL LOOKS INCOMPLETE — FIX IT AND RETRY')
      return
    }
    setBusy(true)
    setNudge('TRANSMITTING…')
    const res = await requestLoginCode(addr)
    setBusy(false)
    if (!res.ok) {
      setNudge(res.message ?? 'TRANSMISSION FAILED — TRY AGAIN')
      return
    }
    setEmail(addr)
    setVal('')
    setNudge(null)
    setStage('code')
  }

  const verify = async () => {
    const code = val.trim()
    if (!/^\d{6}$/.test(code)) {
      setNudge('ENTER THE 6-DIGIT CODE FROM THE EMAIL')
      return
    }
    setBusy(true)
    setNudge('VERIFYING…')
    const res = await verifyLoginCode(email, code)
    if (!res.ok) {
      setBusy(false)
      setNudge(res.message ?? 'ACCESS DENIED — CHECK THE CODE')
      return
    }
    await claimSignups()
    setBusy(false)
    onSuccess()
  }

  const submit = () => {
    if (busy) return
    if (stage === 'email') void sendCode()
    else void verify()
  }

  useKeys((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'Backspace') {
      if (val === '' || !e.isTrusted) {
        e.preventDefault()
        if (stage === 'code') {
          setStage('email')
          setVal(email)
          setNudge(null)
        } else {
          onBack()
        }
      }
    }
  })

  const onChange = (next: string) => {
    setNudge(null)
    if (stage === 'email') setVal(next.replace(/\s/g, '').slice(0, 254))
    else setVal(next.replace(/\D/g, '').slice(0, 6))
  }

  return (
    <div className="screen">
      <div className="title">L :: ACCESS</div>
      <div className="q-text">
        {stage === 'email'
          ? 'CLAIM YOUR NODE — ENTER THE EMAIL YOU SIGNED UP WITH:'
          : `ACCESS CODE SENT TO ${email.toUpperCase()} — ENTER IT BELOW:`}
      </div>
      <div className="prompt-row">
        <span className="prompt">&gt;</span>
        <input
          ref={inputRef}
          autoFocus
          type={stage === 'email' ? 'email' : 'text'}
          inputMode={stage === 'email' ? 'email' : 'numeric'}
          autoComplete={stage === 'email' ? 'email' : 'one-time-code'}
          value={val}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          disabled={busy}
        />
      </div>
      <div className="btn-row">
        <button className="btn" onClick={submit} disabled={busy}>
          {stage === 'email' ? '[ SEND CODE ]' : '[ VERIFY ]'}
        </button>
        {stage === 'code' && (
          <button
            className="btn dim"
            disabled={busy}
            onClick={() => {
              setStage('email')
              setVal(email)
              setNudge(null)
            }}
          >
            [ CHANGE EMAIL ]
          </button>
        )}
        <button className="btn dim" onClick={onBack} disabled={busy}>
          [ BACK ]
        </button>
      </div>
      <div className="screen-hint">
        {nudge ??
          (stage === 'email'
            ? 'A ONE-TIME ACCESS CODE WILL BE EMAILED TO YOU'
            : 'CHECK YOUR INBOX (AND SPAM) — THE CODE EXPIRES IN AN HOUR')}
      </div>
    </div>
  )
}
