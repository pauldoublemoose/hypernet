export type Status = 'subscriber' | 'prospect' | 'cocreator' | 'legacy' | 'admin'

export type ContactChannel = 'email' | 'phone' | 'discord' | 'facebook'

export interface Skill {
  category: string
  subcategory: string
  note?: string
}

export interface CustomSkillOption {
  category: string
  subcategory?: string
}

export interface Location {
  country: string
  city: string
}

export interface CustomLocationOption {
  country: string
  city?: string
}

export interface Answers {
  status?: Status
  fullName?: string
  email?: string
  phone?: string
  discord?: string
  facebook?: string
  contactChannels: ContactChannel[]
  locations: Location[]
  customLocations: CustomLocationOption[]
  attendedEvents: string[]
  contributionHistory?: string
  years: string[]
  skills: Skill[]
  customOptions: CustomSkillOption[]
  otherInfo?: string
}

export const initialAnswers: Answers = {
  contactChannels: [],
  locations: [],
  customLocations: [],
  attendedEvents: [],
  years: [],
  skills: [],
  customOptions: [],
}
