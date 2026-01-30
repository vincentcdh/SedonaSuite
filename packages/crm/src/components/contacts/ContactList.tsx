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
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Upload,
} from 'lucide-react'
import type { Contact, PaginatedResult } from '../../types'

interface ContactListProps {
  contacts: PaginatedResult<Contact> | undefined
  isLoading: boolean
  search: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
  onExport?: () => void
  onImport?: () => void
  canExport?: boolean
}

export const ContactList: FC<ContactListProps> = ({
  contacts,
  isLoading,
  search,
  onSearchChange,
  onPageChange,
  onDelete,
  onExport,
  onImport,
  canExport = true,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un contact..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          )}
          {canExport && onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
          <Link to="/crm/contacts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contact
            </Button>
          </Link>
        </div>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : contacts?.data.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Aucun contact trouve</p>
              <Link to="/crm/contacts/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Creer votre premier contact
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {contacts?.data.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onDelete={onDelete ? () => onDelete(contact.id) : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {contacts && contacts.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {contacts.total} contact{contacts.total > 1 ? 's' : ''} au total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(contacts.page - 1)}
              disabled={contacts.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {contacts.page} sur {contacts.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(contacts.page + 1)}
              disabled={contacts.page >= contacts.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ContactRowProps {
  contact: Contact
  onDelete?: () => void
}

const ContactRow: FC<ContactRowProps> = ({ contact, onDelete }) => {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Sans nom'
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/crm/contacts/$contactId"
          params={{ contactId: contact.id }}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-medium text-sm">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{fullName}</p>
              {contact.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{contact.tags.length - 2}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {contact.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </span>
              )}
              {contact.company && (
                <span className="flex items-center gap-1 truncate">
                  <Building2 className="h-3 w-3" />
                  {contact.company.name}
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
              <Link to="/crm/contacts/$contactId" params={{ contactId: contact.id }}>
                Voir le detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/crm/contacts/$contactId/edit" params={{ contactId: contact.id }}>
                Modifier
              </Link>
            </DropdownMenuItem>
            {contact.email && (
              <DropdownMenuItem asChild>
                <a href={`mailto:${contact.email}`}>Envoyer un email</a>
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
