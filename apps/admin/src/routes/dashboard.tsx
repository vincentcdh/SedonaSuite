import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Download,
  Trash2,
  Play,
  Square,
  ExternalLink,
  LogOut,
  Server,
  Copy,
  Check,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { isAuthenticated, logout } from '@/lib/auth'
import { getOrganizations, createOrganization, deleteOrganization, updateOrganization } from '@/lib/storage'
import { generateDockerConfig, generateDeployScript } from '@/lib/generator'
import type { Organization, CreateOrganizationInput } from '@/lib/types'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateOrganizationInput>({
    name: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'FREE',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setOrganizations(getOrganizations())
  }, [])

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    try {
      const org = createOrganization(formData)
      setOrganizations(getOrganizations())
      setShowCreateForm(false)
      setFormData({ name: '', slug: '', adminEmail: '', adminPassword: '', plan: 'FREE' })
      setSelectedOrg(org)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  const handleDeleteOrg = (id: string) => {
    if (confirm('Supprimer cette organisation ? Les fichiers de déploiement devront être supprimés manuellement.')) {
      deleteOrganization(id)
      setOrganizations(getOrganizations())
      if (selectedOrg?.id === id) setSelectedOrg(null)
    }
  }

  const handleDownloadConfig = (org: Organization) => {
    const config = generateDockerConfig(org)

    // Create a zip-like download with multiple files
    downloadFile(`docker-compose-${org.slug}.yml`, config.composeFile)
    setTimeout(() => downloadFile(`.env.${org.slug}`, config.envFile), 100)
    setTimeout(() => downloadFile(`init-${org.slug}.sql`, config.initSql), 200)
    setTimeout(() => downloadFile(`deploy-${org.slug}.sh`, generateDeployScript(org)), 300)

    // Mark as deployed
    updateOrganization(org.id, { status: 'deployed', deployedAt: new Date().toISOString() })
    setOrganizations(getOrganizations())
  }

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Sedona Admin Console</h1>
              <p className="text-sm text-muted-foreground">Gestion des instances</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organizations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Organisations ({organizations.length})</h2>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle organisation
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Créer une nouvelle organisation</CardTitle>
                  <CardDescription>
                    Une nouvelle instance sera créée avec sa propre base de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrg} className="space-y-4">
                    {formError && (
                      <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom de l'entreprise *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              name: e.target.value,
                              slug: generateSlug(e.target.value),
                            })
                          }}
                          placeholder="Ma Société SAS"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug (identifiant unique) *</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="ma-societe"
                          pattern="[a-z0-9-]+"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email admin *</Label>
                        <Input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          placeholder="admin@societe.fr"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mot de passe admin *</Label>
                        <Input
                          type="text"
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          placeholder="MotDePasse123!"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Plan</Label>
                      <Select
                        value={formData.plan}
                        onValueChange={(value: 'FREE' | 'PRO' | 'ENTERPRISE') =>
                          setFormData({ ...formData, plan: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">Free</SelectItem>
                          <SelectItem value="PRO">Pro</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit">Créer l'organisation</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Organizations Grid */}
            {organizations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune organisation créée</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Créez votre première organisation pour commencer
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {organizations.map((org) => (
                  <Card
                    key={org.id}
                    className={`cursor-pointer transition-colors ${
                      selectedOrg?.id === org.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedOrg(org)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{org.name}</h3>
                            <p className="text-sm text-muted-foreground">{org.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={org.plan === 'ENTERPRISE' ? 'default' : 'secondary'}
                          >
                            {org.plan}
                          </Badge>
                          <Badge
                            variant={
                              org.status === 'deployed'
                                ? 'default'
                                : org.status === 'stopped'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {org.status === 'deployed' ? 'Déployé' : org.status === 'stopped' ? 'Arrêté' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadConfig(org)
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Config Docker
                        </Button>
                        {org.status === 'deployed' && (
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={`http://localhost:${org.port}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Ouvrir
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteOrg(org.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Org Details */}
          <div>
            {selectedOrg ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>{selectedOrg.name}</CardTitle>
                  <CardDescription>Détails de l'organisation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                        {selectedOrg.id}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(selectedOrg.id, 'id')}
                      >
                        {copied === 'id' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Slug</Label>
                    <p className="font-mono">{selectedOrg.slug}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Port</Label>
                    <p className="font-mono">{selectedOrg.port}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Admin Email</Label>
                    <p>{selectedOrg.adminEmail}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Admin Password</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {selectedOrg.adminPassword}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(selectedOrg.adminPassword, 'pwd')}
                      >
                        {copied === 'pwd' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Plan</Label>
                    <p>{selectedOrg.plan}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Créé le</Label>
                    <p>{new Date(selectedOrg.createdAt).toLocaleString('fr-FR')}</p>
                  </div>

                  {selectedOrg.deployedAt && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Déployé le</Label>
                      <p>{new Date(selectedOrg.deployedAt).toLocaleString('fr-FR')}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label className="text-xs text-muted-foreground">Commandes Docker</Label>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded flex-1 truncate">
                          docker-compose up -d
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`cd deployments/${selectedOrg.slug} && docker-compose up -d`, 'start')}
                        >
                          {copied === 'start' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded flex-1 truncate">
                          docker-compose down
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`cd deployments/${selectedOrg.slug} && docker-compose down`, 'stop')}
                        >
                          {copied === 'stop' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Sélectionnez une organisation pour voir les détails
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
