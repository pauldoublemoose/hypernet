import { useLayoutEffect, useState } from 'react'
import { useKeys } from '../../hooks'
import { useUi } from '../../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import type { InputMode } from '../TerminalFrame'

const ADMIN_PASSWORD = 'moonshine'

export function AdminGateScreen({
  onUnlock,
  onBack,
  setMode,
}: {
  onUnlock: () => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [val, setVal] = useState('')
  const [nudge, setNudge] = useState(false)
  const [dialog, setDialog] = useState(false)
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('TXT')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  const tryUnlock = () => {
    if (val.trim().toLowerCase() === ADMIN_PASSWORD) onUnlock()
    else {
      setNudge(true)
      setVal('')
    }
  }

  useKeys(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        tryUnlock()
      } else if (e.key === 'Backspace' && (val === '' || !e.isTrusted)) {
        e.preventDefault()
        setDialog(true)
      }
    },
    !dialog,
  )

  return (
    <div className="screen">
      <div className="title">A :: ACCESS</div>
      <div className="q-text">AUTHORIZATION REQUIRED</div>
      <div className="prompt-row">
        <span className="prompt">&gt;</span>
        <input
          autoFocus
          type="password"
          autoComplete="current-password"
          value={val}
          spellCheck={false}
          onChange={(e) => {
            setNudge(false)
            setVal(e.target.value)
          }}
        />
      </div>
      <div className="btn-row">
        <button className="btn" onClick={tryUnlock}>
          [ UNLOCK ]
        </button>
        <button className="btn dim" onClick={onBack}>
          [ BACK ]
        </button>
      </div>
      <div className="screen-hint">
        {nudge ? 'ACCESS DENIED' : 'ENTER PASSPHRASE'}
      </div>
      {dialog && (
        <ConfirmDialog
          question="LEAVE ADMIN ACCESS?"
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
