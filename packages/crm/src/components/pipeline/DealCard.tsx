import { type FC } from 'react'
import { Card, CardContent, Badge } from '@sedona/ui'
import { User, Building2, Calendar, TrendingUp } from 'lucide-react'
import type { Deal } from '../../types'

interface DealCardProps {
  deal: Deal
  onClick?: () => void
}

export const DealCard: FC<DealCardProps> = ({ deal, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: deal.currency || 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusBadge = () => {
    switch (deal.status) {
      case 'won':
        return (
          <Badge variant="default" className="bg-success hover:bg-success text-xs">
            Gagne
          </Badge>
        )
      case 'lost':
        return (
          <Badge variant="default" className="bg-error hover:bg-error text-xs">
            Perdu
          </Badge>
        )
      default:
        return null
    }
  }

  const contactName = deal.contact
    ? [deal.contact.firstName, deal.contact.lastName].filter(Boolean).join(' ')
    : null

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2">{deal.name}</h4>
          {getStatusBadge()}
        </div>

        {/* Amount */}
        {deal.amount !== null && (
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            <TrendingUp className="h-3 w-3" />
            {formatCurrency(deal.amount)}
          </div>
        )}

        {/* Contact / Company */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {contactName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {contactName}
            </span>
          )}
          {deal.company && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {deal.company.name}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {deal.expectedCloseDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(deal.expectedCloseDate)}
            </span>
          )}
          {deal.probability !== null && (
            <Badge variant="outline" className="text-xs">
              {deal.probability}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
