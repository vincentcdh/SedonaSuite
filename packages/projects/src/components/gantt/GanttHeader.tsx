// ===========================================
// GANTT HEADER COMPONENT
// ===========================================

import { type FC } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings,
  Calendar,
} from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@sedona/ui'
import { format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { GanttViewConfig, GanttViewMode, GanttGroupBy } from './types'

interface GanttHeaderProps {
  config: GanttViewConfig
  onConfigChange: (config: GanttViewConfig) => void
  onTodayClick: () => void
}

export const GanttHeader: FC<GanttHeaderProps> = ({
  config,
  onConfigChange,
  onTodayClick,
}) => {
  const navigatePrevious = () => {
    let newStartDate: Date
    let newEndDate: Date

    switch (config.viewMode) {
      case 'day':
      case 'week':
        newStartDate = subWeeks(config.startDate, 1)
        newEndDate = subWeeks(config.endDate, 1)
        break
      case 'month':
      case 'quarter':
        newStartDate = subMonths(config.startDate, 1)
        newEndDate = subMonths(config.endDate, 1)
        break
    }

    onConfigChange({ ...config, startDate: newStartDate, endDate: newEndDate })
  }

  const navigateNext = () => {
    let newStartDate: Date
    let newEndDate: Date

    switch (config.viewMode) {
      case 'day':
      case 'week':
        newStartDate = addWeeks(config.startDate, 1)
        newEndDate = addWeeks(config.endDate, 1)
        break
      case 'month':
      case 'quarter':
        newStartDate = addMonths(config.startDate, 1)
        newEndDate = addMonths(config.endDate, 1)
        break
    }

    onConfigChange({ ...config, startDate: newStartDate, endDate: newEndDate })
  }

  const formatDateRange = () => {
    switch (config.viewMode) {
      case 'day':
      case 'week':
        return `${format(config.startDate, 'd MMM', { locale: fr })} - ${format(config.endDate, 'd MMM yyyy', { locale: fr })}`
      case 'month':
        return `${format(config.startDate, 'MMMM', { locale: fr })} - ${format(config.endDate, 'MMMM yyyy', { locale: fr })}`
      case 'quarter':
        return format(config.startDate, 'yyyy', { locale: fr })
    }
  }

  const handleViewModeChange = (value: GanttViewMode) => {
    onConfigChange({ ...config, viewMode: value })
  }

  const handleGroupByChange = (value: string) => {
    onConfigChange({ ...config, groupBy: value as GanttGroupBy })
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      {/* Navigation temporelle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={navigatePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" onClick={onTodayClick}>
          <Calendar className="h-4 w-4 mr-2" />
          Aujourd'hui
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={navigateNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="ml-4 text-sm font-medium">
          {formatDateRange()}
        </span>
      </div>

      {/* Zoom - Simple buttons instead of ToggleGroup */}
      <div className="flex items-center gap-1 border rounded-md">
        {(['day', 'week', 'month', 'quarter'] as const).map((mode) => (
          <Button
            key={mode}
            variant={config.viewMode === mode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange(mode)}
            className="px-3"
          >
            {mode === 'day' && 'Jour'}
            {mode === 'week' && 'Semaine'}
            {mode === 'month' && 'Mois'}
            {mode === 'quarter' && 'Trimestre'}
          </Button>
        ))}
      </div>

      {/* Filtres et Options */}
      <div className="flex items-center gap-2">
        {/* Filtre par statut/assigné/priorité */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Grouper
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Grouper par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={config.groupBy}
              onValueChange={handleGroupByChange}
            >
              <DropdownMenuRadioItem value="none">Aucun</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status">Statut</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="assignee">Assigné</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="priority">Priorité</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Options d'affichage */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Options d'affichage</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={config.showDependencies}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, showDependencies: checked })
              }
            >
              Afficher les dépendances
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={config.showProgress}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, showProgress: checked })
              }
            >
              Afficher la progression
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={config.showAssignees}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, showAssignees: checked })
              }
            >
              Afficher les assignés
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={config.showWeekends}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, showWeekends: checked })
              }
            >
              Afficher les weekends
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
