// ===========================================
// DATA PAGE (RGPD)
// ===========================================

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Badge,
} from '@sedona/ui'
import { useSession } from '@/lib/auth'
import {
  Download,
  FileJson,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileArchive,
  Shield,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/data')({
  component: DataSettingsPage,
})

interface ExportRequest {
  id: string
  requestedAt: string
  status: 'pending' | 'processing' | 'ready' | 'expired'
  expiresAt?: string
  downloadUrl?: string
}

// Mock data
const mockExports: ExportRequest[] = [
  {
    id: '1',
    requestedAt: '2024-01-15T10:30:00',
    status: 'ready',
    expiresAt: '2024-01-22T10:30:00',
  },
  {
    id: '2',
    requestedAt: '2024-01-10T14:00:00',
    status: 'expired',
  },
]

function DataSettingsPage() {
  const { data: session } = useSession()
  const [isExporting, setIsExporting] = useState(false)
  const [exportRequested, setExportRequested] = useState(false)
  const [exports] = useState<ExportRequest[]>(mockExports)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')

  const userEmail = session?.user?.email || ''

  const handleRequestExport = async () => {
    setIsExporting(true)
    try {
      // TODO: Implement export request API call
      console.log('Requesting data export')
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setExportRequested(true)
    } catch (error) {
      console.error('Failed to request export:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            En cours
          </Badge>
        )
      case 'ready':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Pret
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Expire
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* RGPD Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vos donnees personnelles
          </CardTitle>
          <CardDescription>
            Conformement au RGPD, vous avez le droit d'acceder a vos donnees et
            de les supprimer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">
              Sedona.AI traite vos donnees personnelles de maniere securisee et
              conforme au Reglement General sur la Protection des Donnees
              (RGPD). Vous pouvez a tout moment exercer vos droits d'acces, de
              rectification et de suppression.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter mes donnees
          </CardTitle>
          <CardDescription>
            Telechargez une copie de toutes vos donnees au format JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {exportRequested && (
            <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Demande d'export enregistree. Vous recevrez un email quand vos
              donnees seront pretes.
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <FileJson className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Export complet</p>
                <p className="text-sm text-muted-foreground">
                  Contacts, factures, projets, documents et parametres
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRequestExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Demande en cours...' : 'Demander un export'}
            </Button>
          </div>

          {exports.length > 0 && (
            <>
              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Exports precedents</h4>
                {exports.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileArchive className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Export du {formatDate(exp.requestedAt)}
                        </p>
                        {exp.expiresAt && exp.status === 'ready' && (
                          <p className="text-xs text-muted-foreground">
                            Expire le {formatDate(exp.expiresAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(exp.status)}
                      {exp.status === 'ready' && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            Les exports sont disponibles pendant 7 jours apres leur generation.
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer mon compte
          </CardTitle>
          <CardDescription>
            Supprimez definitivement votre compte et toutes vos donnees
            personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  Attention : cette action est irreversible
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Votre profil et parametres seront supprimes</li>
                  <li>Votre acces a l'organisation sera revoque</li>
                  <li>
                    Vos donnees personnelles seront supprimees sous 30 jours
                  </li>
                  <li>
                    Les donnees partagees avec l'organisation seront conservees
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
          ) : (
            <div className="space-y-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <p className="text-sm font-medium">
                Pour confirmer, saisissez votre adresse email :
              </p>
              <div className="space-y-2">
                <Label htmlFor="deleteEmail">
                  Tapez{' '}
                  <span className="font-mono font-bold">{userEmail}</span>
                </Label>
                <Input
                  id="deleteEmail"
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder={userEmail}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmEmail('')
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmEmail !== userEmail}
                >
                  Supprimer definitivement
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
