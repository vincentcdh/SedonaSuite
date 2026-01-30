// ===========================================
// TIME TRACKER WIDGET COMPONENT
// ===========================================

import { useState, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Square,
  Clock,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Input,
  Switch,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@sedona/ui'
import type { TimeEntry, Task } from '../../types'

interface TimeTrackerProps {
  projectId: string
  userId: string
  taskId?: string
  tasks?: Task[]
  runningTimer?: TimeEntry | null
  variant?: 'inline' | 'floating' | 'compact'
  onStart: (data: { projectId: string; taskId?: string; description?: string }) => void
  onStop: (timerId: string, isBillable: boolean) => void
  onPause?: (timerId: string) => void
}

export function TimeTracker({
  projectId,
  userId,
  taskId: initialTaskId,
  tasks = [],
  runningTimer,
  variant = 'inline',
  onStart,
  onStop,
  onPause,
}: TimeTrackerProps) {
  const [elapsed, setElapsed] = useState(0)
  const [description, setDescription] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || '')
  const [isBillable, setIsBillable] = useState(true)

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (!runningTimer || !runningTimer.isRunning) {
      setElapsed(0)
      return
    }

    const start = new Date(runningTimer.startTime)

    const updateElapsed = () => {
      const now = new Date()
      setElapsed(Math.floor((now.getTime() - start.getTime()) / 1000))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [runningTimer])

  const handleStart = useCallback(() => {
    onStart({
      projectId,
      taskId: selectedTaskId || undefined,
      description: description || undefined,
    })
    setDescription('')
  }, [projectId, selectedTaskId, description, onStart])

  const handleStop = useCallback(() => {
    if (!runningTimer) return
    onStop(runningTimer.id, isBillable)
  }, [runningTimer, isBillable, onStop])

  const handlePause = useCallback(() => {
    if (!runningTimer || !onPause) return
    onPause(runningTimer.id)
  }, [runningTimer, onPause])

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Timer is running
  if (runningTimer && runningTimer.isRunning) {
    return (
      <Card
        className={cn(
          variant === 'floating' && 'fixed bottom-4 right-4 shadow-lg z-50 w-80',
          variant === 'compact' && 'p-2'
        )}
      >
        <CardContent className={cn('p-4', variant === 'compact' && 'p-2')}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Recording indicator */}
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />

              {/* Elapsed time */}
              <span className="text-2xl font-mono font-bold tabular-nums">
                {formatTime(elapsed)}
              </span>
            </div>

            <div className="flex gap-2">
              {onPause && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
              >
                <Square className="h-4 w-4 mr-1" />
                Arrêter
              </Button>
            </div>
          </div>

          {/* Current task */}
          {runningTimer.task && (
            <p className="mt-2 text-sm text-muted-foreground truncate">
              📋 {runningTimer.task.title}
            </p>
          )}

          {/* Description */}
          {runningTimer.description && (
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {runningTimer.description}
            </p>
          )}

          {/* Billable toggle */}
          <div className="flex items-center gap-2 mt-3">
            <Switch
              id="billable-running"
              checked={isBillable}
              onCheckedChange={setIsBillable}
            />
            <Label htmlFor="billable-running" className="text-sm">
              Facturable
            </Label>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Start form
  return (
    <Card
      className={cn(
        variant === 'floating' && 'fixed bottom-4 right-4 shadow-lg z-50 w-80'
      )}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Démarrer un timer</span>
        </div>

        {/* Task selection */}
        {!initialTaskId && tasks.length > 0 && (
          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une tâche (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucune tâche</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Description */}
        <Input
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleStart()
            }
          }}
        />

        {/* Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="billable-start"
              checked={isBillable}
              onCheckedChange={setIsBillable}
            />
            <Label htmlFor="billable-start" className="text-sm">
              Facturable
            </Label>
          </div>

          <Button onClick={handleStart}>
            <Play className="h-4 w-4 mr-2" />
            Démarrer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
