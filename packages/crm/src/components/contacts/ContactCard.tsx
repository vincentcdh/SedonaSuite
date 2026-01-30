import { type FC } from 'react'
import { Link } from '@tanstack/react-router'
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
  Mail,
  Phone,
  Smartphone,
  Building2,
  MapPin,
  Calendar,
  User,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import type { Contact } from '../../types'

interface ContactCardProps {
  contact: Contact
  onEdit?: () => void
  onDelete?: () => void
}

export const ContactCard: FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Sans nom'
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xl">{initials}</span>
            </div>
            <div>
              <CardTitle className="text-xl">{fullName}</CardTitle>
              {contact.jobTitle && (
                <p className="text-muted-foreground">{contact.jobTitle}</p>
              )}
              {contact.company && (
                <Link
                  to="/crm/companies/$companyId"
                  params={{ companyId: contact.company.id }}
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  <Building2 className="h-3 w-3" />
                  {contact.company.name}
                </Link>
              )}
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

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {contact.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Coordonnees</h3>
          <div className="space-y-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {contact.phone}
              </a>
            )}
            {contact.mobile && (
              <a
                href={`tel:${contact.mobile}`}
                className="flex items-center gap-3 text-sm hover:text-primary"
              >
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                {contact.mobile}
              </a>
            )}
          </div>
        </div>

        {/* Address */}
        {(contact.addressLine1 || contact.city) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Adresse</h3>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  {contact.addressLine1 && <p>{contact.addressLine1}</p>}
                  {contact.addressLine2 && <p>{contact.addressLine2}</p>}
                  <p>
                    {[contact.postalCode, contact.city].filter(Boolean).join(' ')}
                  </p>
                  {contact.country && contact.country !== 'France' && (
                    <p>{contact.country}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Source */}
        {contact.source && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
              <div className="flex items-center gap-3 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{contact.source.replace('_', ' ')}</span>
                {contact.sourceDetails && (
                  <span className="text-muted-foreground">({contact.sourceDetails})</span>
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
                <p className="text-muted-foreground text-xs">Cree le</p>
                <p>{formatDate(contact.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Modifie le</p>
                <p>{formatDate(contact.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
