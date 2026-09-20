import { useEffect, useRef, useState } from 'react'
import { useKeys } from '../../hooks'
import { hasSavedProfile } from '../../lib/profileStore'
import {
  DEMO_SELF,
  PEER_LINES,
  SESSION_MS,
  pairMystery,
  type MysteryMatch,
} from '../../lib/mysteryPool'

type Line = { id: string; from: 'you' | 'them'; text: string }

type Phase =
  | { kind: 'booth' }
  | { kind: 'pooling' }
  | { kind: 'live'; match: MysteryMatch; endsAt: number; lines: Line[]; note: string | null }
  | { kind: 'ended'; note: string | null }

function remainLabel(endsAt: number, now: number) {
  const s = Math.max(0, Math.ceil((endsAt - now) / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export function MysteryChatScreen({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'booth' })
  const [draft, setDraft] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const timers = useRef<number[]>([])
  const signedIn = hasSavedProfile()

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    if (phase.kind !== 'live') return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [phase.kind])

  useEffect(() => {
    if (phase.kind !== 'live') return
    if (now < phase.endsAt) return
    setPhase({ kind: 'ended', note: 'time is up.' })
  }, [now, phase])

  const goBooth = () => {
    clearTimers()
    setDraft('')
    setPhase({ kind: 'booth' })
  }

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.isTrusted && e.key === 'Backspace')
      return
    e.preventDefault()
    if (phase.kind === 'live' || phase.kind === 'pooling') {
      setPhase({ kind: 'ended', note: 'you hung up.' })
      return
    }
    if (phase.kind === 'ended') {
      goBooth()
      return
    }
    onBack()
  })

  const join = () => {
    setPhase({ kind: 'pooling' })
    const id = window.setTimeout(() => {
      const match = pairMystery(DEMO_SELF.city, DEMO_SELF.event)
      setNow(Date.now())
      setPhase({
        kind: 'live',
        match,
        endsAt: Date.now() + SESSION_MS,
        lines: [],
        note: null,
      })
    }, 450)
    timers.current.push(id)
  }

  const send = () => {
    if (phase.kind !== 'live') return
    const text = draft.trim()
    if (!text) return
    const you: Line = { id: `y-${Date.now()}`, from: 'you', text }
    setDraft('')
    setPhase({ ...phase, lines: [...phase.lines, you] })
    const reply = PEER_LINES[phase.lines.filter((l) => l.from === 'them').length % PEER_LINES.length]
    const id = window.setTimeout(() => {
      setPhase((cur) => {
        if (cur.kind !== 'live') return cur
        return {
          ...cur,
          lines: [...cur.lines, { id: `t-${Date.now()}`, from: 'them', text: reply }],
        }
      })
    }, 400)
    timers.current.push(id)
  }

  const hangUp = (note: string) => {
    clearTimers()
    setPhase({ kind: 'ended', note })
  }

  return (
    <div className="screen hz-screen mystery-screen" data-shell="mystery">
      <div className="title">MC :: MYSTERY CHAT</div>
      <p className="dim hz-lead">
        Anonymous 1:1 booth. No names. Fifteen minutes.{' '}
        {signedIn ? 'You are signed in on this node.' : 'No session — local demo signed-in.'}
      </p>
      {phase.kind === 'booth' ? (
        <section className="mystery-booth" data-shell="mystery-booth">
          <p className="mystery-earpiece" aria-hidden>
            ⌕
          </p>
          <p>Drop a coin. Join the pool. Match a handset that shares a soft signal, or a random line.</p>
          <div className="btn-row">
            <button type="button" className="btn" data-shell="mystery-join" onClick={join}>
              [ JOIN THE POOL ]
            </button>
          </div>
        </section>
      ) : null}
      {phase.kind === 'pooling' ? (
        <p className="mystery-wait" data-shell="mystery-pooling">
          coin in the slot · hunting a handset…
        </p>
      ) : null}
      {phase.kind === 'live' ? (
        <section className="mystery-live" data-shell="mystery-live">
          <p>
            matched <span data-shell="mystery-alias">{phase.match.alias}</span>
          </p>
          <p className="dim" data-shell="mystery-reason">
            {phase.match.reason}
          </p>
          <p className="dim">time left {remainLabel(phase.endsAt, now)}</p>
          <ul className="mystery-thread">
            {phase.lines.map((line) => (
              <li
                key={line.id}
                className="mystery-line"
                data-shell={line.from === 'you' ? 'mystery-you' : 'mystery-them'}
              >
                <span className="dim">{line.from === 'you' ? 'YOU' : phase.match.alias}</span>
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
          <label className="hz-field">
            <span>Say</span>
            <input
              className="profile-input"
              data-shell="mystery-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  send()
                }
              }}
            />
          </label>
          <div className="btn-row">
            <button type="button" className="btn" data-shell="mystery-send" onClick={send} disabled={!draft.trim()}>
              [ SEND ]
            </button>
            <button type="button" className="btn dim" data-shell="mystery-leave" onClick={() => hangUp('you hung up.')}>
              [ LEAVE ]
            </button>
            <button type="button" className="btn dim" onClick={() => hangUp('reported. stub.')}>
              [ REPORT ]
            </button>
            <button type="button" className="btn dim" onClick={() => hangUp('blocked. stub.')}>
              [ BLOCK ]
            </button>
          </div>
        </section>
      ) : null}
      {phase.kind === 'ended' ? (
        <section className="mystery-ended" data-shell="mystery-ended">
          <p>{phase.note ?? 'line closed.'}</p>
          <p className="dim">Identity stays hidden. Reveal is later.</p>
          <div className="btn-row">
            <button type="button" className="btn" data-shell="mystery-again" onClick={join}>
              [ CHAT AGAIN ]
            </button>
            <button type="button" className="btn dim" data-shell="mystery-vibe" onClick={() => hangUp('vibe noted. stub.')}>
              [ RATE VIBE ]
            </button>
            <button type="button" className="btn dim" onClick={goBooth}>
              [ BACK TO BOOTH ]
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
