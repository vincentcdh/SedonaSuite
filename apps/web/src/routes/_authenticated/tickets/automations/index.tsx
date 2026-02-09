// ===========================================
// AUTOMATIONS PAGE (PRO FEATURE)
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Clock,
  Mail,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Bot,
  Bell,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Switch,
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'
import { useOrganization } from '@/lib/auth'
import { useAutomationRules, useToggleAutomationRule } from '@sedona/tickets'

export const Route = createFileRoute('/_authenticated/tickets/automations/')({
  component: AutomationsPage,
})

// PRO features to display in upgrade card
const automationFeatures = [
  { icon: Bot, label: 'Auto-assignation intelligente' },
  { icon: Mail, label: 'Reponses automatiques' },
  { icon: Tag, label: 'Tagging automatique' },
  { icon: Bell, label: 'Alertes et rappels SLA' },
  { icon: Clock, label: 'Actions planifiees' },
]

// Trigger type labels
const triggerLabels: Record<string, string> = {
  ticket_created: 'Nouveau ticket',
  ticket_updated: 'Ticket mis a jour',
  message_received: 'Message recu',
  sla_breach: 'Depassement SLA',
  schedule: 'Planifie',
}

// Action type labels
const actionLabels: Record<string, string> = {
  assign_to_user: 'Assigner a un agent',
  assign_to_team: 'Assigner a une equipe',
  change_status: 'Changer le statut',
  change_priority: 'Changer la priorite',
  add_tag: 'Ajouter un tag',
  remove_tag: 'Retirer un tag',
  send_email: 'Envoyer un email',
  send_notification: 'Envoyer une notification',
  add_internal_note: 'Ajouter une note interne',
  close_ticket: 'Fermer le ticket',
}

function AutomationsPage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Automatisations"
      description="Les automatisations vous permettent de gagner du temps en automatisant les taches repetitives et les workflows de support."
      features={automationFeatures}
    >
      <AutomationsContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL AUTOMATIONS CONTENT
// ===========================================

function AutomationsContent() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Fetch automation rules
  const { data: automations = [], isLoading } = useAutomationRules(organizationId)

  // Toggle mutation
  const toggleRule = useToggleAutomationRule(organizationId)

  const handleToggle = async (ruleId: string, currentState: boolean) => {
    try {
      await toggleRule.mutateAsync({ ruleId, isActive: !currentState })
    } catch (err) {
      console.error('Error toggling automation:', err)
    }
  }

  // Calculate stats
  const activeCount = automations.filter(a => a.isActive).length
  const pausedCount = automations.filter(a => !a.isActive).length
  const totalExecutions = automations.reduce((sum, a) => sum + (a.timesTriggered || 0), 0)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Automatisations
          </h1>
          <p className="text-muted-foreground mt-1">
            Automatisez vos workflows pour gagner du temps
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle automatisation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active{activeCount > 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Pause className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pausedCount}</p>
                <p className="text-sm text-muted-foreground">En pause</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExecutions}</p>
                <p className="text-sm text-muted-foreground">Executions total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      {automations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune automatisation configuree</p>
            <p className="text-sm text-muted-foreground mt-1">
              Creez votre premiere automatisation pour gagner du temps
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{automation.name}</h3>
                      <Badge variant={automation.isActive ? 'default' : 'secondary'}>
                        {automation.isActive ? 'Active' : 'En pause'}
                      </Badge>
                    </div>
                    {automation.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {automation.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {triggerLabels[automation.triggerType] || automation.triggerType}
                      </Badge>
                      {automation.actions.length > 0 && (
                        <>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          {automation.actions.map((action, i) => (
                            <Badge key={i} variant="secondary">
                              {actionLabels[action.type] || action.type}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {automation.timesTriggered || 0} execution{(automation.timesTriggered || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Switch
                    checked={automation.isActive}
                    onCheckedChange={() => handleToggle(automation.id, automation.isActive)}
                    disabled={toggleRule.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
