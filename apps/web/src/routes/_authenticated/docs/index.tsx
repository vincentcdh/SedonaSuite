// ===========================================
// DOCS FILE BROWSER PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  FolderPlus,
  Upload,
  Grid3X3,
  List,
  Search,
  Filter,
  MoreHorizontal,
  File,
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  ChevronRight,
  Star,
  Trash2,
  Download,
  Edit,
  Move,
  Lock,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Progress,
} from '@sedona/ui'
import { formatFileSize, fileTypeColors, PLAN_LIMITS } from '@sedona/docs/utils'

export const Route = createFileRoute('/_authenticated/docs/')({
  component: DocsIndexPage,
})

// Simulated PRO status
const isPro = false

// Mock data
const mockFolders = [
  { id: '1', name: 'Contrats', color: '#3b82f6', fileCount: 12 },
  { id: '2', name: 'Factures', color: '#10b981', fileCount: 45 },
  { id: '3', name: 'Marketing', color: '#f59e0b', fileCount: 8 },
  { id: '4', name: 'RH', color: '#8b5cf6', fileCount: 23 },
]

const mockFiles = [
  {
    id: '1',
    name: 'Contrat_Client_ABC.pdf',
    fileType: 'pdf',
    sizeBytes: 2456789,
    createdAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'Jean Dupont',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Logo_Entreprise.png',
    fileType: 'image',
    sizeBytes: 156789,
    createdAt: '2024-01-14T14:20:00Z',
    uploadedBy: 'Marie Martin',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Budget_2024.xlsx',
    fileType: 'spreadsheet',
    sizeBytes: 89456,
    createdAt: '2024-01-13T09:15:00Z',
    uploadedBy: 'Pierre Durand',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Presentation_Produit.pptx',
    fileType: 'presentation',
    sizeBytes: 5678912,
    createdAt: '2024-01-12T16:45:00Z',
    uploadedBy: 'Sophie Bernard',
    isFavorite: true,
  },
  {
    id: '5',
    name: 'Video_Formation.mp4',
    fileType: 'video',
    sizeBytes: 125678901,
    createdAt: '2024-01-11T11:00:00Z',
    uploadedBy: 'Jean Dupont',
    isFavorite: false,
  },
]

// Storage usage mock
const storageUsage = {
  usedBytes: 750 * 1024 * 1024, // 750 MB
  limitBytes: PLAN_LIMITS.FREE.maxStorageBytes,
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
    case 'document':
      return FileText
    case 'image':
      return Image
    case 'video':
      return Video
    case 'audio':
      return Music
    case 'archive':
      return Archive
    case 'spreadsheet':
      return FileSpreadsheet
    case 'presentation':
      return Presentation
    default:
      return File
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function DocsIndexPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const storagePercentage = Math.round(
    (storageUsage.usedBytes / storageUsage.limitBytes) * 100
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Link to="/docs" className="hover:text-foreground">
              Documents
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowNewFolderDialog(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Nouveau dossier
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
        </div>
      </div>

      {/* Storage usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stockage utilise</span>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(storageUsage.usedBytes)} / {formatFileSize(storageUsage.limitBytes)}
            </span>
          </div>
          <Progress
            value={storagePercentage}
            className={storagePercentage >= 90 ? 'bg-red-100' : storagePercentage >= 70 ? 'bg-yellow-100' : ''}
          />
          {storagePercentage >= 70 && !isPro && (
            <p className="text-sm text-muted-foreground mt-2">
              {storagePercentage >= 90
                ? 'Stockage presque plein !'
                : 'Stockage bientot plein.'}{' '}
              <button className="text-primary hover:underline">
                Passez a PRO pour 50 GB
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des fichiers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Dossiers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mockFolders.map((folder) => (
            <Link
              key={folder.id}
              to="/docs/folder/$folderId"
              params={{ folderId: folder.id }}
              className="group"
            >
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${folder.color}20` }}
                    >
                      <Folder className="h-5 w-5" style={{ color: folder.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {folder.fileCount} fichiers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Fichiers</h2>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockFiles.map((file) => {
              const FileIcon = getFileIcon(file.fileType)
              const color = fileTypeColors[file.fileType as keyof typeof fileTypeColors] || fileTypeColors.other

              return (
                <Link
                  key={file.id}
                  to="/docs/file/$fileId"
                  params={{ fileId: file.id }}
                  className="group"
                >
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="p-3 rounded-lg mb-3"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <FileIcon className="h-8 w-8" style={{ color }} />
                        </div>
                        <p className="font-medium text-sm truncate w-full">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(file.sizeBytes)}
                        </p>
                        {file.isFavorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mt-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              {mockFiles.map((file) => {
                const FileIcon = getFileIcon(file.fileType)
                const color = fileTypeColors[file.fileType as keyof typeof fileTypeColors] || fileTypeColors.other

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <Link
                      to="/docs/file/$fileId"
                      params={{ fileId: file.id }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <FileIcon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.sizeBytes)} - {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {file.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Telecharger
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            {file.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Renommer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="h-4 w-4 mr-2" />
                            Deplacer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* New folder dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Nom du dossier</Label>
              <Input
                id="folderName"
                placeholder="Mon dossier"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowNewFolderDialog(false)}>
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
