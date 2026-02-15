// ===========================================
// LOCAL STORAGE FOR ORGANIZATIONS
// ===========================================
// In production, this would be a database

import type { Organization, CreateOrganizationInput } from './types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'sedona_admin_organizations'
const BASE_PORT = 4000

export function getOrganizations(): Organization[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveOrganizations(orgs: Organization[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs))
}

export function getNextPort(): number {
  const orgs = getOrganizations()
  if (orgs.length === 0) return BASE_PORT
  const maxPort = Math.max(...orgs.map((o) => o.port))
  return maxPort + 1
}

export function createOrganization(input: CreateOrganizationInput): Organization {
  const orgs = getOrganizations()

  // Check if slug already exists
  if (orgs.some((o) => o.slug === input.slug)) {
    throw new Error(`Une organisation avec le slug "${input.slug}" existe déjà`)
  }

  const org: Organization = {
    id: uuidv4(),
    name: input.name,
    slug: input.slug,
    domain: input.domain,
    adminEmail: input.adminEmail,
    adminPassword: input.adminPassword,
    plan: input.plan,
    status: 'pending',
    port: getNextPort(),
    createdAt: new Date().toISOString(),
  }

  orgs.push(org)
  saveOrganizations(orgs)
  return org
}

export function updateOrganization(id: string, updates: Partial<Organization>): Organization {
  const orgs = getOrganizations()
  const index = orgs.findIndex((o) => o.id === id)
  if (index === -1) throw new Error('Organisation non trouvée')

  orgs[index] = { ...orgs[index], ...updates }
  saveOrganizations(orgs)
  return orgs[index]
}

export function deleteOrganization(id: string): void {
  const orgs = getOrganizations()
  const filtered = orgs.filter((o) => o.id !== id)
  saveOrganizations(filtered)
}

export function getOrganization(id: string): Organization | null {
  const orgs = getOrganizations()
  return orgs.find((o) => o.id === id) || null
}
