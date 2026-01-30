// ===========================================
// SLA POLICIES SERVER FUNCTIONS (PRO Feature)
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  SlaPolicy,
  CreateSlaPolicyInput,
  UpdateSlaPolicyInput,
  TicketPriority,
} from '../types'

// ===========================================
// GET ALL SLA POLICIES
// ===========================================

export async function getSlaPolicies(organizationId: string): Promise<SlaPolicy[]> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .select('*')
    .eq('organization_id', organizationId)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).map(mapSlaPolicyFromDb)
}

// ===========================================
// GET ACTIVE SLA POLICIES
// ===========================================

export async function getActiveSlaPolicies(organizationId: string): Promise<SlaPolicy[]> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).map(mapSlaPolicyFromDb)
}

// ===========================================
// GET DEFAULT SLA POLICY
// ===========================================

export async function getDefaultSlaPolicy(organizationId: string): Promise<SlaPolicy | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_default', true)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapSlaPolicyFromDb(data)
}

// ===========================================
// GET SLA POLICY BY ID
// ===========================================

export async function getSlaPolicyById(id: string): Promise<SlaPolicy | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapSlaPolicyFromDb(data)
}

// ===========================================
// CREATE SLA POLICY
// ===========================================

export async function createSlaPolicy(
  organizationId: string,
  input: CreateSlaPolicyInput
): Promise<SlaPolicy> {
  // If this is set as default, unset other defaults first
  if (input.isDefault) {
    await getSupabaseClient()
      .from('tickets_sla_policies')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
  }

  const { data, error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description,
      first_response_time: input.firstResponseTime,
      resolution_time: input.resolutionTime,
      urgent_first_response: input.urgentFirstResponse,
      urgent_resolution: input.urgentResolution,
      high_first_response: input.highFirstResponse,
      high_resolution: input.highResolution,
      normal_first_response: input.normalFirstResponse,
      normal_resolution: input.normalResolution,
      low_first_response: input.lowFirstResponse,
      low_resolution: input.lowResolution,
      business_hours_only: input.businessHoursOnly ?? false,
      business_hours_start: input.businessHoursStart || '09:00',
      business_hours_end: input.businessHoursEnd || '18:00',
      business_days: input.businessDays || [1, 2, 3, 4, 5],
      is_default: input.isDefault ?? false,
    })
    .select()
    .single()

  if (error) throw error

  return mapSlaPolicyFromDb(data)
}

// ===========================================
// UPDATE SLA POLICY
// ===========================================

export async function updateSlaPolicy(
  input: UpdateSlaPolicyInput,
  organizationId?: string
): Promise<SlaPolicy> {
  // If setting as default, unset other defaults first
  if (input.isDefault && organizationId) {
    await getSupabaseClient()
      .from('tickets_sla_policies')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
      .neq('id', input.id)
  }

  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.firstResponseTime !== undefined) updateData.first_response_time = input.firstResponseTime
  if (input.resolutionTime !== undefined) updateData.resolution_time = input.resolutionTime
  if (input.urgentFirstResponse !== undefined) updateData.urgent_first_response = input.urgentFirstResponse
  if (input.urgentResolution !== undefined) updateData.urgent_resolution = input.urgentResolution
  if (input.highFirstResponse !== undefined) updateData.high_first_response = input.highFirstResponse
  if (input.highResolution !== undefined) updateData.high_resolution = input.highResolution
  if (input.normalFirstResponse !== undefined) updateData.normal_first_response = input.normalFirstResponse
  if (input.normalResolution !== undefined) updateData.normal_resolution = input.normalResolution
  if (input.lowFirstResponse !== undefined) updateData.low_first_response = input.lowFirstResponse
  if (input.lowResolution !== undefined) updateData.low_resolution = input.lowResolution
  if (input.businessHoursOnly !== undefined) updateData.business_hours_only = input.businessHoursOnly
  if (input.businessHoursStart !== undefined) updateData.business_hours_start = input.businessHoursStart
  if (input.businessHoursEnd !== undefined) updateData.business_hours_end = input.businessHoursEnd
  if (input.businessDays !== undefined) updateData.business_days = input.businessDays
  if (input.isDefault !== undefined) updateData.is_default = input.isDefault

  const { data, error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapSlaPolicyFromDb(data)
}

// ===========================================
// DELETE SLA POLICY
// ===========================================

export async function deleteSlaPolicy(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tickets_sla_policies')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// CALCULATE SLA DUE DATES
// ===========================================

export function calculateSlaDueDates(
  policy: SlaPolicy,
  priority: TicketPriority,
  createdAt: Date = new Date()
): { firstResponseDue: Date | null; resolutionDue: Date | null } {
  // Get response times based on priority
  let firstResponseMinutes: number | null = null
  let resolutionMinutes: number | null = null

  switch (priority) {
    case 'urgent':
      firstResponseMinutes = policy.urgentFirstResponse ?? policy.firstResponseTime
      resolutionMinutes = policy.urgentResolution ?? policy.resolutionTime
      break
    case 'high':
      firstResponseMinutes = policy.highFirstResponse ?? policy.firstResponseTime
      resolutionMinutes = policy.highResolution ?? policy.resolutionTime
      break
    case 'normal':
      firstResponseMinutes = policy.normalFirstResponse ?? policy.firstResponseTime
      resolutionMinutes = policy.normalResolution ?? policy.resolutionTime
      break
    case 'low':
      firstResponseMinutes = policy.lowFirstResponse ?? policy.firstResponseTime
      resolutionMinutes = policy.lowResolution ?? policy.resolutionTime
      break
  }

  // Calculate due dates (simplified - not accounting for business hours)
  const firstResponseDue = firstResponseMinutes
    ? new Date(createdAt.getTime() + firstResponseMinutes * 60 * 1000)
    : null

  const resolutionDue = resolutionMinutes
    ? new Date(createdAt.getTime() + resolutionMinutes * 60 * 1000)
    : null

  return { firstResponseDue, resolutionDue }
}

// ===========================================
// CHECK SLA BREACH STATUS
// ===========================================

export function checkSlaBreachStatus(
  ticket: {
    slaFirstResponseDue: string | null
    slaResolutionDue: string | null
    slaFirstResponseAt: string | null
    slaResolvedAt: string | null
  }
): {
  firstResponseBreached: boolean
  resolutionBreached: boolean
  firstResponseRemaining: number | null // minutes
  resolutionRemaining: number | null // minutes
} {
  const now = new Date()

  let firstResponseBreached = false
  let resolutionBreached = false
  let firstResponseRemaining: number | null = null
  let resolutionRemaining: number | null = null

  // Check first response SLA
  if (ticket.slaFirstResponseDue && !ticket.slaFirstResponseAt) {
    const due = new Date(ticket.slaFirstResponseDue)
    firstResponseRemaining = Math.floor((due.getTime() - now.getTime()) / 60000)
    firstResponseBreached = firstResponseRemaining < 0
  }

  // Check resolution SLA
  if (ticket.slaResolutionDue && !ticket.slaResolvedAt) {
    const due = new Date(ticket.slaResolutionDue)
    resolutionRemaining = Math.floor((due.getTime() - now.getTime()) / 60000)
    resolutionBreached = resolutionRemaining < 0
  }

  return {
    firstResponseBreached,
    resolutionBreached,
    firstResponseRemaining,
    resolutionRemaining,
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapSlaPolicyFromDb(data: any): SlaPolicy {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    description: data.description as string | null,
    firstResponseTime: data.first_response_time as number | null,
    resolutionTime: data.resolution_time as number | null,
    urgentFirstResponse: data.urgent_first_response as number | null,
    urgentResolution: data.urgent_resolution as number | null,
    highFirstResponse: data.high_first_response as number | null,
    highResolution: data.high_resolution as number | null,
    normalFirstResponse: data.normal_first_response as number | null,
    normalResolution: data.normal_resolution as number | null,
    lowFirstResponse: data.low_first_response as number | null,
    lowResolution: data.low_resolution as number | null,
    businessHoursOnly: data.business_hours_only as boolean,
    businessHoursStart: data.business_hours_start as string,
    businessHoursEnd: data.business_hours_end as string,
    businessDays: data.business_days as number[],
    isDefault: data.is_default as boolean,
    isActive: data.is_active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
