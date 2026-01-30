// ===========================================
// CLIENT PORTAL MANAGEMENT PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Users,
  Link2,
  Mail,
  MoreHorizontal,
  Plus,
  Copy,
  Shield,
  Clock,
  Eye,
  MessageSquare,
  Upload,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Crown,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Switch,
  Separator,
} from '@sedona/ui'

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/client-portal/'
)({
  component: ClientPortalManagementPage,
})

// Mock data
const mockClientAccounts = [
  {
    id: '1',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@client.fr',
    lastAccessedAt: '2024-02-10T14:30:00',
    accessCount: 12,
    isActive: true,
    canComment: true,
    canUploadFiles: false,
  },
  {
    id: '2',
    clientName: 'Marie Martin',
    clientEmail: 'marie@entreprise.com',
    lastAccessedAt: '2024-02-08T09:15:00',
    accessCount: 5,
    isActive: true,
    canComment: true,
    canUploadFiles: true,
  },
  {
    id: '3',
    clientName: 'Pierre Durand',
    clientEmail: 'p.durand@societe.fr',
    lastAccessedAt: null,
    accessCount: 0,
    isActive: false,
    canComment: true,
    canUploadFiles: false,
  },
]

const mockShareLinks = [
  {
    id: '1',
    name: 'Lien presentation client',
    shareToken: 'abc123xyz789',
    createdAt: '2024-02-01T10:00:00',
    expiresAt: '2024-03-01T10:00:00',
    accessCount: 8,
    isActive: true,
    passwordProtected: false,
  },
  {
    id: '2',
    name: 'Acces revision design',
    shareToken: 'def456uvw012',
    createdAt: '2024-01-15T14:00:00',
    expiresAt: null,
    accessCount: 3,
    isActive: true,
    passwordProtected: true,
  },
]

const isPro = false
const clientPortalLimit = isPro ? Infinity : 1
const clientsLimit = isPro ? Infinity : 2

function ClientPortalManagementPage() {
  const { projectId } = Route.useParams()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showShareLinkDialog, setShowShareLinkDialog] = useState(false)

  const totalClients = mockClientAccounts.length + mockShareLinks.length
  const canAddMore = totalClients < clientsLimit

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show toast
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portail Client</h1>
          <p className="text-muted-foreground">
            Gerez l'acces des clients a ce projet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a
              href={`/client-portal/preview/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye className="h-4 w-4 mr-2" />
              Previsualiser
            </a>
          </Button>
        </div>
      </div>

      {/* Limits Warning */}
      {!isPro && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">Plan Gratuit</p>
                  <p className="text-sm text-muted-foreground">
                    {totalClients}/{clientsLimit} acces clients utilises
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Passer a PRO
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts" className="gap-2">
            <Users className="h-4 w-4" />
            Clients invites ({mockClientAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            Liens de partage ({mockShareLinks.length})
          </TabsTrigger>
        </TabsList>

        {/* Client Accounts Tab */}
        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Clients invites</CardTitle>
                <CardDescription>
                  Clients avec un compte pour acceder au projet
                </CardDescription>
              </div>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button disabled={!canAddMore}>
                    <Plus className="h-4 w-4 mr-2" />
                    Inviter un client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inviter un client</DialogTitle>
                    <DialogDescription>
                      Le client recevra un email pour creer son acces
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="client@exemple.fr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Jean Dupont" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <Label>Permissions</Label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Peut commenter</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Peut uploader des fichiers</span>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Voir l'equipe</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={() => setShowInviteDialog(false)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer l'invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {mockClientAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun client invite</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockClientAccounts.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {client.clientName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{client.clientName}</p>
                            {!client.isActive && (
                              <Badge variant="secondary">Desactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {client.clientEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            Derniere visite
                          </p>
                          <p>{formatDate(client.lastAccessedAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {client.canComment && (
                            <Badge variant="outline" className="gap-1">
                              <MessageSquare className="h-3 w-3" />
                            </Badge>
                          )}
                          {client.canUploadFiles && (
                            <Badge variant="outline" className="gap-1">
                              <Upload className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Modifier les permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renvoyer l'invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {client.isActive ? (
                              <DropdownMenuItem className="text-warning">
                                <XCircle className="h-4 w-4 mr-2" />
                                Desactiver l'acces
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Reactiver l'acces
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Links Tab */}
        <TabsContent value="links" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Liens de partage</CardTitle>
                <CardDescription>
                  Acces sans compte via un lien unique
                </CardDescription>
              </div>
              <Dialog
                open={showShareLinkDialog}
                onOpenChange={setShowShareLinkDialog}
              >
                <DialogTrigger asChild>
                  <Button disabled={!canAddMore}>
                    <Plus className="h-4 w-4 mr-2" />
                    Creer un lien
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Creer un lien de partage</DialogTitle>
                    <DialogDescription>
                      Generez un lien unique pour partager le projet
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkName">Nom du lien</Label>
                      <Input
                        id="linkName"
                        placeholder="Ex: Lien presentation client"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Proteger par mot de passe</Label>
                        <p className="text-xs text-muted-foreground">
                          Ajouter une protection supplementaire
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiresAt">Date d'expiration (optionnel)</Label>
                      <Input id="expiresAt" type="date" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <Label>Permissions</Label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Peut commenter</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Voir l'equipe</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowShareLinkDialog(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={() => setShowShareLinkDialog(false)}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Generer le lien
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {mockShareLinks.length === 0 ? (
                <div className="text-center py-8">
                  <Link2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun lien de partage</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockShareLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Link2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{link.name}</p>
                            {link.passwordProtected && (
                              <Badge variant="secondary" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Protege
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            /client-portal/{link.shareToken.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          {link.expiresAt ? (
                            <>
                              <p className="text-muted-foreground">Expire le</p>
                              <p>{formatDate(link.expiresAt)}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-muted-foreground">Visites</p>
                              <p>{link.accessCount}</p>
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/client-portal/${link.shareToken}`
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ouvrir le lien
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Modifier les permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {link.isActive ? (
                              <DropdownMenuItem className="text-warning">
                                <XCircle className="h-4 w-4 mr-2" />
                                Desactiver
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Reactiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
