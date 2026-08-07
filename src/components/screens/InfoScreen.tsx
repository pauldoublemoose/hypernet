import { useLayoutEffect } from 'react'
import { useKeys, useTypewriter } from '../../hooks'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

export function InfoScreen({
  text,
  buttonLabel,
  onNext,
  onBack,
  setMode,
}: {
  text: string
  buttonLabel: string
  onNext: () => void
  onBack?: () => void
  setMode: (m: InputMode) => void
}) {
  const { shown, done, finish } = useTypewriter(text)
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (done) onNext()
      else finish()
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      onBack?.()
    }
  })

  return (
    <div className="screen" onClick={() => !done && finish()}>
      <div className="tw">
        {shown}
        {!done && <span className="caret">▮</span>}
      </div>
      {done && (
        <div className="btn-row">
          <button className="btn hl" onClick={onNext}>
            [ {buttonLabel} ]
          </button>
        </div>
      )}
    </div>
  )
}
