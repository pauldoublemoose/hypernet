import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { STAY_TUNED_TEXT, THANKS_TEXT } from '../../data/copy'
import { submitSignup } from '../../lib/supabase'
import type { Answers } from '../../types'
import type { InputMode } from '../TerminalFrame'
import { Typed } from '../Typed'

type Stage = 'tx' | 'added' | 'thanks' | 'stay'

export function ThanksScreen({
  answers,
  setMode,
}: {
  answers: Answers
  setMode: (m: InputMode) => void
}) {
  const [stage, setStage] = useState<Stage>('tx')
  const [offline, setOffline] = useState(false)
  const started = useRef(false)

  useLayoutEffect(() => setMode('NAV'), [setMode])

  useEffect(() => {
    if (started.current) return
    started.current = true
    submitSignup(answers).then((res) => {
      setOffline(res.offline)
      setStage('added')
      window.setTimeout(() => setStage('thanks'), 600)
    })
  }, [answers])

  return (
    <div className="screen">
      <div className="title">6 :: TRANSMISSION</div>
      <div className="term-log">
        <div>&gt; TRANSMITTING NODE...</div>
        {stage !== 'tx' && (
          <div>
            &gt; {offline ? 'UPLINK OFFLINE — NODE CACHED LOCALLY.' : 'NODE ACCEPTED.'}
          </div>
        )}
        {stage !== 'tx' && <div>&gt; NODE REGISTERED.</div>}
      </div>
      {(stage === 'thanks' || stage === 'stay') && (
        <Typed
          className="thanks-text"
          text={THANKS_TEXT}
          onDone={() => window.setTimeout(() => setStage('stay'), 1200)}
        />
      )}
      {stage === 'stay' && <Typed className="thanks-text dim" text={STAY_TUNED_TEXT} />}
      {stage === 'stay' && (
        <div className="btn-row">
          <button className="btn dim" onClick={() => window.location.reload()}>
            [ RESET TERMINAL ]
          </button>
        </div>
      )}
    </div>
  )
}
