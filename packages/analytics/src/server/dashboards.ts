// ===========================================
// DASHBOARDS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Dashboard,
  DashboardWithWidgets,
  DashboardFilters,
  CreateDashboardInput,
  UpdateDashboardInput,
} from '../types'

// ===========================================
// GET DASHBOARDS
// ===========================================

export async function getDashboards(
  organizationId: string,
  filters?: DashboardFilters
): Promise<Dashboard[]> {
  const client = getSupabaseClient()

  let query = client
    .from('analytics_dashboards')
    .select('*')
    .eq('organization_id', organizationId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters?.isShared !== undefined) {
    query = query.eq('is_shared', filters.isShared)
  }

  if (filters?.createdBy) {
    query = query.eq('created_by', filters.createdBy)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapDashboard)
}

// ===========================================
// GET DASHBOARD BY ID
// ===========================================

export async function getDashboardById(
  dashboardId: string
): Promise<DashboardWithWidgets | null> {
  const client = getSupabaseClient()

  const { data: dashboard, error: dashboardError } = await client
    .from('analytics_dashboards')
    .select('*')
    .eq('id', dashboardId)
    .single()

  if (dashboardError) {
    if (dashboardError.code === 'PGRST116') return null
    throw dashboardError
  }

  const { data: widgets, error: widgetsError } = await client
    .from('analytics_widgets')
    .select('*')
    .eq('dashboard_id', dashboardId)
    .order('grid_y', { ascending: true })
    .order('grid_x', { ascending: true })

  if (widgetsError) throw widgetsError

  return {
    ...mapDashboard(dashboard),
    widgets: (widgets || []).map(mapWidget),
  }
}

// ===========================================
// GET DEFAULT DASHBOARD
// ===========================================

export async function getDefaultDashboard(
  organizationId: string
): Promise<DashboardWithWidgets | null> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('analytics_dashboards')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_default', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return getDashboardById(data.id)
}

// ===========================================
// CREATE DASHBOARD
// ===========================================

export async function createDashboard(
  organizationId: string,
  userId: string,
  input: CreateDashboardInput
): Promise<Dashboard> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('analytics_dashboards')
    .insert({
      organization_id: organizationId,
      created_by: userId,
      name: input.name,
      description: input.description || null,
      is_default: input.isDefault || false,
      is_shared: input.isShared || false,
      layout: [],
    })
    .select()
    .single()

  if (error) throw error

  return mapDashboard(data)
}

// ===========================================
// UPDATE DASHBOARD
// ===========================================

export async function updateDashboard(
  dashboardId: string,
  input: UpdateDashboardInput
): Promise<Dashboard> {
  const client = getSupabaseClient()

  const updateData: any = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.isDefault !== undefined) updateData.is_default = input.isDefault
  if (input.isShared !== undefined) updateData.is_shared = input.isShared

  const { data, error } = await client
    .from('analytics_dashboards')
    .update(updateData)
    .eq('id', dashboardId)
    .select()
    .single()

  if (error) throw error

  return mapDashboard(data)
}

// ===========================================
// UPDATE DASHBOARD LAYOUT
// ===========================================

export async function updateDashboardLayout(
  dashboardId: string,
  layout: Array<{ widgetId: string; x: number; y: number; w: number; h: number }>
): Promise<Dashboard> {
  const client = getSupabaseClient()

  // Update dashboard layout
  const { data, error } = await client
    .from('analytics_dashboards')
    .update({ layout })
    .eq('id', dashboardId)
    .select()
    .single()

  if (error) throw error

  // Also update individual widget positions
  for (const item of layout) {
    await client
      .from('analytics_widgets')
      .update({
        grid_x: item.x,
        grid_y: item.y,
        grid_w: item.w,
        grid_h: item.h,
      })
      .eq('id', item.widgetId)
  }

  return mapDashboard(data)
}

// ===========================================
// DELETE DASHBOARD
// ===========================================

export async function deleteDashboard(dashboardId: string): Promise<void> {
  const client = getSupabaseClient()

  const { error } = await client
    .from('analytics_dashboards')
    .delete()
    .eq('id', dashboardId)

  if (error) throw error
}

// ===========================================
// DUPLICATE DASHBOARD
// ===========================================

export async function duplicateDashboard(
  dashboardId: string,
  userId: string,
  newName?: string
): Promise<Dashboard> {
  const original = await getDashboardById(dashboardId)
  if (!original) throw new Error('Dashboard not found')

  const client = getSupabaseClient()

  // Create new dashboard
  const { data: newDashboard, error: dashboardError } = await client
    .from('analytics_dashboards')
    .insert({
      organization_id: original.organizationId,
      created_by: userId,
      name: newName || `${original.name} (copie)`,
      description: original.description,
      is_default: false,
      is_shared: false,
      layout: [],
    })
    .select()
    .single()

  if (dashboardError) throw dashboardError

  // Duplicate widgets
  const widgetIdMap: Record<string, string> = {}
  for (const widget of original.widgets) {
    const { data: newWidget, error: widgetError } = await client
      .from('analytics_widgets')
      .insert({
        dashboard_id: newDashboard.id,
        title: widget.title,
        widget_type: widget.widgetType,
        metric_source: widget.metricSource,
        metric_key: widget.metricKey,
        config: widget.config,
        grid_x: widget.gridX,
        grid_y: widget.gridY,
        grid_w: widget.gridW,
        grid_h: widget.gridH,
      })
      .select()
      .single()

    if (widgetError) throw widgetError
    widgetIdMap[widget.id] = newWidget.id
  }

  // Update layout with new widget IDs
  const newLayout = original.layout.map((item) => ({
    ...item,
    widgetId: widgetIdMap[item.widgetId] || item.widgetId,
  }))

  await client
    .from('analytics_dashboards')
    .update({ layout: newLayout })
    .eq('id', newDashboard.id)

  return mapDashboard(newDashboard)
}

// ===========================================
// HELPERS
// ===========================================

function mapDashboard(row: any): Dashboard {
  return {
    id: row.id,
    organizationId: row.organization_id,
    createdBy: row.created_by,
    name: row.name,
    description: row.description,
    isDefault: row.is_default,
    isShared: row.is_shared,
    layout: row.layout || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapWidget(row: any): any {
  return {
    id: row.id,
    dashboardId: row.dashboard_id,
    title: row.title,
    widgetType: row.widget_type,
    metricSource: row.metric_source,
    metricKey: row.metric_key,
    config: row.config || {},
    gridX: row.grid_x,
    gridY: row.grid_y,
    gridW: row.grid_w,
    gridH: row.grid_h,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
