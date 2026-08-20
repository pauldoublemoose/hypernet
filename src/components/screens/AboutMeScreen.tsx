import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useKeys } from '../../hooks'
import { fetchMySignup } from '../../lib/auth'
import { updateAboutText } from '../../lib/supabase'
import { useUi } from '../../ui'
import { ConfirmDialog } from '../ConfirmDialog'
import type { InputMode } from '../TerminalFrame'

/** Mirrors the signups_about_len check constraint in the database. */
const MAX_ABOUT_LENGTH = 4000

type Stage = 'loading' | 'missing' | 'ready'

/**
 * Freeform "about me" editor for the caller's own node. Unlike the wizard's
 * multiline steps, ENTER inserts a newline here — this is a document, not an
 * answer — and saving is explicit (button or CTRL+ENTER).
 */
export function AboutMeScreen({
  onDone,
  setMode,
}: {
  onDone: () => void
  setMode: (m: InputMode) => void
}) {
  const [stage, setStage] = useState<Stage>('loading')
  const [signupId, setSignupId] = useState<string | null>(null)
  const [val, setVal] = useState('')
  const [savedVal, setSavedVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [nudge, setNudge] = useState<string | null>(null)
  const [dialog, setDialog] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode(stage === 'ready' && !dialog ? 'TXT' : 'NAV')
  }, [stage, dialog, setMode])
  useLayoutEffect(() => {
    setEnterArmed(true)
  }, [setEnterArmed])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const mine = await fetchMySignup()
      if (!alive) return
      if (mine?.id) {
        setSignupId(mine.id)
        setVal(mine.about ?? '')
        setSavedVal(mine.about ?? '')
        setStage('ready')
      } else {
        setStage('missing')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (stage !== 'ready' || dialog) {
      inputRef.current?.blur()
      return
    }
    // Defer: closing the dialog can leave focus on BODY after the button unmounts.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [stage, dialog])

  const dirty = val !== savedVal

  const save = async () => {
    if (!signupId || saving) return
    setSaving(true)
    setNudge(null)
    const trimmed = val.trim()
    const { ok } = await updateAboutText(signupId, trimmed)
    if (!ok) {
      setSaving(false)
      setNudge('SAVE FAILED — CHECK UPLINK AND TRY AGAIN')
      return
    }
    onDone()
  }

  const leave = () => {
    if (dirty) setDialog(true)
    else onDone()
  }

  useKeys(
    (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        void save()
      } else if (e.key === 'Backspace' && (val === '' || !e.isTrusted)) {
        // Empty field, or the mobile BACK button (untrusted): means "go back".
        e.preventDefault()
        leave()
      }
    },
    stage === 'ready' && !dialog,
  )
  useKeys(
    (e) => {
      if (e.key === 'Enter' || e.key === 'Backspace') {
        e.preventDefault()
        onDone()
      }
    },
    stage === 'missing',
  )

  return (
    <div className="screen">
      <div className="title">L :: ABOUT YOU</div>
      {stage === 'loading' && <div className="term-log">&gt; RETRIEVING NODE…</div>}
      {stage === 'missing' && (
        <>
          <div className="term-log">&gt; NO NODE TO ANNOTATE. LOGIN AND CLAIM A NODE FIRST.</div>
          <div className="btn-row">
            <button className="btn dim" onClick={onDone}>
              [ BACK ]
            </button>
          </div>
        </>
      )}
      {stage === 'ready' && (
        <>
          <div className="q-text">
            FREEFORM SECTOR. Write anything interesting about yourself — projects, obsessions,
            plans, lore. Visible only to you and the operators.
          </div>
          <div className="prompt-row">
            <span className="prompt">&gt;</span>
            <textarea
              ref={inputRef}
              autoFocus
              rows={10}
              maxLength={MAX_ABOUT_LENGTH}
              value={val}
              onChange={(e) => {
                setNudge(null)
                setVal(e.target.value)
              }}
              spellCheck={false}
            />
          </div>
          <div className="btn-row">
            <button className="btn" onClick={() => void save()}>
              {saving ? '[ SAVING… ]' : '[ SAVE ]'}
            </button>
            <button className="btn dim" onClick={leave}>
              [ BACK ]
            </button>
          </div>
          <div className="screen-hint">
            {nudge ?? `${val.length} / ${MAX_ABOUT_LENGTH} · CTRL+ENTER to save`}
          </div>
        </>
      )}
      {dialog && (
        <ConfirmDialog
          question="DISCARD UNSAVED CHANGES?"
          onYes={() => {
            setDialog(false)
            onDone()
          }}
          onNo={() => setDialog(false)}
        />
      )}
    </div>
  )
}
