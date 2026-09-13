import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useKeys } from '../../hooks'
import {
  cloneProfile,
  initials,
  loadProfile,
  readAvatarFile,
  saveProfile,
  type ProfileData,
  type ProfileSection,
  type Visibility,
} from '../../lib/profileStore'
import type { Answers } from '../../types'
import { useUi } from '../../ui'
import type { InputMode } from '../TerminalFrame'

function PrivacyToggle({
  value,
  onChange,
}: {
  value: Visibility
  onChange: (v: Visibility) => void
}) {
  return (
    <div className="privacy-toggle" role="group" aria-label="Visibility">
      <button
        type="button"
        className={`privacy-btn${value === 'public' ? ' is-on' : ''}`}
        aria-pressed={value === 'public'}
        onClick={() => onChange('public')}
      >
        PUBLIC
      </button>
      <button
        type="button"
        className={`privacy-btn${value === 'private' ? ' is-on' : ''}`}
        aria-pressed={value === 'private'}
        onClick={() => onChange('private')}
      >
        PRIVATE
      </button>
    </div>
  )
}

function PrivacyBadge({ value }: { value: Visibility }) {
  return (
    <span
      className={`privacy-badge${value === 'private' ? ' is-private' : ''}`}
      title={value === 'private' ? 'Hidden from others' : 'Visible to others'}
    >
      {value === 'private' ? 'PRIVATE' : 'PUBLIC'}
    </span>
  )
}

function Section({
  id,
  title,
  explain,
  privacy,
  onPrivacy,
  editing,
  children,
  wide,
}: {
  id: string
  title: string
  explain: string
  privacy: Visibility
  onPrivacy: (v: Visibility) => void
  editing: boolean
  children: ReactNode
  wide?: boolean
}) {
  return (
    <section
      className={`profile-section${wide ? ' is-wide' : ''}${privacy === 'private' ? ' is-private' : ''}`}
      aria-labelledby={id}
    >
      <header className="profile-section-head">
        <div>
          <h2 id={id} className="profile-section-title">
            {title}
            {!editing && <PrivacyBadge value={privacy} />}
          </h2>
          {editing && <p className="profile-explain">{explain}</p>}
        </div>
        {editing && <PrivacyToggle value={privacy} onChange={onPrivacy} />}
      </header>
      {editing && privacy === 'private' && (
        <div className="profile-private-note">Hidden from others · you still see this</div>
      )}
      {children}
    </section>
  )
}

function blank(value: string) {
  return !value.trim()
}

function ViewText({ value, empty }: { value: string; empty: string }) {
  if (blank(value)) return <p className="profile-empty dim">{empty}</p>
  return <p className="profile-view-text">{value}</p>
}

export function ProfileScreen({
  answers,
  locations,
  onBack,
  setMode,
}: {
  answers: Answers
  locations: string
  onBack: () => void
  setMode: (m: InputMode) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<ProfileData>(() => loadProfile(answers))
  const [draft, setDraft] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const { setEnterArmed } = useUi()
  const shown = editing && draft ? draft : profile

  useLayoutEffect(() => {
    setMode('NAV')
    setEnterArmed(false)
  }, [setMode, setEnterArmed])

  useKeys((e) => {
    if (e.key !== 'Backspace') return
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (e.isTrusted) return
    }
    e.preventDefault()
    if (editing) {
      setDraft(null)
      setEditing(false)
      return
    }
    onBack()
  })

  const persist = (next: ProfileData) => {
    setProfile(next)
    saveProfile(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 900)
  }

  const patch = (partial: Partial<ProfileData>) => {
    if (!draft) return
    setDraft({ ...draft, ...partial })
  }

  const setPrivacy = (section: ProfileSection, value: Visibility) => {
    if (!draft) return
    setDraft({ ...draft, privacy: { ...draft.privacy, [section]: value } })
  }

  const startEdit = () => {
    setDraft(cloneProfile(profile))
    setEditing(true)
    setSaved(false)
  }

  const cancelEdit = () => {
    setDraft(null)
    setEditing(false)
  }

  const saveEdit = () => {
    if (!draft) return
    persist(draft)
    setDraft(null)
    setEditing(false)
  }

  const onPickAvatar = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const avatarDataUrl = await readAvatarFile(file)
      patch({ avatarDataUrl })
    } catch {
      /* ignore bad files */
    }
  }

  const contacts = [
    { label: 'EMAIL', value: shown.email },
    { label: 'PHONE / WHATSAPP', value: shown.phone },
    { label: 'DISCORD', value: shown.discord },
    { label: 'FACEBOOK', value: shown.facebook },
  ]
  const listedContacts = contacts.filter((c) => !blank(c.value))

  return (
    <div className={`screen profile-screen${editing ? ' is-editing' : ' is-viewing'}`}>
      <div className="profile-top">
        <div className="title">P :: NODE</div>
        {editing ? (
          <div className="profile-actions">
            <button type="button" className="btn" onClick={saveEdit}>
              [ SAVE ]
            </button>
            <button type="button" className="btn dim" onClick={cancelEdit}>
              [ CANCEL ]
            </button>
          </div>
        ) : (
          <div className="profile-actions">
            <span className={`profile-save${saved ? ' is-flash' : ''}`}>
              {saved ? 'SAVED LOCALLY' : ''}
            </span>
            <button type="button" className="btn" onClick={startEdit}>
              [ EDIT MY PROFILE ]
            </button>
          </div>
        )}
      </div>
      <p className="profile-oneliner dim">
        {editing ? 'Editing — privacy toggles are on until you save or cancel.' : 'You in the network.'}
      </p>

      <div className="profile-hero">
        {editing ? (
          <button
            type="button"
            className="profile-avatar"
            onClick={() => fileRef.current?.click()}
            title="Upload avatar"
            aria-label="Upload avatar"
          >
            {shown.avatarDataUrl ? (
              <img src={shown.avatarDataUrl} alt="" />
            ) : (
              <span className="profile-initials">{initials(shown.displayName)}</span>
            )}
          </button>
        ) : (
          <div className="profile-avatar is-static">
            {shown.avatarDataUrl ? (
              <img src={shown.avatarDataUrl} alt="" />
            ) : (
              <span className="profile-initials">{initials(shown.displayName)}</span>
            )}
          </div>
        )}
        <div className="profile-hero-meta">
          {editing ? (
            <label className="profile-name-label">
              <span className="dim">DISPLAY NAME</span>
              <input
                className="profile-name-input"
                value={shown.displayName}
                placeholder="YOUR NODE"
                spellCheck={false}
                onChange={(e) => patch({ displayName: e.target.value })}
              />
            </label>
          ) : (
            <h1 className="profile-name-display">
              {shown.displayName.trim() || 'YOUR NODE'}
              <PrivacyBadge value={shown.privacy.avatar} />
            </h1>
          )}
          {locations ? <div className="dim profile-place">{locations}</div> : null}
          {editing && (
            <>
              <div className="profile-hero-privacy">
                <span className="dim">AVATAR</span>
                <PrivacyToggle
                  value={shown.privacy.avatar}
                  onChange={(v) => setPrivacy('avatar', v)}
                />
              </div>
              <div className="btn-row">
                <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
                  [ {shown.avatarDataUrl ? 'REPLACE IMAGE' : 'UPLOAD AVATAR'} ]
                </button>
                {shown.avatarDataUrl ? (
                  <button
                    type="button"
                    className="btn dim"
                    onClick={() => patch({ avatarDataUrl: '' })}
                  >
                    [ REMOVE ]
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void onPickAvatar(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div className="profile-grid">
        <Section
          id="profile-bio"
          title="BIO"
          explain="A short description of you."
          privacy={shown.privacy.bio}
          onPrivacy={(v) => setPrivacy('bio', v)}
          editing={editing}
        >
          {editing ? (
            <div className="prompt-row">
              <textarea
                rows={4}
                value={shown.bio}
                placeholder="Who you are, what you build…"
                spellCheck={false}
                onChange={(e) => patch({ bio: e.target.value })}
              />
            </div>
          ) : (
            <ViewText value={shown.bio} empty="No bio yet." />
          )}
        </Section>

        <Section
          id="profile-skills"
          title="SKILLS / INTERESTS"
          explain="Free text for now — how others will find you later."
          privacy={shown.privacy.skills}
          onPrivacy={(v) => setPrivacy('skills', v)}
          editing={editing}
        >
          {editing ? (
            <div className="prompt-row">
              <textarea
                rows={4}
                value={shown.skillsText}
                placeholder="carpentry, sound, kitchens, whatever you bring…"
                spellCheck={false}
                onChange={(e) => patch({ skillsText: e.target.value })}
              />
            </div>
          ) : (
            <ViewText value={shown.skillsText} empty="No skills listed yet." />
          )}
        </Section>

        <Section
          id="profile-contact"
          title="CONTACT"
          explain="External channels. No in-app messaging yet."
          privacy={shown.privacy.contact}
          onPrivacy={(v) => setPrivacy('contact', v)}
          editing={editing}
          wide
        >
          {editing ? (
            <div className="profile-contact-fields">
              <label className="profile-field">
                <span className="dim">EMAIL</span>
                <div className="prompt-row">
                  <input
                    value={shown.email}
                    placeholder="—"
                    spellCheck={false}
                    onChange={(e) => patch({ email: e.target.value })}
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="dim">PHONE / WHATSAPP</span>
                <div className="prompt-row">
                  <input
                    value={shown.phone}
                    placeholder="—"
                    spellCheck={false}
                    onChange={(e) => patch({ phone: e.target.value })}
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="dim">DISCORD</span>
                <div className="prompt-row">
                  <input
                    value={shown.discord}
                    placeholder="—"
                    spellCheck={false}
                    onChange={(e) => patch({ discord: e.target.value })}
                  />
                </div>
              </label>
              <label className="profile-field">
                <span className="dim">FACEBOOK</span>
                <div className="prompt-row">
                  <input
                    value={shown.facebook}
                    placeholder="—"
                    spellCheck={false}
                    onChange={(e) => patch({ facebook: e.target.value })}
                  />
                </div>
              </label>
            </div>
          ) : listedContacts.length ? (
            <ul className="profile-contact-list">
              {listedContacts.map((c) => (
                <li key={c.label} className="profile-contact-item">
                  <span className="dim">{c.label}</span>
                  <span>{c.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="profile-empty dim">No contact listed yet.</p>
          )}
        </Section>

        <Section
          id="profile-chronicle"
          title="CHRONICLE"
          explain="Your event history — what you've joined and the role you played."
          privacy={shown.privacy.chronicle}
          onPrivacy={(v) => setPrivacy('chronicle', v)}
          editing={editing}
          wide
        >
          <div className="profile-chronicle">
            <div className="profile-chronicle-empty">COMING SOON</div>
            {editing && (
              <p className="dim">
                After events, Going attendance will land here. You can still set whether this
                section is public.
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}
