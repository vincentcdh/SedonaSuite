import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import { assertCrmDealLimit } from '@sedona/billing/server'
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  MoveDealInput,
  DealFilters,
  PaginatedResult,
  PaginationParams,
} from '../types'

// ===========================================
// DEALS SERVER FUNCTIONS
// ===========================================

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

/**
 * Get paginated deals for an organization
 */
export async function getDeals(
  organizationId: string,
  filters: DealFilters = {},
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Deal>> {
  const client = getClient()
  const { page = 1, pageSize = 25, sortBy = 'created_at', sortOrder = 'desc' } = pagination

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = client
    .from('crm_deals')
    .select(
      '*, contact:crm_contacts(id, first_name, last_name, email), company:crm_companies(id, name), stage:crm_pipeline_stages(id, name, color)',
      { count: 'exact' }
    )
    .eq('organization_id', organizationId)
    .is('deleted_at', null) as any

  // Apply filters
  if (filters.pipelineId) {
    query = query.eq('pipeline_id', filters.pipelineId)
  }

  if (filters.stageId) {
    query = query.eq('stage_id', filters.stageId)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.contactId) {
    query = query.eq('contact_id', filters.contactId)
  }

  if (filters.companyId) {
    query = query.eq('company_id', filters.companyId)
  }

  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId)
  }

  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount)
  }

  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount)
  }

  if (filters.closeDateAfter) {
    query = query.gte('expected_close_date', filters.closeDateAfter)
  }

  if (filters.closeDateBefore) {
    query = query.lte('expected_close_date', filters.closeDateBefore)
  }

  // Apply sorting
  const columnMap: Record<string, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    name: 'name',
    amount: 'amount',
    expectedCloseDate: 'expected_close_date',
  }
  const column = columnMap[sortBy] || sortBy
  query = query.order(column, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch deals: ${error.message}`)
  }

  return {
    data: (data || []).map(mapDealFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get a single deal by ID
 */
export async function getDeal(dealId: string): Promise<Deal | null> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_deals')
    .select(
      '*, contact:crm_contacts(id, first_name, last_name, email), company:crm_companies(id, name), stage:crm_pipeline_stages(id, name, color), pipeline:crm_pipelines(id, name)'
    )
    .eq('id', dealId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch deal: ${error.message}`)
  }

  return data ? mapDealFromDb(data) : null
}

/**
 * Create a new deal
 */
export async function createDeal(
  organizationId: string,
  input: CreateDealInput
): Promise<Deal> {
  // Validate organization ID
  const validOrgId = validateOrganizationId(organizationId)

  // Check module limit before creating
  await assertCrmDealLimit(validOrgId)

  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_deals') as any)
    .insert({
      organization_id: validOrgId,
      pipeline_id: input.pipelineId,
      stage_id: input.stageId,
      name: input.name,
      amount: input.amount,
      currency: input.currency || 'EUR',
      probability: input.probability,
      expected_close_date: input.expectedCloseDate,
      contact_id: input.contactId,
      company_id: input.companyId,
      owner_id: input.ownerId,
      custom_fields: input.customFields || {},
      status: 'open',
    })
    .select(
      '*, contact:crm_contacts(id, first_name, last_name, email), company:crm_companies(id, name), stage:crm_pipeline_stages(id, name, color)'
    )
    .single()

  if (error) {
    throw new Error(`Failed to create deal: ${error.message}`)
  }

  return mapDealFromDb(data)
}

/**
 * Update a deal
 */
export async function updateDeal(input: UpdateDealInput): Promise<Deal> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.pipelineId !== undefined) updateData['pipeline_id'] = input.pipelineId
  if (input.stageId !== undefined) updateData['stage_id'] = input.stageId
  if (input.name !== undefined) updateData['name'] = input.name
  if (input.amount !== undefined) updateData['amount'] = input.amount
  if (input.currency !== undefined) updateData['currency'] = input.currency
  if (input.probability !== undefined) updateData['probability'] = input.probability
  if (input.expectedCloseDate !== undefined) updateData['expected_close_date'] = input.expectedCloseDate
  if (input.contactId !== undefined) updateData['contact_id'] = input.contactId
  if (input.companyId !== undefined) updateData['company_id'] = input.companyId
  if (input.ownerId !== undefined) updateData['owner_id'] = input.ownerId
  if (input.customFields !== undefined) updateData['custom_fields'] = input.customFields

  // Handle status changes
  if (input.status !== undefined) {
    updateData['status'] = input.status
    if (input.status === 'won') {
      updateData['won_at'] = new Date().toISOString()
      updateData['lost_at'] = null
      updateData['lost_reason'] = null
    } else if (input.status === 'lost') {
      updateData['lost_at'] = new Date().toISOString()
      updateData['won_at'] = null
      if (input.lostReason) {
        updateData['lost_reason'] = input.lostReason
      }
    } else if (input.status === 'open') {
      updateData['won_at'] = null
      updateData['lost_at'] = null
      updateData['lost_reason'] = null
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_deals') as any)
    .update(updateData)
    .eq('id', input.id)
    .select(
      '*, contact:crm_contacts(id, first_name, last_name, email), company:crm_companies(id, name), stage:crm_pipeline_stages(id, name, color)'
    )
    .single()

  if (error) {
    throw new Error(`Failed to update deal: ${error.message}`)
  }

  return mapDealFromDb(data)
}

/**
 * Move a deal to a different stage
 */
export async function moveDeal(input: MoveDealInput): Promise<Deal> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client
    .from('crm_deals') as any)
    .update({ stage_id: input.stageId })
    .eq('id', input.id)
    .select(
      '*, contact:crm_contacts(id, first_name, last_name, email), company:crm_companies(id, name), stage:crm_pipeline_stages(id, name, color)'
    )
    .single()

  if (error) {
    throw new Error(`Failed to move deal: ${error.message}`)
  }

  return mapDealFromDb(data)
}

/**
 * Mark a deal as won
 */
export async function markDealAsWon(dealId: string): Promise<Deal> {
  return updateDeal({ id: dealId, status: 'won' })
}

/**
 * Mark a deal as lost
 */
export async function markDealAsLost(dealId: string, lostReason?: string): Promise<Deal> {
  return updateDeal({ id: dealId, status: 'lost', lostReason })
}

/**
 * Reopen a deal
 */
export async function reopenDeal(dealId: string): Promise<Deal> {
  return updateDeal({ id: dealId, status: 'open' })
}

/**
 * Delete a deal (soft delete)
 */
export async function deleteDeal(dealId: string): Promise<void> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client
    .from('crm_deals') as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', dealId)

  if (error) {
    throw new Error(`Failed to delete deal: ${error.message}`)
  }
}

/**
 * Get deal statistics for an organization
 */
export async function getDealStats(organizationId: string, pipelineId?: string): Promise<{
  open: number
  won: number
  lost: number
  totalValue: number
  wonValue: number
  averageDealSize: number
  conversionRate: number
}> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = client
    .from('crm_deals')
    .select('status, amount')
    .eq('organization_id', organizationId)
    .is('deleted_at', null) as any

  if (pipelineId) {
    query = query.eq('pipeline_id', pipelineId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch deal stats: ${error.message}`)
  }

  const deals = data || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDeals = deals.filter((d: any) => d['status'] === 'open')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wonDeals = deals.filter((d: any) => d['status'] === 'won')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lostDeals = deals.filter((d: any) => d['status'] === 'lost')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalValue = deals.reduce((sum: number, d: any) => sum + ((d['amount'] as number) || 0), 0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wonValue = wonDeals.reduce((sum: number, d: any) => sum + ((d['amount'] as number) || 0), 0)

  const closedDeals = wonDeals.length + lostDeals.length
  const conversionRate = closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0
  const averageDealSize = wonDeals.length > 0 ? wonValue / wonDeals.length : 0

  return {
    open: openDeals.length,
    won: wonDeals.length,
    lost: lostDeals.length,
    totalValue,
    wonValue,
    averageDealSize: Math.round(averageDealSize),
    conversionRate: Math.round(conversionRate * 10) / 10,
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDealFromDb(data: any): Deal {
  const contact = data['contact']
  const company = data['company']
  const stage = data['stage']
  const pipeline = data['pipeline']

  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    pipelineId: data['pipeline_id'] as string,
    stageId: data['stage_id'] as string,
    name: data['name'] as string,
    amount: data['amount'] as number | null,
    currency: (data['currency'] as string) || 'EUR',
    probability: data['probability'] as number | null,
    expectedCloseDate: data['expected_close_date'] as string | null,
    contactId: data['contact_id'] as string | null,
    companyId: data['company_id'] as string | null,
    contact: contact
      ? {
          id: contact['id'] as string,
          organizationId: '',
          firstName: contact['first_name'] as string | null,
          lastName: contact['last_name'] as string | null,
          email: contact['email'] as string | null,
          phone: null,
          mobile: null,
          jobTitle: null,
          companyId: null,
          source: null,
          sourceDetails: null,
          addressLine1: null,
          addressLine2: null,
          city: null,
          postalCode: null,
          country: 'France',
          customFields: {},
          tags: [],
          ownerId: null,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        }
      : null,
    company: company
      ? {
          id: company['id'] as string,
          organizationId: '',
          name: company['name'] as string,
          siret: null,
          website: null,
          industry: null,
          size: null,
          addressLine1: null,
          addressLine2: null,
          city: null,
          postalCode: null,
          country: 'France',
          phone: null,
          email: null,
          customFields: {},
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        }
      : null,
    status: data['status'] as Deal['status'],
    wonAt: data['won_at'] as string | null,
    lostAt: data['lost_at'] as string | null,
    lostReason: data['lost_reason'] as string | null,
    ownerId: data['owner_id'] as string | null,
    customFields: (data['custom_fields'] as Record<string, unknown>) || {},
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    deletedAt: data['deleted_at'] as string | null,
    stage: stage
      ? {
          id: stage['id'] as string,
          pipelineId: '',
          name: stage['name'] as string,
          color: stage['color'] as string,
          position: 0,
          probability: 0,
          createdAt: '',
          updatedAt: '',
        }
      : undefined,
    pipeline: pipeline
      ? {
          id: pipeline['id'] as string,
          organizationId: '',
          name: pipeline['name'] as string,
          description: null,
          isDefault: false,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        }
      : undefined,
  }
}
