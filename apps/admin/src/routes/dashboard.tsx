import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  Server,
  Copy,
  Check,
  Rocket,
  Database,
  Globe,
  ChevronRight,
  AlertCircle,
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
import type { Organization, CreateOrganizationInput } from '@/lib/types'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardPage,
})

// GitHub repo URL for Vercel deploy
const GITHUB_REPO = 'vincentcdh/SedonaSuite'

function DashboardPage() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Form state
  const [formData, setFormData] = useState<CreateOrganizationInput>({
    name: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'FREE',
  })
  const [formError, setFormError] = useState('')

  // Supabase config state
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')

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
      setSelectedOrg(org)
      setShowCreateForm(false)
      setFormData({ name: '', slug: '', adminEmail: '', adminPassword: '', plan: 'FREE' })
      setStep(2) // Go to Supabase step
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  const handleSaveSupabase = () => {
    if (!selectedOrg) return
    if (!supabaseUrl || !supabaseAnonKey) {
      alert('Veuillez remplir les deux champs Supabase')
      return
    }

    updateOrganization(selectedOrg.id, {
      supabaseUrl,
      supabaseAnonKey,
      status: 'configuring',
    })
    setOrganizations(getOrganizations())
    setSelectedOrg({ ...selectedOrg, supabaseUrl, supabaseAnonKey, status: 'configuring' })
    setStep(3) // Go to deploy step
  }

  const handleDeleteOrg = (id: string) => {
    if (confirm('Supprimer cette organisation ?')) {
      deleteOrganization(id)
      setOrganizations(getOrganizations())
      if (selectedOrg?.id === id) {
        setSelectedOrg(null)
        setStep(1)
      }
    }
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

  const getVercelDeployUrl = (org: Organization) => {
    const envVars = {
      VITE_SUPABASE_URL: org.supabaseUrl || '',
      VITE_SUPABASE_ANON_KEY: org.supabaseAnonKey || '',
      ORG_ID: org.id,
      ORG_NAME: org.name,
      ORG_PLAN: org.plan,
    }

    const envString = Object.entries(envVars)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join(',')

    return `https://vercel.com/new/clone?repository-url=https://github.com/${GITHUB_REPO}&project-name=sedona-${org.slug}&env=${envString}`
  }

  const markAsDeployed = (org: Organization, vercelUrl: string) => {
    updateOrganization(org.id, {
      status: 'deployed',
      vercelUrl,
      deployedAt: new Date().toISOString(),
    })
    setOrganizations(getOrganizations())
    setSelectedOrg({ ...org, status: 'deployed', vercelUrl, deployedAt: new Date().toISOString() })
  }

  const selectOrg = (org: Organization) => {
    setSelectedOrg(org)
    setSupabaseUrl(org.supabaseUrl || '')
    setSupabaseAnonKey(org.supabaseAnonKey || '')

    if (org.status === 'deployed') {
      setStep(3)
    } else if (org.supabaseUrl) {
      setStep(3)
    } else {
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Sedona Admin Console</h1>
              <p className="text-sm text-muted-foreground">Déploiement d'instances en 1 clic</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Organizations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Organisations</h2>
              <Button size="sm" onClick={() => { setShowCreateForm(true); setStep(1); setSelectedOrg(null); }}>
                <Plus className="w-4 h-4 mr-1" />
                Nouveau
              </Button>
            </div>

            {organizations.length === 0 && !showCreateForm ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Building2 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune organisation</p>
                  <Button size="sm" className="mt-4" onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Créer la première
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {organizations.map((org) => (
                  <Card
                    key={org.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedOrg?.id === org.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => selectOrg(org)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{org.name}</span>
                        </div>
                        <Badge
                          variant={org.status === 'deployed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {org.status === 'deployed' ? 'En ligne' : org.status === 'configuring' ? 'Config...' : 'Nouveau'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Configuration Panel */}
          <div className="lg:col-span-2">
            {/* Step indicators */}
            {(showCreateForm || selectedOrg) && (
              <div className="flex items-center gap-2 mb-6">
                <StepIndicator number={1} label="Organisation" active={step === 1} completed={step > 1} />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <StepIndicator number={2} label="Base de données" active={step === 2} completed={step > 2} />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <StepIndicator number={3} label="Déploiement" active={step === 3} completed={selectedOrg?.status === 'deployed'} />
              </div>
            )}

            {/* Step 1: Create Organization */}
            {(showCreateForm || step === 1) && !selectedOrg && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Étape 1 : Créer l'organisation
                  </CardTitle>
                  <CardDescription>
                    Informations de base sur l'entreprise cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrg} className="space-y-4">
                    {formError && (
                      <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
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
                        <Label>Identifiant (slug) *</Label>
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
                        <Label>Email administrateur *</Label>
                        <Input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          placeholder="admin@societe.fr"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mot de passe *</Label>
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
                          <SelectItem value="FREE">Free - Gratuit</SelectItem>
                          <SelectItem value="PRO">Pro - 29€/mois</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise - Sur devis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit">
                        Continuer
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Supabase Config */}
            {step === 2 && selectedOrg && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Étape 2 : Base de données Supabase
                  </CardTitle>
                  <CardDescription>
                    Créez un projet Supabase gratuit et copiez les clés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions :</h4>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                      <li>
                        Allez sur{' '}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          supabase.com/dashboard
                        </a>
                      </li>
                      <li>Créez un nouveau projet (gratuit)</li>
                      <li>Dans Settings → API, copiez les clés ci-dessous</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project URL *</Label>
                      <Input
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://xxxxx.supabase.co"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Anon Key (public) *</Label>
                      <Input
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveSupabase}>
                      Continuer
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Retour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Deploy */}
            {step === 3 && selectedOrg && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Étape 3 : Déployer sur Vercel
                  </CardTitle>
                  <CardDescription>
                    {selectedOrg.status === 'deployed'
                      ? 'Instance déployée et accessible'
                      : 'Cliquez pour déployer automatiquement'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedOrg.status === 'deployed' ? (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Instance en ligne !</span>
                        </div>
                        {selectedOrg.vercelUrl && (
                          <a
                            href={selectedOrg.vercelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-700 underline text-sm mt-2 block"
                          >
                            {selectedOrg.vercelUrl}
                          </a>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-muted-foreground">Identifiants admin</Label>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-muted p-3 rounded">
                            <p className="text-muted-foreground text-xs">Email</p>
                            <p className="font-mono">{selectedOrg.adminEmail}</p>
                          </div>
                          <div className="bg-muted p-3 rounded">
                            <p className="text-muted-foreground text-xs">Mot de passe</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono flex-1">{selectedOrg.adminPassword}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedOrg.adminPassword, 'pwd')}
                              >
                                {copied === 'pwd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild>
                          <a href={selectedOrg.vercelUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ouvrir l'instance
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteOrg(selectedOrg.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-900 mb-2">Prêt à déployer</h4>
                        <p className="text-sm text-amber-800">
                          Cliquez sur le bouton ci-dessous. Vercel va automatiquement cloner et déployer l'application.
                          Une fois terminé, revenez ici et entrez l'URL.
                        </p>
                      </div>

                      <Button
                        size="lg"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={getVercelDeployUrl(selectedOrg)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Rocket className="w-5 h-5 mr-2" />
                          Déployer sur Vercel
                        </a>
                      </Button>

                      <div className="border-t pt-4 space-y-3">
                        <Label>Une fois déployé, entrez l'URL Vercel :</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://sedona-xxxxx.vercel.app"
                            id="vercel-url-input"
                          />
                          <Button
                            onClick={() => {
                              const input = document.getElementById('vercel-url-input') as HTMLInputElement
                              if (input.value) {
                                markAsDeployed(selectedOrg, input.value)
                              }
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmer
                          </Button>
                        </div>
                      </div>

                      <Button variant="outline" onClick={() => setStep(2)}>
                        Retour
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!showCreateForm && !selectedOrg && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Déployez une nouvelle instance</h3>
                  <p className="text-muted-foreground mb-6">
                    Chaque client obtient sa propre application Sedona avec sa base de données isolée
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une organisation
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StepIndicator({ number, label, active, completed }: { number: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-primary' : completed ? 'text-green-600' : 'text-muted-foreground'}`}>
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          completed
            ? 'bg-green-600 text-white'
            : active
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
        }`}
      >
        {completed ? <Check className="w-3 h-3" /> : number}
      </div>
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </div>
  )
}
