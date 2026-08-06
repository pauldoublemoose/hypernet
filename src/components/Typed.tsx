import { useEffect, useRef } from 'react'
import { useTypewriter } from '../hooks'

export function Typed({
  text,
  onDone,
  className,
}: {
  text: string
  onDone?: () => void
  className?: string
}) {
  const { shown, done, finish } = useTypewriter(text)
  const called = useRef(false)
  useEffect(() => {
    if (done && !called.current) {
      called.current = true
      onDone?.()
    }
  }, [done, onDone])
  return (
    <div className={`tw ${className ?? ''}`} onClick={finish}>
      {shown}
      {!done && <span className="caret">▮</span>}
    </div>
  )
}
