// ===========================================
// TICKETS INBOX PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Inbox,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  Checkbox,
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sedona/ui'
import type { TicketStatus, TicketPriority } from '@sedona/tickets'

export const Route = createFileRoute('/_authenticated/tickets/inbox/')({
  component: TicketInboxPage,
})

// Mock inbox data
const mockInboxTickets = [
  {
    id: '1',
    ticketNumber: 'TKT-003',
    subject: 'Bug sur la page de paiement',
    preview: 'Bonjour, je rencontre un probleme lors du paiement...',
    status: 'open' as TicketStatus,
    priority: 'urgent' as TicketPriority,
    requesterName: 'Pierre Martin',
    isRead: false,
    isStarred: true,
    createdAt: '2024-02-14T16:00:00Z',
    slaBreached: true,
  },
  {
    id: '2',
    ticketNumber: 'TKT-001',
    subject: 'Probleme de connexion a mon compte',
    preview: 'Oui c\'est bien jean.dupont@example.com...',
    status: 'in_progress' as TicketStatus,
    priority: 'high' as TicketPriority,
    requesterName: 'Jean Dupont',
    isRead: false,
    isStarred: false,
    createdAt: '2024-02-14T13:30:00Z',
    slaBreached: false,
  },
  {
    id: '3',
    ticketNumber: 'TKT-006',
    subject: 'Question sur la facturation',
    preview: 'J\'ai une question concernant ma derniere facture...',
    status: 'open' as TicketStatus,
    priority: 'normal' as TicketPriority,
    requesterName: 'Sophie Bernard',
    isRead: true,
    isStarred: false,
    createdAt: '2024-02-14T11:00:00Z',
    slaBreached: false,
  },
  {
    id: '4',
    ticketNumber: 'TKT-007',
    subject: 'Demande de fonctionnalite',
    preview: 'Serait-il possible d\'ajouter une option pour...',
    status: 'waiting' as TicketStatus,
    priority: 'low' as TicketPriority,
    requesterName: 'Marc Leroy',
    isRead: true,
    isStarred: false,
    createdAt: '2024-02-13T15:00:00Z',
    slaBreached: false,
  },
]

const statusConfig: Record<TicketStatus, { icon: typeof Circle; className: string }> = {
  open: { icon: Circle, className: 'text-blue-500' },
  in_progress: { icon: Clock, className: 'text-yellow-500' },
  waiting: { icon: AlertCircle, className: 'text-orange-500' },
  resolved: { icon: CheckCircle2, className: 'text-green-500' },
  closed: { icon: CheckCircle2, className: 'text-gray-500' },
}

const priorityConfig: Record<TicketPriority, { className: string }> = {
  low: { className: 'bg-gray-100 text-gray-700' },
  normal: { className: 'bg-blue-100 text-blue-700' },
  high: { className: 'bg-orange-100 text-orange-700' },
  urgent: { className: 'bg-red-100 text-red-700' },
}

function TicketInboxPage() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('inbox')

  const toggleSelectTicket = (id: string) => {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTickets.length === mockInboxTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(mockInboxTickets.map(t => t.id))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Il y a quelques min'
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const unreadCount = mockInboxTickets.filter(t => !t.isRead).length
  const starredCount = mockInboxTickets.filter(t => t.isStarred).length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Boite de reception</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</Badge>
            )}
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-12">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="h-4 w-4" />
              Boite de reception
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned" className="gap-2">
              <User className="h-4 w-4" />
              Mes tickets
            </TabsTrigger>
            <TabsTrigger value="starred" className="gap-2">
              <Star className="h-4 w-4" />
              Favoris
              {starredCount > 0 && (
                <Badge variant="secondary" className="ml-1">{starredCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inbox" className="flex-1 m-0 overflow-hidden flex flex-col">
          {/* Bulk actions */}
          {selectedTickets.length > 0 && (
            <div className="border-b bg-muted/50 px-6 py-2">
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {selectedTickets.length} selectionne{selectedTickets.length > 1 ? 's' : ''}
                </span>
                <Button variant="ghost" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Ticket list header */}
          <div className="border-b px-6 py-2 bg-muted/30 flex items-center gap-4">
            <Checkbox
              checked={selectedTickets.length === mockInboxTickets.length && mockInboxTickets.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Tout selectionner</span>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto">
            {mockInboxTickets.map(ticket => {
              const StatusIcon = statusConfig[ticket.status].icon
              return (
                <div
                  key={ticket.id}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 border-b hover:bg-muted/30 transition-colors cursor-pointer',
                    !ticket.isRead && 'bg-primary/5',
                    ticket.slaBreached && 'bg-red-50/50'
                  )}
                >
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={() => toggleSelectTicket(ticket.id)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <button
                    className="text-muted-foreground hover:text-yellow-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Toggle star
                    }}
                  >
                    <Star className={cn('h-4 w-4', ticket.isStarred && 'fill-yellow-500 text-yellow-500')} />
                  </button>

                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: ticket.id }}
                    className="flex-1 min-w-0 flex items-center gap-4"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {ticket.requesterName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm', !ticket.isRead && 'font-semibold')}>
                          {ticket.requesterName}
                        </span>
                        <StatusIcon className={cn('h-3 w-3', statusConfig[ticket.status].className)} />
                        {ticket.priority === 'urgent' || ticket.priority === 'high' ? (
                          <Badge className={cn('text-xs', priorityConfig[ticket.priority].className)}>
                            {ticket.priority === 'urgent' ? 'Urgent' : 'Haute'}
                          </Badge>
                        ) : null}
                        {ticket.slaBreached && (
                          <Badge variant="destructive" className="text-xs">SLA</Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={cn('text-sm truncate', !ticket.isRead && 'font-medium')}>
                          {ticket.subject}
                        </span>
                        <span className="text-sm text-muted-foreground truncate flex-shrink">
                          - {ticket.preview}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Marquer comme lu</DropdownMenuItem>
                      <DropdownMenuItem>Ajouter aux favoris</DropdownMenuItem>
                      <DropdownMenuItem>Assigner</DropdownMenuItem>
                      <DropdownMenuItem>Archiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}

            {mockInboxTickets.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Votre boite de reception est vide</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="flex-1 m-0 p-8 text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun ticket assigne pour le moment</p>
        </TabsContent>

        <TabsContent value="starred" className="flex-1 m-0 p-8 text-center text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun ticket en favoris</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
