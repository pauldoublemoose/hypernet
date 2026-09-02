import { useEffect, useMemo, useState } from 'react'
import { DesktopIcons, type ShellFeature } from './components/DesktopIcons'
import { TerminalFrame, type InputMode } from './components/TerminalFrame'
import { AboutScreen } from './components/screens/AboutScreen'
import { AdminGateScreen } from './components/screens/AdminGateScreen'
import { AdminTableScreen } from './components/screens/AdminTableScreen'
import { ChoiceScreen } from './components/screens/ChoiceScreen'
import { ConfirmSubmitScreen } from './components/screens/ConfirmSubmitScreen'
import { InfoScreen } from './components/screens/InfoScreen'
import { LocationScreen } from './components/screens/LocationScreen'
import { MultiScreen } from './components/screens/MultiScreen'
import { ReviewScreen, type ReviewTarget } from './components/screens/ReviewScreen'
import { SkillsScreen } from './components/screens/SkillsScreen'
import { PhoneScreen } from './components/screens/PhoneScreen'
import { TextScreen } from './components/screens/TextScreen'
import { ThanksScreen } from './components/screens/ThanksScreen'
import { WelcomeScreen } from './components/screens/WelcomeScreen'
import {
  BRANCH_TEXT,
  CONTACT_CHANNEL_OPTIONS,
  EVENTS,
  PRE_STATUS_TEXT,
  STATUS_OPTIONS,
  STATUS_QUESTION,
} from './data/copy'
import { LOCATION_TAXONOMY } from './data/locations'
import { SKILL_TAXONOMY } from './data/skills'
import {
  fetchLocationOptions,
  fetchSkillOptions,
  type RemoteLocationOption,
  type RemoteSkillOption,
} from './lib/supabase'
import {
  initialAnswers,
  type Answers,
  type ContactChannel,
  type Status,
} from './types'
import { buildGraphData } from './lib/network/buildGraph'
import { NetworkGraph } from './components/NetworkGraph'
import { useUi } from './ui'

type ScreenId =
  | 'welcome'
  | 'about'
  | 'preStatus'
  | 'status'
  | 'branch'
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
  | 'review'
  | 'confirm'
  | 'thanks'
  | 'adminGate'
  | 'admin'

const SECTION: Record<ScreenId, string> = {
  welcome: '0 :: WELCOME',
  about: '0 :: ABOUT',
  preStatus: '1 :: SIGN-UP',
  status: '1 :: STATUS',
  branch: '1 :: STATUS',
  name: '2 :: CONTACT',
  channels: '2 :: CONTACT',
  email: '2 :: CONTACT',
  phone: '2 :: CONTACT',
  discord: '2 :: CONTACT',
  facebook: '2 :: CONTACT',
  location: '2B :: LOCATION',
  attended: '3 :: HISTORY',
  capacity: '3A :: HISTORY',
  years: '3B :: HISTORY',
  skills: '4 :: SKILLSET',
  other: '5 :: MISC',
  review: '5B :: REVIEW',
  confirm: '5C :: CONFIRM',
  thanks: '6 :: COMPLETE',
  adminGate: 'A :: ACCESS',
  admin: 'A :: LEDGER',
}

const CHANNEL_ORDER: ContactChannel[] = ['email', 'phone', 'discord', 'facebook']

const ATTENDED_OPTIONS = [
  ...EVENTS,
  { id: 'none', label: 'NONE — HAVE NOT ATTENDED ANY' },
]

/** Next contact-info question among the channels the user ticked. */
function nextChannel(after: ContactChannel | null, a: Answers): ScreenId {
  const start = after === null ? 0 : CHANNEL_ORDER.indexOf(after) + 1
  for (let i = start; i < CHANNEL_ORDER.length; i++) {
    if (a.contactChannels.includes(CHANNEL_ORDER[i])) return CHANNEL_ORDER[i]
  }
  return 'location'
}

function getNext(id: ScreenId, a: Answers): ScreenId {
  const st: Status = a.status ?? 'subscriber'
  switch (id) {
    case 'preStatus':
      return 'status'
    case 'status':
      return 'branch'
    case 'branch':
      return 'name'
    case 'name':
      return st === 'subscriber' ? 'email' : 'channels'
    case 'channels':
      return nextChannel(null, a)
    case 'email':
      return st === 'subscriber' ? 'phone' : nextChannel('email', a)
    case 'phone':
      return st === 'subscriber' ? 'location' : nextChannel('phone', a)
    case 'discord':
      return nextChannel('discord', a)
    case 'facebook':
      return 'location'
    case 'location':
      return st === 'subscriber' ? 'review' : 'attended'
    case 'attended':
      if (st === 'cocreator' || st === 'admin') return 'capacity'
      if (st === 'legacy') return 'years'
      return 'skills'
    case 'capacity':
      return 'skills'
    case 'years':
      return 'skills'
    case 'skills':
      return 'other'
    case 'other':
      return 'review'
    case 'review':
      return 'confirm'
    case 'confirm':
      return 'thanks'
    default:
      return 'thanks'
  }
}

const CONTACT_FIELDS: Record<
  'name' | ContactChannel,
  { question: string; key: 'fullName' | ContactChannel }
> = {
  name: { question: 'YOUR FULL NAME:', key: 'fullName' },
  email: { question: 'EMAIL ADDRESS:', key: 'email' },
  phone: { question: 'PHONE NUMBER (WHATSAPP):', key: 'phone' },
  discord: { question: 'DISCORD TAG:', key: 'discord' },
  facebook: { question: 'FACEBOOK NAME:', key: 'facebook' },
}

function isAdminScreen(id: ScreenId) {
  return id === 'admin' || id === 'adminGate'
}

function shellFeature(screen: ScreenId, graphOpen: boolean): ShellFeature {
  if (graphOpen) return 'graph'
  if (isAdminScreen(screen)) return 'admin'
  return 'terminal'
}

export default function App() {
  const { theme, graphOpen, setGraphOpen, expanded } = useUi()
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  // Rebuild when the overlay opens so admin ghost changes apply immediately.
  const graphData = useMemo(() => buildGraphData(answers), [answers, graphOpen])
  const [screen, setScreen] = useState<ScreenId>('welcome')
  const [history, setHistory] = useState<ScreenId[]>([])
  const [mode, setMode] = useState<InputMode>('NAV')
  const [editingFromReview, setEditingFromReview] = useState(false)
  const [remoteSkills, setRemoteSkills] = useState<RemoteSkillOption[]>([])
  const [remoteLocations, setRemoteLocations] = useState<RemoteLocationOption[]>([])

  useEffect(() => {
    fetchSkillOptions().then(setRemoteSkills)
    fetchLocationOptions().then(setRemoteLocations)
  }, [])

  const taxonomy = useMemo(() => {
    const t: Record<string, string[]> = {}
    for (const [c, subs] of Object.entries(SKILL_TAXONOMY)) t[c] = [...subs]
    for (const o of remoteSkills) {
      const c = o.category.toUpperCase()
      t[c] ??= []
      const sub = o.subcategory?.toUpperCase()
      if (sub && !t[c].includes(sub)) t[c].push(sub)
    }
    return t
  }, [remoteSkills])

  const locationTaxonomy = useMemo(() => {
    const t: Record<string, string[]> = {}
    for (const [c, cities] of Object.entries(LOCATION_TAXONOMY)) t[c] = [...cities]
    for (const o of remoteLocations) {
      const country = o.country.toUpperCase()
      t[country] ??= []
      const city = o.city?.toUpperCase()
      if (city && !t[country].includes(city)) t[country].push(city)
    }
    return t
  }, [remoteLocations])

  const go = (next: ScreenId) => {
    setHistory((h) => [...h, screen])
    setScreen(next)
  }

  const back = () => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      if (prev === 'review') setEditingFromReview(false)
      setScreen(prev)
      return h.slice(0, -1)
    })
  }

  /** Merge a patch into answers, then advance (or return to review if editing). */
  const advance = (patch: Partial<Answers>) => {
    const merged = { ...answers, ...patch }
    setAnswers(merged)
    if (editingFromReview) {
      setEditingFromReview(false)
      setScreen('review')
      setHistory((h) => (h[h.length - 1] === 'review' ? h.slice(0, -1) : h))
      return
    }
    go(getNext(screen, merged))
  }

  const jumpToEdit = (target: ReviewTarget) => {
    if (target === '__submit__') return
    setEditingFromReview(true)
    go(target)
  }

  const textField = (id: 'name' | ContactChannel) => {
    if (id === 'phone') {
      return (
        <PhoneScreen
          key="phone"
          title="2 :: CONTACT DETAILS"
          question="PHONE NUMBER (WHATSAPP):"
          initial={answers.phone}
          onSubmit={(v) => advance({ phone: v })}
          onBack={back}
          setMode={setMode}
        />
      )
    }
    const f = CONTACT_FIELDS[id]
    return (
      <TextScreen
        key={id}
        title="2 :: CONTACT DETAILS"
        question={f.question}
        hint="ENTER to confirm · SKIP to leave empty"
        kind={id === 'email' ? 'email' : 'text'}
        initial={answers[f.key]}
        onSubmit={(v) => advance({ [f.key]: v || undefined })}
        onBack={back}
        setMode={setMode}
      />
    )
  }

  let content
  switch (screen) {
    case 'welcome':
      content = (
        <WelcomeScreen
          key="welcome"
          onSignup={() => go('preStatus')}
          onAbout={() => go('about')}
          onAdmin={() => go('adminGate')}
          setMode={setMode}
        />
      )
      break
    case 'adminGate':
      content = (
        <AdminGateScreen
          key="adminGate"
          onUnlock={() => go('admin')}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'admin':
      content = (
        <AdminTableScreen key="admin" onBack={() => setScreen('welcome')} setMode={setMode} />
      )
      break
    case 'about':
      content = <AboutScreen key="about" onBack={back} setMode={setMode} />
      break
    case 'preStatus':
      content = (
        <InfoScreen
          key="preStatus"
          text={PRE_STATUS_TEXT}
          buttonLabel="OK"
          onNext={() => go('status')}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'status':
      content = (
        <ChoiceScreen
          key="status"
          title="1 :: CO-CREATOR STATUS"
          text={STATUS_QUESTION}
          options={STATUS_OPTIONS}
          onSelect={(id) => advance({ status: id as Status })}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'branch':
      content = (
        <InfoScreen
          key={`branch-${answers.status}`}
          text={BRANCH_TEXT[answers.status ?? 'subscriber'] ?? ''}
          buttonLabel="CONTINUE"
          onNext={() => go(getNext('branch', answers))}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'name':
    case 'email':
    case 'phone':
    case 'discord':
    case 'facebook':
      content = textField(screen)
      break
    case 'channels':
      content = (
        <MultiScreen
          key="channels"
          title="2 :: CONTACT DETAILS"
          text="HOW CAN YOU BE REACHED? Tick every channel that works for you:"
          options={CONTACT_CHANNEL_OPTIONS}
          initial={answers.contactChannels}
          confirmIfSingle
          onSubmit={(ids) => advance({ contactChannels: ids as ContactChannel[] })}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'location':
      content = (
        <LocationScreen
          key="location"
          taxonomy={locationTaxonomy}
          initialLocations={answers.locations}
          onDone={(locations, customs) => {
            const merged = [...answers.customLocations]
            for (const c of customs) {
              if (!merged.some((m) => m.country === c.country && m.city === c.city)) {
                merged.push(c)
              }
            }
            advance({ locations, customLocations: merged })
          }}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'attended':
      content = (
        <MultiScreen
          key="attended"
          title="3 :: HISTORY"
          text="Have you attended (as guest or otherwise) any of the HYPERSTITION projects?"
          options={ATTENDED_OPTIONS}
          initial={answers.attendedEvents}
          onSubmit={(ids) => {
            const cleaned = ids.includes('none') ? ['none'] : ids.filter((id) => id !== 'none')
            advance({ attendedEvents: cleaned })
          }}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'capacity':
      content = (
        <TextScreen
          key="capacity"
          title="3A :: HISTORY"
          question="In what capacity have you previously contributed to HYPERSTITION?"
          hint="ENTER to confirm · SHIFT+ENTER for a new line"
          multiline
          initial={answers.contributionHistory}
          onSubmit={(v) => advance({ contributionHistory: v || undefined })}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'years':
      content = (
        <MultiScreen
          key="years"
          title="3B :: HISTORY"
          text="Which year(s) were you a MEMBER in HYPERSTITION?"
          options={EVENTS}
          initial={answers.years}
          onSubmit={(ids) => advance({ years: ids })}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'skills':
      content = (
        <SkillsScreen
          key="skills"
          taxonomy={taxonomy}
          initialSkills={answers.skills}
          onDone={(skills, customs) => {
            const merged = [...answers.customOptions]
            for (const c of customs) {
              if (!merged.some((m) => m.category === c.category && m.subcategory === c.subcategory)) {
                merged.push(c)
              }
            }
            advance({ skills, customOptions: merged })
          }}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'other':
      content = (
        <TextScreen
          key="other"
          title="5 :: ANYTHING ELSE"
          question="Anything else we should know about you? E.g. camps or burner projects you have participated in, or other non-burner creative events you have created."
          hint="ENTER to confirm · SHIFT+ENTER for a new line"
          multiline
          initial={answers.otherInfo}
          onSubmit={(v) => advance({ otherInfo: v || undefined })}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'review':
      content = (
        <ReviewScreen
          key="review"
          answers={answers}
          onEdit={jumpToEdit}
          onSubmit={() => go('confirm')}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'confirm':
      content = (
        <ConfirmSubmitScreen
          key="confirm"
          onSubmit={() => go('thanks')}
          onDiscard={() => {
            setAnswers(initialAnswers)
            setHistory([])
            setEditingFromReview(false)
            setScreen('welcome')
          }}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'thanks':
      content = <ThanksScreen key="thanks" answers={answers} setMode={setMode} />
      break
  }

  const openTerminal = () => {
    setGraphOpen(false)
    if (isAdminScreen(screen)) {
      setScreen('welcome')
      setHistory([])
    }
  }

  const openGraph = () => setGraphOpen(true)

  const openAdmin = () => {
    setGraphOpen(false)
    if (!isAdminScreen(screen)) go('adminGate')
  }

  return (
    <div className={`app${expanded ? ' is-expanded' : ''}`} data-theme={theme}>
      <DesktopIcons
        active={shellFeature(screen, graphOpen)}
        onTerminal={openTerminal}
        onGraph={openGraph}
        onAdmin={openAdmin}
      />
      <TerminalFrame section={SECTION[screen]} mode={mode}>
        <div className={graphOpen ? 'form-layer is-hidden' : 'form-layer'} aria-hidden={graphOpen}>
          {content}
        </div>
        {graphOpen && (
          <div className="screen net-screen graph-overlay">
            <div className="title">6 :: NETWORK</div>
            <div className="net-intro dim">PRE-ALPHA GRAPH · TOGGLE [GRAPH] TO RETURN</div>
            <NetworkGraph data={graphData} newNodeId="you" preview />
          </div>
        )}
      </TerminalFrame>
    </div>
  )
}
