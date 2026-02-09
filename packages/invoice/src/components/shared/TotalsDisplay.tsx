import type { FC } from 'react'
import { useMemo } from 'react'
import { Card, CardContent, Separator } from '@sedona/ui'

interface VatBreakdownItem {
  rate: number
  amount: number
}

interface TotalsDisplayProps {
  subtotal: number
  vatBreakdown: VatBreakdownItem[]
  discountAmount?: number
  discountPercent?: number
  total: number
  currency?: string
}

export const TotalsDisplay: FC<TotalsDisplayProps> = ({
  subtotal,
  vatBreakdown,
  discountAmount = 0,
  discountPercent,
  total,
  currency = 'EUR',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  // Calcul de la remise effective
  const effectiveDiscount = useMemo(() => {
    if (discountPercent && discountPercent > 0) {
      return subtotal * (discountPercent / 100)
    }
    return discountAmount
  }, [subtotal, discountAmount, discountPercent])

  // Total TVA
  const totalVat = useMemo(() => {
    return vatBreakdown.reduce((sum, { amount }) => sum + amount, 0)
  }, [vatBreakdown])

  // Total final avec remise
  const finalTotal = useMemo(() => {
    return total - effectiveDiscount
  }, [total, effectiveDiscount])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Sous-total HT */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total HT</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Remise */}
          {effectiveDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Remise{discountPercent ? ` (${discountPercent}%)` : ''}
              </span>
              <span>- {formatCurrency(effectiveDiscount)}</span>
            </div>
          )}

          {/* Detail TVA par taux */}
          {vatBreakdown.length > 0 && (
            <>
              <Separator />
              {vatBreakdown.map(({ rate, amount }) => (
                <div key={rate} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA {rate}%</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total TVA</span>
                <span className="font-medium">{formatCurrency(totalVat)}</span>
              </div>
            </>
          )}

          <Separator />

          {/* Total TTC */}
          <div className="flex justify-between text-lg font-bold">
            <span>Total TTC</span>
            <span className="text-primary">{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
