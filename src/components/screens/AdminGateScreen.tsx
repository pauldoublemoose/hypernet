import { useEffect, useLayoutEffect, useState } from 'react'
import { useKeys } from '../../hooks'
import { isAdmin } from '../../lib/auth'
import { useSession } from '../../lib/session'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type Stage = 'checking' | 'anon' | 'denied'

/** Gate to the admin ledger: requires a logged-in session with admin role. */
export function AdminGateScreen({
  onUnlock,
  onLogin,
  onBack,
  setMode,
}: {
  onUnlock: () => void
  onLogin: () => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [stage, setStage] = useState<Stage>('checking')
  const { status } = useSession()
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'anon') {
      setStage('anon')
      return
    }
    let alive = true
    ;(async () => {
      const admin = await isAdmin()
      if (!alive) return
      if (admin) onUnlock()
      else setStage('denied')
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useKeys((e) => {
    if (e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault()
      onBack()
    } else if (e.key === 'Enter' && stage === 'anon') {
      e.preventDefault()
      onLogin()
    }
  })

  return (
    <div className="screen">
      <div className="title">A :: ACCESS</div>
      <div className="term-log">
        {stage === 'checking' && <div>&gt; VERIFYING CLEARANCE…</div>}
        {stage === 'anon' && <div>&gt; ADMIN ACCESS REQUIRES LOGIN.</div>}
        {stage === 'denied' && <div>&gt; ACCESS DENIED — THIS ACCOUNT HAS NO CLEARANCE.</div>}
      </div>
      {stage !== 'checking' && (
        <div className="btn-row">
          {stage === 'anon' && (
            <button className="btn hl" onClick={onLogin}>
              [ LOGIN ]
            </button>
          )}
          <button className="btn dim" onClick={onBack}>
            [ BACK ]
          </button>
        </div>
      )}
      <div className="screen-hint">
        {stage === 'anon' ? 'LOGIN, THEN TAP THE DOT AGAIN' : null}
      </div>
    </div>
  )
}
