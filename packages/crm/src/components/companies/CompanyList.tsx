import { type FC } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from '@sedona/ui'
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react'
import type { Company, PaginatedResult } from '../../types'

interface CompanyListProps {
  companies: PaginatedResult<Company> | undefined
  isLoading: boolean
  search: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
}

export const CompanyList: FC<CompanyListProps> = ({
  companies,
  isLoading,
  search,
  onSearchChange,
  onPageChange,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link to="/crm/companies/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entreprise
          </Button>
        </Link>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : companies?.data.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Aucune entreprise trouvee</p>
              <Link to="/crm/companies/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Creer votre premiere entreprise
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {companies?.data.map((company) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  onDelete={onDelete ? () => onDelete(company.id) : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {companies && companies.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {companies.total} entreprise{companies.total > 1 ? 's' : ''} au total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(companies.page - 1)}
              disabled={companies.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {companies.page} sur {companies.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(companies.page + 1)}
              disabled={companies.page >= companies.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface CompanyRowProps {
  company: Company
  onDelete?: () => void
}

const CompanyRow: FC<CompanyRowProps> = ({ company, onDelete }) => {
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/crm/companies/$companyId"
          params={{ companyId: company.id }}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{company.name}</p>
              {company.industry && (
                <Badge variant="outline" className="text-xs">
                  {company.industry}
                </Badge>
              )}
              {company.size && (
                <Badge variant="secondary" className="text-xs">
                  {company.size} employes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {company.city}
                </span>
              )}
              {company.website && (
                <span className="flex items-center gap-1 truncate">
                  <Globe className="h-3 w-3" />
                  {company.website.replace(/^https?:\/\//, '')}
                </span>
              )}
              {company.contactsCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {company.contactsCount} contact{company.contactsCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/crm/companies/$companyId" params={{ companyId: company.id }}>
                Voir le detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/crm/companies/$companyId/edit" params={{ companyId: company.id }}>
                Modifier
              </Link>
            </DropdownMenuItem>
            {company.website && (
              <DropdownMenuItem asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  Visiter le site
                </a>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem className="text-error focus:text-error" onClick={onDelete}>
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
