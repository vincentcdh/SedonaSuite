// ===========================================
// USER TYPES
// ===========================================

export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  phone?: string | null
  locale?: string
  timezone?: string
  twoFactorEnabled?: boolean
  createdAt: Date
  updatedAt: Date
}

// ===========================================
// SESSION TYPES
// ===========================================

export interface AuthSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress?: string | null
  userAgent?: string | null
  currentOrganizationId?: string | null
}

// ===========================================
// ORGANIZATION TYPES
// ===========================================

export type OrganizationRole = 'owner' | 'admin' | 'member'

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null

  // French business info (custom metadata)
  siret?: string | null
  siren?: string | null
  vatNumber?: string | null
  legalName?: string | null

  // Address (custom metadata)
  addressStreet?: string | null
  addressComplement?: string | null
  addressPostalCode?: string | null
  addressCity?: string | null
  addressCountry?: string | null

  // Contact (custom metadata)
  phone?: string | null
  email?: string | null
  website?: string | null

  // Subscription
  subscriptionPlan?: 'FREE' | 'PRO' | 'ENTERPRISE'
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

  createdAt: Date
  updatedAt?: Date
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  joinedAt: Date | null
  invitedAt?: Date | null
  invitedBy?: string | null
}

// ===========================================
// AUTH STATE TYPES
// ===========================================

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  organization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  isAuthenticated: boolean
}

// ===========================================
// AUTH ACTION TYPES
// ===========================================

export interface SignUpInput {
  email: string
  password: string
  name: string
  organizationName?: string
}

export interface SignInInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ResetPasswordInput {
  email: string
}

export interface NewPasswordInput {
  token: string
  password: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  locale?: string
  timezone?: string
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
}

// ===========================================
// INVITATION TYPES
// ===========================================

export interface InviteMemberInput {
  email: string
  role: OrganizationRole
  organizationId: string
}

export interface AcceptInvitationInput {
  token: string
  name?: string
  password?: string
}

// ===========================================
// CALLBACK TYPES
// ===========================================

export type AuthCallback = () => void | Promise<void>
export type AuthErrorCallback = (error: Error) => void | Promise<void>
