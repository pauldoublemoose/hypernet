/**
 * Where the Supabase client keeps the session.
 *
 * localStorage is the primary store, but it throws outright in private-mode
 * Safari and in some in-app browsers, where the default adapter would drop the
 * login on the floor mid-visit. Mirroring every write in memory keeps the
 * session alive for the rest of the tab's life; surviving until tomorrow is
 * api/session.ts's job.
 */

const memory = new Map<string, string>()

function guarded<T>(fn: (ls: Storage) => T, fallback: T): T {
  try {
    return fn(window.localStorage)
  } catch {
    return fallback
  }
}

export const authStorage = {
  getItem(key: string): string | null {
    return guarded((ls) => ls.getItem(key), null) ?? memory.get(key) ?? null
  },
  setItem(key: string, value: string): void {
    memory.set(key, value)
    guarded((ls) => ls.setItem(key, value), undefined)
  },
  removeItem(key: string): void {
    memory.delete(key)
    guarded((ls) => ls.removeItem(key), undefined)
  },
}
