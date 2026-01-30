// ===========================================
// HR SETTINGS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  Clock,
  Bell,
  Users,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Switch,
  Badge,
  Separator,
} from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/hr/settings')({
  component: HrSettingsPage,
})

// Simulated PRO status
const isPro = false

// Mock leave types
const mockLeaveTypes = [
  { id: '1', name: 'Conges payes', code: 'cp', color: '#10b981', isPaid: true, isSystem: true },
  { id: '2', name: 'RTT', code: 'rtt', color: '#3b82f6', isPaid: true, isSystem: true },
  { id: '3', name: 'Maladie', code: 'sick', color: '#f59e0b', isPaid: true, isSystem: true },
  { id: '4', name: 'Sans solde', code: 'unpaid', color: '#6b7280', isPaid: false, isSystem: true },
  { id: '5', name: 'Maternite', code: 'maternity', color: '#ec4899', isPaid: true, isSystem: true },
  { id: '6', name: 'Paternite', code: 'paternity', color: '#8b5cf6', isPaid: true, isSystem: true },
]

function HrSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Parametres RH</h1>
        <p className="text-muted-foreground">
          Configurez les options du module ressources humaines
        </p>
      </div>

      {/* Leave configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuration des conges
          </CardTitle>
          <CardDescription>
            Definissez les parametres par defaut pour les conges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="annualLeaveDays">Jours de CP par an</Label>
              <Input
                id="annualLeaveDays"
                type="number"
                defaultValue={25}
              />
              <p className="text-sm text-muted-foreground">
                Nombre de jours de conges payes acquis par an
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rttDays">Jours de RTT par an</Label>
              <Input
                id="rttDays"
                type="number"
                defaultValue={10}
              />
              <p className="text-sm text-muted-foreground">
                Nombre de jours de RTT acquis par an
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaveYearStart">Debut de l'annee de reference</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="1">Janvier</option>
                <option value="6" selected>Juin</option>
              </select>
              <p className="text-sm text-muted-foreground">
                Mois de debut de la periode de reference des CP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Types de conges
            </CardTitle>
            <CardDescription>
              Gerez les differents types d'absences disponibles
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un type
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeaveTypes.map(leaveType => (
              <div
                key={leaveType.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: leaveType.color }}
                  />
                  <div>
                    <span className="font-medium">{leaveType.name}</span>
                    <span className="text-muted-foreground text-sm ml-2">({leaveType.code})</span>
                  </div>
                  {leaveType.isSystem && (
                    <Badge variant="secondary" className="text-xs">Systeme</Badge>
                  )}
                  {leaveType.isPaid && (
                    <Badge variant="outline" className="text-xs">Paye</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" disabled={leaveType.isSystem}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={leaveType.isSystem}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Temps de travail
          </CardTitle>
          <CardDescription>
            Configuration par defaut du temps de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workHoursPerWeek">Heures par semaine</Label>
              <Input
                id="workHoursPerWeek"
                type="number"
                defaultValue={35}
              />
            </div>
            <div className="space-y-2">
              <Label>Jours travailles</Label>
              <div className="flex flex-wrap gap-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                  <Button
                    key={day}
                    variant={index < 5 ? 'default' : 'outline'}
                    size="sm"
                    className="w-12"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts (PRO) */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertes automatiques
            {!isPro && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configurez les alertes automatiques pour ne rien oublier
          </CardDescription>
        </CardHeader>
        <CardContent className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fin de periode d'essai</p>
                <p className="text-sm text-muted-foreground">
                  Alerte X jours avant la fin de la periode d'essai
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={15} className="w-20" />
                <span className="text-sm text-muted-foreground">jours</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fin de contrat (CDD)</p>
                <p className="text-sm text-muted-foreground">
                  Alerte X jours avant la fin d'un CDD
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={30} className="w-20" />
                <span className="text-sm text-muted-foreground">jours</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Entretien professionnel</p>
                <p className="text-sm text-muted-foreground">
                  Rappel si aucun entretien depuis X mois
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={24} className="w-20" />
                <span className="text-sm text-muted-foreground">mois</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Documents expirants</p>
                <p className="text-sm text-muted-foreground">
                  Alerte X jours avant l'expiration d'un document
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue={30} className="w-20" />
                <span className="text-sm text-muted-foreground">jours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee self-service (PRO) */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Portail employe
            {!isPro && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Permettez aux employes d'acceder a leur espace personnel
          </CardDescription>
        </CardHeader>
        <CardContent className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activer le portail employe</p>
                <p className="text-sm text-muted-foreground">
                  Les employes pourront acceder a leur espace personnel
                </p>
              </div>
              <Switch disabled={!isPro} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Demandes de conges</p>
                <p className="text-sm text-muted-foreground">
                  Les employes peuvent faire des demandes de conges
                </p>
              </div>
              <Switch defaultChecked disabled={!isPro} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Consulter l'annuaire</p>
                <p className="text-sm text-muted-foreground">
                  Les employes peuvent voir l'annuaire de l'equipe
                </p>
              </div>
              <Switch defaultChecked disabled={!isPro} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modifier leur profil</p>
                <p className="text-sm text-muted-foreground">
                  Les employes peuvent modifier leurs informations personnelles
                </p>
              </div>
              <Switch disabled={!isPro} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  )
}
