import type { Answers } from '../types'

export type Visibility = 'public' | 'private'

export type ProfileSection = 'avatar' | 'bio' | 'skills' | 'contact' | 'chronicle'

export interface ProfileData {
  displayName: string
  bio: string
  skillsText: string
  email: string
  phone: string
  discord: string
  facebook: string
  avatarDataUrl: string
  privacy: Record<ProfileSection, Visibility>
}

const STORAGE_KEY = 'hypernet_profile'
const PRIVACY_DEFAULT_KEY = 'hypernet_privacy_default'

export const DEFAULT_PRIVACY: Record<ProfileSection, Visibility> = {
  avatar: 'public',
  bio: 'public',
  skills: 'public',
  contact: 'public',
  chronicle: 'public',
}

export function loadPrivacyDefault(): Visibility {
  try {
    const raw = localStorage.getItem(PRIVACY_DEFAULT_KEY)
    if (raw === 'private') return 'private'
  } catch {
    /* ignore */
  }
  return 'public'
}

export function savePrivacyDefault(value: Visibility) {
  try {
    localStorage.setItem(PRIVACY_DEFAULT_KEY, value)
  } catch {
    /* ignore */
  }
}

export function privacyDefaults(
  value: Visibility = loadPrivacyDefault(),
): Record<ProfileSection, Visibility> {
  return {
    avatar: value,
    bio: value,
    skills: value,
    contact: value,
    chronicle: value,
  }
}

export function emptyProfile(): ProfileData {
  return {
    displayName: '',
    bio: '',
    skillsText: '',
    email: '',
    phone: '',
    discord: '',
    facebook: '',
    avatarDataUrl: '',
    privacy: privacyDefaults(),
  }
}

function readStored(): Partial<ProfileData> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ProfileData>
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function fillBlanks(profile: ProfileData, answers: Answers): ProfileData {
  const next = { ...profile, privacy: { ...privacyDefaults(), ...profile.privacy } }
  if (!next.displayName && answers.fullName) next.displayName = answers.fullName
  if (!next.bio && answers.otherInfo) next.bio = answers.otherInfo
  if (!next.email && answers.email) next.email = answers.email
  if (!next.phone && answers.phone) next.phone = answers.phone
  if (!next.discord && answers.discord) next.discord = answers.discord
  if (!next.facebook && answers.facebook) next.facebook = answers.facebook
  if (!next.skillsText && answers.skills.length) {
    next.skillsText = answers.skills
      .map((s) => {
        const tag = s.subcategory ? `${s.category} / ${s.subcategory}` : s.category
        return s.note ? `${tag} — ${s.note}` : tag
      })
      .join('\n')
  }
  return next
}

/** Load the local profile, filling empty fields from signup answers when present. */
/** True if this browser already has a saved local profile (returning user). */
export function hasSavedProfile(): boolean {
  const stored = readStored()
  if (!stored) return false
  return Boolean(
    (stored.displayName && stored.displayName.trim()) ||
      (stored.bio && stored.bio.trim()) ||
      (stored.email && stored.email.trim()) ||
      (stored.phone && stored.phone.trim()) ||
      (stored.discord && stored.discord.trim()) ||
      (stored.facebook && stored.facebook.trim()) ||
      (stored.skillsText && stored.skillsText.trim()) ||
      stored.avatarDataUrl,
  )
}

export function loadProfile(answers: Answers): ProfileData {
  const stored = readStored()
  const base = stored
    ? {
        ...emptyProfile(),
        ...stored,
        privacy: { ...privacyDefaults(), ...stored.privacy },
      }
    : emptyProfile()
  return fillBlanks(base, answers)
}

export function saveProfile(profile: ProfileData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    /* quota / private mode */
  }
}

export function cloneProfile(profile: ProfileData): ProfileData {
  return { ...profile, privacy: { ...profile.privacy } }
}

/** Square-crop an image file to a small JPEG data URL for localStorage. */
export function readAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('no canvas'))
          return
        }
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.84))
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
