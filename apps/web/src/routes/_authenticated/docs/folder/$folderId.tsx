// ===========================================
// FOLDER VIEW PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
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
  ArrowLeft,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Input,
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
} from '@sedona/ui'
import { formatFileSize, fileTypeColors } from '@sedona/docs/utils'

export const Route = createFileRoute('/_authenticated/docs/folder/$folderId')({
  component: FolderViewPage,
})

// Mock data
const mockFolder = {
  id: '1',
  name: 'Contrats',
  color: '#3b82f6',
  parentId: null,
}

const mockBreadcrumbs = [
  { id: 'root', name: 'Documents' },
  { id: '1', name: 'Contrats' },
]

const mockSubfolders = [
  { id: 'sub1', name: 'Clients', color: '#10b981', fileCount: 8 },
  { id: 'sub2', name: 'Fournisseurs', color: '#f59e0b', fileCount: 5 },
]

const mockFiles = [
  {
    id: 'f1',
    name: 'Contrat_Client_ABC.pdf',
    fileType: 'pdf',
    sizeBytes: 2456789,
    createdAt: '2024-01-15T10:30:00Z',
    isFavorite: true,
  },
  {
    id: 'f2',
    name: 'Contrat_Client_XYZ.pdf',
    fileType: 'pdf',
    sizeBytes: 1856789,
    createdAt: '2024-01-14T14:20:00Z',
    isFavorite: false,
  },
  {
    id: 'f3',
    name: 'Annexe_Conditions.docx',
    fileType: 'document',
    sizeBytes: 89456,
    createdAt: '2024-01-13T09:15:00Z',
    isFavorite: false,
  },
]

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

function FolderViewPage() {
  const { folderId } = Route.useParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/docs">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{mockFolder.name}</h1>
          </div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {mockBreadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.id === 'root' ? (
                  <Link to="/docs" className="hover:text-foreground">
                    {crumb.name}
                  </Link>
                ) : index === mockBreadcrumbs.length - 1 ? (
                  <span className="text-foreground">{crumb.name}</span>
                ) : (
                  <Link
                    to="/docs/folder/$folderId"
                    params={{ folderId: crumb.id }}
                    className="hover:text-foreground"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
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

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans ce dossier..."
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

      {/* Subfolders */}
      {mockSubfolders.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Dossiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockSubfolders.map((folder) => (
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
      )}

      {/* Files */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Fichiers</h2>

        {mockFiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ce dossier est vide</p>
              <Button className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Importer des fichiers
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
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
