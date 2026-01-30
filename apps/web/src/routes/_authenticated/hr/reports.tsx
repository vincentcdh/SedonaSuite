// ===========================================
// HR REPORTS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Briefcase,
  Clock,
  Lock,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/hr/reports')({
  component: HrReportsPage,
})

// Simulated PRO status
const isPro = false

function HrReportsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Rapports RH</h1>
        <p className="text-muted-foreground">
          Indicateurs cles et statistiques de votre equipe
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectif total</p>
                <p className="text-3xl font-bold">24</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 ce mois
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embauches ce mois</p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blurred for FREE tier */}
        <Card className="relative">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${!isPro ? 'blur-sm' : ''}`}>
              <div>
                <p className="text-sm text-muted-foreground">Departs ce mois</p>
                <p className="text-3xl font-bold">1</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  Turnover: 4.2%
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  PRO
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blurred for FREE tier */}
        <Card className="relative">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${!isPro ? 'blur-sm' : ''}`}>
              <div>
                <p className="text-sm text-muted-foreground">Taux d'absenteisme</p>
                <p className="text-3xl font-bold">3.2%</p>
                <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  PRO
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract distribution - Visible FREE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Repartition par type de contrat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>CDI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">18</span>
                  <span className="text-muted-foreground text-sm">75%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>CDD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">3</span>
                  <span className="text-muted-foreground text-sm">12.5%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '12.5%' }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span>Stage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">2</span>
                  <span className="text-muted-foreground text-sm">8.3%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '8.3%' }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>Alternance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">1</span>
                  <span className="text-muted-foreground text-sm">4.2%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '4.2%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department distribution - Blurred FREE */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Repartition par departement
            </CardTitle>
          </CardHeader>
          <CardContent className={!isPro ? 'blur-sm' : ''}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Technique</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">10</span>
                  <span className="text-muted-foreground text-sm">41.7%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '41.7%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span>Commercial</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">6</span>
                  <span className="text-muted-foreground text-sm">25%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span>Marketing</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">4</span>
                  <span className="text-muted-foreground text-sm">16.7%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '16.7%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span>RH & Admin</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">4</span>
                  <span className="text-muted-foreground text-sm">16.7%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '16.7%' }} />
              </div>
            </div>
          </CardContent>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            </div>
          )}
        </Card>
      </div>

      {/* Headcount evolution - Blurred FREE */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolution des effectifs (12 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent className={!isPro ? 'blur-sm' : ''}>
          <div className="h-64 flex items-end justify-between gap-2">
            {[18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${(value / 30) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              PRO
            </Badge>
          </div>
        )}
      </Card>

      {/* Additional metrics - Blurred FREE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Anciennete moyenne
            </CardTitle>
          </CardHeader>
          <CardContent className={!isPro ? 'blur-sm' : ''}>
            <p className="text-4xl font-bold">2.4</p>
            <p className="text-muted-foreground">annees</p>
          </CardContent>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            </div>
          )}
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Conges poses ce mois
            </CardTitle>
          </CardHeader>
          <CardContent className={!isPro ? 'blur-sm' : ''}>
            <p className="text-4xl font-bold">45</p>
            <p className="text-muted-foreground">jours</p>
          </CardContent>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            </div>
          )}
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Entretiens en retard
            </CardTitle>
          </CardHeader>
          <CardContent className={!isPro ? 'blur-sm' : ''}>
            <p className="text-4xl font-bold text-orange-600">2</p>
            <p className="text-muted-foreground">entretiens pro &gt; 2 ans</p>
          </CardContent>
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
