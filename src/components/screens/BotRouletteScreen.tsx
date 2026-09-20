import { useMemo, useState } from 'react'
import { useKeys } from '../../hooks'
import { loadPeople } from '../../lib/contactsStore'
import { CardThumb } from '../CardThumb'

type Face = { id: string; name: string; imageUrl?: string }

function pickFaces(pool: Face[], n: number): Face[] {
  if (pool.length === 0) return []
  return Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)])
}

export function BotRouletteScreen({ onBack }: { onBack: () => void }) {
  const pool = useMemo<Face[]>(
    () =>
      loadPeople().map((p) => ({
        id: p.id,
        name: p.displayName,
        imageUrl: p.imageUrl,
      })),
    [],
  )
  const [reels, setReels] = useState<Face[]>(() => pickFaces(pool, 3))
  const [spinning, setSpinning] = useState(false)
  const [jackpot, setJackpot] = useState(false)

  useKeys((e) => {
    if (e.key !== 'Backspace' && e.key !== 'Escape') return
    e.preventDefault()
    onBack()
  })

  const spin = () => {
    if (spinning || pool.length === 0) return
    setSpinning(true)
    setJackpot(false)
    const next = pickFaces(pool, 3)
    window.setTimeout(() => {
      setReels(next)
      setSpinning(false)
      setJackpot(true)
    }, 700)
  }

  return (
    <div className={`screen roulette-screen${jackpot ? ' is-jackpot' : ''}`} data-shell="roulette">
      <h1 className="finder-title">BOT ROULETTE</h1>
      <p className="dim hz-lead">Robot-face slots. Pull. Win. Repeat.</p>
      <div className="roulette-reels" aria-live="polite">
        {(reels.length ? reels : [{ id: 'empty', name: '?' }]).map((face, i) => (
          <div key={`${face.id}-${i}`} className={`roulette-reel${spinning ? ' is-spin' : ''}`}>
            <span className="roulette-bot" aria-hidden>
              ⌂
            </span>
            <CardThumb src={face.imageUrl} label={face.name} shape="circle" />
            <span className="roulette-name">{face.name}</span>
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button type="button" className="btn" data-shell="roulette-spin" onClick={spin} disabled={spinning}>
          {spinning ? '[ SPINNING ]' : '[ PULL ]'}
        </button>
      </div>
      {jackpot ? (
        <p className="roulette-win" data-shell="roulette-win">
          ★ JACKPOT ★ YOU ARE THE CHOSEN NODE ★
        </p>
      ) : null}
    </div>
  )
}
