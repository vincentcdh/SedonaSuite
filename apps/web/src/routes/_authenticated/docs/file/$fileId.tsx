// ===========================================
// FILE DETAIL PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Download,
  Star,
  Trash2,
  Edit,
  Move,
  Share2,
  Clock,
  User,
  Folder,
  Tag,
  FileText,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
  MessageSquare,
  History,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Avatar,
  AvatarFallback,
} from '@sedona/ui'
import { formatFileSize, fileTypeColors } from '@sedona/docs/utils'

export const Route = createFileRoute('/_authenticated/docs/file/$fileId')({
  component: FileDetailPage,
})

// Simulated PRO status
const isPro = false

// Mock file data
const mockFile = {
  id: '1',
  name: 'Contrat_Client_ABC.pdf',
  originalName: 'Contrat_Client_ABC.pdf',
  fileType: 'pdf',
  mimeType: 'application/pdf',
  extension: 'pdf',
  sizeBytes: 2456789,
  storagePath: '/documents/org123/contrat_client_abc.pdf',
  description: 'Contrat de prestation de services avec le client ABC pour l\'annee 2024.',
  tags: ['contrat', 'client', '2024'],
  currentVersion: 3,
  isLocked: false,
  isFavorite: true,
  downloadCount: 12,
  folder: {
    id: '1',
    name: 'Contrats',
    path: '/Contrats',
  },
  uploader: {
    id: 'user1',
    fullName: 'Jean Dupont',
    email: 'jean@example.com',
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-18T14:20:00Z',
}

// Mock activity
const mockActivity = [
  { id: '1', action: 'Telechargement', user: 'Marie Martin', date: '2024-01-18T14:20:00Z' },
  { id: '2', action: 'Modification', user: 'Jean Dupont', date: '2024-01-17T10:15:00Z' },
  { id: '3', action: 'Telechargement', user: 'Pierre Durand', date: '2024-01-16T16:30:00Z' },
  { id: '4', action: 'Creation', user: 'Jean Dupont', date: '2024-01-15T10:30:00Z' },
]

// Mock versions (PRO)
const mockVersions = [
  { version: 3, date: '2024-01-18T14:20:00Z', user: 'Jean Dupont', sizeBytes: 2456789 },
  { version: 2, date: '2024-01-17T10:15:00Z', user: 'Jean Dupont', sizeBytes: 2345678 },
  { version: 1, date: '2024-01-15T10:30:00Z', user: 'Jean Dupont', sizeBytes: 2234567 },
]

// Mock comments (PRO)
const mockComments = [
  {
    id: '1',
    content: 'Merci de verifier la clause 3.2 avant envoi au client.',
    author: { fullName: 'Marie Martin', initials: 'MM' },
    createdAt: '2024-01-17T15:30:00Z',
  },
  {
    id: '2',
    content: 'OK, c\'est corrige dans la version 3.',
    author: { fullName: 'Jean Dupont', initials: 'JD' },
    createdAt: '2024-01-18T09:00:00Z',
  },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function FileDetailPage() {
  const { fileId } = Route.useParams()
  const [isFavorite, setIsFavorite] = useState(mockFile.isFavorite)

  const color = fileTypeColors[mockFile.fileType as keyof typeof fileTypeColors] || fileTypeColors.other

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/docs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">{mockFile.name}</h1>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(mockFile.sizeBytes)} - Version {mockFile.currentVersion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Star
              className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`}
            />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Telecharger
          </Button>
          <Button variant="outline" disabled={!isPro}>
            <Share2 className="h-4 w-4 mr-2" />
            Partager
            {!isPro && <Lock className="h-3 w-3 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview area */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center p-8">
          {mockFile.fileType === 'pdf' ? (
            <div className="w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4" style={{ color }} />
                <p className="font-medium">{mockFile.name}</p>
                <p className="text-sm mt-2">Apercu PDF</p>
                <Button className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Ouvrir le PDF
                </Button>
              </div>
            </div>
          ) : mockFile.fileType === 'image' ? (
            <div className="w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center">
              <Image className="h-16 w-16 text-muted-foreground" />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4" style={{ color }} />
              <p className="font-medium">{mockFile.name}</p>
              <p className="text-sm mt-2">Apercu non disponible</p>
              <Button className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Telecharger
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l overflow-auto">
          <Tabs defaultValue="info">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Informations
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Activite
              </TabsTrigger>
              <TabsTrigger value="versions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" disabled={!isPro}>
                Versions
                {!isPro && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" disabled={!isPro}>
                Commentaires
                {!isPro && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="p-4 space-y-6 mt-0">
              {/* Description */}
              {mockFile.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{mockFile.description}</p>
                </div>
              )}

              {/* Tags */}
              {mockFile.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockFile.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dossier:</span>
                  <Link
                    to="/docs/folder/$folderId"
                    params={{ folderId: mockFile.folder.id }}
                    className="text-primary hover:underline"
                  >
                    {mockFile.folder.name}
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cree par:</span>
                  <span>{mockFile.uploader.fullName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cree le:</span>
                  <span>{formatDate(mockFile.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Modifie le:</span>
                  <span>{formatDate(mockFile.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Telechargements:</span>
                  <span>{mockFile.downloadCount}</span>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Renommer
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Move className="h-4 w-4 mr-2" />
                  Deplacer
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="p-4 mt-0">
              <div className="space-y-4">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}
                        <span className="text-muted-foreground">a effectue:</span>
                        {' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="versions" className="p-4 mt-0">
              {!isPro ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Historique des versions</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Conservez jusqu'a 10 versions de vos fichiers avec l'offre PRO.
                  </p>
                  <Button className="mt-4">
                    <Lock className="h-4 w-4 mr-2" />
                    Passer a PRO
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockVersions.map((version) => (
                    <Card key={version.version}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Version {version.version}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatShortDate(version.date)} par {version.user}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(version.sizeBytes)}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="p-4 mt-0">
              {!isPro ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Commentaires</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Collaborez avec votre equipe en ajoutant des commentaires.
                  </p>
                  <Button className="mt-4">
                    <Lock className="h-4 w-4 mr-2" />
                    Passer a PRO
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.author.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatShortDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Textarea placeholder="Ajouter un commentaire..." className="mb-2" />
                    <Button size="sm">Envoyer</Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
