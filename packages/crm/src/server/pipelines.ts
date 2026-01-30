import { getSupabaseClient } from '@sedona/database'
import type {
  Pipeline,
  PipelineStage,
  Deal,
  DealContactSummary,
  DealCompanySummary,
  CreatePipelineInput,
  UpdatePipelineInput,
  CreatePipelineStageInput,
  UpdatePipelineStageInput,
} from '../types'

// ===========================================
// PIPELINES SERVER FUNCTIONS
// ===========================================

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

/**
 * Get all pipelines for an organization
 */
export async function getPipelines(organizationId: string): Promise<Pipeline[]> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_pipelines')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pipelines: ${error.message}`)
  }

  return (data || []).map(mapPipelineFromDb)
}

/**
 * Get a single pipeline with stages
 */
export async function getPipeline(pipelineId: string): Promise<Pipeline | null> {
  const client = getClient()

  const { data: pipeline, error: pipelineError } = await client
    .from('crm_pipelines')
    .select('*')
    .eq('id', pipelineId)
    .is('deleted_at', null)
    .single()

  if (pipelineError) {
    if (pipelineError.code === 'PGRST116') return null
    throw new Error(`Failed to fetch pipeline: ${pipelineError.message}`)
  }

  if (!pipeline) return null

  // Get stages
  const { data: stages, error: stagesError } = await client
    .from('crm_pipeline_stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true })

  if (stagesError) {
    throw new Error(`Failed to fetch pipeline stages: ${stagesError.message}`)
  }

  return {
    ...mapPipelineFromDb(pipeline),
    stages: (stages || []).map(mapStageFromDb),
  }
}

/**
 * Get pipeline with stages and deals
 */
export async function getPipelineWithDeals(pipelineId: string): Promise<Pipeline | null> {
  const client = getClient()

  const { data: pipeline, error: pipelineError } = await client
    .from('crm_pipelines')
    .select('*')
    .eq('id', pipelineId)
    .is('deleted_at', null)
    .single()

  if (pipelineError) {
    if (pipelineError.code === 'PGRST116') return null
    throw new Error(`Failed to fetch pipeline: ${pipelineError.message}`)
  }

  if (!pipeline) return null

  // Get stages with deals count
  const { data: stages, error: stagesError } = await client
    .from('crm_pipeline_stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true })

  if (stagesError) {
    throw new Error(`Failed to fetch pipeline stages: ${stagesError.message}`)
  }

  // Get deals for each stage
  const stagesWithDeals = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stages || []).map(async (stage: any) => {
      const { data: deals } = await client
        .from('crm_deals')
        .select('*, contact:crm_contacts(id, first_name, last_name), company:crm_companies(id, name)')
        .eq('stage_id', stage['id'])
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedDeals: Deal[] = (deals || []).map((d: any) => {
        const rawContact = d['contact'] as { id: string; first_name: string | null; last_name: string | null } | null
        const rawCompany = d['company'] as { id: string; name: string } | null

        const contact: DealContactSummary | null = rawContact ? {
          id: rawContact.id,
          firstName: rawContact.first_name,
          lastName: rawContact.last_name,
        } : null

        const company: DealCompanySummary | null = rawCompany ? {
          id: rawCompany.id,
          name: rawCompany.name,
        } : null

        return {
          id: d['id'] as string,
          organizationId: d['organization_id'] as string,
          pipelineId: d['pipeline_id'] as string,
          stageId: d['stage_id'] as string,
          name: d['name'] as string,
          amount: d['amount'] as number | null,
          currency: (d['currency'] as string) || 'EUR',
          probability: d['probability'] as number | null,
          expectedCloseDate: d['expected_close_date'] as string | null,
          contactId: d['contact_id'] as string | null,
          companyId: d['company_id'] as string | null,
          contact,
          company,
          status: d['status'] as 'open' | 'won' | 'lost',
          wonAt: d['won_at'] as string | null,
          lostAt: d['lost_at'] as string | null,
          lostReason: d['lost_reason'] as string | null,
          ownerId: d['owner_id'] as string | null,
          customFields: (d['custom_fields'] as Record<string, unknown>) || {},
          createdAt: d['created_at'] as string,
          updatedAt: d['updated_at'] as string,
          deletedAt: d['deleted_at'] as string | null,
        }
      })

      return {
        ...mapStageFromDb(stage),
        deals: mappedDeals,
        dealsCount: deals?.length || 0,
      }
    })
  )

  // Calculate total value
  const totalValue = stagesWithDeals.reduce((sum, stage) => {
    return (
      sum +
      (stage.deals?.reduce((stageSum, deal) => stageSum + (deal.amount || 0), 0) || 0)
    )
  }, 0)

  return {
    ...mapPipelineFromDb(pipeline),
    stages: stagesWithDeals,
    totalValue,
    dealsCount: stagesWithDeals.reduce((sum, stage) => sum + stage.dealsCount, 0),
  }
}

/**
 * Get default pipeline for an organization
 */
export async function getDefaultPipeline(organizationId: string): Promise<Pipeline | null> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_pipelines')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_default', true)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch default pipeline: ${error.message}`)
  }

  return data ? mapPipelineFromDb(data) : null
}

/**
 * Create a new pipeline with stages
 */
export async function createPipeline(
  organizationId: string,
  input: CreatePipelineInput
): Promise<Pipeline> {
  const client = getClient()

  // If this is set as default, unset other defaults first
  if (input.isDefault) {
    await client
      .from('crm_pipelines')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
  }

  // Create pipeline
  const { data: pipeline, error: pipelineError } = await client
    .from('crm_pipelines')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description,
      is_default: input.isDefault || false,
    })
    .select()
    .single()

  if (pipelineError) {
    throw new Error(`Failed to create pipeline: ${pipelineError.message}`)
  }

  // Create stages if provided
  if (input.stages && input.stages.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stagesData = input.stages.map((stage) => ({
      pipeline_id: (pipeline as any)['id'],
      name: stage.name,
      color: stage.color || '#0c82d6',
      position: stage.position,
      probability: stage.probability || 0,
    }))

    const { error: stagesError } = await client.from('crm_pipeline_stages').insert(stagesData)

    if (stagesError) {
      throw new Error(`Failed to create pipeline stages: ${stagesError.message}`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getPipeline((pipeline as any)['id'] as string) as Promise<Pipeline>
}

/**
 * Create default pipeline with standard stages
 */
export async function createDefaultPipeline(organizationId: string): Promise<Pipeline> {
  return createPipeline(organizationId, {
    name: 'Pipeline de vente',
    description: 'Pipeline de vente par defaut',
    isDefault: true,
    stages: [
      { name: 'Nouveau', color: '#6b7280', position: 0, probability: 10 },
      { name: 'Qualification', color: '#3b82f6', position: 1, probability: 20 },
      { name: 'Proposition', color: '#8b5cf6', position: 2, probability: 40 },
      { name: 'Negociation', color: '#f59e0b', position: 3, probability: 60 },
      { name: 'Cloture', color: '#10b981', position: 4, probability: 80 },
    ],
  })
}

/**
 * Update a pipeline
 */
export async function updatePipeline(input: UpdatePipelineInput): Promise<Pipeline> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.description !== undefined) updateData['description'] = input.description

  // Handle default flag
  if (input.isDefault !== undefined) {
    if (input.isDefault) {
      // Get organization ID first
      const { data: current } = await client
        .from('crm_pipelines')
        .select('organization_id')
        .eq('id', input.id)
        .single()

      if (current) {
        // Unset other defaults
        await client
          .from('crm_pipelines')
          .update({ is_default: false })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq('organization_id', (current as any)['organization_id'])
      }
    }
    updateData['is_default'] = input.isDefault
  }

  const { error } = await client.from('crm_pipelines').update(updateData).eq('id', input.id)

  if (error) {
    throw new Error(`Failed to update pipeline: ${error.message}`)
  }

  return getPipeline(input.id) as Promise<Pipeline>
}

/**
 * Delete a pipeline (soft delete)
 */
export async function deletePipeline(pipelineId: string): Promise<void> {
  const client = getClient()

  const { error } = await client
    .from('crm_pipelines')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', pipelineId)

  if (error) {
    throw new Error(`Failed to delete pipeline: ${error.message}`)
  }
}

// ===========================================
// PIPELINE STAGES FUNCTIONS
// ===========================================

/**
 * Create a pipeline stage
 */
export async function createPipelineStage(
  pipelineId: string,
  input: CreatePipelineStageInput
): Promise<PipelineStage> {
  const client = getClient()

  const { data, error } = await client
    .from('crm_pipeline_stages')
    .insert({
      pipeline_id: pipelineId,
      name: input.name,
      color: input.color || '#0c82d6',
      position: input.position,
      probability: input.probability || 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create pipeline stage: ${error.message}`)
  }

  return mapStageFromDb(data)
}

/**
 * Update a pipeline stage
 */
export async function updatePipelineStage(input: UpdatePipelineStageInput): Promise<PipelineStage> {
  const client = getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}

  if (input.name !== undefined) updateData['name'] = input.name
  if (input.color !== undefined) updateData['color'] = input.color
  if (input.position !== undefined) updateData['position'] = input.position
  if (input.probability !== undefined) updateData['probability'] = input.probability

  const { data, error } = await client
    .from('crm_pipeline_stages')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update pipeline stage: ${error.message}`)
  }

  return mapStageFromDb(data)
}

/**
 * Delete a pipeline stage
 */
export async function deletePipelineStage(stageId: string): Promise<void> {
  const client = getClient()

  // Check if there are deals in this stage
  const { count } = await client
    .from('crm_deals')
    .select('*', { count: 'exact', head: true })
    .eq('stage_id', stageId)
    .is('deleted_at', null)

  if (count && count > 0) {
    throw new Error('Cannot delete stage with deals. Move deals to another stage first.')
  }

  const { error } = await client.from('crm_pipeline_stages').delete().eq('id', stageId)

  if (error) {
    throw new Error(`Failed to delete pipeline stage: ${error.message}`)
  }
}

/**
 * Reorder pipeline stages
 */
export async function reorderPipelineStages(
  pipelineId: string,
  stageIds: string[]
): Promise<PipelineStage[]> {
  const client = getClient()

  // Update positions
  await Promise.all(
    stageIds.map((id, index) =>
      client.from('crm_pipeline_stages').update({ position: index }).eq('id', id)
    )
  )

  // Return updated stages
  const { data, error } = await client
    .from('crm_pipeline_stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true })

  if (error) {
    throw new Error(`Failed to reorder stages: ${error.message}`)
  }

  return (data || []).map(mapStageFromDb)
}

/**
 * Get pipeline count for an organization
 */
export async function getPipelineCount(organizationId: string): Promise<number> {
  const client = getClient()

  const { count, error } = await client
    .from('crm_pipelines')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  if (error) {
    throw new Error(`Failed to count pipelines: ${error.message}`)
  }

  return count || 0
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPipelineFromDb(data: any): Pipeline {
  return {
    id: data['id'] as string,
    organizationId: data['organization_id'] as string,
    name: data['name'] as string,
    description: data['description'] as string | null,
    isDefault: data['is_default'] as boolean,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
    deletedAt: data['deleted_at'] as string | null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStageFromDb(data: any): PipelineStage {
  return {
    id: data['id'] as string,
    pipelineId: data['pipeline_id'] as string,
    name: data['name'] as string,
    color: data['color'] as string,
    position: data['position'] as number,
    probability: data['probability'] as number,
    createdAt: data['created_at'] as string,
    updatedAt: data['updated_at'] as string,
  }
}
