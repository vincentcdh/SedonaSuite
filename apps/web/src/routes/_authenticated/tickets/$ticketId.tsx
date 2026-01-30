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
import type { TicketStatus, TicketPriority } from '@sedona/tickets'

export const Route = createFileRoute('/_authenticated/tickets/$ticketId')({
  component: TicketDetailPage,
})

// Mock ticket data
const mockTicket = {
  id: '1',
  ticketNumber: 'TKT-001',
  subject: 'Probleme de connexion a mon compte',
  description: 'Je n\'arrive plus a me connecter a mon compte depuis ce matin. J\'ai essaye de reinitialiser mon mot de passe mais je ne recois pas l\'email.',
  status: 'in_progress' as TicketStatus,
  priority: 'high' as TicketPriority,
  requesterName: 'Jean Dupont',
  requesterEmail: 'jean.dupont@example.com',
  requesterPhone: '+33 6 12 34 56 78',
  assignee: { id: '1', fullName: 'Alice Martin', email: 'alice@example.com', avatarUrl: null },
  category: { id: '1', name: 'Support Technique', color: '#3B82F6' },
  tags: ['urgent', 'connexion'],
  source: 'email' as const,
  createdAt: '2024-02-14T10:30:00Z',
  updatedAt: '2024-02-14T14:00:00Z',
  slaFirstResponseDue: '2024-02-14T12:30:00Z',
  slaFirstResponseAt: '2024-02-14T11:00:00Z',
  slaResolutionDue: '2024-02-15T10:30:00Z',
  slaBreached: false,
}

// Mock messages
const mockMessages = [
  {
    id: '1',
    authorType: 'customer' as const,
    authorName: 'Jean Dupont',
    authorEmail: 'jean.dupont@example.com',
    content: 'Je n\'arrive plus a me connecter a mon compte depuis ce matin. J\'ai essaye de reinitialiser mon mot de passe mais je ne recois pas l\'email. Pouvez-vous m\'aider ?',
    isInternal: false,
    createdAt: '2024-02-14T10:30:00Z',
  },
  {
    id: '2',
    authorType: 'agent' as const,
    authorName: 'Alice Martin',
    content: 'Bonjour Jean,\n\nJe comprends votre frustration. Je vais verifier votre compte immediatement.\n\nPouvez-vous me confirmer l\'adresse email associee a votre compte ?\n\nCordialement,\nAlice',
    isInternal: false,
    createdAt: '2024-02-14T11:00:00Z',
  },
  {
    id: '3',
    authorType: 'agent' as const,
    authorName: 'Alice Martin',
    content: 'Note interne: Le compte semble bloque suite a plusieurs tentatives de connexion echouees. Verifier les logs.',
    isInternal: true,
    createdAt: '2024-02-14T11:05:00Z',
  },
  {
    id: '4',
    authorType: 'customer' as const,
    authorName: 'Jean Dupont',
    authorEmail: 'jean.dupont@example.com',
    content: 'Oui c\'est bien jean.dupont@example.com. Merci pour votre aide !',
    isInternal: false,
    createdAt: '2024-02-14T13:30:00Z',
  },
]

// Mock activity log
const mockActivity = [
  { id: '1', type: 'created', description: 'Ticket cree', actor: 'Systeme', createdAt: '2024-02-14T10:30:00Z' },
  { id: '2', type: 'assigned', description: 'Assigne a Alice Martin', actor: 'Systeme', createdAt: '2024-02-14T10:31:00Z' },
  { id: '3', type: 'status_changed', description: 'Statut change de "Ouvert" a "En cours"', actor: 'Alice Martin', createdAt: '2024-02-14T11:00:00Z' },
  { id: '4', type: 'priority_changed', description: 'Priorite changee de "Normale" a "Haute"', actor: 'Alice Martin', createdAt: '2024-02-14T11:02:00Z' },
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

function TicketDetailPage() {
  const { ticketId } = Route.useParams()
  const [replyContent, setReplyContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showInternalNotes, setShowInternalNotes] = useState(true)

  const ticket = mockTicket
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
    ? mockMessages
    : mockMessages.filter(m => !m.isInternal)

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
                        {message.authorName.split(' ').map(n => n[0]).join('')}
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
                    <Button disabled={!replyContent.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {isInternalNote ? 'Ajouter la note' : 'Envoyer'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 m-0 overflow-y-auto p-6">
              <div className="space-y-4">
                {mockActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.actor} - {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
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
                <Select value={ticket.status}>
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
                      {ticket.assignee.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{ticket.assignee.fullName}</p>
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
                      ) : (
                        formatDate(ticket.slaFirstResponseDue)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution</span>
                    <span>{formatDate(ticket.slaResolutionDue)}</span>
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
