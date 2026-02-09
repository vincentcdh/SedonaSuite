// ===========================================
// TIME ENTRY FORM COMPONENT
// ===========================================

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Button,
  Input,
  Textarea,
  Switch,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import type { TimeEntry, Task } from '../../types'

interface TimeEntryFormProps {
  projectId: string
  tasks?: Task[]
  taskId?: string
  date?: Date
  editEntry?: TimeEntry
  onSubmit: (data: {
    projectId: string
    taskId?: string
    description?: string
    startTime: string
    durationMinutes: number
    isBillable: boolean
    hourlyRate?: number
  }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function TimeEntryForm({
  projectId,
  tasks = [],
  taskId: initialTaskId,
  date: initialDate,
  editEntry,
  onSubmit,
  onCancel,
  isLoading = false,
}: TimeEntryFormProps) {
  const [taskId, setTaskId] = useState(editEntry?.taskId || initialTaskId || '__none__')
  const [date, setDate] = useState(
    editEntry
      ? format(new Date(editEntry.startTime), 'yyyy-MM-dd')
      : initialDate
        ? format(initialDate, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')
  )
  const [hours, setHours] = useState(
    editEntry?.durationMinutes ? Math.floor(editEntry.durationMinutes / 60) : 0
  )
  const [minutes, setMinutes] = useState(
    editEntry?.durationMinutes ? editEntry.durationMinutes % 60 : 0
  )
  const [description, setDescription] = useState(editEntry?.description || '')
  const [isBillable, setIsBillable] = useState(editEntry?.isBillable ?? true)
  const [hourlyRate, setHourlyRate] = useState<number | null>(
    editEntry?.hourlyRate ?? null
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const durationMinutes = hours * 60 + minutes

    if (durationMinutes === 0) {
      setError('La durée doit être supérieure à 0')
      return
    }

    // Create start time from date at 9:00 AM
    const startTime = new Date(date)
    startTime.setHours(9, 0, 0, 0)

    onSubmit({
      projectId,
      taskId: taskId && taskId !== '__none__' ? taskId : undefined,
      description: description || undefined,
      startTime: startTime.toISOString(),
      durationMinutes,
      isBillable,
      hourlyRate: hourlyRate || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="task">Tâche</Label>
          <Select value={taskId} onValueChange={setTaskId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une tâche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Aucune tâche</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {/* Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours">Heures</Label>
          <Input
            id="hours"
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minutes">Minutes</Label>
          <Input
            id="minutes"
            type="number"
            min={0}
            max={59}
            step={15}
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Décrivez ce que vous avez fait..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Billable toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="billable">Facturable</Label>
          <p className="text-sm text-muted-foreground">
            Ce temps sera inclus dans la facturation
          </p>
        </div>
        <Switch
          id="billable"
          checked={isBillable}
          onCheckedChange={setIsBillable}
        />
      </div>

      {/* Hourly rate (if billable) */}
      {isBillable && (
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Taux horaire (€)</Label>
          <Input
            id="hourlyRate"
            type="number"
            min={0}
            step={0.01}
            placeholder="Laisser vide pour utiliser le taux par défaut"
            value={hourlyRate ?? ''}
            onChange={(e) =>
              setHourlyRate(e.target.value ? parseFloat(e.target.value) : null)
            }
          />
          <p className="text-sm text-muted-foreground">
            Optionnel - utilise le taux du projet par défaut
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Enregistrement...'
            : editEntry
              ? 'Mettre à jour'
              : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
