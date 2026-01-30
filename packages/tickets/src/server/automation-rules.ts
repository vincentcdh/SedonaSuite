// ===========================================
// AUTOMATION RULES SERVER FUNCTIONS (PRO Feature)
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  AutomationRule,
  AutomationCondition,
  AutomationAction,
  CreateAutomationRuleInput,
  UpdateAutomationRuleInput,
  Ticket,
} from '../types'

function getTicketsClient() {
  return getSupabaseClient().schema('tickets' as any) as any
}

// ===========================================
// GET ALL AUTOMATION RULES
// ===========================================

export async function getAutomationRules(organizationId: string): Promise<AutomationRule[]> {
  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .order('priority', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error

  return (data || []).map(mapAutomationRuleFromDb)
}

// ===========================================
// GET ACTIVE AUTOMATION RULES
// ===========================================

export async function getActiveAutomationRules(organizationId: string): Promise<AutomationRule[]> {
  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  if (error) throw error

  return (data || []).map(mapAutomationRuleFromDb)
}

// ===========================================
// GET AUTOMATION RULES BY TRIGGER
// ===========================================

export async function getAutomationRulesByTrigger(
  organizationId: string,
  triggerType: AutomationRule['triggerType']
): Promise<AutomationRule[]> {
  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .eq('trigger_type', triggerType)
    .order('priority', { ascending: true })

  if (error) throw error

  return (data || []).map(mapAutomationRuleFromDb)
}

// ===========================================
// GET AUTOMATION RULE BY ID
// ===========================================

export async function getAutomationRuleById(id: string): Promise<AutomationRule | null> {
  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapAutomationRuleFromDb(data)
}

// ===========================================
// CREATE AUTOMATION RULE
// ===========================================

export async function createAutomationRule(
  organizationId: string,
  input: CreateAutomationRuleInput,
  userId?: string
): Promise<AutomationRule> {
  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description,
      trigger_type: input.triggerType,
      conditions: input.conditions,
      actions: input.actions,
      is_active: input.isActive ?? true,
      priority: input.priority ?? 100,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  return mapAutomationRuleFromDb(data)
}

// ===========================================
// UPDATE AUTOMATION RULE
// ===========================================

export async function updateAutomationRule(
  input: UpdateAutomationRuleInput
): Promise<AutomationRule> {
  const updateData: any = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.triggerType !== undefined) updateData.trigger_type = input.triggerType
  if (input.conditions !== undefined) updateData.conditions = input.conditions
  if (input.actions !== undefined) updateData.actions = input.actions
  if (input.isActive !== undefined) updateData.is_active = input.isActive
  if (input.priority !== undefined) updateData.priority = input.priority

  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapAutomationRuleFromDb(data)
}

// ===========================================
// DELETE AUTOMATION RULE
// ===========================================

export async function deleteAutomationRule(id: string): Promise<void> {
  const { error } = await getTicketsClient()
    .from('automation_rules')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// TOGGLE AUTOMATION RULE
// ===========================================

export async function toggleAutomationRule(
  id: string,
  isActive: boolean
): Promise<AutomationRule> {
  const { data, error } = await getTicketsClient()
    .from('automation_rules')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapAutomationRuleFromDb(data)
}

// ===========================================
// RECORD RULE TRIGGER
// ===========================================

export async function recordRuleTrigger(id: string): Promise<void> {
  const { error } = await getTicketsClient()
    .from('automation_rules')
    .update({
      times_triggered: getTicketsClient().raw('times_triggered + 1'),
      last_triggered_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// EVALUATE CONDITIONS
// ===========================================

export function evaluateConditions(
  conditions: AutomationCondition[],
  ticket: Partial<Ticket>,
  context?: Record<string, unknown>
): boolean {
  if (conditions.length === 0) return true

  return conditions.every(condition => {
    const fieldValue = getFieldValue(condition.field, ticket, context)
    return evaluateCondition(condition, fieldValue)
  })
}

function getFieldValue(
  field: string,
  ticket: Partial<Ticket>,
  context?: Record<string, unknown>
): unknown {
  // Check ticket fields
  if (field in ticket) {
    return ticket[field as keyof Ticket]
  }

  // Check context
  if (context && field in context) {
    return context[field]
  }

  // Check nested fields (e.g., "requester.email")
  if (field.includes('.')) {
    const parts = field.split('.')
    let value: unknown = ticket
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }
    return value
  }

  return undefined
}

function evaluateCondition(
  condition: AutomationCondition,
  fieldValue: unknown
): boolean {
  const { operator, value } = condition

  switch (operator) {
    case 'equals':
      return fieldValue === value
    case 'not_equals':
      return fieldValue !== value
    case 'contains':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.toLowerCase().includes(value.toLowerCase())
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value)
      }
      return false
    case 'not_contains':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return !fieldValue.toLowerCase().includes(value.toLowerCase())
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(value)
      }
      return true
    case 'greater_than':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value
    case 'less_than':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value
    default:
      return false
  }
}

// ===========================================
// GET ACTIONS TO EXECUTE
// ===========================================

export function parseActions(actions: AutomationAction[]): {
  ticketUpdates: Partial<Ticket>
  notifications: { type: string; value: string }[]
  replies: { content: string }[]
} {
  const ticketUpdates: Partial<Ticket> = {}
  const notifications: { type: string; value: string }[] = []
  const replies: { content: string }[] = []

  for (const action of actions) {
    switch (action.type) {
      case 'set_status':
        ticketUpdates.status = action.value as Ticket['status']
        break
      case 'set_priority':
        ticketUpdates.priority = action.value as Ticket['priority']
        break
      case 'assign_to':
        ticketUpdates.assignedTo = action.value as string
        break
      case 'add_tag':
        if (!ticketUpdates.tags) ticketUpdates.tags = []
        ticketUpdates.tags.push(action.value as string)
        break
      case 'send_notification':
        notifications.push({ type: 'notification', value: action.value as string })
        break
      case 'send_reply':
        replies.push({ content: action.value as string })
        break
    }
  }

  return { ticketUpdates, notifications, replies }
}

// ===========================================
// HELPERS
// ===========================================

function mapAutomationRuleFromDb(data: any): AutomationRule {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    description: data.description as string | null,
    triggerType: data.trigger_type as AutomationRule['triggerType'],
    conditions: data.conditions as AutomationCondition[],
    actions: data.actions as AutomationAction[],
    isActive: data.is_active as boolean,
    priority: data.priority as number,
    timesTriggered: data.times_triggered as number,
    lastTriggeredAt: data.last_triggered_at as string | null,
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
