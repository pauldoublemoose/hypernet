import { useState } from 'react'
import { ABOUT_SECTIONS } from '../../data/copy'
import type { InputMode } from '../TerminalFrame'
import { ChoiceScreen } from './ChoiceScreen'
import { InfoScreen } from './InfoScreen'

export function AboutScreen({
  onBack,
  setMode,
}: {
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = ABOUT_SECTIONS.find((s) => s.id === openId)

  if (open) {
    return (
      <InfoScreen
        key={open.id}
        text={`[ ${open.header} ]\n\n${open.body}`}
        buttonLabel="BACK TO INFO MENU"
        onNext={() => setOpenId(null)}
        onBack={() => setOpenId(null)}
        setMode={setMode}
      />
    )
  }

  return (
    <ChoiceScreen
      key="about-menu"
      title="0 :: INFO"
      text="What do you want to know?"
      options={[
        ...ABOUT_SECTIONS.map((s) => ({ id: s.id, label: s.header })),
        { id: '__back__', label: 'BACK TO WELCOME' },
      ]}
      onSelect={(id) => {
        if (id === '__back__') onBack()
        else setOpenId(id)
      }}
      onBack={onBack}
      setMode={setMode}
    />
  )
}
