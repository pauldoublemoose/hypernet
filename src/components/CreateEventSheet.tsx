import { useMemo, useState } from 'react'
import {
  areFriends,
  ensureDefaultLists,
  ensureSeedFriendshipGraph,
  loadPeople,
  selfId,
} from '../lib/contactsStore'
import { clustersIAdmin } from '../lib/groupsStore'
import { createEvent, type EventPrivacy } from '../lib/horizonStore'
import { emptyIdentity, saveIdentity } from '../lib/identity'
import { loadProfile } from '../lib/profileStore'
import type { Answers } from '../types'
import { CardThumb } from './CardThumb'
import { CreateAccord, CreateCover, CreateSheet } from './CreateSheet'
import { IdentityEdit } from './IdentityEdit'

const TIMEZONES = ['UTC', 'GMT', 'CET', 'CEST', 'EET', 'EST', 'PST']

const PRIVACY: { value: EventPrivacy; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'only_me', label: 'Only me' },
]

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function CreateEventSheet({
  answers,
  onCancel,
  onCreated,
}: {
  answers: Answers
  onCancel: () => void
  onCreated: (id: string) => void
}) {
  const profile = loadProfile(answers)
  const hostName = profile.displayName || answers.fullName || 'You'
  const people = useMemo(() => {
    ensureSeedFriendshipGraph()
    return loadPeople().filter((p) => p.id !== selfId())
  }, [])
  const lists = useMemo(() => ensureDefaultLists(), [])
  const adminGroups = clustersIAdmin()

  const [cover, setCover] = useState('')
  const [host, setHost] = useState<'self' | string>('self')
  const [hostOpen, setHostOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayIso)
  const [startTime, setStartTime] = useState('14:00')
  const [timezone, setTimezone] = useState('CEST')
  const [showEnd, setShowEnd] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [venueKind, setVenueKind] = useState<'' | 'physical' | 'virtual'>('')
  const [venue, setVenue] = useState('')
  const [privacy, setPrivacy] = useState<EventPrivacy>('everyone')
  const [privacyListIds, setPrivacyListIds] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [cohosts, setCohosts] = useState<string[]>([])
  const [recurrence, setRecurrence] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [identity, setIdentity] = useState(emptyIdentity)

  const hostGroup = adminGroups.find((g) => g.id === host)
  const hostLabel = host === 'self' ? hostName : hostGroup?.name || hostName
  const hostHint = host === 'self' ? 'Host — Your profile' : 'Host — Group'

  const submit = () => {
    if (!title.trim()) return
    const ownerGroupIds = host === 'self' ? [] : [host]
    const ev = createEvent({
      title,
      date,
      description,
      externalUrl: venueKind === 'virtual' ? venue || externalUrl : externalUrl,
      hostName: hostLabel,
      ownerIds: [selfId(), ...cohosts],
      ownerGroupIds,
      privacy,
      privacyListIds: privacy === 'contacts' ? privacyListIds : [],
      imageUrl: cover,
      startTime,
      timezone,
      endDate: showEnd ? endDate : '',
      endTime: showEnd ? endTime : '',
      venueKind: venueKind || undefined,
      venue,
      recurrence,
    })
    saveIdentity('event', ev.id, identity)
    onCreated(ev.id)
  }

  return (
    <CreateSheet
      title="Create event"
      shell="create-event"
      onClose={onCancel}
      ctaLabel="Create event"
      ctaDisabled={!title.trim()}
      onCta={submit}
    >
      <CreateCover url={cover} onUrl={setCover} />
      <div className="create-host">
        <button
          type="button"
          className="create-host-btn"
          data-shell="create-host"
          aria-expanded={hostOpen}
          onClick={() => setHostOpen((o) => !o)}
        >
          <CardThumb
            src={host === 'self' ? profile.avatarDataUrl : hostGroup?.imageUrl}
            label={hostLabel}
            shape={host === 'self' ? 'circle' : 'square'}
            size="sm"
          />
          <span className="create-host-copy">
            <span>{hostLabel}</span>
            <span className="dim">{hostHint}</span>
          </span>
          <span className="dim" aria-hidden>
            ▾
          </span>
        </button>
        {hostOpen ? (
          <div className="create-host-menu" role="listbox" aria-label="Host">
            <button
              type="button"
              className={`create-host-opt${host === 'self' ? ' is-on' : ''}`}
              onClick={() => {
                setHost('self')
                setHostOpen(false)
              }}
            >
              {hostName} — Your profile
            </button>
            {adminGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`create-host-opt${host === g.id ? ' is-on' : ''}`}
                onClick={() => {
                  setHost(g.id)
                  setHostOpen(false)
                }}
              >
                {g.name} — Group
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <label className="create-field">
        <span className="visually-hidden">Event name</span>
        <input
          className="profile-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event name"
          aria-label="Event name"
          data-shell="create-name"
        />
      </label>
      <div className="create-dt">
        <label className="create-field">
          <span>Start date</span>
          <input
            className="profile-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Start date"
          />
        </label>
        <label className="create-field">
          <span>Start time</span>
          <input
            className="profile-input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            aria-label="Start time"
          />
        </label>
        <label className="create-field">
          <span>Timezone</span>
          <select
            className="profile-input"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            aria-label="Timezone"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
      </div>
      {showEnd ? (
        <div className="create-dt">
          <label className="create-field">
            <span>End date</span>
            <input
              className="profile-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />
          </label>
          <label className="create-field">
            <span>End time</span>
            <input
              className="profile-input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-label="End time"
            />
          </label>
        </div>
      ) : (
        <button type="button" className="create-link" data-shell="create-end" onClick={() => setShowEnd(true)}>
          + End date and time
        </button>
      )}
      <label className="create-field">
        <span className="visually-hidden">Physical or virtual</span>
        <select
          className="profile-input"
          value={venueKind}
          onChange={(e) => setVenueKind(e.target.value as typeof venueKind)}
          aria-label="Physical or virtual"
        >
          <option value="">Is this a physical or virtual event?</option>
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
        </select>
      </label>
      {venueKind ? (
        <label className="create-field">
          <span className="visually-hidden">{venueKind === 'virtual' ? 'Link' : 'Location'}</span>
          <input
            className="profile-input"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder={venueKind === 'virtual' ? 'Event link' : 'Location'}
            aria-label={venueKind === 'virtual' ? 'Event link' : 'Location'}
          />
        </label>
      ) : null}
      <label className="create-field">
        <span className="visually-hidden">Who can see this</span>
        <select
          className="profile-input"
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value as EventPrivacy)}
          aria-label="Who can see this"
        >
          {PRIVACY.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Who can see this? {opt.label}
            </option>
          ))}
        </select>
      </label>
      {privacy === 'contacts' ? (
        <div className="hz-checks">
          {lists.map((l) => (
            <label key={l.id} className="hz-check">
              <input
                type="checkbox"
                checked={privacyListIds.includes(l.id)}
                onChange={() =>
                  setPrivacyListIds((prev) =>
                    prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id],
                  )
                }
              />
              <span>{l.name}</span>
            </label>
          ))}
        </div>
      ) : null}
      <label className="create-field">
        <span className="visually-hidden">What do people need to know</span>
        <textarea
          className="profile-input profile-textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do people need to know?"
          aria-label="What do people need to know"
        />
      </label>
      <label className="create-field">
        <span>Find Me</span>
        <textarea
          className="profile-input profile-textarea"
          rows={2}
          value={identity.findMe}
          onChange={(e) => setIdentity({ ...identity, findMe: e.target.value })}
          placeholder="Theme, vibe, who it is for"
          aria-label="Find Me"
          data-shell="find-me"
        />
      </label>
      <CreateAccord id="cohosts" label="Add co-hosts">
        {people.length === 0 ? (
          <p className="dim hz-lead">No people in the directory yet.</p>
        ) : (
          <div className="hz-checks">
            {people.map((p) => (
              <label key={p.id} className="hz-check">
                <input
                  type="checkbox"
                  checked={cohosts.includes(p.id)}
                  onChange={() =>
                    setCohosts((prev) =>
                      prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                    )
                  }
                />
                <span>
                  {p.displayName}
                  {areFriends(p.id) ? ' · Friend' : ''}
                </span>
              </label>
            ))}
          </div>
        )}
      </CreateAccord>
      <CreateAccord id="recurring" label="Recurring event">
        <label className="create-field">
          <span>Repeat</span>
          <select
            className="profile-input"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            aria-label="Repeat"
          >
            <option value="">Does not repeat</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
      </CreateAccord>
      <CreateAccord id="more" label="More settings">
        <label className="create-field">
          <span>External URL</span>
          <input
            className="profile-input"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <IdentityEdit
          kind="event"
          base={{
            kind: 'event',
            id: 'draft',
            title,
            subtitle: date,
            body: description,
            imageUrl: cover,
          }}
          value={identity}
          onChange={setIdentity}
        />
      </CreateAccord>
    </CreateSheet>
  )
}
