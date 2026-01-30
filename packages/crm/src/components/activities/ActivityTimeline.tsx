import { type FC } from 'react'
import { Card, CardContent, Badge, Button, Skeleton } from '@sedona/ui'
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  Check,
  MoreHorizontal,
} from 'lucide-react'
import type { Activity, PaginatedResult } from '../../types'

interface ActivityTimelineProps {
  activities: PaginatedResult<Activity> | undefined
  isLoading: boolean
  onComplete?: (activityId: string) => void
  onUncomplete?: (activityId: string) => void
  onEdit?: (activity: Activity) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export const ActivityTimeline: FC<ActivityTimelineProps> = ({
  activities,
  isLoading,
  onComplete,
  onUncomplete,
  onEdit,
  onLoadMore,
  hasMore,
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'meeting':
        return <Calendar className="h-4 w-4" />
      case 'task':
        return <CheckSquare className="h-4 w-4" />
      case 'note':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActivityTypeLabel = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return 'Appel'
      case 'email':
        return 'Email'
      case 'meeting':
        return 'Reunion'
      case 'task':
        return 'Tache'
      case 'note':
        return 'Note'
      default:
        return type
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "A l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`

    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const isOverdue = (activity: Activity) => {
    if (!activity.dueDate || activity.completedAt) return false
    return new Date(activity.dueDate) < new Date()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities?.data.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Aucune activite</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.data.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              activity.completedAt
                ? 'bg-success/10 text-success'
                : isOverdue(activity)
                  ? 'bg-error/10 text-error'
                  : 'bg-primary/10 text-primary'
            }`}
          >
            {getActivityIcon(activity.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{activity.subject}</p>
                  <Badge variant="outline" className="text-xs">
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                  {activity.completedAt && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Termine
                    </Badge>
                  )}
                  {isOverdue(activity) && (
                    <Badge variant="destructive" className="text-xs">
                      En retard
                    </Badge>
                  )}
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{formatDate(activity.createdAt)}</span>
                  {activity.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Echeance: {formatDate(activity.dueDate)}
                    </span>
                  )}
                  {activity.durationMinutes && (
                    <span>{activity.durationMinutes} min</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {(activity.type === 'task' || activity.type === 'meeting') && (
                  <>
                    {activity.completedAt ? (
                      onUncomplete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUncomplete(activity.id)}
                        >
                          Rouvrir
                        </Button>
                      )
                    ) : (
                      onComplete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onComplete(activity.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Terminer
                        </Button>
                      )
                    )}
                  </>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(activity)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Charger plus
          </Button>
        </div>
      )}
    </div>
  )
}
