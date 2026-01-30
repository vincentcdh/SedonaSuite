// ===========================================
// METRICS DEFINITIONS
// ===========================================
// Defines all available metrics across modules

import type { MetricSource, WidgetType } from '../types'

export interface MetricDefinition {
  key: string
  source: MetricSource
  name: string
  description: string
  format: 'number' | 'currency' | 'percentage' | 'duration'
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max'
  supportedWidgets: WidgetType[]
  isPro?: boolean
}

// ===========================================
// CRM METRICS
// ===========================================

export const CRM_METRICS: MetricDefinition[] = [
  {
    key: 'contacts_total',
    source: 'crm',
    name: 'Total contacts',
    description: 'Nombre total de contacts dans le CRM',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'contacts_created',
    source: 'crm',
    name: 'Nouveaux contacts',
    description: 'Contacts créés sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'companies_total',
    source: 'crm',
    name: 'Total entreprises',
    description: 'Nombre total d\'entreprises',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'companies_created',
    source: 'crm',
    name: 'Nouvelles entreprises',
    description: 'Entreprises créées sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_total',
    source: 'crm',
    name: 'Total opportunités',
    description: 'Nombre total d\'opportunités',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_created',
    source: 'crm',
    name: 'Nouvelles opportunités',
    description: 'Opportunités créées sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_won',
    source: 'crm',
    name: 'Opportunités gagnées',
    description: 'Opportunités gagnées sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_lost',
    source: 'crm',
    name: 'Opportunités perdues',
    description: 'Opportunités perdues sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_value_total',
    source: 'crm',
    name: 'Valeur totale pipeline',
    description: 'Valeur totale des opportunités en cours',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_value_won',
    source: 'crm',
    name: 'Valeur opportunités gagnées',
    description: 'Valeur des opportunités gagnées sur la période',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'deals_conversion_rate',
    source: 'crm',
    name: 'Taux de conversion',
    description: 'Pourcentage d\'opportunités gagnées',
    format: 'percentage',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
  },
  {
    key: 'deals_by_stage',
    source: 'crm',
    name: 'Répartition par étape',
    description: 'Nombre d\'opportunités par étape du pipeline',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart', 'table'],
  },
  {
    key: 'activities_completed',
    source: 'crm',
    name: 'Activités complétées',
    description: 'Nombre d\'activités terminées',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart', 'heatmap'],
    isPro: true,
  },
]

// ===========================================
// INVOICE METRICS
// ===========================================

export const INVOICE_METRICS: MetricDefinition[] = [
  {
    key: 'revenue_total',
    source: 'invoice',
    name: 'Chiffre d\'affaires total',
    description: 'CA total sur la période',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'revenue_invoiced',
    source: 'invoice',
    name: 'Facturé',
    description: 'Montant total facturé',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'revenue_paid',
    source: 'invoice',
    name: 'Encaissé',
    description: 'Montant total encaissé',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'revenue_pending',
    source: 'invoice',
    name: 'En attente',
    description: 'Montant en attente de paiement',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'revenue_overdue',
    source: 'invoice',
    name: 'En retard',
    description: 'Montant des factures en retard',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'invoices_created',
    source: 'invoice',
    name: 'Factures créées',
    description: 'Nombre de factures créées',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'invoices_paid',
    source: 'invoice',
    name: 'Factures payées',
    description: 'Nombre de factures payées',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'invoices_overdue_count',
    source: 'invoice',
    name: 'Factures en retard',
    description: 'Nombre de factures en retard',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'quotes_created',
    source: 'invoice',
    name: 'Devis créés',
    description: 'Nombre de devis créés',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'quotes_accepted',
    source: 'invoice',
    name: 'Devis acceptés',
    description: 'Nombre de devis acceptés',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'quotes_conversion_rate',
    source: 'invoice',
    name: 'Taux conversion devis',
    description: 'Pourcentage de devis convertis',
    format: 'percentage',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
  },
  {
    key: 'avg_payment_delay',
    source: 'invoice',
    name: 'Délai moyen paiement',
    description: 'Nombre de jours moyen avant paiement',
    format: 'duration',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
    isPro: true,
  },
  {
    key: 'revenue_by_client',
    source: 'invoice',
    name: 'CA par client',
    description: 'Chiffre d\'affaires par client',
    format: 'currency',
    aggregation: 'sum',
    supportedWidgets: ['bar_chart', 'pie_chart', 'table'],
    isPro: true,
  },
]

// ===========================================
// PROJECTS METRICS
// ===========================================

export const PROJECTS_METRICS: MetricDefinition[] = [
  {
    key: 'projects_total',
    source: 'projects',
    name: 'Total projets',
    description: 'Nombre total de projets',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'projects_active',
    source: 'projects',
    name: 'Projets actifs',
    description: 'Projets en cours',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'projects_completed',
    source: 'projects',
    name: 'Projets terminés',
    description: 'Projets terminés sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'projects_on_time',
    source: 'projects',
    name: 'Projets dans les délais',
    description: 'Projets terminés à temps',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'bar_chart'],
  },
  {
    key: 'tasks_total',
    source: 'projects',
    name: 'Total tâches',
    description: 'Nombre total de tâches',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tasks_completed',
    source: 'projects',
    name: 'Tâches terminées',
    description: 'Tâches terminées sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tasks_overdue',
    source: 'projects',
    name: 'Tâches en retard',
    description: 'Nombre de tâches en retard',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tasks_by_status',
    source: 'projects',
    name: 'Tâches par statut',
    description: 'Répartition des tâches par statut',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart'],
  },
  {
    key: 'avg_task_completion_time',
    source: 'projects',
    name: 'Durée moyenne tâche',
    description: 'Durée moyenne de complétion d\'une tâche',
    format: 'duration',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
    isPro: true,
  },
  {
    key: 'team_velocity',
    source: 'projects',
    name: 'Vélocité équipe',
    description: 'Tâches complétées par semaine',
    format: 'number',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
    isPro: true,
  },
]

// ===========================================
// TICKETS METRICS
// ===========================================

export const TICKETS_METRICS: MetricDefinition[] = [
  {
    key: 'tickets_total',
    source: 'tickets',
    name: 'Total tickets',
    description: 'Nombre total de tickets',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tickets_open',
    source: 'tickets',
    name: 'Tickets ouverts',
    description: 'Tickets actuellement ouverts',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tickets_created',
    source: 'tickets',
    name: 'Nouveaux tickets',
    description: 'Tickets créés sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tickets_resolved',
    source: 'tickets',
    name: 'Tickets résolus',
    description: 'Tickets résolus sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'tickets_by_priority',
    source: 'tickets',
    name: 'Tickets par priorité',
    description: 'Répartition des tickets par priorité',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart'],
  },
  {
    key: 'tickets_by_category',
    source: 'tickets',
    name: 'Tickets par catégorie',
    description: 'Répartition des tickets par catégorie',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart', 'table'],
  },
  {
    key: 'avg_resolution_time',
    source: 'tickets',
    name: 'Temps résolution moyen',
    description: 'Durée moyenne de résolution',
    format: 'duration',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
  },
  {
    key: 'avg_first_response_time',
    source: 'tickets',
    name: 'Temps première réponse',
    description: 'Durée moyenne avant première réponse',
    format: 'duration',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
    isPro: true,
  },
  {
    key: 'satisfaction_score',
    source: 'tickets',
    name: 'Score satisfaction',
    description: 'Score de satisfaction client',
    format: 'percentage',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
    isPro: true,
  },
]

// ===========================================
// HR METRICS
// ===========================================

export const HR_METRICS: MetricDefinition[] = [
  {
    key: 'employees_total',
    source: 'hr',
    name: 'Effectif total',
    description: 'Nombre total d\'employés actifs',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'employees_hired',
    source: 'hr',
    name: 'Embauches',
    description: 'Nouvelles embauches sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'employees_departed',
    source: 'hr',
    name: 'Départs',
    description: 'Départs sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'turnover_rate',
    source: 'hr',
    name: 'Taux de rotation',
    description: 'Pourcentage de turnover',
    format: 'percentage',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
  },
  {
    key: 'employees_by_department',
    source: 'hr',
    name: 'Effectif par département',
    description: 'Répartition des employés par département',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart', 'table'],
  },
  {
    key: 'employees_by_contract',
    source: 'hr',
    name: 'Effectif par contrat',
    description: 'Répartition par type de contrat',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart'],
  },
  {
    key: 'leave_days_taken',
    source: 'hr',
    name: 'Jours de congés pris',
    description: 'Total de jours de congés pris',
    format: 'number',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'leave_requests_pending',
    source: 'hr',
    name: 'Demandes en attente',
    description: 'Demandes de congés en attente',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi'],
  },
  {
    key: 'avg_seniority',
    source: 'hr',
    name: 'Ancienneté moyenne',
    description: 'Ancienneté moyenne des employés (années)',
    format: 'number',
    aggregation: 'avg',
    supportedWidgets: ['kpi', 'line_chart'],
    isPro: true,
  },
]

// ===========================================
// DOCS METRICS
// ===========================================

export const DOCS_METRICS: MetricDefinition[] = [
  {
    key: 'files_total',
    source: 'docs',
    name: 'Total fichiers',
    description: 'Nombre total de fichiers',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'files_uploaded',
    source: 'docs',
    name: 'Fichiers importés',
    description: 'Fichiers importés sur la période',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
  },
  {
    key: 'storage_used',
    source: 'docs',
    name: 'Stockage utilisé',
    description: 'Espace de stockage utilisé (MB)',
    format: 'number',
    aggregation: 'sum',
    supportedWidgets: ['kpi', 'line_chart'],
  },
  {
    key: 'files_by_type',
    source: 'docs',
    name: 'Fichiers par type',
    description: 'Répartition des fichiers par type',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['bar_chart', 'pie_chart'],
  },
  {
    key: 'files_downloaded',
    source: 'docs',
    name: 'Téléchargements',
    description: 'Nombre de téléchargements',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['kpi', 'line_chart', 'bar_chart'],
    isPro: true,
  },
  {
    key: 'most_accessed_files',
    source: 'docs',
    name: 'Fichiers les plus accédés',
    description: 'Top 10 des fichiers les plus consultés',
    format: 'number',
    aggregation: 'count',
    supportedWidgets: ['table'],
    isPro: true,
  },
]

// ===========================================
// ALL METRICS
// ===========================================

export const ALL_METRICS: MetricDefinition[] = [
  ...CRM_METRICS,
  ...INVOICE_METRICS,
  ...PROJECTS_METRICS,
  ...TICKETS_METRICS,
  ...HR_METRICS,
  ...DOCS_METRICS,
]

export const METRICS_BY_SOURCE: Record<MetricSource, MetricDefinition[]> = {
  crm: CRM_METRICS,
  invoice: INVOICE_METRICS,
  projects: PROJECTS_METRICS,
  tickets: TICKETS_METRICS,
  hr: HR_METRICS,
  docs: DOCS_METRICS,
}

export function getMetricDefinition(source: MetricSource, key: string): MetricDefinition | undefined {
  return METRICS_BY_SOURCE[source]?.find(m => m.key === key)
}

export function getMetricsBySource(source: MetricSource): MetricDefinition[] {
  return METRICS_BY_SOURCE[source] || []
}

export function getMetricsForWidgetType(widgetType: WidgetType): MetricDefinition[] {
  return ALL_METRICS.filter(m => m.supportedWidgets.includes(widgetType))
}

export function getFreeMetrics(): MetricDefinition[] {
  return ALL_METRICS.filter(m => !m.isPro)
}

export function getProMetrics(): MetricDefinition[] {
  return ALL_METRICS.filter(m => m.isPro)
}
