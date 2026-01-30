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
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Switch,
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'

export const Route = createFileRoute('/_authenticated/tickets/automations/')({
  component: AutomationsPage,
})

// Mock automations
const mockAutomations = [
  {
    id: '1',
    name: 'Auto-assignation urgente',
    description: 'Assigne automatiquement les tickets urgents a l\'equipe senior',
    trigger: 'Nouveau ticket avec priorite urgente',
    actions: ['Assigner a l\'equipe Senior', 'Envoyer une notification Slack'],
    isActive: true,
    runsCount: 156,
  },
  {
    id: '2',
    name: 'Rappel SLA',
    description: 'Envoie un rappel 1h avant l\'echeance SLA',
    trigger: '1 heure avant echeance SLA',
    actions: ['Envoyer un email de rappel', 'Ajouter le tag "SLA-proche"'],
    isActive: true,
    runsCount: 89,
  },
  {
    id: '3',
    name: 'Fermeture automatique',
    description: 'Ferme les tickets resolus sans reponse apres 7 jours',
    trigger: 'Ticket resolu sans reponse depuis 7 jours',
    actions: ['Changer le statut en Ferme', 'Envoyer un email de cloture'],
    isActive: false,
    runsCount: 234,
  },
  {
    id: '4',
    name: 'Reponse automatique',
    description: 'Envoie une reponse automatique pour les demandes de remboursement',
    trigger: 'Nouveau ticket contenant "remboursement"',
    actions: ['Envoyer une reponse template', 'Ajouter le tag "remboursement"'],
    isActive: true,
    runsCount: 67,
  },
]

// PRO features to display in upgrade card
const automationFeatures = [
  { icon: Bot, label: 'Auto-assignation intelligente' },
  { icon: Mail, label: 'Reponses automatiques' },
  { icon: Tag, label: 'Tagging automatique' },
  { icon: Bell, label: 'Alertes et rappels SLA' },
  { icon: Clock, label: 'Actions planifiees' },
]

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
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Actives</p>
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
                <p className="text-2xl font-bold">1</p>
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
                <p className="text-2xl font-bold">546</p>
                <p className="text-sm text-muted-foreground">Executions ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {mockAutomations.map((automation) => (
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
                  <p className="text-sm text-muted-foreground mb-3">
                    {automation.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {automation.trigger}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    {automation.actions.map((action, i) => (
                      <Badge key={i} variant="secondary">
                        {action}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {automation.runsCount} executions
                  </p>
                </div>
                <Switch checked={automation.isActive} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
