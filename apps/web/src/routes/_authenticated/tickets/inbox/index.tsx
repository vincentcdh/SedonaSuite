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
  Archive,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  Button,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@sedona/ui'
import { useTickets, useDeleteTicket, useChangeTicketStatus, type TicketStatus, type TicketPriority } from '@sedona/tickets'
import { useOrganization, useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/tickets/inbox/')({
  component: TicketInboxPage,
})

const statusConfig: Record<TicketStatus, { icon: typeof Circle; className: string }> = {
  open: { icon: Circle, className: 'text-blue-500' },
  in_progress: { icon: Clock, className: 'text-yellow-500' },
  waiting: { icon: AlertCircle, className: 'text-orange-500' },
  resolved: { icon: CheckCircle2, className: 'text-green-500' },
  closed: { icon: CheckCircle2, className: 'text-gray-500' },
}

const priorityConfig: Record<TicketPriority, { className: string; label: string }> = {
  low: { className: 'bg-gray-100 text-gray-700', label: 'Basse' },
  normal: { className: 'bg-blue-100 text-blue-700', label: 'Normal' },
  high: { className: 'bg-orange-100 text-orange-700', label: 'Haute' },
  urgent: { className: 'bg-red-100 text-red-700', label: 'Urgent' },
}

function TicketInboxPage() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('inbox')
  const [ticketsToDelete, setTicketsToDelete] = useState<string[]>([])

  const { organization } = useOrganization()
  const { user } = useAuth()
  const organizationId = organization?.id || ''
  const userId = user?.id || ''

  // Fetch tickets based on active tab
  const inboxFilters = activeTab === 'assigned'
    ? { assigneeId: userId }
    : { status: ['open', 'in_progress', 'waiting'] as TicketStatus[] }

  const { data: ticketsData, isLoading, refetch } = useTickets(
    organizationId,
    inboxFilters,
    { page: 1, pageSize: 50 }
  )
  const tickets = ticketsData?.data || []

  // Mutations
  const deleteTicket = useDeleteTicket(organizationId)
  const changeStatus = useChangeTicketStatus()

  const toggleSelectTicket = (id: string) => {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(tickets.map(t => t.id))
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

  const handleArchiveSelected = async () => {
    try {
      for (const ticketId of selectedTickets) {
        await changeStatus.mutateAsync({ ticketId, status: 'closed' })
      }
      setSelectedTickets([])
    } catch (err) {
      console.error('Error archiving tickets:', err)
    }
  }

  const handleDeleteSelected = async () => {
    try {
      for (const ticketId of ticketsToDelete) {
        await deleteTicket.mutateAsync(ticketId)
      }
      setSelectedTickets([])
      setTicketsToDelete([])
    } catch (err) {
      console.error('Error deleting tickets:', err)
    }
  }

  // Filter tickets for different tabs
  const assignedTickets = tickets.filter(t => t.assigneeId === userId)
  const displayTickets = activeTab === 'assigned' ? assignedTickets : tickets
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Boite de reception</h1>
            {openCount > 0 && (
              <Badge variant="secondary">{openCount} ouvert{openCount > 1 ? 's' : ''}</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
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
              {openCount > 0 && (
                <Badge variant="secondary" className="ml-1">{openCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assigned" className="gap-2">
              <User className="h-4 w-4" />
              Mes tickets
              {assignedTickets.length > 0 && (
                <Badge variant="secondary" className="ml-1">{assignedTickets.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="flex-1 m-0 overflow-hidden flex flex-col">
          {/* Bulk actions */}
          {selectedTickets.length > 0 && (
            <div className="border-b bg-muted/50 px-6 py-2">
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {selectedTickets.length} selectionne{selectedTickets.length > 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleArchiveSelected}
                  disabled={changeStatus.isPending}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setTicketsToDelete(selectedTickets)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Ticket list header */}
          <div className="border-b px-6 py-2 bg-muted/30 flex items-center gap-4">
            <Checkbox
              checked={selectedTickets.length === displayTickets.length && displayTickets.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Tout selectionner</span>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Ticket list */}
              <div className="flex-1 overflow-y-auto">
                {displayTickets.map(ticket => {
                  const StatusIcon = statusConfig[ticket.status]?.icon || Circle
                  const statusClass = statusConfig[ticket.status]?.className || 'text-gray-500'
                  const priority = priorityConfig[ticket.priority as TicketPriority] || priorityConfig.normal

                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center gap-4 px-6 py-4 border-b hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTickets.includes(ticket.id)}
                        onCheckedChange={() => toggleSelectTicket(ticket.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <Link
                        to="/tickets/$ticketId"
                        params={{ ticketId: ticket.id }}
                        className="flex-1 min-w-0 flex items-center gap-4"
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {(ticket.requesterName || ticket.requesterEmail || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {ticket.ticketNumber}
                            </span>
                            <span className="text-sm font-medium">
                              {ticket.requesterName || ticket.requesterEmail}
                            </span>
                            <StatusIcon className={cn('h-3 w-3', statusClass)} />
                            {(ticket.priority === 'urgent' || ticket.priority === 'high') && (
                              <Badge className={cn('text-xs', priority.className)}>
                                {priority.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm truncate font-medium">
                              {ticket.subject}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {ticket.category && (
                            <Badge variant="outline" className="text-xs">
                              {ticket.category.name}
                            </Badge>
                          )}
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
                          <DropdownMenuItem
                            onClick={() => changeStatus.mutate({ ticketId: ticket.id, status: 'in_progress' })}
                          >
                            En cours
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => changeStatus.mutate({ ticketId: ticket.id, status: 'resolved' })}
                          >
                            Resolu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => changeStatus.mutate({ ticketId: ticket.id, status: 'closed' })}
                          >
                            Archiver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setTicketsToDelete([ticket.id])}
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}

                {displayTickets.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {activeTab === 'assigned'
                        ? 'Aucun ticket assigne pour le moment'
                        : 'Votre boite de reception est vide'
                      }
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={ticketsToDelete.length > 0} onOpenChange={(open) => !open && setTicketsToDelete([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {ticketsToDelete.length > 1 ? 'les tickets' : 'le ticket'}</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer {ticketsToDelete.length} ticket{ticketsToDelete.length > 1 ? 's' : ''} ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
