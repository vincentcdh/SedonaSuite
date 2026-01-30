// ===========================================
// TIME STATS COMPONENT
// ===========================================

import React from 'react'
import {
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Progress,
} from '@sedona/ui'

interface TimeStatsProps {
  totalMinutes: number
  billableMinutes: number
  totalAmount?: number
  currency?: string
  targetHours?: number
  period?: string
}

export function TimeStats({
  totalMinutes,
  billableMinutes,
  totalAmount,
  currency = '€',
  targetHours,
  period = 'Cette période',
}: TimeStatsProps) {
  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m.toString().padStart(2, '0')}min`
  }

  const nonBillableMinutes = totalMinutes - billableMinutes
  const billablePercentage =
    totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0
  const targetProgress =
    targetHours && targetHours > 0
      ? Math.round((totalMinutes / (targetHours * 60)) * 100)
      : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {formatDuration(totalMinutes)}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billable time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold tabular-nums">
                {formatDuration(billableMinutes)}
              </p>
              <p className="text-sm text-muted-foreground">
                Facturable ({billablePercentage}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Non-billable time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {formatDuration(nonBillableMinutes)}
              </p>
              <p className="text-sm text-muted-foreground">Non facturable</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount or target progress */}
      {totalAmount !== undefined ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {totalAmount.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </p>
                <p className="text-sm text-muted-foreground">Montant total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : targetHours ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold tabular-nums">
                    {targetProgress}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    / {targetHours}h
                  </p>
                </div>
                <Progress
                  value={Math.min(targetProgress || 0, 100)}
                  className="h-2 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
