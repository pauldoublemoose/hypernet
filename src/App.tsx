import { useEffect, useMemo, useRef, useState } from 'react'
import { DesertField } from './components/DesertField'
import { DesktopIcons, type ShellFeature } from './components/DesktopIcons'
import { IdentityPreview } from './components/IdentityPreview'
import { PixelDust } from './components/PixelDust'
import { TerminalFrame, type InputMode } from './components/TerminalFrame'
import { AboutMeScreen } from './components/screens/AboutMeScreen'
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
import { ProfileScreen } from './components/screens/ProfileScreen'
import { SettingsScreen } from './components/screens/SettingsScreen'
import { EventsScreen } from './components/screens/EventsScreen'
import { HorizonsScreen } from './components/screens/HorizonsScreen'
import { MyHorizonsScreen } from './components/screens/MyHorizonsScreen'
import { ContactsScreen } from './components/screens/ContactsScreen'
import { ClustersScreen, type ClustersTab } from './components/screens/ClustersScreen'
import { TerminalScreen } from './components/screens/TerminalScreen'
import { FinderScreen } from './components/screens/FinderScreen'
import {
  AnnouncementsScreen,
  ChronicleScreen,
  GlobalChatScreen,
  MyChatsScreen,
  NotificationsScreen,
} from './components/screens/StubScreens'
import { ensureDefaultHorizon } from './lib/horizonStore'
import { resolveAvatarUrl } from './lib/defaultAvatars'
import { readOnboarded, shellKind } from './lib/onboarding'
import type { SpaceRecord } from './lib/space'
import { loadProfile } from './lib/profileStore'
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
import { NetworkGraph } from './components/NetworkGraph'
import { AccountScreen } from './components/screens/AccountScreen'
import { LoginScreen } from './components/screens/LoginScreen'
import { clearDraft, loadDraft, saveDraft } from './lib/draft'
import { signupToAnswers } from './lib/network/buildGraph'
import { updateSignup } from './lib/supabase'
import { track, trackScreen, trackVisit } from './lib/telemetry'
import { TelemetryScreen } from './components/screens/TelemetryScreen'
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
  | 'login'
  | 'account'
  | 'aboutMe'
  | 'telemetry'
  | 'profile'
  | 'settings'
  | 'events'
  | 'horizons'
  | 'myHorizons'
  | 'contacts'
  | 'clusters'
  | 'terminal'
  | 'announcements'
  | 'globalChat'
  | 'notes'
  | 'notifications'
  | 'myChats'
  | 'chronicle'

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
  login: 'L :: ACCESS',
  account: 'L :: YOUR NODE',
  aboutMe: 'L :: ABOUT YOU',
  telemetry: 'A :: TELEMETRY',
  profile: 'P :: NODE',
  settings: 'S :: SETTINGS',
  events: 'E :: EVENTS',
  horizons: 'H :: HORIZONS',
  myHorizons: 'MH :: MY HORIZONS',
  contacts: 'C :: CONTACTS',
  clusters: 'CL :: CLUSTERS',
  terminal: 'T :: TERMINAL',
  announcements: 'GA :: ANNOUNCEMENTS',
  globalChat: 'GC :: GLOBAL CHAT',
  notes: 'F :: FINDER',
  notifications: 'N :: NOTIFICATIONS',
  myChats: 'MC :: MY CHATS',
  chronicle: 'CH :: MY CHRONICLE',
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

/** Screens that are never part of an in-progress signup draft. */
const NO_DRAFT_SCREENS: ReadonlySet<string> = new Set([
  'thanks',
  'adminGate',
  'admin',
  'login',
  'account',
  'aboutMe',
  'telemetry',
  'profile',
  'settings',
  'events',
  'horizons',
  'myHorizons',
  'contacts',
  'clusters',
  'terminal',
  'announcements',
  'globalChat',
  'notes',
  'notifications',
  'myChats',
  'chronicle',
])

/** Validated draft from a previous session, or null. */
function restoredDraft() {
  const d = loadDraft()
  if (!d) return null
  const screen = d.screen as ScreenId
  if (!(screen in SECTION) || NO_DRAFT_SCREENS.has(screen)) return null
  const history = (Array.isArray(d.history) ? d.history : []).filter(
    (s): s is ScreenId => s in SECTION && !NO_DRAFT_SCREENS.has(s),
  )
  // Merge over initialAnswers so drafts survive future Answers schema additions.
  return { answers: { ...initialAnswers, ...d.answers }, screen, history }
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

function shellFeature(screen: ScreenId, graphOpen: boolean, clustersFocus: ClustersTab): ShellFeature {
  if (graphOpen) return 'graph'
  if (isAdminScreen(screen)) return 'admin'
  if (screen === 'profile') return 'profile'
  if (screen === 'settings') return 'settings'
  if (screen === 'events') return 'events'
  if (screen === 'horizons') return 'horizons'
  if (screen === 'myHorizons') return 'my-horizons'
  if (screen === 'contacts') return 'contacts'
  if (screen === 'clusters') return clustersFocus === 'mine' ? 'my-cluster' : 'clusters'
  if (screen === 'terminal') return 'terminal'
  if (screen === 'announcements') return 'announcements'
  if (screen === 'globalChat') return 'global-chat'
  if (screen === 'notes') return 'notes'
  if (screen === 'notifications') return 'notifications'
  if (screen === 'myChats') return 'my-chats'
  if (screen === 'chronicle') return 'chronicle'
  return 'terminal'
}

export default function App() {
  const { theme, graphOpen, setGraphOpen, expanded } = useUi()
  const [draft] = useState(restoredDraft)
  const [answers, setAnswers] = useState<Answers>(() => draft?.answers ?? initialAnswers)
  const [screen, setScreen] = useState<ScreenId>(() => draft?.screen ?? 'welcome')
  const [history, setHistory] = useState<ScreenId[]>(() => draft?.history ?? [])
  const [mode, setMode] = useState<InputMode>('NAV')
  const [onboarded, setOnboarded] = useState(() => readOnboarded() || Boolean(draft))
  const [hover, setHover] = useState<SpaceRecord | null>(null)
  const hoverTimer = useRef<number | null>(null)
  const profile = loadProfile(answers)
  const kind = shellKind(screen, onboarded)

  const onHover = (space: SpaceRecord | null) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
    if (space) {
      setHover(space)
      return
    }
    hoverTimer.current = window.setTimeout(() => setHover(null), 180)
  }
  const [editingFromReview, setEditingFromReview] = useState(false)
  // When set, the review/confirm flow updates this claimed signup instead of inserting.
  const [editingSignupId, setEditingSignupId] = useState<string | null>(null)
  // The Answers object that has already been transmitted. Thanks can be
  // unmounted (desktop icons / header badge) and re-mounted via BACK; this
  // guard survives that so we never insert the same signup twice. A new
  // signup replaces `answers`, which naturally resets the guard.
  const submittedAnswersRef = useRef<Answers | null>(null)
  const [remoteSkills, setRemoteSkills] = useState<RemoteSkillOption[]>([])
  const [remoteLocations, setRemoteLocations] = useState<RemoteLocationOption[]>([])
  const [clustersFocus, setClustersFocus] = useState<ClustersTab>('directory')

  useEffect(() => {
    fetchSkillOptions().then(setRemoteSkills)
    fetchLocationOptions().then(setRemoteLocations)
  }, [])

  useEffect(() => {
    trackVisit()
    if (draft) track('draft_restored', draft.screen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    trackScreen(screen)
  }, [screen])
  useEffect(() => {
    if (graphOpen) track('graph_opened', screen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphOpen])

  // Autosave the in-progress signup so a refresh or closed tab never loses
  // answers. Welcome is excluded: saving the pristine entry state would only
  // churn (and could clobber a real draft before it is restored).
  const draftRef = useRef({ answers, screen, history })
  draftRef.current = { answers, screen, history }
  const editingRef = useRef(editingSignupId)
  editingRef.current = editingSignupId
  // Account edits are not drafted: a restored draft could not carry the
  // signup id safely, and would turn an edit into a duplicate insert.
  const skipDraftSave = (s: string) =>
    s === 'welcome' || NO_DRAFT_SCREENS.has(s) || editingRef.current !== null
  useEffect(() => {
    if (skipDraftSave(screen)) return
    const id = window.setTimeout(() => saveDraft(draftRef.current), 400)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, screen, history])
  useEffect(() => {
    const flush = () => {
      if (!skipDraftSave(draftRef.current.screen)) saveDraft(draftRef.current)
    }
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        onDraftChange={(v) => setAnswers((a) => ({ ...a, [f.key]: v || undefined }))}
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
          onSignIn={() => go('terminal')}
          onAbout={() => go('about')}
          onAdmin={() => go('adminGate')}
          onLogin={() => go('account')}
          onEnterDesert={() => setOnboarded(true)}
          setMode={setMode}
        />
      )
      break
    case 'login':
      content = (
        <LoginScreen
          key="login"
          onSuccess={() => {
            setHistory(['welcome'])
            setScreen('account')
          }}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'account':
      content = (
        <AccountScreen
          key="account"
          onEdit={(row) => {
            setAnswers(signupToAnswers(row))
            setEditingSignupId(row.id)
            go('review')
          }}
          onEditAbout={() => go('aboutMe')}
          onSignup={() => go('preStatus')}
          onLogin={() => go('login')}
          onExit={() => {
            setEditingSignupId(null)
            setAnswers(initialAnswers)
            setHistory([])
            setScreen('welcome')
          }}
          setMode={setMode}
        />
      )
      break
    case 'aboutMe':
      content = (
        <AboutMeScreen
          key="aboutMe"
          onDone={() => {
            setHistory(['welcome'])
            setScreen('account')
          }}
          setMode={setMode}
        />
      )
      break
    case 'adminGate':
      content = (
        <AdminGateScreen
          key="adminGate"
          onUnlock={() => go('admin')}
          onLogin={() => go('login')}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'admin':
      content = (
        <AdminTableScreen
          key="admin"
          onTelemetry={() => go('telemetry')}
          onBack={() => setScreen('welcome')}
          setMode={setMode}
        />
      )
      break
    case 'telemetry':
      content = <TelemetryScreen key="telemetry" onBack={back} setMode={setMode} />
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
          onDraftChange={(v) => setAnswers((a) => ({ ...a, contributionHistory: v || undefined }))}
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
          onDraftChange={(v) => setAnswers((a) => ({ ...a, otherInfo: v || undefined }))}
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
          onSubmit={() => {
            if (!editingSignupId) {
              go('thanks')
              return
            }
            const id = editingSignupId
            updateSignup(id, answers).then(() => {
              setEditingSignupId(null)
              setEditingFromReview(false)
              setAnswers(initialAnswers)
              setHistory(['welcome'])
              setScreen('account')
            })
          }}
          onDiscard={() => {
            clearDraft()
            setAnswers(initialAnswers)
            setHistory([])
            setEditingFromReview(false)
            if (editingSignupId) {
              setEditingSignupId(null)
              setScreen('account')
            } else {
              setScreen('welcome')
            }
          }}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'thanks':
      content = (
        <ThanksScreen
          key="thanks"
          answers={answers}
          setMode={setMode}
          alreadySubmitted={submittedAnswersRef.current === answers}
          onSubmitted={() => {
            submittedAnswersRef.current = answers
          }}
        />
      )
      break
    case 'profile':
      content = (
        <ProfileScreen
          key="profile"
          answers={answers}
          locations={answers.locations.map((l) => `${l.city}, ${l.country}`).join(' · ')}
          onBack={back}
          setMode={setMode}
        />
      )
      break
    case 'settings':
      content = <SettingsScreen key="settings" onBack={back} setMode={setMode} />
      break
    case 'events':
      content = (
        <EventsScreen key="events" answers={answers} onBack={back} />
      )
      break
    case 'horizons':
      content = (
        <HorizonsScreen key="horizons" answers={answers} onBack={back} />
      )
      break
    case 'myHorizons':
      content = (
        <MyHorizonsScreen key="myHorizons" answers={answers} onBack={back} />
      )
      break
    case 'contacts':
      content = <ContactsScreen key="contacts" onBack={back} />
      break
    case 'clusters':
      content = <ClustersScreen key={`clusters-${clustersFocus}`} onBack={back} initialTab={clustersFocus} />
      break
    case 'terminal':
      content = (
        <TerminalScreen key="terminal" onBack={back} setMode={setMode} />
      )
      break
    case 'announcements':
      content = <AnnouncementsScreen key="announcements" onBack={back} />
      break
    case 'globalChat':
      content = <GlobalChatScreen key="globalChat" onBack={back} />
      break
    case 'notes':
      content = <FinderScreen key="notes" onBack={back} hover={hover} onHover={onHover} />
      break
    case 'notifications':
      content = <NotificationsScreen key="notifications" onBack={back} />
      break
    case 'myChats':
      content = <MyChatsScreen key="myChats" onBack={back} />
      break
    case 'chronicle':
      content = <ChronicleScreen key="chronicle" onBack={back} />
      break
  }

  const openTerminal = () => {
    setGraphOpen(false)
    if (screen !== 'terminal') go('terminal')
  }

  const openGraph = () => setGraphOpen(true)

  const openAdmin = () => {
    setGraphOpen(false)
    if (!isAdminScreen(screen)) go('adminGate')
  }

  const openProfile = () => {
    setGraphOpen(false)
    if (screen !== 'profile') go('profile')
  }

  const openSettings = () => {
    setGraphOpen(false)
    if (screen !== 'settings') go('settings')
  }

  const openEvents = () => {
    setGraphOpen(false)
    if (screen !== 'events') go('events')
  }

  const openHorizons = () => {
    setGraphOpen(false)
    if (screen !== 'horizons') go('horizons')
  }

  const openMyHorizons = () => {
    setGraphOpen(false)
    const name = loadProfile(answers).displayName || answers.fullName || 'You'
    ensureDefaultHorizon(name)
    if (screen !== 'myHorizons') go('myHorizons')
  }

  const openContacts = () => {
    setGraphOpen(false)
    if (screen !== 'contacts') go('contacts')
  }

  const openClusters = (focus: ClustersTab) => {
    setGraphOpen(false)
    setClustersFocus(focus)
    if (screen !== 'clusters') go('clusters')
  }

  const openAnnouncements = () => {
    setGraphOpen(false)
    if (screen !== 'announcements') go('announcements')
  }

  const openGlobalChat = () => {
    setGraphOpen(false)
    if (screen !== 'globalChat') go('globalChat')
  }

  const openNotes = () => {
    setGraphOpen(false)
    if (screen !== 'notes') go('notes')
  }

  const openNotifications = () => {
    setGraphOpen(false)
    if (screen !== 'notifications') go('notifications')
  }

  const openMyChats = () => {
    setGraphOpen(false)
    if (screen !== 'myChats') go('myChats')
  }

  const openChronicle = () => {
    setGraphOpen(false)
    if (screen !== 'chronicle') go('chronicle')
  }

  return (
    <div
      className={`app${expanded ? ' is-expanded' : ''}${kind === 'window' ? ' has-window' : ' is-desert'}`}
      data-theme={theme}
    >
      <PixelDust />
      {kind !== 'onboarding' && (
        <DesktopIcons
          active={shellFeature(screen, graphOpen, clustersFocus)}
          onAnnouncements={openAnnouncements}
          onGlobalChat={openGlobalChat}
          onGraph={openGraph}
          onNotes={openNotes}
          onAdmin={openAdmin}
          onProfile={openProfile}
          onSettings={openSettings}
          onEvents={openEvents}
          onHorizons={openHorizons}
          onMyHorizons={openMyHorizons}
          onContacts={openContacts}
          onClusters={() => openClusters('directory')}
          onMyClusters={() => openClusters('mine')}
          onNotifications={openNotifications}
          onMyChats={openMyChats}
          onChronicle={openChronicle}
          onTerminal={openTerminal}
          avatarSrc={resolveAvatarUrl('self', profile.avatarDataUrl)}
          avatarLabel={profile.displayName || 'My profile'}
        />
      )}
      <div className="shell-stage" data-shell="stage">
        {kind === 'onboarding' && content}
        {kind === 'desert' && (
          <DesertField hoverId={hover?.id ?? null} onHover={onHover} />
        )}
        {kind === 'window' && (
          <TerminalFrame
            section={
              screen === 'clusters'
                ? clustersFocus === 'mine'
                  ? 'CL :: MY CLUSTERS'
                  : 'CL :: CLUSTERS'
                : SECTION[screen]
            }
            mode={mode}
            onOpenTerminal={openTerminal}
          >
            <div className={graphOpen ? 'form-layer is-hidden' : 'form-layer'} aria-hidden={graphOpen}>
              {content}
            </div>
            {graphOpen && (
              <div className="screen net-screen graph-overlay">
                <div className="title">N :: WORLD</div>
                <div className="net-intro dim">DROP INTO A WORLD · WALK LOCALLY · [GRAPH] TO RETURN</div>
                <NetworkGraph
                  selfName={profile.displayName || answers.fullName || 'You'}
                  selfAvatarUrl={profile.avatarDataUrl}
                  onOpenSelfProfile={openProfile}
                />
              </div>
            )}
          </TerminalFrame>
        )}
        {hover && kind !== 'onboarding' && (
          <IdentityPreview
            space={hover}
            onEnter={() => onHover(hover)}
            onLeave={() => onHover(null)}
          />
        )}
      </div>
    </div>
  )
}