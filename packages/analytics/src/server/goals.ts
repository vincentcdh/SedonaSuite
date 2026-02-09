// ===========================================
// GOALS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Goal,
  GoalWithProgress,
  GoalProgress,
  GoalFilters,
  CreateGoalInput,
  UpdateGoalInput,
} from '../types'

// ===========================================
// GET GOALS
// ===========================================

export async function getGoals(
  organizationId: string,
  filters?: GoalFilters
): Promise<Goal[]> {
  const client = getSupabaseClient()

  let query = client
    .from('analytics_goals')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.metricSource) {
    query = query.eq('metric_source', filters.metricSource)
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapGoal)
}

// ===========================================
// GET GOAL BY ID
// ===========================================

export async function getGoalById(goalId: string): Promise<GoalWithProgress | null> {
  const client = getSupabaseClient()

  const { data: goal, error: goalError } = await client
    .from('analytics_goals')
    .select('*')
    .eq('id', goalId)
    .single()

  if (goalError) {
    if (goalError.code === 'PGRST116') return null
    throw goalError
  }

  // Note: analytics_goal_progress table doesn't exist in schema
  // Returning goal without progress data
  return enrichGoalWithProgress(mapGoal(goal), [])
}

// ===========================================
// GET ACTIVE GOALS WITH PROGRESS
// ===========================================

export async function getActiveGoalsWithProgress(
  organizationId: string
): Promise<GoalWithProgress[]> {
  const client = getSupabaseClient()

  const { data: goals, error: goalsError } = await client
    .from('analytics_goals')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('end_date', { ascending: true })

  if (goalsError) throw goalsError

  const goalsWithProgress: GoalWithProgress[] = []

  // Note: analytics_goal_progress table doesn't exist in schema
  // Returning goals without progress data
  for (const goal of goals || []) {
    goalsWithProgress.push(enrichGoalWithProgress(mapGoal(goal), []))
  }

  return goalsWithProgress
}

// ===========================================
// CREATE GOAL
// ===========================================

export async function createGoal(
  organizationId: string,
  userId: string,
  input: CreateGoalInput
): Promise<Goal> {
  const client = getSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    organization_id: organizationId,
    created_by: userId,
    assigned_to: input.assignedTo || null,
    name: input.name,
    description: input.description || null,
    metric_source: input.metricSource,
    metric_name: input.metricKey, // DB uses metric_name instead of metric_key
    target_value: input.targetValue,
    current_value: 0,
    start_date: input.startDate,
    end_date: input.endDate,
  }

  const { data, error } = await client
    .from('analytics_goals')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapGoal(data)
}

// ===========================================
// UPDATE GOAL
// ===========================================

export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput
): Promise<Goal> {
  const client = getSupabaseClient()

  const updateData: any = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.metricSource !== undefined) updateData.metric_source = input.metricSource
  if (input.metricKey !== undefined) updateData.metric_name = input.metricKey // DB uses metric_name
  if (input.targetValue !== undefined) updateData.target_value = input.targetValue
  if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate

  const { data, error } = await client
    .from('analytics_goals')
    .update(updateData)
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error

  return mapGoal(data)
}

// ===========================================
// UPDATE GOAL CURRENT VALUE
// ===========================================

export async function updateGoalCurrentValue(
  goalId: string,
  currentValue: number
): Promise<Goal> {
  const client = getSupabaseClient()

  // Update goal current value
  const { data, error } = await client
    .from('analytics_goals')
    .update({ current_value: currentValue })
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error

  // Note: analytics_goal_progress table doesn't exist in schema
  // Progress recording is disabled

  return mapGoal(data)
}

// ===========================================
// TOGGLE GOAL ACTIVE
// ===========================================

export async function toggleGoalActive(
  goalId: string,
  _isActive: boolean
): Promise<Goal> {
  // Note: is_active column doesn't exist in schema
  // Just return the goal as-is
  const goal = await getGoalById(goalId)
  if (!goal) throw new Error('Goal not found')
  return goal
}

// ===========================================
// DELETE GOAL
// ===========================================

export async function deleteGoal(goalId: string): Promise<void> {
  const client = getSupabaseClient()

  const { error } = await client
    .from('analytics_goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

function mapGoal(row: any): Goal {
  return {
    id: row.id,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    name: row.name,
    description: row.description,
    metricSource: row.metric_source,
    metricKey: row.metric_key,
    targetValue: parseFloat(row.target_value),
    currentValue: parseFloat(row.current_value),
    periodType: row.period_type,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapProgress(row: any): GoalProgress {
  return {
    id: row.id,
    goalId: row.goal_id,
    recordedAt: row.recorded_at,
    value: parseFloat(row.value),
    createdAt: row.created_at,
  }
}

function enrichGoalWithProgress(goal: Goal, progress: GoalProgress[]): GoalWithProgress {
  const percentComplete = goal.targetValue > 0
    ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
    : 0

  const today = new Date()
  const endDate = new Date(goal.endDate)
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  // Calculate projected value based on current velocity
  let projectedValue: number | undefined
  let onTrack = false

  if (progress.length >= 2) {
    const recentProgress = progress.slice(-7) // Last 7 data points
    const firstPoint = recentProgress[0]
    const lastPoint = recentProgress[recentProgress.length - 1]

    if (firstPoint && lastPoint) {
      const daysPassed = Math.max(1,
        (new Date(lastPoint.recordedAt).getTime() - new Date(firstPoint.recordedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      const dailyVelocity = (lastPoint.value - firstPoint.value) / daysPassed

      if (dailyVelocity > 0) {
        projectedValue = goal.currentValue + (dailyVelocity * daysRemaining)
        onTrack = projectedValue >= goal.targetValue
      }
    }
  }

  // Simple check: are we on pace?
  if (!onTrack) {
    const startDate = new Date(goal.startDate)
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const expectedProgress = (elapsedDays / totalDays) * 100
    onTrack = percentComplete >= expectedProgress * 0.9 // Allow 10% margin
  }

  return {
    ...goal,
    progress,
    percentComplete,
    daysRemaining,
    projectedValue,
    onTrack,
  }
}
