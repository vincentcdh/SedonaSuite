import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Mail,
  Calendar,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Separator,
  toast,
} from '@sedona/ui'
import { getSupabaseClient } from '@sedona/database'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminConsolePage,
})

interface Organization {
  id: string
  name: string
  slug: string
  industry: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
  onboarding_completed: boolean
  member_count: number
  owner_email: string | null
  owner_name: string | null
}

interface AdminStats {
  total_organizations: number
  total_users: number
  total_employees: number
  organizations_this_month: number
}

function AdminConsolePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase.rpc('admin_list_organizations')

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les organisations',
          variant: 'destructive',
        })
      } else {
        setOrganizations(orgsData || [])
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc('admin_get_stats')

      if (statsError) {
        console.error('Error fetching stats:', statsError)
      } else {
        setStats(statsData)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteOrganization = async () => {
    if (!deleteOrgId) return

    setIsDeleting(true)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.rpc('admin_delete_organization', {
        p_org_id: deleteOrgId,
      })

      if (error) {
        throw new Error(error.message)
      }

      const result = data as { success: boolean; error?: string }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      toast({
        title: 'Succes',
        description: 'Organisation supprimee avec succes',
      })

      // Refresh data
      fetchData()
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de la suppression',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteOrgId(null)
    }
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.owner_email && org.owner_email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Console Admin</h1>
          <p className="text-muted-foreground">
            Gerez toutes les organisations de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle organisation
              </Button>
            </DialogTrigger>
            <CreateOrganizationDialog
              onSuccess={() => {
                setIsCreateDialogOpen(false)
                fetchData()
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_organizations}</p>
                  <p className="text-sm text-muted-foreground">Organisations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <UserPlus className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_employees}</p>
                  <p className="text-sm text-muted-foreground">Employes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.organizations_this_month}</p>
                  <p className="text-sm text-muted-foreground">Ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, slug ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organisations ({filteredOrganizations.length})</CardTitle>
          <CardDescription>Liste de toutes les organisations enregistrees</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Aucune organisation ne correspond a votre recherche'
                  : 'Aucune organisation enregistree'}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredOrganizations.map((org, index) => (
                <div key={org.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{org.name}</p>
                          {org.industry && (
                            <Badge variant="secondary" className="shrink-0">
                              {org.industry}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="truncate">/{org.slug}</span>
                          {org.owner_email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {org.owner_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden md:block">
                        <p className="text-sm">
                          {org.member_count} membre{org.member_count > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cree le {formatDate(org.created_at)}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(org.id)
                              toast({ title: 'ID copie dans le presse-papiers' })
                            }}
                          >
                            Copier l'ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteOrgId(org.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrgId} onOpenChange={() => setDeleteOrgId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Supprimer l'organisation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Toutes les donnees de l'organisation seront
              supprimees, y compris les employes, les factures, les projets, etc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ===========================================
// CREATE ORGANIZATION DIALOG
// ===========================================

interface CreateOrganizationDialogProps {
  onSuccess: () => void
  onCancel: () => void
}

function CreateOrganizationDialog({ onSuccess, onCancel }: CreateOrganizationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    industry: '',
  })
  const [error, setError] = useState<string | null>(null)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.ownerEmail,
        password: formData.ownerPassword,
        email_confirm: true,
        user_metadata: {
          name: formData.ownerName,
        },
      })

      if (authError) {
        // If admin API is not available, try signUp
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.ownerEmail,
          password: formData.ownerPassword,
          options: {
            data: { name: formData.ownerName },
          },
        })

        if (signUpError) {
          throw new Error(signUpError.message)
        }

        if (!signUpData.user) {
          throw new Error("Erreur lors de la creation de l'utilisateur")
        }

        // Now create the organization with the new user
        // Sign in as the new user temporarily to create the org
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.ownerEmail,
          password: formData.ownerPassword,
        })

        if (signInError) {
          throw new Error("L'utilisateur a ete cree mais la connexion a echoue. L'utilisateur doit se connecter et creer l'organisation.")
        }

        // Create organization
        const { data: orgData, error: orgError } = await supabase.rpc('setup_organization', {
          p_org_name: formData.name,
          p_org_slug: formData.slug,
          p_admin_name: formData.ownerName,
          p_admin_email: formData.ownerEmail,
          p_user_id: signUpData.user.id,
        })

        if (orgError) {
          throw new Error(orgError.message)
        }

        const result = orgData as { success: boolean; error?: string }
        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la creation de l'organisation")
        }

        // Sign out the new user
        await supabase.auth.signOut()

        // Reload the page to restore the admin session
        window.location.reload()
        return
      }

      // If admin API worked, create org directly via RPC
      if (authData?.user) {
        const { data: orgData, error: orgError } = await supabase.rpc('admin_create_organization', {
          p_name: formData.name,
          p_slug: formData.slug,
          p_owner_email: formData.ownerEmail,
          p_owner_name: formData.ownerName,
          p_owner_password: formData.ownerPassword,
          p_industry: formData.industry || null,
        })

        if (orgError) {
          throw new Error(orgError.message)
        }

        const result = orgData as { success: boolean; error?: string }
        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la creation de l'organisation")
        }
      }

      toast({
        title: 'Succes',
        description: 'Organisation creee avec succes',
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Nouvelle organisation</DialogTitle>
          <DialogDescription>
            Creez une nouvelle organisation avec son administrateur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'organisation *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ma Societe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="ma-societe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Secteur d'activite</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
              placeholder="Technologie, Commerce, etc."
            />
          </div>

          <Separator />

          <p className="text-sm font-medium">Compte administrateur</p>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Nom complet *</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
              placeholder="Jean Dupont"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Email *</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
              placeholder="admin@societe.fr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Mot de passe *</Label>
            <Input
              id="ownerPassword"
              type="password"
              value={formData.ownerPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerPassword: e.target.value }))}
              placeholder="Min. 8 caracteres"
              minLength={8}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creation...
              </>
            ) : (
              'Creer l\'organisation'
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
