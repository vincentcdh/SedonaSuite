// ===========================================
// SCHEDULED REPORTS PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  FileBarChart,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Play,
  Pause,
  Clock,
  Mail,
  Download,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { ANALYTICS_PLAN_LIMITS } from '@sedona/analytics'
import { usePlan } from '@/hooks/usePlan'

export const Route = createFileRoute('/_authenticated/analytics/reports')({
  component: ReportsPage,
})

// Mock scheduled reports (for PRO users)
const mockReportsData = [
  {
    id: '1',
    name: 'Rapport hebdomadaire CA',
    description: 'Resume du chiffre d\'affaires de la semaine',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    timeOfDay: '08:00',
    format: 'pdf',
    recipients: ['jean@example.com', 'marie@example.com'],
    isActive: true,
    lastRunAt: '2024-01-15T08:00:00Z',
    nextRunAt: '2024-01-22T08:00:00Z',
  },
  {
    id: '2',
    name: 'Bilan mensuel',
    description: 'Synthese mensuelle de tous les KPIs',
    frequency: 'monthly',
    dayOfMonth: 1,
    timeOfDay: '09:00',
    format: 'pdf',
    recipients: ['direction@example.com'],
    isActive: true,
    lastRunAt: '2024-01-01T09:00:00Z',
    nextRunAt: '2024-02-01T09:00:00Z',
  },
]

// Mock report history (for PRO users)
const mockHistoryData = [
  {
    id: 'h1',
    reportName: 'Rapport hebdomadaire CA',
    generatedAt: '2024-01-15T08:00:00Z',
    status: 'completed',
    format: 'pdf',
    fileSize: 245000,
  },
  {
    id: 'h2',
    reportName: 'Bilan mensuel',
    generatedAt: '2024-01-01T09:00:00Z',
    status: 'completed',
    format: 'pdf',
    fileSize: 512000,
  },
  {
    id: 'h3',
    reportName: 'Rapport hebdomadaire CA',
    generatedAt: '2024-01-08T08:00:00Z',
    status: 'failed',
    errorMessage: 'Erreur de generation',
  },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFrequency(frequency: string, dayOfWeek?: number, dayOfMonth?: number): string {
  switch (frequency) {
    case 'daily':
      return 'Tous les jours'
    case 'weekly': {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      return `Chaque ${days[dayOfWeek || 0]}`
    }
    case 'monthly':
      return `Le ${dayOfMonth || 1} de chaque mois`
    default:
      return frequency
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ReportsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { isFree } = usePlan()

  // Get data based on plan
  const mockReports = isFree ? [] : mockReportsData
  const mockHistory = isFree ? [] : mockHistoryData

  // PRO feature gate - show upgrade prompt for FREE users
  if (isFree) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Rapports automatises</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Programmez des rapports automatiques et recevez-les directement par email.
              Cette fonctionnalite est disponible avec l'offre PRO.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-left p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Planification flexible</p>
                  <p className="text-sm text-muted-foreground">
                    Quotidien, hebdomadaire ou mensuel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left p-4 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Envoi par email</p>
                  <p className="text-sm text-muted-foreground">
                    Plusieurs destinataires supportes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left p-4 bg-muted/50 rounded-lg">
                <Download className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">Formats multiples</p>
                  <p className="text-sm text-muted-foreground">
                    PDF, CSV et Excel
                  </p>
                </div>
              </div>
            </div>

            <Link to="/settings/billing">
              <Button size="lg">
                <Lock className="h-4 w-4 mr-2" />
                Passer a PRO
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart className="h-6 w-6" />
            Rapports automatises
          </h1>
          <p className="text-muted-foreground mt-1">
            Programmez des rapports et recevez-les par email
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rapport
        </Button>
      </div>

      {/* Scheduled reports list */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Rapports programmes</h2>
        {mockReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">Aucun rapport programme</p>
              <p className="text-sm text-muted-foreground mt-2">
                Creez votre premier rapport automatise.
              </p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Creer un rapport
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockReports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {report.name}
                        <Badge variant={report.isActive ? 'default' : 'secondary'}>
                          {report.isActive ? 'Actif' : 'Pause'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Executer maintenant
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {report.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Mettre en pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatFrequency(report.frequency, report.dayOfWeek, report.dayOfMonth)}
                      {' a '}{report.timeOfDay}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {report.recipients.length} destinataire{report.recipients.length > 1 ? 's' : ''}
                    </div>
                    <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Dernier envoi: {formatDate(report.lastRunAt)}</span>
                    <span>Prochain: {formatDate(report.nextRunAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Report history */}
      {mockHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Historique</h2>
          <Card>
            <div className="divide-y">
              {mockHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {item.status === 'failed' && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {item.status === 'processing' && (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    )}
                    <div>
                      <p className="font-medium">{item.reportName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.generatedAt)}
                        {item.status === 'failed' && (
                          <span className="text-red-600"> - {item.errorMessage}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {item.status === 'completed' && item.fileSize && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Telecharger
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau rapport automatise</DialogTitle>
            <DialogDescription>
              Configurez un rapport qui sera genere et envoye automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du rapport</Label>
              <Input placeholder="Ex: Rapport hebdomadaire CA" />
            </div>

            <div className="space-y-2">
              <Label>Dashboard source</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez un dashboard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Vue d'ensemble</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequence</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Heure d'envoi</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destinataires (emails separes par des virgules)</Label>
              <Input placeholder="jean@example.com, marie@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button>Creer le rapport</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
