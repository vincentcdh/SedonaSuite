// ===========================================
// HR ALERTS PAGE (PRO FEATURE)
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  Plus,
  Bell,
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Settings,
  Mail,
  Zap,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Switch,
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'

export const Route = createFileRoute('/_authenticated/hr/alerts/')({
  component: AlertsPage,
})

// Mock alerts
const mockActiveAlerts = [
  {
    id: '1',
    type: 'contract_expiry',
    title: 'Contrat arrivant a echeance',
    description: 'Le contrat de Marie Dupont expire dans 30 jours',
    severity: 'warning',
    date: '2024-03-15',
    employee: 'Marie Dupont',
  },
  {
    id: '2',
    type: 'leave_balance',
    title: 'Solde de conges eleve',
    description: 'Pierre Martin a 25 jours de conges non pris',
    severity: 'info',
    date: '2024-02-14',
    employee: 'Pierre Martin',
  },
  {
    id: '3',
    type: 'missing_document',
    title: 'Document manquant',
    description: 'Attestation de securite sociale manquante',
    severity: 'error',
    date: '2024-02-10',
    employee: 'Sophie Bernard',
  },
  {
    id: '4',
    type: 'anniversary',
    title: 'Anniversaire d\'embauche',
    description: '5 ans dans l\'entreprise le 20/02',
    severity: 'success',
    date: '2024-02-20',
    employee: 'Lucas Petit',
  },
]

const mockAlertRules = [
  {
    id: '1',
    name: 'Expiration de contrat',
    description: 'Alerte 30 jours avant l\'expiration d\'un CDD',
    isActive: true,
    triggers: 12,
  },
  {
    id: '2',
    name: 'Solde de conges',
    description: 'Alerte si plus de 20 jours non pris',
    isActive: true,
    triggers: 5,
  },
  {
    id: '3',
    name: 'Documents manquants',
    description: 'Alerte si documents obligatoires absents',
    isActive: true,
    triggers: 3,
  },
  {
    id: '4',
    name: 'Periode d\'essai',
    description: 'Rappel 7 jours avant fin de periode d\'essai',
    isActive: false,
    triggers: 0,
  },
]

const severityConfig = {
  error: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  warning: { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle },
  info: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Bell },
  success: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
}

// PRO features to display in upgrade card
const alertFeatures = [
  { icon: Calendar, label: 'Alertes d\'expiration de contrat' },
  { icon: FileText, label: 'Documents manquants' },
  { icon: Clock, label: 'Periodes d\'essai' },
  { icon: Mail, label: 'Notifications par email' },
  { icon: Zap, label: 'Regles personnalisables' },
]

function AlertsPage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Alertes RH"
      description="Les alertes RH vous permettent de ne jamais oublier les echeances importantes : fins de contrat, periodes d'essai, documents manquants, etc."
      features={alertFeatures}
    >
      <AlertsContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL ALERTS CONTENT
// ===========================================

function AlertsContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Alertes RH
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez des alertes automatiques pour ne rien oublier
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle regle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Critique</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Information</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Regles actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertes actives
            </CardTitle>
            <CardDescription>Alertes necessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActiveAlerts.map((alert) => {
                const config = severityConfig[alert.severity as keyof typeof severityConfig]
                const Icon = config.icon
                return (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {alert.employee}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alert Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Regles d'alerte
            </CardTitle>
            <CardDescription>Configurez vos alertes automatiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAlertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rule.triggers} declenchements
                    </p>
                  </div>
                  <Switch checked={rule.isActive} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
