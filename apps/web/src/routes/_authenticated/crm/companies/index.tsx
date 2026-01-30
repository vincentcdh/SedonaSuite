import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Input, Card, CardContent, Progress } from '@sedona/ui'
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
} from 'lucide-react'
import { useState } from 'react'
import { usePlan } from '@/hooks/usePlan'

// Plan limits
const FREE_PLAN_LIMITS = {
  companies: 50,
}

export const Route = createFileRoute('/_authenticated/crm/companies/')({
  component: CompaniesPage,
})

// Mock data
const mockCompanies = [
  {
    id: '1',
    name: 'Acme Corp',
    industry: 'Technologie',
    size: '51-200',
    city: 'Paris',
    website: 'www.acme.com',
    contactsCount: 5,
    dealsCount: 2,
  },
  {
    id: '2',
    name: 'Tech Solutions',
    industry: 'Services IT',
    size: '11-50',
    city: 'Lyon',
    website: 'www.techsolutions.fr',
    contactsCount: 3,
    dealsCount: 1,
  },
  {
    id: '3',
    name: 'Design Studio',
    industry: 'Design',
    size: '1-10',
    city: 'Bordeaux',
    website: 'www.designstudio.fr',
    contactsCount: 2,
    dealsCount: 0,
  },
  {
    id: '4',
    name: 'Finance Plus',
    industry: 'Finance',
    size: '201-500',
    city: 'Paris',
    website: 'www.financeplus.fr',
    contactsCount: 8,
    dealsCount: 3,
  },
  {
    id: '5',
    name: 'Marketing Pro',
    industry: 'Marketing',
    size: '11-50',
    city: 'Marseille',
    website: 'www.marketingpro.fr',
    contactsCount: 4,
    dealsCount: 1,
  },
]

function CompaniesPage() {
  const [search, setSearch] = useState('')
  const { isFree } = usePlan()

  const filteredCompanies = mockCompanies.filter(
    (company) =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase()) ||
      company.city.toLowerCase().includes(search.toLowerCase())
  )

  // Usage tracking for FREE plan
  const currentCount = mockCompanies.length
  const limit = FREE_PLAN_LIMITS.companies
  const usagePercent = (currentCount / limit) * 100
  const isNearLimit = usagePercent >= 80
  const isAtLimit = currentCount >= limit

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
              <Link to="/settings/billing" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Illimite en PRO
              </Link>
            </div>
          )}
        </div>
        {isAtLimit && isFree ? (
          <Link to="/settings/billing">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
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
                  <Button variant="ghost" size="sm" onClick={(e) => e.preventDefault()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold mb-1">{company.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{company.industry}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {company.contactsCount} contacts
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {company.city}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>{company.size} employes</span>
                  <span>{company.dealsCount} deals en cours</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          Affichage de {filteredCompanies.length} entreprises
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
