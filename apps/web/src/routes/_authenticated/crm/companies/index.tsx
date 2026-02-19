import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Input, Card, CardContent, Progress, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@sedona/ui'
import {
  Plus,
  Search,
  Filter,
  Building2,
  Users,
  Globe,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useOrganization } from '@/lib/auth'
import { useCompanies, useDeleteCompany } from '@sedona/crm'
import { useModuleLimit, useIsModulePaid } from '@sedona/billing'

export const Route = createFileRoute('/_authenticated/crm/companies/')({
  component: CompaniesPage,
})

function CompaniesPage() {
  const [search, setSearch] = useState('')
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Module-based billing: check if CRM is paid and get limits
  const { isPaid: isCrmPaid } = useIsModulePaid(organizationId, 'crm')
  const { limit, usage: currentCount, isUnlimited } = useModuleLimit(organizationId, 'crm', 'companies')

  // Fetch companies from Supabase
  const { data: companiesData, isLoading, error } = useCompanies(
    organizationId,
    { search: search || undefined },
    { page: 1, pageSize: 25 }
  )

  const companies = companiesData?.data || []

  // Delete company mutation
  const deleteCompanyMutation = useDeleteCompany()

  // Usage tracking (only for free tier)
  const usagePercent = isUnlimited ? 0 : (currentCount / limit) * 100
  const isNearLimit = !isUnlimited && usagePercent >= 80
  const isAtLimit = !isUnlimited && currentCount >= limit
  const isFree = !isCrmPaid

  if (error) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement des entreprises</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Entreprises</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerez vos entreprises et comptes clients
            </p>
          </div>
          {isFree && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : ''}`}>
                    {currentCount}/{limit} entreprises
                  </span>
                  {isNearLimit && !isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  {isAtLimit && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Progress
                  value={usagePercent}
                  className={`h-1.5 w-24 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
                />
              </div>
              <Link to="/settings/modules" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Illimite en PRO
              </Link>
            </div>
          )}
        </div>
        {isAtLimit && isFree ? (
          <Link to="/settings/modules">
            <Button size="sm" variant="default">
              <Sparkles className="h-4 w-4 mr-2" />
              Passer en PRO
            </Button>
          </Link>
        ) : (
          <Link to="/crm/companies/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle entreprise
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une entreprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : companies.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune entreprise trouvee</p>
          <Link to="/crm/companies/new" className="mt-4 inline-block">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une entreprise
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              to="/crm/companies/$companyId"
              params={{ companyId: company.id }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault()
                            window.location.href = `/crm/companies/${company.id}`
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault()
                            if (confirm('Etes-vous sur de vouloir supprimer cette entreprise ?')) {
                              deleteCompanyMutation.mutate(company.id)
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold mb-1">{company.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{company.industry || '-'}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {(company as any).contactsCount || 0} contacts
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {company.city || '-'}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>{company.size || '-'}</span>
                    <span>{(company as any).dealsCount || 0} deals en cours</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          Affichage de {companies.length} sur {companiesData?.total || 0} entreprises
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
