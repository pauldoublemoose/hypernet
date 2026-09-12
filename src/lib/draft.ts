import type { Answers } from '../types'

/**
 * Autosaved signup draft so an accidental refresh or closed tab never
 * loses in-progress answers. Cleared on successful transmission.
 */

const DRAFT_KEY = 'hypernet_signup_draft'
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface SignupDraft {
  savedAt: number
  answers: Answers
  screen: string
  history: string[]
}

export function loadDraft(): SignupDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as SignupDraft
    if (!draft || typeof draft !== 'object' || !draft.answers) return null
    if (Date.now() - (draft.savedAt ?? 0) > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function saveDraft(draft: Omit<SignupDraft, 'savedAt'>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch {
    /* storage unavailable; nothing to do */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
}
