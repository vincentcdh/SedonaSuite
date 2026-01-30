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

// Get Supabase client with analytics schema
function getAnalyticsClient() {
  return getSupabaseClient().schema('analytics' as any) as any
}

// ===========================================
// GET WIDGETS
// ===========================================

export async function getWidgetsByDashboard(
  dashboardId: string
): Promise<Widget[]> {
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('widgets')
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
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('widgets')
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
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('widgets')
    .insert({
      dashboard_id: input.dashboardId,
      title: input.title,
      widget_type: input.widgetType,
      metric_source: input.metricSource,
      metric_key: input.metricKey,
      config: input.config || {},
      grid_x: input.gridX || 0,
      grid_y: input.gridY || 0,
      grid_w: input.gridW || 4,
      grid_h: input.gridH || 2,
    })
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
  const client = getAnalyticsClient()

  const updateData: any = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.widgetType !== undefined) updateData.widget_type = input.widgetType
  if (input.metricSource !== undefined) updateData.metric_source = input.metricSource
  if (input.metricKey !== undefined) updateData.metric_key = input.metricKey
  if (input.config !== undefined) updateData.config = input.config
  if (input.gridX !== undefined) updateData.grid_x = input.gridX
  if (input.gridY !== undefined) updateData.grid_y = input.gridY
  if (input.gridW !== undefined) updateData.grid_w = input.gridW
  if (input.gridH !== undefined) updateData.grid_h = input.gridH

  const { data, error } = await client
    .from('widgets')
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
  const client = getAnalyticsClient()

  const { error } = await client
    .from('widgets')
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
  organizationId: string,
  source: string,
  key: string,
  filters: MetricFilters
): Promise<any | null> {
  const client = getAnalyticsClient()

  const { data, error } = await client
    .from('metrics_cache')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('metric_source', source)
    .eq('metric_key', key)
    .eq('period_type', filters.periodType)
    .eq('period_start', filters.startDate)
    .eq('period_end', filters.endDate)
    .gt('expires_at', new Date().toISOString())
    .order('computed_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null

  return data
}

async function cacheMetric(
  organizationId: string,
  source: string,
  key: string,
  filters: MetricFilters,
  data: any
): Promise<void> {
  const client = getAnalyticsClient()

  // Set cache expiration (1 hour for recent data, longer for historical)
  const now = new Date()
  const endDate = new Date(filters.endDate)
  const isRecent = (now.getTime() - endDate.getTime()) < 24 * 60 * 60 * 1000
  const expiresAt = new Date(now.getTime() + (isRecent ? 60 : 1440) * 60 * 1000)

  await client
    .from('metrics_cache')
    .upsert({
      organization_id: organizationId,
      metric_source: source,
      metric_key: key,
      period_type: filters.periodType,
      period_start: filters.startDate,
      period_end: filters.endDate,
      value: data.value,
      metadata: data.metadata || {},
      computed_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'organization_id,metric_source,metric_key,period_type,period_start',
    })
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
