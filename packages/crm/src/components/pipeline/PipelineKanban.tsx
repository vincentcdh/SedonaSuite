import { type FC, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@sedona/ui'
import { Plus, MoreHorizontal } from 'lucide-react'
import type { Pipeline, PipelineStage, Deal } from '../../types'
import { DealCard } from './DealCard'

interface PipelineKanbanProps {
  pipeline: Pipeline
  onMoveDeal: (dealId: string, stageId: string) => void
  onDealClick: (deal: Deal) => void
  onAddDeal: (stageId: string) => void
  onEditStage?: (stage: PipelineStage) => void
}

export const PipelineKanban: FC<PipelineKanbanProps> = ({
  pipeline,
  onMoveDeal,
  onDealClick,
  onAddDeal,
  onEditStage,
}) => {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragEnd = () => {
    setDraggedDeal(null)
    setDragOverStage(null)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  const handleDrop = (stageId: string) => {
    if (draggedDeal && draggedDeal.stageId !== stageId) {
      onMoveDeal(draggedDeal.id, stageId)
    }
    handleDragEnd()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStageTotal = (deals: Deal[] | undefined) => {
    if (!deals) return 0
    return deals.reduce((sum, deal) => sum + (deal.amount || 0), 0)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {pipeline.stages?.map((stage) => {
        const stageDeals = (stage as PipelineStage & { deals?: Deal[] }).deals || []
        const stageTotal = getStageTotal(stageDeals)
        const isOver = dragOverStage === stage.id

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDrop={() => handleDrop(stage.id)}
          >
            <Card
              className={`h-full transition-colors ${
                isOver ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
            >
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  {onEditStage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEditStage(stage)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {stageTotal > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stageTotal)}
                  </p>
                )}
              </CardHeader>

              <CardContent className="p-2 space-y-2 min-h-[200px]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-grab active:cursor-grabbing ${
                      draggedDeal?.id === deal.id ? 'opacity-50' : ''
                    }`}
                  >
                    <DealCard deal={deal} onClick={() => onDealClick(deal)} />
                  </div>
                ))}

                {stageDeals.length === 0 && !isOver && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Aucune opportunite
                  </div>
                )}

                {isOver && (
                  <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                    Deposer ici
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => onAddDeal(stage.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une opportunite
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
