export const ONBOARDING_KEY = 'hypernet_onboarded'

export const DESERT_HEADLINE =
  'Welcome to the digital desert. This place is boring and empty until you make it otherwise.'

export const HYPERNET_HEADLINE = 'HYPERNET: Find co-creators, share events, build community.'

export type OnboardingStepId = 'desert' | 'hypernet' | 'purpose' | 'start'

export const ONBOARDING_STEPS: OnboardingStepId[] = ['desert', 'hypernet', 'purpose', 'start']

export function readOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export function writeOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    /* quota */
  }
}

export function shellKind(
  screen: string,
  onboarded: boolean,
): 'onboarding' | 'desert' | 'window' {
  if (screen !== 'welcome') return 'window'
  return onboarded ? 'desert' : 'onboarding'
}
