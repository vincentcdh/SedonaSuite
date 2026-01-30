import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sedona/ui'
import {
  Users,
  FileText,
  FolderKanban,
  Ticket,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-description">
          Bienvenue sur Sedona.AI. Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Contacts"
          value="1,284"
          change={12}
          changeLabel="vs mois dernier"
          icon={Users}
        />
        <StatsCard
          title="Factures"
          value="32,450 €"
          change={8}
          changeLabel="vs mois dernier"
          icon={FileText}
        />
        <StatsCard
          title="Projets actifs"
          value="12"
          change={-2}
          changeLabel="vs mois dernier"
          icon={FolderKanban}
        />
        <StatsCard
          title="Tickets ouverts"
          value="23"
          change={-15}
          changeLabel="vs semaine dernière"
          icon={Ticket}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
            <CardDescription>Les dernières actions sur votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Nouveau contact ajouté', detail: 'Marie Dupont', time: 'Il y a 5 min' },
                { action: 'Facture payée', detail: 'FAC-2024-0042', time: 'Il y a 1h' },
                { action: 'Projet mis à jour', detail: 'Refonte site web', time: 'Il y a 2h' },
                { action: 'Ticket résolu', detail: '#1234 - Bug connexion', time: 'Il y a 3h' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
            <CardDescription>Accédez rapidement aux fonctionnalités clés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                { label: 'Nouveau contact', href: '/crm/contacts/new', icon: Users },
                { label: 'Créer une facture', href: '/invoices/new', icon: FileText },
                { label: 'Nouveau projet', href: '/projects/new', icon: FolderKanban },
                { label: 'Ouvrir un ticket', href: '/tickets/new', icon: Ticket },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
}

function StatsCard({ title, value, change, changeLabel, icon: Icon }: StatsCardProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold font-heading">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
      </CardContent>
    </Card>
  )
}
