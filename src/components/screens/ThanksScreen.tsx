import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { STAY_TUNED_TEXT, THANKS_TEXT } from '../../data/copy'
import { useGraphData } from '../../lib/network/useGraphData'
import { submitSignup } from '../../lib/supabase'
import type { Answers } from '../../types'
import { useUi } from '../../ui'
import { NetworkGraph } from '../NetworkGraph'
import type { InputMode } from '../TerminalFrame'
import { Typed } from '../Typed'

type Stage = 'tx' | 'added' | 'thanks' | 'stay' | 'fade' | 'graph'

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
  const { setEnterArmed } = useUi()

  const graph = useGraphData(answers, stage === 'graph')

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useEffect(() => {
    if (started.current) return
    started.current = true
    submitSignup(answers).then((res) => {
      setOffline(res.offline)
      setStage('added')
      window.setTimeout(() => setStage('thanks'), 600)
    })
  }, [answers])

  useEffect(() => {
    if (stage !== 'fade') return
    const id = window.setTimeout(() => setStage('graph'), 900)
    return () => window.clearTimeout(id)
  }, [stage])

  if (stage === 'graph') {
    return (
      <div className="screen net-screen">
        <div className="title">6 :: NETWORK</div>
        <div className="net-intro dim">YOUR NODE IS LIVE. WATCH IT JOIN THE PRE-ALPHA GRAPH.</div>
        <NetworkGraph data={graph} newNodeId="you" />
        <div className="btn-row">
          <button className="btn dim" onClick={() => window.location.reload()}>
            [ RESET TERMINAL ]
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`screen thanks-screen ${stage === 'fade' ? 'fade-out' : ''}`}>
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
      {(stage === 'thanks' || stage === 'stay' || stage === 'fade') && (
        <Typed
          className="thanks-text"
          text={THANKS_TEXT}
          onDone={() => {
            if (stage === 'thanks') window.setTimeout(() => setStage('stay'), 800)
          }}
        />
      )}
      {(stage === 'stay' || stage === 'fade') && (
        <Typed
          className="thanks-text dim"
          text={STAY_TUNED_TEXT}
          onDone={() => {
            if (stage === 'stay') window.setTimeout(() => setStage('fade'), 1400)
          }}
        />
      )}
    </div>
  )
}
