// ===========================================
// HR TIME TRACKING PAGE (PRO FEATURE)
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Clock,
  Plus,
  Play,
  Pause,
  Calendar,
  BarChart3,
  Timer,
  Coffee,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Avatar,
  AvatarFallback,
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'

export const Route = createFileRoute('/_authenticated/hr/time-tracking/')({
  component: HRTimeTrackingPage,
})

// Mock data
const mockEmployees = [
  {
    id: '1',
    name: 'Alice Martin',
    initials: 'AM',
    hoursToday: 6.5,
    hoursWeek: 32,
    status: 'working',
    currentTask: 'Developpement feature X',
  },
  {
    id: '2',
    name: 'Bob Durand',
    initials: 'BD',
    hoursToday: 7,
    hoursWeek: 35,
    status: 'break',
    currentTask: null,
  },
  {
    id: '3',
    name: 'Claire Petit',
    initials: 'CP',
    hoursToday: 5,
    hoursWeek: 28,
    status: 'working',
    currentTask: 'Reunion client',
  },
  {
    id: '4',
    name: 'David Lambert',
    initials: 'DL',
    hoursToday: 0,
    hoursWeek: 20,
    status: 'offline',
    currentTask: null,
  },
]

const mockStats = {
  totalHoursToday: 18.5,
  totalHoursWeek: 115,
  averagePerDay: 7.2,
  overtimeHours: 8,
}

// PRO features to display in upgrade card
const hrTimeFeatures = [
  { icon: Timer, label: 'Pointage en temps reel' },
  { icon: Calendar, label: 'Historique complet' },
  { icon: TrendingUp, label: 'Suivi des heures sup.' },
  { icon: FileSpreadsheet, label: 'Export Excel/PDF' },
  { icon: BarChart3, label: 'Rapports et statistiques' },
]

function HRTimeTrackingPage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Temps de travail"
      description="Le suivi du temps de travail vous permet de gerer les heures de vos employes, les heures supplementaires et d'exporter des rapports detailles."
      features={hrTimeFeatures}
    >
      <HRTimeTrackingContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL HR TIME TRACKING CONTENT
// ===========================================

function HRTimeTrackingContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Temps de travail
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez le temps de travail de vos employes en temps reel
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter manuellement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.totalHoursToday}h</p>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.totalHoursWeek}h</p>
                <p className="text-sm text-muted-foreground">Cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.averagePerDay}h</p>
                <p className="text-sm text-muted-foreground">Moyenne/jour</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStats.overtimeHours}h</p>
                <p className="text-sm text-muted-foreground">Heures sup.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Time */}
      <Card>
        <CardHeader>
          <CardTitle>Activite en cours</CardTitle>
          <CardDescription>Statut en temps reel de vos employes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{employee.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.currentTask || 'Pas de tache en cours'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{employee.hoursToday}h aujourd'hui</p>
                    <p className="text-sm text-muted-foreground">{employee.hoursWeek}h cette semaine</p>
                  </div>
                  <Badge
                    variant={
                      employee.status === 'working'
                        ? 'default'
                        : employee.status === 'break'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="gap-1"
                  >
                    {employee.status === 'working' && <Play className="h-3 w-3" />}
                    {employee.status === 'break' && <Coffee className="h-3 w-3" />}
                    {employee.status === 'working'
                      ? 'En cours'
                      : employee.status === 'break'
                        ? 'Pause'
                        : 'Hors ligne'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
