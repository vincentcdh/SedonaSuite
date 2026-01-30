// ===========================================
// TRASH PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Trash2,
  File,
  FileText,
  Folder,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@sedona/ui'
import { formatFileSize, fileTypeColors } from '@sedona/docs/utils'

export const Route = createFileRoute('/_authenticated/docs/trash')({
  component: TrashPage,
})

// Mock deleted items
const mockDeletedItems = [
  {
    id: '1',
    type: 'file',
    name: 'Old_Contract.pdf',
    fileType: 'pdf',
    sizeBytes: 1234567,
    deletedAt: '2024-01-17T10:30:00Z',
    deletedBy: 'Jean Dupont',
  },
  {
    id: '2',
    type: 'folder',
    name: 'Archive 2023',
    fileCount: 15,
    deletedAt: '2024-01-16T14:20:00Z',
    deletedBy: 'Marie Martin',
  },
  {
    id: '3',
    type: 'file',
    name: 'Draft_Presentation.pptx',
    fileType: 'presentation',
    sizeBytes: 3456789,
    deletedAt: '2024-01-15T09:15:00Z',
    deletedBy: 'Pierre Durand',
  },
]

function getIcon(item: any) {
  if (item.type === 'folder') return Folder
  switch (item.fileType) {
    case 'pdf':
    case 'document':
      return FileText
    default:
      return File
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TrashPage() {
  const [showEmptyDialog, setShowEmptyDialog] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            Corbeille
          </h1>
          <p className="text-muted-foreground mt-1">
            Les elements supprimes sont conserves 30 jours avant suppression definitive.
          </p>
        </div>
        {mockDeletedItems.length > 0 && (
          <Button variant="destructive" onClick={() => setShowEmptyDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Vider la corbeille
          </Button>
        )}
      </div>

      {mockDeletedItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Corbeille vide</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les fichiers et dossiers supprimes apparaitront ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {mockDeletedItems.map((item) => {
              const Icon = getIcon(item)
              const color = item.type === 'folder'
                ? '#6b7280'
                : fileTypeColors[item.fileType as keyof typeof fileTypeColors] || fileTypeColors.other

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="p-2 rounded-lg opacity-60"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-muted-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supprime le {formatDate(item.deletedAt)} par {item.deletedBy}
                        {item.type === 'file' && item.sizeBytes && ` - ${formatFileSize(item.sizeBytes)}`}
                        {item.type === 'folder' && item.fileCount && ` - ${item.fileCount} fichiers`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurer
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Empty trash dialog */}
      <Dialog open={showEmptyDialog} onOpenChange={setShowEmptyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Vider la corbeille
            </DialogTitle>
            <DialogDescription>
              Cette action est irreversible. Tous les elements de la corbeille seront
              definitivement supprimes et ne pourront pas etre recuperes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmptyDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => setShowEmptyDialog(false)}>
              Vider la corbeille
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
