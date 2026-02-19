// ===========================================
// WIDGETS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient, validateOrganizationId } from '@sedona/database'
import { assertWidgetLimit, isCustomWidgetsEnabled } from '@sedona/billing/server'
import type { Widget, WidgetData, CreateWidgetInput, UpdateWidgetInput, MetricFilters } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any

// ===========================================
// GET WIDGETS
// ===========================================

export async function getWidgetsByDashboard(dashboardId: string): Promise<Widget[]> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase
    .from('analytics_widgets')
    .select('*')
    .eq('dashboard_id', dashboardId)
    .order('grid_y', { ascending: true })
    .order('grid_x', { ascending: true })

  if (error) throw new Error(`Failed to fetch widgets: ${error.message}`)

  return (data ?? []).map(mapWidgetFromDb)
}

// ===========================================
// GET WIDGET BY ID
// ===========================================

export async function getWidgetById(widgetId: string): Promise<Widget | null> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase
    .from('analytics_widgets')
    .select('*')
    .eq('id', widgetId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch widget: ${error.message}`)
  }

  return mapWidgetFromDb(data)
}

// ===========================================
// CREATE WIDGET
// ===========================================

export async function createWidget(
  organizationId: string,
  input: CreateWidgetInput
): Promise<Widget> {
  const validOrgId = validateOrganizationId(organizationId)
  const supabase = getSupabaseClient() as SupabaseClientAny

  // Check widget limit
  await assertWidgetLimit(validOrgId)

  // Check if custom widgets are enabled (paid feature)
  const customEnabled = await isCustomWidgetsEnabled(validOrgId)
  if (!customEnabled) {
    throw new Error('Les widgets personnalises sont disponibles avec le plan Pro')
  }

  const insertData: Record<string, unknown> = {
    dashboard_id: input.dashboardId,
    title: input.title,
    widget_type: input.widgetType,
    metric_source: input.metricSource,
    metric_key: input.metricKey,
    config: input.config ?? {},
    grid_x: input.gridX ?? 0,
    grid_y: input.gridY ?? 0,
    grid_w: input.gridW ?? 4,
    grid_h: input.gridH ?? 2,
  }

  const { data, error } = await supabase
    .from('analytics_widgets')
    .insert(insertData)
    .select()
    .single()

  if (error) throw new Error(`Failed to create widget: ${error.message}`)

  return mapWidgetFromDb(data)
}

// ===========================================
// UPDATE WIDGET
// ===========================================

export async function updateWidget(
  widgetId: string,
  input: UpdateWidgetInput
): Promise<Widget> {
  const supabase = getSupabaseClient() as SupabaseClientAny
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (input.title !== undefined) updateData['title'] = input.title
  if (input.widgetType !== undefined) updateData['widget_type'] = input.widgetType
  if (input.metricSource !== undefined) updateData['metric_source'] = input.metricSource
  if (input.metricKey !== undefined) updateData['metric_key'] = input.metricKey
  if (input.config !== undefined) updateData['config'] = input.config
  if (input.gridX !== undefined) updateData['grid_x'] = input.gridX
  if (input.gridY !== undefined) updateData['grid_y'] = input.gridY
  if (input.gridW !== undefined) updateData['grid_w'] = input.gridW
  if (input.gridH !== undefined) updateData['grid_h'] = input.gridH

  const { data, error } = await supabase
    .from('analytics_widgets')
    .update(updateData)
    .eq('id', widgetId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update widget: ${error.message}`)

  return mapWidgetFromDb(data)
}

// ===========================================
// DELETE WIDGET
// ===========================================

export async function deleteWidget(widgetId: string): Promise<void> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { error } = await supabase
    .from('analytics_widgets')
    .delete()
    .eq('id', widgetId)

  if (error) throw new Error(`Failed to delete widget: ${error.message}`)
}

// ===========================================
// UPDATE WIDGET POSITION
// ===========================================

export async function updateWidgetPosition(
  widgetId: string,
  position: { x: number; y: number; w: number; h: number }
): Promise<Widget> {
  const supabase = getSupabaseClient() as SupabaseClientAny

  const { data, error } = await supabase
    .from('analytics_widgets')
    .update({
      grid_x: position.x,
      grid_y: position.y,
      grid_w: position.w,
      grid_h: position.h,
      updated_at: new Date().toISOString(),
    })
    .eq('id', widgetId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update widget position: ${error.message}`)

  return mapWidgetFromDb(data)
}

// ===========================================
// GET WIDGET DATA
// ===========================================

export async function getWidgetData(
  widget: Widget,
  organizationId: string,
  filters: MetricFilters
): Promise<WidgetData> {
  // This is a placeholder implementation
  // In a real implementation, this would fetch data from the appropriate module
  // based on widget.metricSource and widget.metricKey
  const validOrgId = validateOrganizationId(organizationId)

  // For now, return placeholder data
  // The actual implementation would call module-specific stats functions
  return {
    value: 0,
    previousValue: 0,
    change: 0,
    changePercent: 0,
    trend: 'stable',
    series: [],
    breakdown: [],
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapWidgetFromDb(row: Record<string, unknown>): Widget {
  return {
    id: row['id'] as string,
    dashboardId: row['dashboard_id'] as string,
    title: row['title'] as string,
    widgetType: row['widget_type'] as Widget['widgetType'],
    metricSource: row['metric_source'] as Widget['metricSource'],
    metricKey: row['metric_key'] as string,
    config: (row['config'] as Widget['config']) ?? {},
    gridX: (row['grid_x'] as number) ?? 0,
    gridY: (row['grid_y'] as number) ?? 0,
    gridW: (row['grid_w'] as number) ?? 4,
    gridH: (row['grid_h'] as number) ?? 2,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  }
}
