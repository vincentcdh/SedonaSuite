// ===========================================
// RECENT FILES PAGE
// ===========================================

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Clock,
  File,
  FileText,
  Image,
  MoreHorizontal,
  Download,
  Star,
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

export const Route = createFileRoute('/_authenticated/docs/recent')({
  component: RecentFilesPage,
})

// Mock recent files
const mockRecentFiles = [
  {
    id: '1',
    name: 'Contrat_Client_ABC.pdf',
    fileType: 'pdf',
    sizeBytes: 2456789,
    createdAt: '2024-01-15T10:30:00Z',
    lastAccessedAt: '2024-01-18T14:20:00Z',
    folder: 'Contrats',
  },
  {
    id: '2',
    name: 'Logo_Entreprise.png',
    fileType: 'image',
    sizeBytes: 156789,
    createdAt: '2024-01-14T14:20:00Z',
    lastAccessedAt: '2024-01-18T11:00:00Z',
    folder: 'Marketing',
  },
  {
    id: '3',
    name: 'Budget_2024.xlsx',
    fileType: 'spreadsheet',
    sizeBytes: 89456,
    createdAt: '2024-01-13T09:15:00Z',
    lastAccessedAt: '2024-01-17T16:45:00Z',
    folder: 'Finance',
  },
  {
    id: '4',
    name: 'Presentation_Produit.pptx',
    fileType: 'presentation',
    sizeBytes: 5678912,
    createdAt: '2024-01-12T16:45:00Z',
    lastAccessedAt: '2024-01-17T10:30:00Z',
    folder: 'Marketing',
  },
  {
    id: '5',
    name: 'Notes_Reunion.docx',
    fileType: 'document',
    sizeBytes: 45678,
    createdAt: '2024-01-16T09:00:00Z',
    lastAccessedAt: '2024-01-16T18:00:00Z',
    folder: 'RH',
  },
]

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

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }
}

function RecentFilesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Fichiers recents
        </h1>
        <p className="text-muted-foreground mt-1">
          Vos fichiers consultes ou modifies recemment
        </p>
      </div>

      {mockRecentFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Aucun fichier recent</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les fichiers que vous consultez ou modifiez apparaitront ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {mockRecentFiles.map((file) => {
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
                        {file.folder} - {formatFileSize(file.sizeBytes)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatRelativeDate(file.lastAccessedAt)}
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
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
                        Ajouter aux favoris
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
