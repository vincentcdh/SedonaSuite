// ===========================================
// DOCS SETTINGS PAGE
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import {
  Settings,
  HardDrive,
  Lock,
  Clock,
  FileSearch,
  Cloud,
  Sparkles,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Switch,
  Badge,
  Separator,
  Progress,
} from '@sedona/ui'
import { formatFileSize } from '@sedona/docs/utils'
import { useOrganization } from '@/lib/auth'
import { useIsModulePaid, useModuleLimit } from '@sedona/billing'
import { useStorageUsage } from '@sedona/docs'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/docs/settings')({
  component: DocsSettingsPage,
})

function DocsSettingsPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Module-based billing: check if docs module is paid
  const { isPaid: isPro } = useIsModulePaid(organizationId, 'docs')
  const { limit: storageLimitBytes, isUnlimited: storageUnlimited } = useModuleLimit(organizationId, 'docs', 'storage')
  const { limit: maxFileSizeBytes } = useModuleLimit(organizationId, 'docs', 'file_size')
  const { limit: maxFolders, isUnlimited: foldersUnlimited } = useModuleLimit(organizationId, 'docs', 'folders')

  // Fetch storage usage from Supabase
  const { data: storageData } = useStorageUsage(organizationId)
  const defaultLimit = 1024 * 1024 * 1024 // 1GB default
  const storageUsage = {
    usedBytes: storageData?.usedBytes || 0,
    limitBytes: storageData?.limitBytes || storageLimitBytes || defaultLimit,
    fileCount: storageData?.fileCount || 0,
    folderCount: storageData?.folderCount || 0,
  }

  const storagePercentage = Math.round(
    (storageUsage.usedBytes / storageUsage.limitBytes) * 100
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Parametres Documents</h1>
        <p className="text-muted-foreground">
          Configurez les options de stockage et de gestion des documents
        </p>
      </div>

      {/* Storage overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Stockage
          </CardTitle>
          <CardDescription>
            Apercu de l'utilisation de votre espace de stockage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Espace utilise</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(storageUsage.usedBytes)} / {formatFileSize(storageUsage.limitBytes)}
              </span>
            </div>
            <Progress
              value={storagePercentage}
              className={storagePercentage >= 90 ? 'bg-red-100' : storagePercentage >= 70 ? 'bg-yellow-100' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{storageUsage.fileCount}</p>
              <p className="text-sm text-muted-foreground">Fichiers</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{storageUsage.folderCount}</p>
              <p className="text-sm text-muted-foreground">Dossiers</p>
            </div>
          </div>

          {!isPro && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">Besoin de plus d'espace ?</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Passez a PRO pour obtenir 50 GB de stockage, le versioning et bien plus.
              </p>
              <Button>
                Passer a PRO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Limites
          </CardTitle>
          <CardDescription>
            Limites de fichiers pour votre plan actuel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Taille max par fichier</p>
              <p className="text-sm text-muted-foreground">
                Taille maximale autorisee pour un seul fichier
              </p>
            </div>
            <Badge variant="secondary">
              {formatFileSize(maxFileSizeBytes || 10 * 1024 * 1024)}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nombre de dossiers</p>
              <p className="text-sm text-muted-foreground">
                Nombre maximum de dossiers
              </p>
            </div>
            <Badge variant="secondary">
              {foldersUnlimited ? 'Illimite' : maxFolders || 10}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Version retention (PRO) */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des versions
            {!isPro && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configurez la retention de l'historique des versions
          </CardDescription>
        </CardHeader>
        <CardContent className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activer le versioning</p>
                <p className="text-sm text-muted-foreground">
                  Conserver l'historique des modifications de fichiers
                </p>
              </div>
              <Switch disabled={!isPro} defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Duree de retention (jours)</Label>
              <Input
                id="retentionDays"
                type="number"
                defaultValue={90}
                className="w-32"
                disabled={!isPro}
              />
              <p className="text-sm text-muted-foreground">
                Nombre de jours pendant lesquels les anciennes versions sont conservees
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR (PRO) */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Recherche dans le contenu
            {!isPro && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Extraction automatique du texte pour la recherche
          </CardDescription>
        </CardHeader>
        <CardContent className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Activer l'OCR automatique</p>
              <p className="text-sm text-muted-foreground">
                Extraire le texte des PDF et images pour permettre la recherche dans le contenu
              </p>
            </div>
            <Switch disabled={!isPro} />
          </div>
        </CardContent>
      </Card>

      {/* External integrations (PRO) */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Integrations externes
            {!isPro && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Connectez vos services de stockage cloud
          </CardDescription>
        </CardHeader>
        <CardContent className={!isPro ? 'opacity-50 pointer-events-none' : ''}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-sm text-muted-foreground">
                    Importez des fichiers depuis Google Drive
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled={!isPro}>
                Connecter
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#0061FF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 9.87l-2.816 2.816a.5.5 0 01-.707 0l-2.371-2.37-2.371 2.37a.5.5 0 01-.707 0L6.106 9.87a.5.5 0 010-.707l2.816-2.816a.5.5 0 01.707 0L12 8.718l2.371-2.371a.5.5 0 01.707 0l2.816 2.816a.5.5 0 010 .707z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Dropbox</p>
                  <p className="text-sm text-muted-foreground">
                    Importez des fichiers depuis Dropbox
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled={!isPro}>
                Connecter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  )
}
