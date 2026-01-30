// ===========================================
// TICKET DETAIL PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  Tag,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  StickyNote,
  History,
  AlertCircle,
  CheckCircle2,
  Circle,
  Lock,
  Eye,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
} from '@sedona/ui'
import {
  useTicket,
  useTicketMessages,
  useCreateMessage,
  useAddInternalNote,
  useChangeTicketStatus,
  useAssignTicket,
  type TicketStatus,
  type TicketPriority,
} from '@sedona/tickets'
import { useSession } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/tickets/$ticketId')({
  component: TicketDetailPage,
})

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

function TicketDetailPage() {
  const { ticketId } = Route.useParams()
  const { data: session } = useSession()
  const [replyContent, setReplyContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showInternalNotes, setShowInternalNotes] = useState(true)

  // Fetch ticket data from Supabase
  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useTicket(ticketId)
  const { data: messagesData } = useTicketMessages(ticketId)

  // Mutations
  const createMessageMutation = useCreateMessage()
  const addNoteMutation = useAddInternalNote()
  const changeStatusMutation = useChangeTicketStatus()

  const messages = messagesData || []

  // Loading state
  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (ticketError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Ticket introuvable</h2>
        <p className="text-muted-foreground mb-4">
          Le ticket demande n'existe pas ou a ete supprime.
        </p>
        <Link to="/tickets">
          <Button>Retour aux tickets</Button>
        </Link>
      </div>
    )
  }

  const StatusIcon = statusConfig[ticket.status].icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredMessages = showInternalNotes
    ? messages
    : messages.filter(m => !m.isInternal)

  const handleSendMessage = async () => {
    if (!replyContent.trim() || !ticketId) return

    const userId = session?.user?.id

    try {
      if (isInternalNote) {
        await addNoteMutation.mutateAsync({
          ticketId,
          content: replyContent,
          userId: userId || '',
        })
      } else {
        await createMessageMutation.mutateAsync({
          input: {
            ticketId,
            content: replyContent,
            isInternal: false,
          },
          userId,
          authorType: 'agent',
        })
      }
      setReplyContent('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await changeStatusMutation.mutateAsync({
        ticketId: ticket.id,
        status: newStatus,
      })
    } catch (error) {
      console.error('Failed to change status:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-mono">{ticket.ticketNumber}</span>
              <h1 className="text-xl font-semibold">{ticket.subject}</h1>
              {ticket.slaBreached && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  SLA depassé
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Fusionner avec un autre ticket</DropdownMenuItem>
              <DropdownMenuItem>Creer un ticket lie</DropdownMenuItem>
              <DropdownMenuItem>Exporter</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Messages area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList className="h-12">
                <TabsTrigger value="conversation" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <History className="h-4 w-4" />
                  Historique
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="conversation" className="flex-1 flex flex-col m-0 overflow-hidden">
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Filter toggle */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInternalNotes(!showInternalNotes)}
                    className="gap-2"
                  >
                    {showInternalNotes ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {showInternalNotes ? 'Masquer les notes' : 'Afficher les notes'}
                  </Button>
                </div>

                {filteredMessages.map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.authorType === 'agent' && !message.isInternal && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={cn(
                        'text-xs',
                        message.authorType === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'
                      )}>
                        {(message.authorName || '?').split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'flex-1 max-w-[80%]',
                        message.authorType === 'agent' && !message.isInternal && 'flex flex-col items-end'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </span>
                        {message.isInternal && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <StickyNote className="h-3 w-3" />
                            Note interne
                          </Badge>
                        )}
                      </div>
                      <Card className={cn(
                        message.isInternal && 'bg-yellow-50 border-yellow-200',
                        message.authorType === 'agent' && !message.isInternal && 'bg-primary/5'
                      )}>
                        <CardContent className="p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply area */}
              <div className="border-t p-4">
                <div className="flex gap-2 mb-3">
                  <Button
                    variant={!isInternalNote ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsInternalNote(false)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Repondre
                  </Button>
                  <Button
                    variant={isInternalNote ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsInternalNote(true)}
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    Note interne
                  </Button>
                </div>
                <div className="space-y-3">
                  <Textarea
                    placeholder={isInternalNote ? 'Ajouter une note interne...' : 'Ecrire une reponse...'}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className={cn(isInternalNote && 'bg-yellow-50 border-yellow-200')}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Joindre un fichier
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!replyContent.trim() || createMessageMutation.isPending || addNoteMutation.isPending}
                    >
                      {(createMessageMutation.isPending || addNoteMutation.isPending) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isInternalNote ? 'Ajouter la note' : 'Envoyer'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 m-0 overflow-y-auto p-6">
              <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                <History className="h-8 w-8 mb-2" />
                <p>L'historique des activites sera bientot disponible.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-muted/30 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Status & Priority */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Statut
                </label>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => handleStatusChange(value as TicketStatus)}
                  disabled={changeStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <config.icon className={cn('h-4 w-4', config.className)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Priorite
                </label>
                <Select value={ticket.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <Badge className={config.className}>{config.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Assigne a
              </label>
              {ticket.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(ticket.assignee.fullName || ticket.assignee.email || '?').split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{ticket.assignee.fullName || ticket.assignee.email}</p>
                    <p className="text-xs text-muted-foreground">{ticket.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Assigner
                </Button>
              )}
            </div>

            <Separator />

            {/* Requester */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Demandeur
              </label>
              <Card>
                <CardContent className="p-3">
                  <p className="font-medium">{ticket.requesterName}</p>
                  <p className="text-sm text-muted-foreground">{ticket.requesterEmail}</p>
                  {ticket.requesterPhone && (
                    <p className="text-sm text-muted-foreground">{ticket.requesterPhone}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Category & Tags */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Categorie
                </label>
                {ticket.category && (
                  <Badge
                    variant="outline"
                    style={{ borderColor: ticket.category.color, color: ticket.category.color }}
                  >
                    {ticket.category.name}
                  </Badge>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Tag className="h-3 w-3 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* SLA Info */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                SLA
              </label>
              <Card>
                <CardContent className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premiere reponse</span>
                    <span className={ticket.slaFirstResponseAt ? 'text-green-600' : 'text-muted-foreground'}>
                      {ticket.slaFirstResponseAt ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : ticket.slaFirstResponseDue ? (
                        formatDate(ticket.slaFirstResponseDue)
                      ) : (
                        '-'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution</span>
                    <span>{ticket.slaResolutionDue ? formatDate(ticket.slaResolutionDue) : '-'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Cree le {formatDate(ticket.createdAt)}</p>
              <p>Source: {ticket.source}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
