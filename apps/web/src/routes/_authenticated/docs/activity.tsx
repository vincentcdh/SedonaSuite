// ===========================================
// ACTIVITY PAGE
// ===========================================

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Activity,
  Upload,
  Download,
  Edit,
  Trash2,
  RotateCcw,
  Share2,
  MessageSquare,
  FolderPlus,
  File,
  FileText,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
} from '@sedona/ui'
import { fileTypeColors } from '@sedona/docs/utils'

export const Route = createFileRoute('/_authenticated/docs/activity')({
  component: ActivityPage,
})

// Mock activity data
const mockActivity = [
  {
    id: '1',
    action: 'uploaded',
    user: { fullName: 'Jean Dupont', initials: 'JD' },
    file: { id: 'f1', name: 'Contrat_2024.pdf', fileType: 'pdf' },
    createdAt: '2024-01-18T14:30:00Z',
  },
  {
    id: '2',
    action: 'downloaded',
    user: { fullName: 'Marie Martin', initials: 'MM' },
    file: { id: 'f2', name: 'Budget_Q1.xlsx', fileType: 'spreadsheet' },
    createdAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '3',
    action: 'renamed',
    user: { fullName: 'Pierre Durand', initials: 'PD' },
    file: { id: 'f3', name: 'Presentation_V2.pptx', fileType: 'presentation' },
    details: { oldName: 'Presentation.pptx', newName: 'Presentation_V2.pptx' },
    createdAt: '2024-01-18T09:15:00Z',
  },
  {
    id: '4',
    action: 'moved',
    user: { fullName: 'Sophie Bernard', initials: 'SB' },
    file: { id: 'f4', name: 'Notes_Reunion.docx', fileType: 'document' },
    details: { toFolder: 'Archives' },
    createdAt: '2024-01-17T16:45:00Z',
  },
  {
    id: '5',
    action: 'deleted',
    user: { fullName: 'Jean Dupont', initials: 'JD' },
    file: { id: 'f5', name: 'Draft_Old.pdf', fileType: 'pdf' },
    createdAt: '2024-01-17T14:00:00Z',
  },
  {
    id: '6',
    action: 'restored',
    user: { fullName: 'Marie Martin', initials: 'MM' },
    file: { id: 'f6', name: 'Important_Doc.docx', fileType: 'document' },
    createdAt: '2024-01-17T11:30:00Z',
  },
  {
    id: '7',
    action: 'folder_created',
    user: { fullName: 'Pierre Durand', initials: 'PD' },
    folder: { id: 'folder1', name: 'Projets 2024' },
    createdAt: '2024-01-16T10:00:00Z',
  },
]

function getActionIcon(action: string) {
  switch (action) {
    case 'uploaded':
      return Upload
    case 'downloaded':
      return Download
    case 'renamed':
    case 'moved':
      return Edit
    case 'deleted':
      return Trash2
    case 'restored':
      return RotateCcw
    case 'shared':
      return Share2
    case 'commented':
      return MessageSquare
    case 'folder_created':
      return FolderPlus
    default:
      return File
  }
}

function getActionText(activity: any) {
  switch (activity.action) {
    case 'uploaded':
      return 'a importe'
    case 'downloaded':
      return 'a telecharge'
    case 'renamed':
      return `a renomme (${activity.details?.oldName} → ${activity.details?.newName})`
    case 'moved':
      return `a deplace vers ${activity.details?.toFolder}`
    case 'deleted':
      return 'a supprime'
    case 'restored':
      return 'a restaure'
    case 'shared':
      return 'a partage'
    case 'commented':
      return 'a commente'
    case 'folder_created':
      return 'a cree le dossier'
    default:
      return 'a modifie'
  }
}

function getActionColor(action: string) {
  switch (action) {
    case 'uploaded':
      return 'bg-green-100 text-green-600'
    case 'downloaded':
      return 'bg-blue-100 text-blue-600'
    case 'deleted':
      return 'bg-red-100 text-red-600'
    case 'restored':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
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

function ActivityPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Activite
        </h1>
        <p className="text-muted-foreground mt-1">
          Historique des actions sur vos documents
        </p>
      </div>

      {mockActivity.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">Aucune activite</p>
            <p className="text-sm text-muted-foreground mt-2">
              L'historique des actions sur vos documents apparaitra ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockActivity.map((activity) => {
            const ActionIcon = getActionIcon(activity.action)
            const actionColor = getActionColor(activity.action)
            const fileColor = activity.file
              ? fileTypeColors[activity.file.fileType as keyof typeof fileTypeColors] || fileTypeColors.other
              : '#6b7280'

            return (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{activity.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{activity.user.fullName}</span>
                        <span className="text-muted-foreground">{getActionText(activity)}</span>
                        {activity.file && (
                          <Link
                            to="/docs/file/$fileId"
                            params={{ fileId: activity.file.id }}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" style={{ color: fileColor }} />
                            {activity.file.name}
                          </Link>
                        )}
                        {activity.folder && (
                          <Link
                            to="/docs/folder/$folderId"
                            params={{ folderId: activity.folder.id }}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <FolderPlus className="h-4 w-4" />
                            {activity.folder.name}
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeDate(activity.createdAt)}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${actionColor}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
