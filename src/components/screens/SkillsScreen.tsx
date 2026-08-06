import { useMemo, useState } from 'react'
import type { CustomSkillOption, Skill } from '../../types'
import type { InputMode } from '../TerminalFrame'
import { ChoiceScreen } from './ChoiceScreen'
import { TextScreen } from './TextScreen'

const NEW_ID = '__new__'

type Phase =
  | { kind: 'menu' }
  | { kind: 'category' }
  | { kind: 'newCategory' }
  | { kind: 'subcategory'; category: string; customCat: boolean }
  | { kind: 'newSubcategory'; category: string; customCat: boolean }
  | { kind: 'note'; category: string; subcategory: string; customCat: boolean; customSub: boolean }

export function SkillsScreen({
  taxonomy,
  initialSkills,
  onDone,
  onBack,
  setMode,
}: {
  taxonomy: Record<string, string[]>
  initialSkills: Skill[]
  onDone: (skills: Skill[], customs: CustomSkillOption[]) => void
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [customs, setCustoms] = useState<CustomSkillOption[]>([])
  const [sessionTax, setSessionTax] = useState<Record<string, string[]>>({})
  const [phase, setPhase] = useState<Phase>(
    initialSkills.length > 0 ? { kind: 'menu' } : { kind: 'category' },
  )

  const merged = useMemo(() => {
    const t: Record<string, string[]> = {}
    for (const [c, subs] of Object.entries(taxonomy)) t[c] = [...subs]
    for (const [c, subs] of Object.entries(sessionTax)) {
      t[c] ??= []
      for (const s of subs) if (!t[c].includes(s)) t[c].push(s)
    }
    return t
  }, [taxonomy, sessionTax])

  const finishSkill = (
    category: string,
    subcategory: string,
    note: string,
    customCat: boolean,
    customSub: boolean,
  ) => {
    setSkills((s) => [...s, { category, subcategory, note: note || undefined }])
    if (customCat || customSub) {
      setCustoms((c) => [...c, { category, subcategory }])
      setSessionTax((t) => ({
        ...t,
        [category]: [...(t[category] ?? []), subcategory],
      }))
    }
    setPhase({ kind: 'menu' })
  }

  switch (phase.kind) {
    case 'menu':
      return (
        <ChoiceScreen
          key="menu"
          title="4 :: SKILLSET / CONTRIBUTION"
          text={
            skills.length > 0
              ? 'SKILLS REGISTERED ON YOUR NODE:'
              : 'No skills registered yet.'
          }
          options={[
            { id: 'add', label: '+ ADD A SKILL' },
            { id: 'done', label: 'DONE — CONTINUE' },
          ]}
          onSelect={(id) => {
            if (id === 'add') setPhase({ kind: 'category' })
            else onDone(skills, customs)
          }}
          onBack={onBack}
          setMode={setMode}
        >
          {skills.length > 0 && (
            <div className="skill-list">
              {skills.map((s, i) => (
                <div key={i} className="skill-line">
                  <span>
                    · {s.category} / {s.subcategory}
                    {s.note ? ` — ${s.note}` : ''}
                  </span>
                  <button
                    className="btn dim skill-x"
                    onClick={() => setSkills((list) => list.filter((_, k) => k !== i))}
                  >
                    [X]
                  </button>
                </div>
              ))}
            </div>
          )}
        </ChoiceScreen>
      )

    case 'category':
      return (
        <ChoiceScreen
          key="category"
          title="4 :: SKILLSET / CONTRIBUTION"
          text="What can you contribute? Select a category:"
          options={[
            ...Object.keys(merged).map((c) => ({ id: c, label: c })),
            { id: NEW_ID, label: '+ ADD A NEW CATEGORY' },
          ]}
          onSelect={(id) => {
            if (id === NEW_ID) setPhase({ kind: 'newCategory' })
            else setPhase({ kind: 'subcategory', category: id, customCat: false })
          }}
          onBack={() => {
            if (skills.length > 0) setPhase({ kind: 'menu' })
            else onBack()
          }}
          setMode={setMode}
        />
      )

    case 'newCategory':
      return (
        <TextScreen
          key="newCategory"
          title="4 :: SKILLSET / CONTRIBUTION"
          question="NAME YOUR NEW CATEGORY:"
          hint="It will become a selectable option for future co-creators."
          onSubmit={(v) => {
            const name = v.toUpperCase()
            if (!name) setPhase({ kind: 'category' })
            else setPhase({ kind: 'newSubcategory', category: name, customCat: true })
          }}
          onBack={() => setPhase({ kind: 'category' })}
          setMode={setMode}
        />
      )

    case 'subcategory': {
      const subs = merged[phase.category] ?? []
      return (
        <ChoiceScreen
          key={`subcategory-${phase.category}`}
          title="4 :: SKILLSET / CONTRIBUTION"
          text={`CATEGORY: ${phase.category} — select a specialty:`}
          options={[
            ...subs.map((s) => ({ id: s, label: s })),
            { id: NEW_ID, label: '+ ADD A NEW SPECIALTY' },
          ]}
          onSelect={(id) => {
            if (id === NEW_ID)
              setPhase({
                kind: 'newSubcategory',
                category: phase.category,
                customCat: phase.customCat,
              })
            else
              setPhase({
                kind: 'note',
                category: phase.category,
                subcategory: id,
                customCat: phase.customCat,
                customSub: false,
              })
          }}
          onBack={() => setPhase({ kind: 'category' })}
          setMode={setMode}
        />
      )
    }

    case 'newSubcategory':
      return (
        <TextScreen
          key={`newSubcategory-${phase.category}`}
          title="4 :: SKILLSET / CONTRIBUTION"
          question={`CATEGORY: ${phase.category} — name your specialty:`}
          hint="It will become a selectable option for future co-creators."
          onSubmit={(v) => {
            const name = v.toUpperCase()
            if (!name) {
              if (phase.customCat) setPhase({ kind: 'newCategory' })
              else
                setPhase({
                  kind: 'subcategory',
                  category: phase.category,
                  customCat: phase.customCat,
                })
              return
            }
            setPhase({
              kind: 'note',
              category: phase.category,
              subcategory: name,
              customCat: phase.customCat,
              customSub: true,
            })
          }}
          onBack={() => {
            if (phase.customCat) setPhase({ kind: 'newCategory' })
            else
              setPhase({
                kind: 'subcategory',
                category: phase.category,
                customCat: phase.customCat,
              })
          }}
          setMode={setMode}
        />
      )

    case 'note':
      return (
        <TextScreen
          key={`note-${phase.category}-${phase.subcategory}`}
          title="4 :: SKILLSET / CONTRIBUTION"
          question={`Tell us more about "${phase.subcategory}" (optional): projects, experience, gear...`}
          hint="ENTER to confirm · SHIFT+ENTER for a new line"
          multiline
          onSubmit={(v) =>
            finishSkill(phase.category, phase.subcategory, v, phase.customCat, phase.customSub)
          }
          onBack={() =>
            setPhase({
              kind: 'subcategory',
              category: phase.category,
              customCat: phase.customCat,
            })
          }
          setMode={setMode}
        />
      )
  }
}
