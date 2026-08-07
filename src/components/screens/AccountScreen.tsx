import { useEffect, useLayoutEffect, useState } from 'react'
import { useKeys } from '../../hooks'
import { ADMIN_COLUMNS, cellValue, type SignupRow } from '../../lib/adminStore'
import { claimSignups, fetchMySignup, getSession, signOut } from '../../lib/auth'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

type OwnedSignup = SignupRow & { id: string }
type Stage = 'loading' | 'anon' | 'empty' | 'node'

export function AccountScreen({
  onEdit,
  onSignup,
  onLogin,
  onExit,
  setMode,
}: {
  onEdit: (row: OwnedSignup) => void
  onSignup: () => void
  onLogin: () => void
  onExit: () => void
  setMode: (m: InputMode) => void
}) {
  const [stage, setStage] = useState<Stage>('loading')
  const [row, setRow] = useState<OwnedSignup | null>(null)
  const [email, setEmail] = useState('')
  const [hl, setHl] = useState(0)
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const session = await getSession()
      if (!alive) return
      if (!session) {
        setStage('anon')
        return
      }
      setEmail(session.user.email ?? '')
      // Idempotent: also covers logins that arrived via the emailed link
      // (which bypass the LoginScreen claim call).
      await claimSignups()
      const mine = await fetchMySignup()
      if (!alive) return
      if (mine?.id) {
        setRow(mine as OwnedSignup)
        setStage('node')
      } else {
        setStage('empty')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const logout = async () => {
    await signOut()
    onExit()
  }

  const actions: { label: string; dim?: boolean; run: () => void }[] =
    stage === 'anon'
      ? [
          { label: '[ LOGIN ]', run: onLogin },
          { label: '[ BACK ]', dim: true, run: onExit },
        ]
      : stage === 'node'
        ? [
            { label: '[ EDIT NODE ]', run: () => row && onEdit(row) },
            { label: '[ LOGOUT ]', dim: true, run: logout },
            { label: '[ BACK ]', dim: true, run: onExit },
          ]
        : [
            { label: '[ CREATE NODE ]', run: onSignup },
            { label: '[ LOGOUT ]', dim: true, run: logout },
            { label: '[ BACK ]', dim: true, run: onExit },
          ]

  useKeys((e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setHl((h) => (h + actions.length - 1) % actions.length)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setHl((h) => (h + 1) % actions.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      actions[hl]?.run()
    } else if (e.key === 'Backspace' && !e.isTrusted) {
      e.preventDefault()
      onExit()
    }
  })

  const summary =
    row === null
      ? []
      : ADMIN_COLUMNS.map((c) => ({ label: c.label, value: cellValue(row, c.id) })).filter(
          (r) => r.value !== '',
        )

  return (
    <div className="screen">
      <div className="title">L :: YOUR NODE</div>
      {stage === 'loading' && <div className="term-log">&gt; RETRIEVING NODE…</div>}
      {stage === 'anon' && (
        <div className="term-log">&gt; NO ACTIVE SESSION. LOGIN TO ACCESS YOUR NODE.</div>
      )}
      {stage === 'empty' && (
        <div className="term-log">
          <div>&gt; LOGGED IN AS {email.toUpperCase()}</div>
          <div>&gt; NO NODE MATCHES THIS EMAIL YET.</div>
        </div>
      )}
      {stage === 'node' && (
        <div className="term-log">
          <div>&gt; LOGGED IN AS {email.toUpperCase()}</div>
          {summary.map((r) => (
            <div key={r.label}>
              &gt; {r.label}: {r.value.toUpperCase()}
            </div>
          ))}
        </div>
      )}
      {stage !== 'loading' && (
        <div className="btn-row">
          {actions.map((a, i) => (
            <button
              key={a.label}
              className={`btn ${a.dim ? 'dim ' : ''}${hl === i ? 'hl' : ''}`}
              onMouseEnter={() => setHl(i)}
              onClick={a.run}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
