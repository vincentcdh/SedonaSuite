// ===========================================
// DASHBOARD STATS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'

// ===========================================
// TYPES
// ===========================================

export interface DashboardStats {
  contacts: {
    total: number
    previousTotal: number
    change: number
  }
  revenue: {
    total: number
    previousTotal: number
    change: number
  }
  projects: {
    active: number
    previousActive: number
    change: number
  }
  tickets: {
    open: number
    previousOpen: number
    change: number
  }
}

export interface RecentActivity {
  id: string
  type: 'contact' | 'invoice' | 'project' | 'ticket' | 'deal'
  action: string
  detail: string
  timestamp: string
}

export interface WeeklyActivityData {
  label: string
  value: number
  date: string
}

// ===========================================
// GET DASHBOARD STATS
// ===========================================

export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  const client = getSupabaseClient()

  // Date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  // Get contact stats
  const [
    { count: contactsTotal },
    { count: contactsPreviousTotal },
  ] = await Promise.all([
    client
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_at', null),
    client
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .lt('created_at', startOfMonth),
  ])

  // Get revenue stats (invoices paid this month vs last month)
  const [invoicesThisMonth, invoicesLastMonth] = await Promise.all([
    client
      .from('invoice_invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('paid_at', startOfMonth),
    client
      .from('invoice_invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('paid_at', startOfPreviousMonth)
      .lt('paid_at', startOfMonth),
  ])

  const revenueThisMonth = (invoicesThisMonth.data || []).reduce(
    (sum: number, inv: any) => sum + (inv.total_amount || 0),
    0
  )
  const revenueLastMonth = (invoicesLastMonth.data || []).reduce(
    (sum: number, inv: any) => sum + (inv.total_amount || 0),
    0
  )

  // Get active projects stats
  const [
    { count: projectsActive },
    { count: projectsPreviousActive },
  ] = await Promise.all([
    client
      .from('projects_projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['active', 'in_progress'])
      .is('archived_at', null),
    client
      .from('projects_projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['active', 'in_progress'])
      .is('archived_at', null)
      .lt('created_at', startOfMonth),
  ])

  // Get open tickets stats
  const [
    { count: ticketsOpen },
    { count: ticketsPreviousOpen },
  ] = await Promise.all([
    client
      .from('tickets_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['open', 'in_progress', 'waiting']),
    client
      .from('tickets_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['open', 'in_progress', 'waiting'])
      .lt('created_at', startOfMonth),
  ])

  // Calculate changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  return {
    contacts: {
      total: contactsTotal || 0,
      previousTotal: contactsPreviousTotal || 0,
      change: calculateChange(contactsTotal || 0, contactsPreviousTotal || 0),
    },
    revenue: {
      total: revenueThisMonth,
      previousTotal: revenueLastMonth,
      change: calculateChange(revenueThisMonth, revenueLastMonth),
    },
    projects: {
      active: projectsActive || 0,
      previousActive: projectsPreviousActive || 0,
      change: calculateChange(projectsActive || 0, projectsPreviousActive || 0),
    },
    tickets: {
      open: ticketsOpen || 0,
      previousOpen: ticketsPreviousOpen || 0,
      change: calculateChange(ticketsOpen || 0, ticketsPreviousOpen || 0),
    },
  }
}

// ===========================================
// GET RECENT ACTIVITY
// ===========================================

export async function getRecentActivity(
  organizationId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  const client = getSupabaseClient()

  // Fetch recent items from each module
  const [contacts, invoices, projects, tickets, deals] = await Promise.all([
    client
      .from('crm_contacts')
      .select('id, first_name, last_name, created_at')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    client
      .from('invoice_invoices')
      .select('id, invoice_number, status, paid_at, created_at')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(5),
    client
      .from('projects_projects')
      .select('id, name, status, updated_at')
      .eq('organization_id', organizationId)
      .is('archived_at', null)
      .order('updated_at', { ascending: false })
      .limit(5),
    client
      .from('tickets_tickets')
      .select('id, ticket_number, subject, status, resolved_at, created_at')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(5),
    client
      .from('crm_deals')
      .select('id, name, stage_id, updated_at')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(5),
  ])

  const activities: RecentActivity[] = []

  // Map contacts
  const contactsData = (contacts.data ?? []) as { id: string; first_name: string | null; last_name: string | null; created_at: string }[]
  for (const c of contactsData) {
    activities.push({
      id: c.id,
      type: 'contact',
      action: 'Nouveau contact ajoute',
      detail: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Sans nom',
      timestamp: c.created_at,
    })
  }

  // Map invoices
  const invoicesData = (invoices.data ?? []) as { id: string; invoice_number: string | null; status: string; paid_at: string | null; created_at: string }[]
  for (const i of invoicesData) {
    if (i.status === 'paid' && i.paid_at) {
      activities.push({
        id: i.id,
        type: 'invoice',
        action: 'Facture payee',
        detail: i.invoice_number || 'Sans numero',
        timestamp: i.paid_at,
      })
    } else {
      activities.push({
        id: i.id,
        type: 'invoice',
        action: 'Facture creee',
        detail: i.invoice_number || 'Sans numero',
        timestamp: i.created_at,
      })
    }
  }

  // Map projects
  const projectsData = (projects.data ?? []) as { id: string; name: string; status: string; updated_at: string }[]
  for (const p of projectsData) {
    activities.push({
      id: p.id,
      type: 'project',
      action: 'Projet mis a jour',
      detail: p.name,
      timestamp: p.updated_at,
    })
  }

  // Map tickets
  const ticketsData = (tickets.data ?? []) as { id: string; ticket_number: string; subject: string; status: string; resolved_at: string | null; created_at: string }[]
  for (const t of ticketsData) {
    if (t.status === 'resolved' || t.status === 'closed') {
      activities.push({
        id: t.id,
        type: 'ticket',
        action: 'Ticket resolu',
        detail: `#${t.ticket_number} - ${t.subject}`,
        timestamp: t.resolved_at || t.created_at,
      })
    } else {
      activities.push({
        id: t.id,
        type: 'ticket',
        action: 'Nouveau ticket',
        detail: `#${t.ticket_number} - ${t.subject}`,
        timestamp: t.created_at,
      })
    }
  }

  // Map deals
  const dealsData = (deals.data ?? []) as { id: string; name: string; stage_id: string | null; updated_at: string }[]
  for (const d of dealsData) {
    activities.push({
      id: d.id,
      type: 'deal',
      action: 'Affaire mise a jour',
      detail: d.name,
      timestamp: d.updated_at,
    })
  }

  // Sort by timestamp and limit
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return activities.slice(0, limit)
}

// ===========================================
// GET WEEKLY ACTIVITY DATA
// ===========================================

export async function getWeeklyActivity(organizationId: string): Promise<WeeklyActivityData[]> {
  const client = getSupabaseClient()

  // Get dates for last 7 days
  const days: WeeklyActivityData[] = []
  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const startOfDay = date.toISOString()
    const endOfDay = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()

    // Count activities for this day (contacts, invoices, tickets created)
    const [contacts, invoices, tickets] = await Promise.all([
      client
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay),
      client
        .from('invoice_invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay),
      client
        .from('tickets_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay),
    ])

    days.push({
      label: dayLabels[date.getDay()] as string,
      value: (contacts.count || 0) + (invoices.count || 0) + (tickets.count || 0),
      date: startOfDay,
    })
  }

  return days
}

// ===========================================
// GET KPI DATA FOR ANALYTICS PAGE
// ===========================================

export interface KPIData {
  id: string
  title: string
  value: number
  previousValue: number
  format: 'number' | 'currency' | 'percentage'
  color: string
  icon: string
}

export async function getKPIData(organizationId: string): Promise<KPIData[]> {
  const client = getSupabaseClient()

  // Date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  // Get all stats in parallel
  const [
    // Contacts
    { count: contactsTotal },
    { count: contactsPrevious },
    // Revenue
    revenueThisMonth,
    revenuePreviousMonth,
    // Tickets
    { count: ticketsOpen },
    { count: ticketsPreviousOpen },
    // Projects
    { count: projectsActive },
    { count: projectsPreviousActive },
  ] = await Promise.all([
    // Contacts total
    client
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_at', null),
    // Contacts previous month
    client
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .lt('created_at', startOfMonth),
    // Revenue this month
    client
      .from('invoice_invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('paid_at', startOfMonth),
    // Revenue previous month
    client
      .from('invoice_invoices')
      .select('total_amount')
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('paid_at', startOfPreviousMonth)
      .lt('paid_at', startOfMonth),
    // Open tickets
    client
      .from('tickets_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['open', 'in_progress', 'waiting']),
    // Previous open tickets
    client
      .from('tickets_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['open', 'in_progress', 'waiting'])
      .lt('created_at', startOfMonth),
    // Active projects
    client
      .from('projects_projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['active', 'in_progress'])
      .is('archived_at', null),
    // Previous active projects
    client
      .from('projects_projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['active', 'in_progress'])
      .is('archived_at', null)
      .lt('created_at', startOfMonth),
  ])

  const revenue = (revenueThisMonth.data || []).reduce(
    (sum: number, inv: any) => sum + (inv.total_amount || 0),
    0
  )
  const previousRevenue = (revenuePreviousMonth.data || []).reduce(
    (sum: number, inv: any) => sum + (inv.total_amount || 0),
    0
  )

  return [
    {
      id: 'contacts',
      title: 'Contacts',
      value: contactsTotal || 0,
      previousValue: contactsPrevious || 0,
      format: 'number',
      color: '#3b82f6',
      icon: 'Users',
    },
    {
      id: 'revenue',
      title: "Chiffre d'affaires",
      value: revenue,
      previousValue: previousRevenue,
      format: 'currency',
      color: '#10b981',
      icon: 'Euro',
    },
    {
      id: 'tickets',
      title: 'Tickets ouverts',
      value: ticketsOpen || 0,
      previousValue: ticketsPreviousOpen || 0,
      format: 'number',
      color: '#f59e0b',
      icon: 'Ticket',
    },
    {
      id: 'projects',
      title: 'Projets actifs',
      value: projectsActive || 0,
      previousValue: projectsPreviousActive || 0,
      format: 'number',
      color: '#8b5cf6',
      icon: 'Briefcase',
    },
  ]
}
