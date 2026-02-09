// ===========================================
// NEW PROJECT PAGE
// ===========================================

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sedona/ui'
import { useCreateProject } from '@sedona/projects'
import { useOrganization, useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/projects/new')({
  component: NewProjectPage,
})

const Textarea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const projectColors = [
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#6B7280', label: 'Gris' },
]

function NewProjectPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const { user } = useAuth()
  const organizationId = organization?.id || ''
  const userId = user?.id || ''

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [status, setStatus] = useState<'active' | 'paused'>('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [error, setError] = useState<string | null>(null)

  const createProject = useCreateProject(organizationId, userId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Le nom du projet est requis')
      return
    }

    if (!organizationId || !userId) {
      setError('Session invalide. Veuillez vous reconnecter.')
      return
    }

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        budgetAmount: budget ? parseFloat(budget) : undefined,
        budgetCurrency: currency,
      })
      navigate({ to: '/projects/$projectId', params: { projectId: project.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation du projet')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouveau projet</h1>
          <p className="text-muted-foreground">Creez un nouveau projet pour organiser vos taches</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du projet</CardTitle>
          <CardDescription>Renseignez les informations de base du projet</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                placeholder="Ex: Refonte site web client"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Decrivez brievement le projet..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectColors.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: c.value }}
                          />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut initial</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'paused')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de debut</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin prevue</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Creer le projet
              </Button>
              <Link to="/projects">
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
