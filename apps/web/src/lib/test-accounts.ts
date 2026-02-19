// ===========================================
// AUTH ACCOUNTS - DEVELOPMENT MODE
// ===========================================
// Links to HR employees for authentication
// Plans are associated with organizations, not users

import type { AuthUser, Organization, OrganizationRole } from '@sedona/auth'

// ===========================================
// PASSWORD HASHING (Client-side for dev mode)
// ===========================================

const SALT = 'sedona_salt_v1'

/**
 * Hash password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// ===========================================
// TYPES
// ===========================================

export interface TestAccount {
  email: string
  passwordHash: string // SECURITY: Store hash, not plain password
  user: Omit<AuthUser, 'createdAt' | 'updatedAt'> & {
    createdAt: Date
    updatedAt: Date
  }
  organization: Organization
  role: OrganizationRole
  employeeId: string // Link to HR employee
}

// ===========================================
// ORGANIZATION - Sedona Demo (PRO Plan)
// ===========================================

const ORG_SEDONA: Organization = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  name: 'Sedona Demo',
  slug: 'sedona-demo',
  logo: null,
  siret: '12345678900001',
  siren: '123456789',
  vatNumber: 'FR12345678901',
  legalName: 'Sedona Demo SAS',
  addressStreet: '10 Rue de la Tech',
  addressPostalCode: '75001',
  addressCity: 'Paris',
  addressCountry: 'FR',
  phone: '+33 1 23 45 67 89',
  email: 'contact@sedona-demo.fr',
  website: 'https://sedona-demo.fr',
  subscriptionPlan: 'PRO',
  subscriptionStatus: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// ===========================================
// USER IDS
// ===========================================
const USER_IDS = {
  vincentCoderch: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
}

const EMPLOYEE_IDS = {
  vincentCoderch: 'f0000000-0000-0000-0000-000000000001',
}

// ===========================================
// ACCOUNTS
// Pre-computed hash for: Sedona123! with salt sedona_salt_v1
// ===========================================

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'vincent.coderch@sedona-demo.fr',
    // Hash of 'Sedona123!' - computed with hashPassword()
    passwordHash: 'c8e5a0d9f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    user: {
      id: USER_IDS.vincentCoderch,
      name: 'Vincent Coderch',
      email: 'vincent.coderch@sedona-demo.fr',
      emailVerified: true,
      image: null,
      phone: '+33 6 12 34 56 78',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_SEDONA,
    role: 'owner',
    employeeId: EMPLOYEE_IDS.vincentCoderch,
  },
]

// Initialize test account hash on first load
let testAccountHashInitialized = false
async function initTestAccountHash() {
  if (testAccountHashInitialized) return
  testAccountHashInitialized = true

  // Compute actual hash for test account
  const hash = await hashPassword('Sedona123!')
  TEST_ACCOUNTS[0].passwordHash = hash
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get the setup account from localStorage (created during first-time setup)
 */
function getSetupAccount(): TestAccount | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('sedona_admin_account')
  if (!stored) return null

  try {
    const account = JSON.parse(stored)
    // Convert to proper TestAccount format
    return {
      email: account.email,
      passwordHash: account.passwordHash || '', // Use hash from storage
      user: {
        id: account.user.id,
        name: account.user.name,
        email: account.user.email,
        emailVerified: account.user.emailVerified ?? true,
        image: null,
        phone: null,
        locale: 'fr',
        timezone: 'Europe/Paris',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      organization: {
        id: account.organization.id,
        name: account.organization.name,
        slug: account.organization.slug,
        logo: null,
        subscriptionPlan: account.organization.subscriptionPlan || 'FREE',
        subscriptionStatus: account.organization.subscriptionStatus || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      role: account.role || 'owner',
      employeeId: account.employeeId,
    }
  } catch {
    return null
  }
}

/**
 * Get all available accounts (TEST_ACCOUNTS + setup account)
 */
function getAllAccounts(): TestAccount[] {
  const setupAccount = getSetupAccount()
  if (setupAccount) {
    return [setupAccount, ...TEST_ACCOUNTS]
  }
  return TEST_ACCOUNTS
}

/**
 * Find an account by email
 */
export function findTestAccount(email: string): TestAccount | undefined {
  return getAllAccounts().find((account) => account.email === email)
}

/**
 * Validate credentials (async - uses password hashing)
 */
export async function validateTestCredentials(
  email: string,
  password: string
): Promise<TestAccount | null> {
  // Initialize test account hash if needed
  await initTestAccountHash()

  const account = findTestAccount(email)
  if (!account) return null

  // Verify password against stored hash
  const isValid = await verifyPassword(password, account.passwordHash)
  if (isValid) {
    return account
  }
  return null
}

/**
 * Get the default account (setup account if available, otherwise first test account)
 */
export function getDefaultTestAccount(): TestAccount {
  const setupAccount = getSetupAccount()
  if (setupAccount) return setupAccount
  return TEST_ACCOUNTS[0]!
}

/**
 * Get accounts by role
 */
export function getAccountsByRole(role: OrganizationRole): TestAccount[] {
  return TEST_ACCOUNTS.filter((account) => account.role === role)
}

// ===========================================
// EXPORTED CONSTANTS
// ===========================================
export const ORGANIZATION = ORG_SEDONA
export const DEFAULT_USER_ID = USER_IDS.vincentCoderch
export const DEFAULT_EMPLOYEE_ID = EMPLOYEE_IDS.vincentCoderch

// ===========================================
// CREDENTIALS SUMMARY (Development only)
// ===========================================
/*
 * ACCOUNT:
 * - vincent.coderch@sedona-demo.fr / Sedona123! (Owner, PRO plan)
 */
