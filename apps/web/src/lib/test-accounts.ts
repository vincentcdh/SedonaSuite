// ===========================================
// TEST ACCOUNTS - DEVELOPMENT ONLY
// ===========================================
// WARNING: These credentials are for development/testing only
// TODO: Remove this file and hardcoded passwords before production

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
  managerId?: string // ID du manager (pour les employees)
}

// ===========================================
// TEST ORGANIZATIONS
// ===========================================

const ORG_FREE: Organization = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  name: 'Startup Demo',
  slug: 'startup-demo',
  logo: null,
  siret: '12345678901234',
  siren: '123456789',
  vatNumber: 'FR12345678901',
  legalName: 'Startup Demo SAS',
  addressStreet: '10 Rue de la Demo',
  addressPostalCode: '75001',
  addressCity: 'Paris',
  addressCountry: 'France',
  phone: '+33 1 23 45 67 89',
  email: 'contact@startup-demo.fr',
  website: 'https://startup-demo.fr',
  subscriptionPlan: 'FREE',
  subscriptionStatus: 'active',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
}

const ORG_PRO: Organization = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  name: 'Entreprise Pro',
  slug: 'entreprise-pro',
  logo: null,
  siret: '98765432109876',
  siren: '987654321',
  vatNumber: 'FR98765432109',
  legalName: 'Entreprise Pro SARL',
  addressStreet: '50 Avenue des Champs-Elysees',
  addressPostalCode: '75008',
  addressCity: 'Paris',
  addressCountry: 'France',
  phone: '+33 1 98 76 54 32',
  email: 'contact@entreprise-pro.fr',
  website: 'https://entreprise-pro.fr',
  subscriptionPlan: 'PRO',
  subscriptionStatus: 'active',
  createdAt: new Date('2023-06-01'),
  updatedAt: new Date('2024-01-01'),
}

const ORG_ENTERPRISE: Organization = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  name: 'Grande Entreprise',
  slug: 'grande-entreprise',
  logo: null,
  siret: '11111111111111',
  siren: '111111111',
  vatNumber: 'FR11111111111',
  legalName: 'Grande Entreprise SA',
  addressStreet: '1 Place de la Defense',
  addressPostalCode: '92800',
  addressCity: 'Puteaux',
  addressCountry: 'France',
  phone: '+33 1 11 11 11 11',
  email: 'contact@grande-entreprise.fr',
  website: 'https://grande-entreprise.fr',
  subscriptionPlan: 'ENTERPRISE',
  subscriptionStatus: 'active',
  createdAt: new Date('2022-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// ===========================================
// USER IDS (pour référence dans managerId)
// ===========================================
const USER_IDS = {
  // Owners
  ownerFree: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
  ownerPro: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
  ownerEnterprise: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03',
  // Managers
  managerFree: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04',
  managerPro: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05',
  managerEnterprise: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06',
  // Employees
  employeeFree: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07',
  employeePro: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08',
  employeeEnterprise: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b09',
}

// ===========================================
// TEST ACCOUNTS BY ROLE
// ===========================================

export const TEST_ACCOUNTS: TestAccount[] = [
  // ==========================================
  // OWNER ACCOUNTS (proprietaires)
  // ==========================================
  {
    email: 'owner.free@test.sedona.ai',
    password: 'Owner123!',
    user: {
      id: USER_IDS.ownerFree,
      name: 'Marie Dupont',
      email: 'owner.free@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 12 34 56 78',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    organization: ORG_FREE,
    role: 'owner',
  },
  {
    email: 'owner.pro@test.sedona.ai',
    password: 'Owner123!',
    user: {
      id: USER_IDS.ownerPro,
      name: 'Jean-Pierre Martin',
      email: 'owner.pro@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 98 76 54 32',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: true,
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_PRO,
    role: 'owner',
  },
  {
    email: 'owner.enterprise@test.sedona.ai',
    password: 'Owner123!',
    user: {
      id: USER_IDS.ownerEnterprise,
      name: 'Sophie Bernard',
      email: 'owner.enterprise@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 11 22 33 44',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: true,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_ENTERPRISE,
    role: 'owner',
  },

  // ==========================================
  // MANAGER ACCOUNTS (gestionnaires)
  // Note: En base de donnees, les emails sont admin.*.test.sedona.ai
  // ==========================================
  {
    email: 'admin.free@test.sedona.ai',
    password: 'Manager123!',
    user: {
      id: USER_IDS.managerFree,
      name: 'Pierre Lambert',
      email: 'admin.free@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 55 44 33 22',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
    organization: ORG_FREE,
    role: 'manager',
  },
  {
    email: 'admin.pro@test.sedona.ai',
    password: 'Manager123!',
    user: {
      id: USER_IDS.managerPro,
      name: 'Claire Moreau',
      email: 'admin.pro@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 77 88 99 00',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2023-07-15'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_PRO,
    role: 'manager',
  },
  {
    email: 'admin.enterprise@test.sedona.ai',
    password: 'Manager123!',
    user: {
      id: USER_IDS.managerEnterprise,
      name: 'Thomas Durand',
      email: 'admin.enterprise@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 22 33 44 55',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: true,
      createdAt: new Date('2022-03-01'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_ENTERPRISE,
    role: 'manager',
  },

  // ==========================================
  // EMPLOYEE ACCOUNTS (employes)
  // Note: En base de donnees, les emails sont member.*.test.sedona.ai
  // ==========================================
  {
    email: 'member.free@test.sedona.ai',
    password: 'Employee123!',
    user: {
      id: USER_IDS.employeeFree,
      name: 'Lucas Petit',
      email: 'member.free@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 33 44 55 66',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
    organization: ORG_FREE,
    role: 'employee',
    managerId: USER_IDS.managerFree,
  },
  {
    email: 'member.pro@test.sedona.ai',
    password: 'Employee123!',
    user: {
      id: USER_IDS.employeePro,
      name: 'Emma Leroy',
      email: 'member.pro@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 44 55 66 77',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2023-09-01'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_PRO,
    role: 'employee',
    managerId: USER_IDS.managerPro,
  },
  {
    email: 'member.enterprise@test.sedona.ai',
    password: 'Employee123!',
    user: {
      id: USER_IDS.employeeEnterprise,
      name: 'Hugo Girard',
      email: 'member.enterprise@test.sedona.ai',
      emailVerified: true,
      image: null,
      phone: '+33 6 55 66 77 88',
      locale: 'fr',
      timezone: 'Europe/Paris',
      twoFactorEnabled: false,
      createdAt: new Date('2022-06-01'),
      updatedAt: new Date('2024-01-01'),
    },
    organization: ORG_ENTERPRISE,
    role: 'employee',
    managerId: USER_IDS.managerEnterprise,
  },
]

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Find a test account by email
 */
export function findTestAccount(email: string): TestAccount | undefined {
  return TEST_ACCOUNTS.find((account) => account.email === email)
}

/**
 * Validate test account credentials
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
 * Get all accounts for a specific role
 */
export function getAccountsByRole(role: OrganizationRole): TestAccount[] {
  return TEST_ACCOUNTS.filter((account) => account.role === role)
}

/**
 * Get all accounts for a specific plan
 */
export function getAccountsByPlan(
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
): TestAccount[] {
  return TEST_ACCOUNTS.filter(
    (account) => account.organization.subscriptionPlan === plan
  )
}

/**
 * Get the default test account (Owner PRO)
 */
export function getDefaultTestAccount(): TestAccount {
  return TEST_ACCOUNTS.find(
    (account) =>
      account.role === 'owner' &&
      account.organization.subscriptionPlan === 'PRO'
  )!
}

/**
 * Get employees managed by a specific manager
 */
export function getEmployeesByManager(managerId: string): TestAccount[] {
  return TEST_ACCOUNTS.filter((account) => account.managerId === managerId)
}

// ===========================================
// CREDENTIALS SUMMARY (for quick reference)
// ===========================================
/*
 * OWNER ACCOUNTS (Proprietaires - tous les droits):
 * - owner.free@test.sedona.ai       / Owner123!     (FREE plan)
 * - owner.pro@test.sedona.ai        / Owner123!     (PRO plan)
 * - owner.enterprise@test.sedona.ai / Owner123!     (ENTERPRISE plan)
 *
 * MANAGER ACCOUNTS (Gestionnaires - presque tous les droits):
 * - admin.free@test.sedona.ai       / Manager123!   (FREE plan)
 * - admin.pro@test.sedona.ai        / Manager123!   (PRO plan)
 * - admin.enterprise@test.sedona.ai / Manager123!   (ENTERPRISE plan)
 *
 * EMPLOYEE ACCOUNTS (Employes - droits limites):
 * - member.free@test.sedona.ai       / Employee123!  (FREE plan)
 * - member.pro@test.sedona.ai        / Employee123!  (PRO plan)
 * - member.enterprise@test.sedona.ai / Employee123!  (ENTERPRISE plan)
 */
