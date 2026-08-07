import { useLayoutEffect, useMemo, useState } from 'react'
import { EVENTS, STATUS_OPTIONS } from '../../data/copy'
import { useKeys, useScrollHlIntoView } from '../../hooks'
import type { Answers, ContactChannel } from '../../types'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

export type ReviewTarget =
  | 'status'
  | 'name'
  | 'channels'
  | 'email'
  | 'phone'
  | 'discord'
  | 'facebook'
  | 'location'
  | 'attended'
  | 'capacity'
  | 'years'
  | 'skills'
  | 'other'
  | '__submit__'

interface ReviewRow {
  id: ReviewTarget
  label: string
  value: string
}

function dash(v: string | undefined | null) {
  return v && v.trim() ? v : '—'
}

function buildRows(a: Answers): ReviewRow[] {
  const st = a.status
  const statusLabel = STATUS_OPTIONS.find((o) => o.id === st)?.label ?? dash(st)
  const rows: ReviewRow[] = [
    { id: 'status', label: 'STATUS', value: statusLabel },
    { id: 'name', label: 'NAME', value: dash(a.fullName) },
  ]

  if (st === 'subscriber') {
    rows.push(
      { id: 'email', label: 'EMAIL', value: dash(a.email) },
      { id: 'phone', label: 'WHATSAPP', value: dash(a.phone) },
    )
  } else {
    const ch = a.contactChannels.length ? a.contactChannels.join(', ').toUpperCase() : '—'
    rows.push({ id: 'channels', label: 'REACHABLE VIA', value: ch })
    for (const c of a.contactChannels as ContactChannel[]) {
      const label = c.toUpperCase()
      const val =
        c === 'email' ? a.email : c === 'phone' ? a.phone : c === 'discord' ? a.discord : a.facebook
      rows.push({ id: c, label, value: dash(val) })
    }
  }

  rows.push({
    id: 'location',
    label: 'CITIES',
    value: a.locations.length
      ? a.locations.map((l) => `${l.city}, ${l.country}`).join(' · ')
      : '—',
  })

  if (st && st !== 'subscriber') {
    const attended = a.attendedEvents.includes('none')
      ? 'NONE'
      : a.attendedEvents.length
        ? a.attendedEvents
            .map((id) => EVENTS.find((e) => e.id === id)?.label ?? id)
            .join(' · ')
        : '—'
    rows.push({ id: 'attended', label: 'ATTENDED', value: attended })

    if (st === 'cocreator' || st === 'admin') {
      rows.push({ id: 'capacity', label: 'CONTRIBUTION', value: dash(a.contributionHistory) })
    }
    if (st === 'legacy') {
      rows.push({
        id: 'years',
        label: 'MEMBER YEARS',
        value: a.years.length
          ? a.years.map((id) => EVENTS.find((e) => e.id === id)?.label ?? id).join(' · ')
          : '—',
      })
    }
    rows.push({
      id: 'skills',
      label: 'SKILLS',
      value: a.skills.length
        ? a.skills.map((s) => `${s.category}/${s.subcategory}`).join(' · ')
        : '—',
    })
    rows.push({ id: 'other', label: 'ANYTHING ELSE', value: dash(a.otherInfo) })
  }

    rows.push({ id: '__submit__', label: 'CONTINUE', value: 'proceed to confirm →' })
  return rows
}

export function ReviewScreen({
  answers,
  onEdit,
  onSubmit,
  onBack,
  setMode,
}: {
  answers: Answers
  onEdit: (target: ReviewTarget) => void
  onSubmit: () => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const rows = useMemo(() => buildRows(answers), [answers])
  const [hl, setHl] = useState(0)
  const { setEnterArmed } = useUi()

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(true)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHl((h) => (h + 1) % rows.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHl((h) => (h - 1 + rows.length) % rows.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const row = rows[hl]
      if (row.id === '__submit__') onSubmit()
      else onEdit(row.id)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      onBack()
    }
  })

  useScrollHlIntoView(hl)

  return (
    <div className="screen">
      <div className="title">5B :: REVIEW</div>
      <div className="q-text">Check your answers. Select a line to edit, or submit.</div>
      <div className="opts review-opts">
        {rows.map((r, i) => (
          <div
            key={`${r.id}-${i}`}
            className={`opt review-opt ${i === hl ? 'hl' : ''} ${r.id === '__submit__' ? 'review-submit' : ''}`}
            onMouseEnter={() => {
              if (window.matchMedia('(pointer: fine)').matches) setHl(i)
            }}
            onClick={() => {
              if (r.id === '__submit__') onSubmit()
              else onEdit(r.id)
            }}
          >
            <div className="opt-label">
              {i === hl ? '> ' : '\u00a0\u00a0'}
              {r.label}
            </div>
            <div className="opt-desc review-val">{r.value}</div>
          </div>
        ))}
      </div>
      <div className="screen-hint">↑↓ MOVE · ENTER edit / submit</div>
    </div>
  )
}
