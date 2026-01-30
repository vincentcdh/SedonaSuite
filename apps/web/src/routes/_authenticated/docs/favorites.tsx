// ===========================================
// FAVORITES PAGE
// ===========================================

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Star,
  Folder,
  File,
  FileText,
  Image,
  MoreHorizontal,
  Download,
  Trash2,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sedona/ui'
import { formatFileSize, fileTypeColors } from '@sedona/docs/utils'

export const Route = createFileRoute('/_authenticated/docs/favorites')({
  component: FavoritesPage,
})

// Mock favorites
const mockFavorites = {
  folders: [
    { id: '1', name: 'Contrats', color: '#3b82f6', fileCount: 12 },
    { id: '2', name: 'Marketing', color: '#f59e0b', fileCount: 8 },
  ],
  files: [
    {
      id: '1',
      name: 'Contrat_Client_ABC.pdf',
      fileType: 'pdf',
      sizeBytes: 2456789,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '4',
      name: 'Presentation_Produit.pptx',
      fileType: 'presentation',
      sizeBytes: 5678912,
      createdAt: '2024-01-12T16:45:00Z',
    },
  ],
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
    case 'document':
      return FileText
    case 'image':
      return Image
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

function FavoritesPage() {
  const isEmpty = mockFavorites.folders.length === 0 && mockFavorites.files.length === 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
          Favoris
        </h1>
        <p className="text-muted-foreground mt-1">
          Vos dossiers et fichiers favoris
        </p>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Aucun favori</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ajoutez des fichiers ou dossiers a vos favoris pour y acceder rapidement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Favorite folders */}
          {mockFavorites.folders.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Dossiers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mockFavorites.folders.map((folder) => (
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
                            className="p-2 rounded-lg relative"
                            style={{ backgroundColor: `${folder.color}20` }}
                          >
                            <Folder className="h-5 w-5" style={{ color: folder.color }} />
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
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

          {/* Favorite files */}
          {mockFavorites.files.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Fichiers</h2>
              <Card>
                <div className="divide-y">
                  {mockFavorites.files.map((file) => {
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
                            className="p-2 rounded-lg relative"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <FileIcon className="h-5 w-5" style={{ color }} />
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.sizeBytes)} - {formatDate(file.createdAt)}
                            </p>
                          </div>
                        </Link>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Retirer des favoris
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
