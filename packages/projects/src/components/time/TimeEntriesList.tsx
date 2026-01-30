// ===========================================
// TIME ENTRIES LIST COMPONENT
// ===========================================

import { useMemo, useState } from 'react'
import { format, parseISO, isSameDay, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Edit2, Trash2, Clock, DollarSign } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@sedona/ui'
import type { TimeEntry } from '../../types'

interface TimeEntriesListProps {
  entries: TimeEntry[]
  showDate?: boolean
  showUser?: boolean
  onEdit?: (entry: TimeEntry) => void
  onDelete?: (entryId: string) => void
  isLoading?: boolean
}

export function TimeEntriesList({
  entries,
  showDate = true,
  showUser = true,
  onEdit,
  onDelete,
  isLoading = false,
}: TimeEntriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, TimeEntry[]>()

    entries.forEach((entry) => {
      const dateKey = format(parseISO(entry.startTime), 'yyyy-MM-dd')
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(entry)
    })

    // Sort by date descending (most recent first)
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, dayEntries]) => ({
        date: parseISO(dateKey),
        entries: dayEntries.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ),
        totalMinutes: dayEntries.reduce(
          (sum, e) => sum + (e.durationMinutes || 0),
          0
        ),
      }))
  }, [entries])

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '0min'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDelete = () => {
    if (deletingId && onDelete) {
      onDelete(deletingId)
    }
    setDeletingId(null)
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Aucune saisie de temps</p>
            <p className="text-sm mt-1">
              Démarrez un timer ou ajoutez une saisie manuelle
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {groupedEntries.map(({ date, entries: dayEntries, totalMinutes }) => (
          <Card key={date.toISOString()}>
            {showDate && (
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {isSameDay(date, startOfDay(new Date()))
                      ? "Aujourd'hui"
                      : format(date, 'EEEE d MMMM', { locale: fr })}
                  </CardTitle>
                  <Badge variant="secondary" className="font-mono">
                    {formatDuration(totalMinutes)}
                  </Badge>
                </div>
              </CardHeader>
            )}

            <CardContent className={showDate ? 'pt-0' : ''}>
              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* User avatar */}
                      {showUser && entry.user && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(entry.user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      {/* Entry info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {entry.task?.title ||
                              entry.description ||
                              'Sans titre'}
                          </p>
                          {entry.isBillable && (
                            <DollarSign className="h-3 w-3 text-green-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {showUser && entry.user && (
                            <span>
                              {entry.user.fullName || entry.user.email}
                            </span>
                          )}
                          {entry.description && entry.task && (
                            <span className="truncate max-w-[200px]">
                              • {entry.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Duration and actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono font-medium text-sm">
                        {formatDuration(entry.durationMinutes)}
                      </span>

                      {/* Actions (visible on hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onEdit(entry)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(entry.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette saisie ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La saisie de temps sera
              définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
