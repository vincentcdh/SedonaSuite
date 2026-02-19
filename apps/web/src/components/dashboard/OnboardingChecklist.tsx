// ===========================================
// ONBOARDING CHECKLIST
// ===========================================
// Interactive checklist to help new users configure their modules

import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  Badge,
  cn,
} from '@sedona/ui'
import {
  Check,
  Circle,
  Users,
  FileText,
  Briefcase,
  TicketIcon,
  UserCog,
  FolderOpen,
  BarChart3,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react'
import { useModuleSubscriptions, type ModuleId } from '@sedona/billing'
import { useOrganization } from '@/lib/auth'

// ===========================================
// TYPES & CONSTANTS
// ===========================================

interface ChecklistItem {
  id: string
  title: string
  description: string
  href: string
  isComplete: boolean
  moduleId?: ModuleId
}

interface ModuleSuggestion {
  moduleId: ModuleId
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  industries: string[]
}

const MODULE_SUGGESTIONS: ModuleSuggestion[] = [
  {
    moduleId: 'crm',
    name: 'CRM',
    description: 'Gestion des contacts et opportunites',
    icon: Users,
    industries: ['services', 'commerce', 'consulting', 'real_estate', 'finance'],
  },
  {
    moduleId: 'invoice',
    name: 'Facturation',
    description: 'Devis, factures et paiements',
    icon: FileText,
    industries: ['services', 'commerce', 'consulting', 'legal', 'manufacturing'],
  },
  {
    moduleId: 'projects',
    name: 'Projets',
    description: 'Gestion de projets et taches',
    icon: Briefcase,
    industries: ['technology', 'consulting', 'construction', 'media'],
  },
  {
    moduleId: 'tickets',
    name: 'Support',
    description: 'Tickets et base de connaissances',
    icon: TicketIcon,
    industries: ['technology', 'services', 'commerce', 'hospitality'],
  },
  {
    moduleId: 'hr',
    name: 'RH',
    description: 'Gestion des employes',
    icon: UserCog,
    industries: ['manufacturing', 'hospitality', 'healthcare', 'education'],
  },
  {
    moduleId: 'docs',
    name: 'Documents',
    description: 'Stockage et partage',
    icon: FolderOpen,
    industries: ['legal', 'consulting', 'finance', 'real_estate'],
  },
  {
    moduleId: 'analytics',
    name: 'Analytics',
    description: 'Tableaux de bord avances',
    icon: BarChart3,
    industries: ['technology', 'finance', 'commerce', 'consulting'],
  },
]

const ONBOARDING_STORAGE_KEY = 'sedona_onboarding_dismissed'

// ===========================================
// HOOKS
// ===========================================

function useOnboardingChecklist() {
  const { organization } = useOrganization()
  const { modules, isLoading } = useModuleSubscriptions(organization?.id)
  const [dismissedChecklist, setDismissedChecklist] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (dismissed === organization?.id) {
      setDismissedChecklist(true)
    }
  }, [organization?.id])

  const dismissChecklist = () => {
    if (organization?.id) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, organization.id)
      setDismissedChecklist(true)
    }
  }

  // Build checklist items
  const checklistItems: ChecklistItem[] = [
    {
      id: 'profile',
      title: 'Completez votre profil',
      description: 'Ajoutez vos informations personnelles',
      href: '/settings/profile',
      isComplete: true, // Assume complete after signup
    },
    {
      id: 'organization',
      title: 'Configurez votre organisation',
      description: 'Logo, adresse et informations legales',
      href: '/settings/organization',
      isComplete: !!organization?.siret || !!organization?.address,
    },
    {
      id: 'first_contact',
      title: 'Creez votre premier contact',
      description: 'Ajoutez un contact dans le CRM',
      href: '/crm/contacts/new',
      isComplete: false, // Would need to check actual data
      moduleId: 'crm',
    },
    {
      id: 'first_invoice',
      title: 'Creez votre premiere facture',
      description: 'Emettez une facture ou un devis',
      href: '/invoices/new',
      isComplete: false,
      moduleId: 'invoice',
    },
    {
      id: 'invite_team',
      title: 'Invitez votre equipe',
      description: 'Ajoutez des collaborateurs',
      href: '/settings/team',
      isComplete: false, // Would check team members count
    },
  ]

  // Get suggested modules based on industry
  const industry = organization?.industry || ''
  const suggestedModules = MODULE_SUGGESTIONS.filter((m) =>
    m.industries.includes(industry)
  ).slice(0, 3)

  // Calculate progress
  const completedCount = checklistItems.filter((item) => item.isComplete).length
  const progress = Math.round((completedCount / checklistItems.length) * 100)

  // Show checklist if progress < 100% and not dismissed
  const showChecklist = progress < 100 && !dismissedChecklist

  return {
    checklistItems,
    suggestedModules,
    progress,
    completedCount,
    totalCount: checklistItems.length,
    showChecklist,
    dismissChecklist,
    modules,
    isLoading,
    industry,
  }
}

// ===========================================
// COMPONENTS
// ===========================================

interface OnboardingChecklistProps {
  compact?: boolean
}

export function OnboardingChecklist({ compact = false }: OnboardingChecklistProps) {
  const {
    checklistItems,
    suggestedModules,
    progress,
    completedCount,
    totalCount,
    showChecklist,
    dismissChecklist,
    modules,
    isLoading,
    industry,
  } = useOnboardingChecklist()

  if (isLoading || !showChecklist) {
    return null
  }

  if (compact) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Demarrage</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-3" />
          <Link
            to="/dashboard"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Voir les etapes
            <ChevronRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Configurez Sedona</CardTitle>
              <CardDescription>
                Completez ces etapes pour bien demarrer
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={dismissChecklist}
            title="Masquer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Checklist Items */}
        <div className="space-y-2">
          {checklistItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                item.isComplete
                  ? 'bg-muted/50 border-transparent'
                  : 'hover:bg-accent hover:border-accent'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-6 w-6 rounded-full',
                  item.isComplete
                    ? 'bg-success text-success-foreground'
                    : 'border-2 border-muted-foreground/30'
                )}
              >
                {item.isComplete ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.isComplete && 'text-muted-foreground line-through'
                  )}
                >
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              {!item.isComplete && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Link>
          ))}
        </div>

        {/* Suggested Modules */}
        {suggestedModules.length > 0 && industry && (
          <>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">
                Modules recommandes pour votre secteur
              </h4>
              <div className="grid gap-2">
                {suggestedModules.map((suggestion) => {
                  const module = modules.find((m) => m.moduleId === suggestion.moduleId)
                  const isPaid = module?.isPaid || false
                  const Icon = suggestion.icon

                  return (
                    <div
                      key={suggestion.moduleId}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{suggestion.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                      {isPaid ? (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          <Check className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Link to="/settings/modules" search={{}}>
                          <Button variant="outline" size="sm">
                            Activer
                          </Button>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* View all modules link */}
        <Link
          to="/settings/modules"
          search={{}}
          className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-2"
        >
          Voir tous les modules
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
