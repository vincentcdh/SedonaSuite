// ===========================================
// WIDGETS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  Widget,
  WidgetData,
  CreateWidgetInput,
  UpdateWidgetInput,
  MetricFilters,
} from '../types'
import { getMetricDefinition } from '../metrics/definitions'

// ===========================================
// GET WIDGETS
// ===========================================

export async function getWidgetsByDashboard(
  dashboardId: string
): Promise<Widget[]> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('analytics_widgets')
    .select('*')
    .eq('dashboard_id', dashboardId)
    .order('grid_y', { ascending: true })
    .order('grid_x', { ascending: true })

  if (error) throw error

  return (data || []).map(mapWidget)
}

// ===========================================
// GET WIDGET BY ID
// ===========================================

export async function getWidgetById(widgetId: string): Promise<Widget | null> {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from('analytics_widgets')
    .select('*')
    .eq('id', widgetId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapWidget(data)
}

// ===========================================
// CREATE WIDGET
// ===========================================

export async function createWidget(input: CreateWidgetInput): Promise<Widget> {
  const client = getSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    dashboard_id: input.dashboardId,
    title: input.title,
    widget_type: input.widgetType,
    metric_source: input.metricSource,
    config: input.config || {},
    position_x: input.gridX || 0,
    position_y: input.gridY || 0,
    width: input.gridW || 4,
    height: input.gridH || 2,
  }

  const { data, error } = await client
    .from('analytics_widgets')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  return mapWidget(data)
}

// ===========================================
// UPDATE WIDGET
// ===========================================

export async function updateWidget(
  widgetId: string,
  input: UpdateWidgetInput
): Promise<Widget> {
  const client = getSupabaseClient()

  const updateData: any = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.widgetType !== undefined) updateData.widget_type = input.widgetType
  if (input.metricSource !== undefined) updateData.metric_source = input.metricSource
  if (input.config !== undefined) updateData.config = input.config
  if (input.gridX !== undefined) updateData.position_x = input.gridX
  if (input.gridY !== undefined) updateData.position_y = input.gridY
  if (input.gridW !== undefined) updateData.width = input.gridW
  if (input.gridH !== undefined) updateData.height = input.gridH

  const { data, error } = await client
    .from('analytics_widgets')
    .update(updateData)
    .eq('id', widgetId)
    .select()
    .single()

  if (error) throw error

  return mapWidget(data)
}

// ===========================================
// DELETE WIDGET
// ===========================================

export async function deleteWidget(widgetId: string): Promise<void> {
  const client = getSupabaseClient()

  const { error } = await client
    .from('analytics_widgets')
    .delete()
    .eq('id', widgetId)

  if (error) throw error
}

// ===========================================
// GET WIDGET DATA
// ===========================================

export async function getWidgetData(
  widget: Widget,
  organizationId: string,
  filters: MetricFilters
): Promise<WidgetData> {
  const metricDef = getMetricDefinition(widget.metricSource, widget.metricKey)

  // Check cache first
  const cachedData = await getCachedMetric(
    organizationId,
    widget.metricSource,
    widget.metricKey,
    filters
  )

  if (cachedData) {
    return formatWidgetData(cachedData, filters, metricDef?.format || 'number')
  }

  // Compute metric (in a real implementation, this would query the actual data)
  const computedData = await computeMetric(
    organizationId,
    widget.metricSource,
    widget.metricKey,
    filters
  )

  // Cache the result
  await cacheMetric(
    organizationId,
    widget.metricSource,
    widget.metricKey,
    filters,
    computedData
  )

  return formatWidgetData(computedData, filters, metricDef?.format || 'number')
}

// ===========================================
// CACHE FUNCTIONS
// ===========================================

async function getCachedMetric(
  _organizationId: string,
  _source: string,
  _key: string,
  _filters: MetricFilters
): Promise<any | null> {
  // Note: analytics_metrics_cache table doesn't exist in schema
  // Caching is disabled for now
  return null
}

async function cacheMetric(
  _organizationId: string,
  _source: string,
  _key: string,
  _filters: MetricFilters,
  _data: any
): Promise<void> {
  // Note: analytics_metrics_cache table doesn't exist in schema
  // Caching is disabled for now
}

async function computeMetric(
  organizationId: string,
  source: string,
  key: string,
  filters: MetricFilters
): Promise<any> {
  // This is a placeholder - in a real implementation, this would query
  // the actual data from each module's tables based on the metric definition
  // For now, return mock data

  const mockValue = Math.floor(Math.random() * 10000) / 100
  const previousValue = mockValue * (0.8 + Math.random() * 0.4)

  return {
    value: mockValue,
    previousValue,
    metadata: {
      source,
      key,
      filters,
    },
  }
}

function formatWidgetData(
  data: any,
  filters: MetricFilters,
  format: string
): WidgetData {
  const value = data.value || 0
  const previousValue = data.previousValue || data.metadata?.previousValue
  const change = previousValue ? value - previousValue : undefined
  const changePercent = previousValue ? ((value - previousValue) / previousValue) * 100 : undefined

  let trend: 'up' | 'down' | 'stable' | undefined
  if (changePercent !== undefined) {
    if (changePercent > 1) trend = 'up'
    else if (changePercent < -1) trend = 'down'
    else trend = 'stable'
  }

  return {
    value,
    previousValue,
    change,
    changePercent,
    trend,
    series: data.metadata?.series,
    breakdown: data.metadata?.breakdown,
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapWidget(row: any): Widget {
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
