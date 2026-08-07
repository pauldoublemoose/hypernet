import { useState } from 'react'
import { useKeys } from '../hooks'

export function ConfirmDialog({
  question,
  onYes,
  onNo,
}: {
  question: string
  onYes: () => void
  onNo: () => void
}) {
  // default highlight on NO so a stray double-backspace doesn't skip backwards
  const [hl, setHl] = useState<0 | 1>(1)

  useKeys((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault()
      setHl((v) => (v === 0 ? 1 : 0))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (hl === 0) onYes()
      else onNo()
    } else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault()
      onYes()
    } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault()
      onNo()
    } else {
      e.preventDefault()
    }
  })

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog-q">{question}</div>
        <div className="dialog-btns">
          <button
            className={`btn ${hl === 0 ? 'hl' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onYes}
          >
            [ YES ]
          </button>
          <button
            className={`btn ${hl === 1 ? 'hl' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onNo}
          >
            [ NO ]
          </button>
        </div>
        <div className="dialog-hint">Y / N · ←→ · ENTER</div>
      </div>
    </div>
  )
}
