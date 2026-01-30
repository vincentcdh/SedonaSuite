import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Card, Progress } from '@sedona/ui'
import { Plus, Settings, MoreHorizontal, User, Building2, Calendar, Euro, Sparkles, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { usePlan } from '@/hooks/usePlan'

// Plan limits
const FREE_PLAN_LIMITS = {
  deals: 25,
}

export const Route = createFileRoute('/_authenticated/crm/pipeline/')({
  component: PipelinePage,
})

// Mock data
const mockPipeline = {
  id: '1',
  name: 'Pipeline de vente',
  stages: [
    {
      id: '1',
      name: 'Nouveau',
      color: '#6b7280',
      probability: 10,
      deals: [
        { id: '1', name: 'Projet Alpha', amount: 25000, contact: 'Marie Dupont', company: 'Acme Corp', expectedCloseDate: '2025-02-15' },
        { id: '2', name: 'Contrat Beta', amount: 15000, contact: 'Jean Martin', company: 'Tech Solutions', expectedCloseDate: '2025-02-20' },
      ],
    },
    {
      id: '2',
      name: 'Qualification',
      color: '#3b82f6',
      probability: 20,
      deals: [
        { id: '3', name: 'Partenariat Gamma', amount: 50000, contact: 'Sophie Bernard', company: 'Design Studio', expectedCloseDate: '2025-03-01' },
      ],
    },
    {
      id: '3',
      name: 'Proposition',
      color: '#8b5cf6',
      probability: 40,
      deals: [
        { id: '4', name: 'Extension Delta', amount: 35000, contact: 'Pierre Durand', company: 'Finance Plus', expectedCloseDate: '2025-02-28' },
        { id: '5', name: 'Service Epsilon', amount: 20000, contact: 'Claire Moreau', company: 'Marketing Pro', expectedCloseDate: '2025-03-10' },
      ],
    },
    {
      id: '4',
      name: 'Negociation',
      color: '#f59e0b',
      probability: 60,
      deals: [
        { id: '6', name: 'Contrat annuel Zeta', amount: 75000, contact: 'Marie Dupont', company: 'Acme Corp', expectedCloseDate: '2025-02-10' },
      ],
    },
    {
      id: '5',
      name: 'Cloture',
      color: '#10b981',
      probability: 80,
      deals: [],
    },
  ],
}

function PipelinePage() {
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null)
  const { isFree } = usePlan()

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stageId: string) => {
    // TODO: Integrate with API to move deal
    console.log(`Move deal ${draggedDeal} to stage ${stageId}`)
    setDraggedDeal(null)
  }

  const getTotalValue = (deals: typeof mockPipeline.stages[0]['deals']) => {
    return deals.reduce((sum, deal) => sum + deal.amount, 0)
  }

  const getWeightedValue = (deals: typeof mockPipeline.stages[0]['deals'], probability: number) => {
    return Math.round(getTotalValue(deals) * (probability / 100))
  }

  // Usage tracking for FREE plan
  const totalDeals = mockPipeline.stages.reduce((sum, stage) => sum + stage.deals.length, 0)
  const limit = FREE_PLAN_LIMITS.deals
  const usagePercent = (totalDeals / limit) * 100
  const isNearLimit = usagePercent >= 80
  const isAtLimit = totalDeals >= limit

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">{mockPipeline.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerez vos opportunites commerciales
            </p>
          </div>
          {isFree && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : ''}`}>
                    {totalDeals}/{limit} deals
                  </span>
                  {isNearLimit && !isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  {isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Progress
                  value={usagePercent}
                  className={`h-1.5 w-24 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
                />
              </div>
              <Link to="/settings/billing" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Illimite en PRO
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Parametres
          </Button>
          {isAtLimit && isFree ? (
            <Link to="/settings/billing">
              <Button size="sm" variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                Passer en PRO
              </Button>
            </Link>
          ) : (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau deal
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {mockPipeline.stages.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col w-80 bg-muted/30 rounded-lg"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-medium">{stage.name}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {stage.deals.length}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stage.probability}%</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{getTotalValue(stage.deals).toLocaleString('fr-FR')} €</span>
                  <span className="text-muted-foreground ml-2">
                    ({getWeightedValue(stage.deals, stage.probability).toLocaleString('fr-FR')} € pondere)
                  </span>
                </div>
              </div>

              {/* Stage Deals */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {stage.deals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{deal.name}</h4>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Euro className="h-3 w-3" />
                        <span className="font-medium text-foreground">
                          {deal.amount.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {deal.contact}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {deal.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.expectedCloseDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {stage.deals.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    Deposez un deal ici
                  </div>
                )}
              </div>

              {/* Add Deal Button */}
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un deal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-muted-foreground">Total deals: </span>
              <span className="font-medium">
                {mockPipeline.stages.reduce((sum, stage) => sum + stage.deals.length, 0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Valeur totale: </span>
              <span className="font-medium">
                {mockPipeline.stages.reduce((sum, stage) => sum + getTotalValue(stage.deals), 0).toLocaleString('fr-FR')} €
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Valeur ponderee: </span>
              <span className="font-medium">
                {mockPipeline.stages.reduce((sum, stage) => sum + getWeightedValue(stage.deals, stage.probability), 0).toLocaleString('fr-FR')} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
