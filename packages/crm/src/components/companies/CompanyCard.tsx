import { type FC } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Separator,
} from '@sedona/ui'
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  FileText,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import type { Company } from '../../types'

interface CompanyCardProps {
  company: Company
  onEdit?: () => void
  onDelete?: () => void
}

export const CompanyCard: FC<CompanyCardProps> = ({ company, onEdit, onDelete }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{company.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {company.industry && (
                  <Badge variant="outline">{company.industry}</Badge>
                )}
                {company.size && (
                  <Badge variant="secondary">{company.size} employes</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Coordonnees</h3>
          <div className="space-y-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                {company.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {company.email && (
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                {company.email}
              </a>
            )}
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {company.phone}
              </a>
            )}
          </div>
        </div>

        {/* Legal Info */}
        {company.siret && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Informations legales</h3>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>SIRET: {company.siret}</span>
              </div>
            </div>
          </>
        )}

        {/* Address */}
        {(company.addressLine1 || company.city) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Adresse</h3>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  {company.addressLine1 && <p>{company.addressLine1}</p>}
                  {company.addressLine2 && <p>{company.addressLine2}</p>}
                  <p>
                    {[company.postalCode, company.city].filter(Boolean).join(' ')}
                  </p>
                  {company.country && company.country !== 'France' && (
                    <p>{company.country}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Stats */}
        {(company.contactsCount !== undefined || company.dealsCount !== undefined) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {company.contactsCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {company.contactsCount} contact{company.contactsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {company.dealsCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {company.dealsCount} opportunite{company.dealsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Metadata */}
        <Separator />
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Informations</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Creee le</p>
                <p>{formatDate(company.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Modifiee le</p>
                <p>{formatDate(company.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
