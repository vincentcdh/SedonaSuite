// ===========================================
// ANALYTICS SETTINGS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Settings,
  BarChart3,
  Target,
  FileBarChart,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Separator,
  Switch,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { ANALYTICS_PLAN_LIMITS } from '@sedona/analytics'

export const Route = createFileRoute('/_authenticated/analytics/settings')({
  component: AnalyticsSettingsPage,
})

// Simulated PRO status
const isPro = false
const limits = isPro ? ANALYTICS_PLAN_LIMITS.PRO : ANALYTICS_PLAN_LIMITS.FREE

function AnalyticsSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Parametres Analytics</h1>
        <p className="text-muted-foreground">
          Configurez les options de vos tableaux de bord et rapports
        </p>
      </div>

      {/* Plan overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Votre plan
          </CardTitle>
          <CardDescription>
            Limites et fonctionnalites de votre abonnement actuel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plan actuel</p>
              <p className="text-sm text-muted-foreground">
                {isPro ? 'PRO' : 'Gratuit'}
              </p>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {isPro ? 'PRO' : 'FREE'}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Dashboards</p>
              <p className="text-2xl font-bold">{limits.maxDashboards}</p>
              <p className="text-xs text-muted-foreground">maximum</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Widgets par dashboard</p>
              <p className="text-2xl font-bold">{limits.maxWidgetsPerDashboard}</p>
              <p className="text-xs text-muted-foreground">maximum</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Objectifs</p>
              <p className="text-2xl font-bold">{limits.maxGoals}</p>
              <p className="text-xs text-muted-foreground">maximum</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Conservation des donnees</p>
              <p className="text-2xl font-bold">{limits.dataRetentionDays}</p>
              <p className="text-xs text-muted-foreground">jours</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Rapports automatises</span>
              </div>
              {limits.scheduledReports ? (
                <Badge variant="default">Disponible</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  PRO
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Metriques personnalisees</span>
              </div>
              {limits.customMetrics ? (
                <Badge variant="default">Disponible</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  PRO
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Formats d'export</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {limits.exportFormats.map((f) => f.toUpperCase()).join(', ')}
              </span>
            </div>
          </div>

          {!isPro && (
            <>
              <Separator />
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">Passez a PRO</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Debloquez les dashboards illimites, rapports automatises, export Excel et plus encore.
                </p>
                <Button>Passer a PRO</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Display preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences d'affichage
          </CardTitle>
          <CardDescription>
            Personnalisez l'affichage de vos donnees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Periode par defaut</p>
              <p className="text-sm text-muted-foreground">
                Periode affichee a l'ouverture des dashboards
              </p>
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Annee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Comparaison par defaut</p>
              <p className="text-sm text-muted-foreground">
                Type de comparaison affiche par defaut
              </p>
            </div>
            <Select defaultValue="previous_period">
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                <SelectItem value="previous_period">Periode precedente</SelectItem>
                <SelectItem value="same_period_last_year">Meme periode N-1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Afficher les tendances</p>
              <p className="text-sm text-muted-foreground">
                Afficher les fleches de tendance sur les KPIs
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Format des nombres</p>
              <p className="text-sm text-muted-foreground">
                Format d'affichage des valeurs numeriques
              </p>
            </div>
            <Select defaultValue="fr">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">1 234,56 (FR)</SelectItem>
                <SelectItem value="en">1,234.56 (EN)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cache management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Donnees en cache
          </CardTitle>
          <CardDescription>
            Gestion du cache des metriques calculees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Rafraichissement automatique</p>
              <p className="text-sm text-muted-foreground">
                Les metriques sont recalculees automatiquement
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Vider le cache</p>
              <p className="text-sm text-muted-foreground">
                Forcer le recalcul de toutes les metriques
              </p>
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Vider le cache
            </Button>
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
