import { useMemo, useState } from 'react'
import type { CustomLocationOption, Location } from '../../types'
import type { InputMode } from '../TerminalFrame'
import { ChoiceScreen } from './ChoiceScreen'
import { TextScreen } from './TextScreen'

const NEW_ID = '__new__'

type Phase =
  | { kind: 'menu' }
  | { kind: 'country' }
  | { kind: 'newCountry' }
  | { kind: 'city'; country: string; customCountry: boolean }
  | { kind: 'newCity'; country: string; customCountry: boolean }

export function LocationScreen({
  taxonomy,
  initialLocations,
  onDone,
  onBack,
  setMode,
}: {
  taxonomy: Record<string, string[]>
  initialLocations: Location[]
  onDone: (locations: Location[], customs: CustomLocationOption[]) => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [customs, setCustoms] = useState<CustomLocationOption[]>([])
  const [sessionTax, setSessionTax] = useState<Record<string, string[]>>({})
  const [phase, setPhase] = useState<Phase>(
    initialLocations.length > 0 ? { kind: 'menu' } : { kind: 'country' },
  )

  const merged = useMemo(() => {
    const t: Record<string, string[]> = {}
    for (const [c, cities] of Object.entries(taxonomy)) t[c] = [...cities]
    for (const [c, cities] of Object.entries(sessionTax)) {
      t[c] ??= []
      for (const city of cities) if (!t[c].includes(city)) t[c].push(city)
    }
    return t
  }, [taxonomy, sessionTax])

  const finishLocation = (
    country: string,
    city: string,
    customCountry: boolean,
    customCity: boolean,
  ) => {
    setLocations((list) => {
      if (list.some((l) => l.country === country && l.city === city)) return list
      return [...list, { country, city }]
    })
    if (customCountry || customCity) {
      setCustoms((c) => {
        if (c.some((x) => x.country === country && x.city === city)) return c
        return [...c, { country, city }]
      })
      setSessionTax((t) => ({
        ...t,
        [country]: [...(t[country] ?? []), city].filter(
          (v, i, a) => a.indexOf(v) === i,
        ),
      }))
    }
    setPhase({ kind: 'menu' })
  }

  switch (phase.kind) {
    case 'menu':
      return (
        <ChoiceScreen
          key="menu"
          title="2B :: LOCATION"
          text={
            locations.length > 0
              ? 'CITIES REGISTERED ON YOUR NODE:'
              : 'No cities registered yet.'
          }
          options={[
            { id: 'add', label: '+ ADD ANOTHER CITY' },
            { id: 'done', label: 'DONE — CONTINUE' },
          ]}
          onSelect={(id) => {
            if (id === 'add') setPhase({ kind: 'country' })
            else onDone(locations, customs)
          }}
          onBack={onBack}
          setMode={setMode}
        >
          {locations.length > 0 && (
            <div className="skill-list">
              {locations.map((l, i) => (
                <div key={`${l.country}-${l.city}-${i}`} className="skill-line">
                  <span>
                    · {l.city}, {l.country}
                  </span>
                  <button
                    className="btn dim skill-x"
                    onClick={() => setLocations((list) => list.filter((_, k) => k !== i))}
                  >
                    [X]
                  </button>
                </div>
              ))}
            </div>
          )}
        </ChoiceScreen>
      )

    case 'country':
      return (
        <ChoiceScreen
          key="country"
          title="2B :: LOCATION"
          text="Which country are you based in?"
          options={[
            ...Object.keys(merged).map((c) => ({ id: c, label: c })),
            { id: NEW_ID, label: '+ ADD A NEW COUNTRY' },
            ...(locations.length === 0 ? [{ id: '__skip__', label: 'SKIP' }] : []),
          ]}
          onSelect={(id) => {
            if (id === '__skip__') onDone([], customs)
            else if (id === NEW_ID) setPhase({ kind: 'newCountry' })
            else setPhase({ kind: 'city', country: id, customCountry: false })
          }}
          onBack={() => {
            if (locations.length > 0) setPhase({ kind: 'menu' })
            else onBack()
          }}
          setMode={setMode}
        />
      )

    case 'newCountry':
      return (
        <TextScreen
          key="newCountry"
          title="2B :: LOCATION"
          question="NAME YOUR COUNTRY:"
          hint="It will become a selectable option for future signees."
          onSubmit={(v) => {
            const name = v.toUpperCase()
            if (!name) setPhase({ kind: 'country' })
            else setPhase({ kind: 'newCity', country: name, customCountry: true })
          }}
          onBack={() => setPhase({ kind: 'country' })}
          setMode={setMode}
        />
      )

    case 'city': {
      const cities = merged[phase.country] ?? []
      return (
        <ChoiceScreen
          key={`city-${phase.country}`}
          title="2B :: LOCATION"
          text={`COUNTRY: ${phase.country} — select a city:`}
          options={[
            ...cities.map((c) => ({ id: c, label: c })),
            { id: NEW_ID, label: '+ ADD A NEW CITY' },
          ]}
          onSelect={(id) => {
            if (id === NEW_ID)
              setPhase({
                kind: 'newCity',
                country: phase.country,
                customCountry: phase.customCountry,
              })
            else finishLocation(phase.country, id, phase.customCountry, false)
          }}
          onBack={() => setPhase({ kind: 'country' })}
          setMode={setMode}
        />
      )
    }

    case 'newCity':
      return (
        <TextScreen
          key={`newCity-${phase.country}`}
          title="2B :: LOCATION"
          question={`COUNTRY: ${phase.country} — name your city:`}
          hint="It will become a selectable option for future signees."
          onSubmit={(v) => {
            const name = v.toUpperCase()
            if (!name) {
              if (phase.customCountry) setPhase({ kind: 'newCountry' })
              else
                setPhase({
                  kind: 'city',
                  country: phase.country,
                  customCountry: phase.customCountry,
                })
              return
            }
            finishLocation(phase.country, name, phase.customCountry, true)
          }}
          onBack={() => {
            if (phase.customCountry) setPhase({ kind: 'newCountry' })
            else
              setPhase({
                kind: 'city',
                country: phase.country,
                customCountry: phase.customCountry,
              })
          }}
          setMode={setMode}
        />
      )
  }
}
