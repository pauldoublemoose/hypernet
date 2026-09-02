import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useKeys } from '../../hooks'
import {
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

function Section({
  id,
  title,
  explain,
  privacy,
  onPrivacy,
  children,
  wide,
}: {
  id: string
  title: string
  explain: string
  privacy: Visibility
  onPrivacy: (v: Visibility) => void
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
          </h2>
          <p className="profile-explain">{explain}</p>
        </div>
        <PrivacyToggle value={privacy} onChange={onPrivacy} />
      </header>
      {privacy === 'private' && (
        <div className="profile-private-note">Hidden from others · you still see this</div>
      )}
      {children}
    </section>
  )
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
  const [saved, setSaved] = useState(false)
  const { setEnterArmed } = useUi()

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
    onBack()
  })

  const persist = (next: ProfileData) => {
    setProfile(next)
    saveProfile(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 900)
  }

  const patch = (partial: Partial<ProfileData>) => persist({ ...profile, ...partial })

  const setPrivacy = (section: ProfileSection, value: Visibility) =>
    persist({ ...profile, privacy: { ...profile.privacy, [section]: value } })

  const onPickAvatar = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const avatarDataUrl = await readAvatarFile(file)
      patch({ avatarDataUrl })
    } catch {
      /* ignore bad files */
    }
  }

  return (
    <div className="screen profile-screen">
      <div className="profile-top">
        <div className="title">P :: NODE</div>
        <span className={`profile-save${saved ? ' is-flash' : ''}`}>
          {saved ? 'SAVED LOCALLY' : 'EDITS STAY ON THIS DEVICE'}
        </span>
      </div>
      <p className="profile-oneliner dim">You in the network.</p>

      <div className="profile-hero">
        <button
          type="button"
          className="profile-avatar"
          onClick={() => fileRef.current?.click()}
          title="Upload avatar"
          aria-label="Upload avatar"
        >
          {profile.avatarDataUrl ? (
            <img src={profile.avatarDataUrl} alt="" />
          ) : (
            <span className="profile-initials">{initials(profile.displayName)}</span>
          )}
        </button>
        <div className="profile-hero-meta">
          <label className="profile-name-label">
            <span className="dim">DISPLAY NAME</span>
            <input
              className="profile-name-input"
              value={profile.displayName}
              placeholder="YOUR NODE"
              spellCheck={false}
              onChange={(e) => patch({ displayName: e.target.value })}
            />
          </label>
          {locations ? <div className="dim profile-place">{locations}</div> : null}
          <div className="profile-hero-privacy">
            <span className="dim">AVATAR</span>
            <PrivacyToggle
              value={profile.privacy.avatar}
              onChange={(v) => setPrivacy('avatar', v)}
            />
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              [ {profile.avatarDataUrl ? 'REPLACE IMAGE' : 'UPLOAD AVATAR'} ]
            </button>
            {profile.avatarDataUrl ? (
              <button type="button" className="btn dim" onClick={() => patch({ avatarDataUrl: '' })}>
                [ REMOVE ]
              </button>
            ) : null}
          </div>
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
          privacy={profile.privacy.bio}
          onPrivacy={(v) => setPrivacy('bio', v)}
        >
          <div className="prompt-row">
            <textarea
              rows={4}
              value={profile.bio}
              placeholder="Who you are, what you build…"
              spellCheck={false}
              onChange={(e) => patch({ bio: e.target.value })}
            />
          </div>
        </Section>

        <Section
          id="profile-skills"
          title="SKILLS / INTERESTS"
          explain="Free text for now — how others will find you later."
          privacy={profile.privacy.skills}
          onPrivacy={(v) => setPrivacy('skills', v)}
        >
          <div className="prompt-row">
            <textarea
              rows={4}
              value={profile.skillsText}
              placeholder="carpentry, sound, kitchens, whatever you bring…"
              spellCheck={false}
              onChange={(e) => patch({ skillsText: e.target.value })}
            />
          </div>
        </Section>

        <Section
          id="profile-contact"
          title="CONTACT"
          explain="External channels. No in-app messaging yet."
          privacy={profile.privacy.contact}
          onPrivacy={(v) => setPrivacy('contact', v)}
          wide
        >
          <div className="profile-contact-fields">
          <label className="profile-field">
            <span className="dim">EMAIL</span>
            <div className="prompt-row">
              <input
                value={profile.email}
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
                value={profile.phone}
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
                value={profile.discord}
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
                value={profile.facebook}
                placeholder="—"
                spellCheck={false}
                onChange={(e) => patch({ facebook: e.target.value })}
              />
            </div>
          </label>
          </div>
        </Section>

        <Section
          id="profile-chronicle"
          title="CHRONICLE"
          explain="Your event history — what you've joined and the role you played."
          privacy={profile.privacy.chronicle}
          onPrivacy={(v) => setPrivacy('chronicle', v)}
          wide
        >
          <div className="profile-chronicle">
            <div className="profile-chronicle-empty">COMING SOON</div>
            <p className="dim">
              After events, Going attendance will land here. You can still set whether this
              section is public.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}
