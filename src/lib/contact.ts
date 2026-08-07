/** Light email check — non-empty values must look like local@domain.tld */
export function isValidEmail(raw: string): boolean {
  const v = raw.trim().toLowerCase()
  if (!v) return true // empty = skip
  // no spaces; one @; domain has a dot; reasonable chars
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

/** Dial codes for the location taxonomy (used when re-splitting a stored number). */
export const COUNTRY_DIAL_CODES: Record<string, string> = {
  SWEDEN: '46',
  DENMARK: '45',
  NORWAY: '47',
  FINLAND: '358',
  GERMANY: '49',
  NETHERLANDS: '31',
  'UNITED KINGDOM': '44',
  FRANCE: '33',
  BELGIUM: '32',
  SWITZERLAND: '41',
  AUSTRIA: '43',
  SPAIN: '34',
  ITALY: '39',
  ISRAEL: '972',
  USA: '1',
}

/** Split a stored E.164-ish phone into code + local digits for editing. */
export function splitPhone(
  phone: string | undefined,
  fallbackCode: string,
): { code: string; number: string } {
  if (!phone) return { code: fallbackCode, number: '' }
  const digits = phone.replace(/\D/g, '')
  if (!digits) return { code: fallbackCode, number: '' }

  // Longest matching known dial code prefix
  const codes = [...new Set(Object.values(COUNTRY_DIAL_CODES))].sort(
    (a, b) => b.length - a.length,
  )
  for (const c of codes) {
    if (digits.startsWith(c) && digits.length > c.length) {
      return { code: c, number: digits.slice(c.length) }
    }
  }
  return { code: fallbackCode, number: digits }
}

export function joinPhone(code: string, number: string): string | undefined {
  const c = code.replace(/\D/g, '')
  const n = number.replace(/\D/g, '')
  if (!c && !n) return undefined
  if (!c || !n) return undefined // incomplete — caller should nudge
  return `+${c}${n}`
}

export function digitsOnly(raw: string, maxLen: number): string {
  return raw.replace(/\D/g, '').slice(0, maxLen)
}
