// ===========================================
// AUTH ACCOUNTS - DEVELOPMENT MODE
// ===========================================
// Links to HR employees for authentication
// Plans are associated with organizations, not users

import type { AuthUser, Organization, OrganizationRole } from '@sedona/auth'

export interface TestAccount {
  email: string
  password: string
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
// ===========================================

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'vincent.coderch@sedona-demo.fr',
    password: 'Sedona123!',
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

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Find an account by email
 */
export function findTestAccount(email: string): TestAccount | undefined {
  return TEST_ACCOUNTS.find((account) => account.email === email)
}

/**
 * Validate credentials
 */
export function validateTestCredentials(
  email: string,
  password: string
): TestAccount | null {
  const account = findTestAccount(email)
  if (account && account.password === password) {
    return account
  }
  return null
}

/**
 * Get the default account (first available)
 */
export function getDefaultTestAccount(): TestAccount {
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
// CREDENTIALS SUMMARY
// ===========================================
/*
 * ACCOUNT:
 * - vincent.coderch@sedona-demo.fr / Sedona123! (Owner, PRO plan)
 */
