import type { OrganizationAddress } from '@sedona/auth'

// ===========================================
// WIZARD DATA TYPES
// ===========================================

export interface OrganizationWizardData {
  // Step 1: Basic Info
  name: string
  slug: string
  industry: string

  // Step 2: Legal Info
  siret?: string
  siren?: string
  vatNumber?: string

  // Step 3: Contact Info
  address: OrganizationAddress
  phone?: string
  email?: string

  // Step 4: Invite Members
  invitedEmails: string[]
}

// ===========================================
// WIZARD STEP PROPS
// ===========================================

export interface WizardStepProps {
  data: Partial<OrganizationWizardData>
  updateData: (data: Partial<OrganizationWizardData>) => void
  goNext: () => void
  goPrevious: () => void
  isFirst: boolean
  isLast: boolean
  isSubmitting: boolean
  onComplete: () => Promise<void>
}

// ===========================================
// INDUSTRY OPTIONS
// ===========================================

export const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technologie / IT' },
  { value: 'services', label: 'Services' },
  { value: 'commerce', label: 'Commerce / Distribution' },
  { value: 'manufacturing', label: 'Industrie / Production' },
  { value: 'construction', label: 'Construction / BTP' },
  { value: 'healthcare', label: 'Sante' },
  { value: 'education', label: 'Education / Formation' },
  { value: 'finance', label: 'Finance / Assurance' },
  { value: 'real_estate', label: 'Immobilier' },
  { value: 'hospitality', label: 'Hotellerie / Restauration' },
  { value: 'transport', label: 'Transport / Logistique' },
  { value: 'media', label: 'Media / Communication' },
  { value: 'legal', label: 'Juridique' },
  { value: 'consulting', label: 'Conseil' },
  { value: 'nonprofit', label: 'Association / ONG' },
  { value: 'other', label: 'Autre' },
] as const

export type IndustryValue = (typeof INDUSTRY_OPTIONS)[number]['value']
