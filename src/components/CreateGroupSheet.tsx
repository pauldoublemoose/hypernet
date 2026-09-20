import { useState } from 'react'
import { createCluster, type ClusterVisibility } from '../lib/groupsStore'
import { emptyIdentity, saveIdentity } from '../lib/identity'
import { loadProfile } from '../lib/profileStore'
import type { Answers } from '../types'
import { CardThumb } from './CardThumb'
import { CreateAccord, CreateCover, CreateSheet } from './CreateSheet'
import { IdentityEdit } from './IdentityEdit'

export function CreateGroupSheet({
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
  const [cover, setCover] = useState('')
  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [visibility, setVisibility] = useState<ClusterVisibility>('public')
  const [location, setLocation] = useState('')
  const [identity, setIdentity] = useState(emptyIdentity)

  const submit = () => {
    if (!name.trim()) return
    const group = createCluster({
      name,
      description: about,
      visibility,
      imageUrl: cover,
      location,
    })
    saveIdentity('group', group.id, identity)
    onCreated(group.id)
  }

  return (
    <CreateSheet
      title="Create group"
      shell="create-group"
      onClose={onCancel}
      ctaLabel="Create group"
      ctaDisabled={!name.trim()}
      onCta={submit}
    >
      <CreateCover url={cover} onUrl={setCover} />
      <div className="create-host">
        <div className="create-host-btn" data-shell="create-host">
          <CardThumb src={profile.avatarDataUrl} label={hostName} shape="circle" size="sm" />
          <span className="create-host-copy">
            <span>{hostName}</span>
            <span className="dim">Admin — Your profile</span>
          </span>
        </div>
      </div>
      <label className="create-field">
        <span className="visually-hidden">Group name</span>
        <input
          className="profile-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          aria-label="Group name"
          data-shell="create-name"
        />
      </label>
      <label className="create-field">
        <span className="visually-hidden">About</span>
        <textarea
          className="profile-input profile-textarea"
          rows={3}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="About this camp or crew"
          aria-label="About"
        />
      </label>
      <label className="create-field">
        <span className="visually-hidden">Privacy</span>
        <select
          className="profile-input"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as ClusterVisibility)}
          aria-label="Who can see this"
        >
          <option value="public">Who can see this? Public</option>
          <option value="private">Who can see this? Private</option>
        </select>
      </label>
      <label className="create-field">
        <span className="visually-hidden">Location</span>
        <input
          className="profile-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          aria-label="Location"
        />
      </label>
      <label className="create-field">
        <span>Find Me</span>
        <textarea
          className="profile-input profile-textarea"
          rows={2}
          value={identity.findMe}
          onChange={(e) => setIdentity({ ...identity, findMe: e.target.value })}
          placeholder="Theme, camp vibe, what the crew is for"
          aria-label="Find Me"
          data-shell="find-me"
        />
      </label>
      <CreateAccord id="members" label="Add members">
        <p className="dim hz-lead">Add members later. You are the first member and admin.</p>
      </CreateAccord>
      <CreateAccord id="admins" label="Admins">
        <p className="dim hz-lead">You admin this group. More admins later.</p>
      </CreateAccord>
      <CreateAccord id="more" label="More settings">
        <IdentityEdit
          kind="group"
          base={{
            kind: 'group',
            id: 'draft',
            title: name,
            subtitle: visibility,
            body: about,
            imageUrl: cover,
          }}
          value={identity}
          onChange={setIdentity}
        />
      </CreateAccord>
    </CreateSheet>
  )
}
