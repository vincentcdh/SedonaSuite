// ===========================================
// TICKETS LIST PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  User,
  Tag,
  ArrowUpDown,
  MessageSquare,
} from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  cn,
} from '@sedona/ui'
import type { TicketStatus, TicketPriority } from '@sedona/tickets'

export const Route = createFileRoute('/_authenticated/tickets/')({
  component: TicketsListPage,
})

// Mock tickets data
const mockTickets = [
  {
    id: '1',
    ticketNumber: 'TKT-001',
    subject: 'Probleme de connexion a mon compte',
    status: 'open' as TicketStatus,
    priority: 'high' as TicketPriority,
    requesterName: 'Jean Dupont',
    requesterEmail: 'jean.dupont@example.com',
    assignee: { id: '1', fullName: 'Alice Martin', avatarUrl: null },
    category: { id: '1', name: 'Support Technique', color: '#3B82F6' },
    tags: ['urgent', 'connexion'],
    createdAt: '2024-02-14T10:30:00Z',
    updatedAt: '2024-02-14T14:00:00Z',
    slaBreached: false,
    messagesCount: 3,
  },
  {
    id: '2',
    ticketNumber: 'TKT-002',
    subject: 'Demande de remboursement commande #12345',
    status: 'in_progress' as TicketStatus,
    priority: 'normal' as TicketPriority,
    requesterName: 'Marie Lambert',
    requesterEmail: 'marie.lambert@example.com',
    assignee: { id: '2', fullName: 'Bob Durand', avatarUrl: null },
    category: { id: '2', name: 'Facturation', color: '#10B981' },
    tags: ['remboursement'],
    createdAt: '2024-02-13T15:45:00Z',
    updatedAt: '2024-02-14T09:00:00Z',
    slaBreached: false,
    messagesCount: 5,
  },
  {
    id: '3',
    ticketNumber: 'TKT-003',
    subject: 'Bug sur la page de paiement',
    status: 'open' as TicketStatus,
    priority: 'urgent' as TicketPriority,
    requesterName: 'Pierre Martin',
    requesterEmail: 'pierre.martin@example.com',
    assignee: null,
    category: { id: '1', name: 'Support Technique', color: '#3B82F6' },
    tags: ['bug', 'paiement', 'urgent'],
    createdAt: '2024-02-14T16:00:00Z',
    updatedAt: '2024-02-14T16:00:00Z',
    slaBreached: true,
    messagesCount: 1,
  },
  {
    id: '4',
    ticketNumber: 'TKT-004',
    subject: 'Question sur les tarifs entreprise',
    status: 'waiting' as TicketStatus,
    priority: 'low' as TicketPriority,
    requesterName: 'Sophie Bernard',
    requesterEmail: 'sophie.bernard@example.com',
    assignee: { id: '1', fullName: 'Alice Martin', avatarUrl: null },
    category: { id: '3', name: 'Commercial', color: '#F59E0B' },
    tags: ['tarifs', 'entreprise'],
    createdAt: '2024-02-12T11:00:00Z',
    updatedAt: '2024-02-13T16:30:00Z',
    slaBreached: false,
    messagesCount: 4,
  },
  {
    id: '5',
    ticketNumber: 'TKT-005',
    subject: 'Probleme resolu - Merci !',
    status: 'resolved' as TicketStatus,
    priority: 'normal' as TicketPriority,
    requesterName: 'Lucas Petit',
    requesterEmail: 'lucas.petit@example.com',
    assignee: { id: '2', fullName: 'Bob Durand', avatarUrl: null },
    category: { id: '1', name: 'Support Technique', color: '#3B82F6' },
    tags: [],
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-11T14:00:00Z',
    slaBreached: false,
    messagesCount: 6,
  },
]

const statusConfig: Record<TicketStatus, { label: string; icon: typeof Circle; className: string }> = {
  open: { label: 'Ouvert', icon: Circle, className: 'text-blue-500' },
  in_progress: { label: 'En cours', icon: Clock, className: 'text-yellow-500' },
  waiting: { label: 'En attente', icon: AlertCircle, className: 'text-orange-500' },
  resolved: { label: 'Resolu', icon: CheckCircle2, className: 'text-green-500' },
  closed: { label: 'Ferme', icon: CheckCircle2, className: 'text-gray-500' },
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Basse', className: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normale', className: 'bg-blue-100 text-blue-700' },
  high: { label: 'Haute', className: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
}

function TicketsListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

  const filteredTickets = mockTickets.filter(ticket => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !ticket.subject.toLowerCase().includes(query) &&
        !ticket.ticketNumber.toLowerCase().includes(query) &&
        !ticket.requesterName.toLowerCase().includes(query) &&
        !ticket.requesterEmail.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    if (statusFilter !== 'all' && ticket.status !== statusFilter) {
      return false
    }
    return true
  })

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id))
    }
  }

  const toggleSelectTicket = (id: string) => {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Il y a quelques minutes'
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par sujet, numero, demandeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouvert</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="waiting">En attente</SelectItem>
            <SelectItem value="resolved">Resolu</SelectItem>
            <SelectItem value="closed">Ferme</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Plus de filtres
        </Button>
      </div>

      {/* Bulk actions */}
      {selectedTickets.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selectionne{selectedTickets.length > 1 ? 's' : ''}
              </span>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Assigner
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Ajouter un tag
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Changer le statut
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets list */}
      <Card>
        <div className="divide-y">
          {/* Header row */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-4 bg-muted/50 text-sm font-medium">
            <Checkbox
              checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span>Ticket</span>
            <span className="w-24 text-center">Statut</span>
            <span className="w-20 text-center">Priorite</span>
            <span className="w-32">Assigne a</span>
            <span className="w-28 text-right">Mise a jour</span>
          </div>

          {/* Ticket rows */}
          {filteredTickets.map(ticket => {
            const StatusIcon = statusConfig[ticket.status].icon
            return (
              <div
                key={ticket.id}
                className={cn(
                  'grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 p-4 items-center hover:bg-muted/30 transition-colors',
                  ticket.slaBreached && 'bg-red-50/50'
                )}
              >
                <Checkbox
                  checked={selectedTickets.includes(ticket.id)}
                  onCheckedChange={() => toggleSelectTicket(ticket.id)}
                />

                <div className="min-w-0">
                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: ticket.id }}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    <span className="text-muted-foreground mr-2">{ticket.ticketNumber}</span>
                    {ticket.subject}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{ticket.requesterName}</span>
                    {ticket.category && (
                      <Badge
                        variant="outline"
                        style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                      >
                        {ticket.category.name}
                      </Badge>
                    )}
                    {ticket.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {ticket.tags.length > 2 && (
                      <span className="text-xs">+{ticket.tags.length - 2}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket.messagesCount}
                    </span>
                  </div>
                </div>

                <div className="w-24 flex justify-center">
                  <Badge variant="outline" className={cn('gap-1', statusConfig[ticket.status].className)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[ticket.status].label}
                  </Badge>
                </div>

                <div className="w-20 flex justify-center">
                  <Badge className={priorityConfig[ticket.priority].className}>
                    {priorityConfig[ticket.priority].label}
                  </Badge>
                </div>

                <div className="w-32">
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {ticket.assignee.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{ticket.assignee.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Non assigne</span>
                  )}
                </div>

                <div className="w-28 flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(ticket.updatedAt)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Voir le ticket</DropdownMenuItem>
                      <DropdownMenuItem>Assigner</DropdownMenuItem>
                      <DropdownMenuItem>Changer le statut</DropdownMenuItem>
                      <DropdownMenuItem>Ajouter un tag</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}

          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucun ticket trouve
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

