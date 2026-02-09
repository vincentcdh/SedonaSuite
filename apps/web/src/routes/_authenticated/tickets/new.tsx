// ===========================================
// NEW TICKET PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@sedona/ui'
import { useCreateTicket, useActiveCategories, useOrganizationMembers, type TicketPriority } from '@sedona/tickets'
import { useOrganization, useSession } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/tickets/new')({
  component: NewTicketPage,
})

function NewTicketPage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const { data: session } = useSession()
  const organizationId = organization?.id || ''

  // Fetch categories from Supabase
  const { data: categories, isLoading: categoriesLoading } = useActiveCategories(organizationId)

  // Fetch organization members for assignment
  const { data: members, isLoading: membersLoading } = useOrganizationMembers(organizationId)

  // Create ticket mutation
  const createTicketMutation = useCreateTicket(organizationId)

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal' as TicketPriority,
    categoryId: '',
    assignedTo: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!organization?.id) return

    try {
      await createTicketMutation.mutateAsync({
        input: {
          subject: formData.subject,
          description: formData.description || undefined,
          priority: formData.priority,
          categoryId: formData.categoryId || undefined,
          assignedTo: formData.assignedTo || undefined,
          requesterName: formData.requesterName || undefined,
          requesterEmail: formData.requesterEmail || undefined,
          requesterPhone: formData.requesterPhone || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        },
        userId: session?.user?.id,
      })

      // Navigate to tickets list
      navigate({ to: '/tickets' })
    } catch (error) {
      console.error('Failed to create ticket:', error)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouveau ticket</h1>
          <p className="text-muted-foreground">Creer un nouveau ticket de support</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Decrivez brievement le probleme"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Fournissez plus de details sur le probleme..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations du demandeur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requesterName">Nom</Label>
                    <Input
                      id="requesterName"
                      value={formData.requesterName}
                      onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                      placeholder="Nom du demandeur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requesterEmail">Email</Label>
                    <Input
                      id="requesterEmail"
                      type="email"
                      value={formData.requesterEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="requesterPhone">Telephone</Label>
                  <Input
                    id="requesterPhone"
                    type="tel"
                    value={formData.requesterPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, requesterPhone: e.target.value }))}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="priority">Priorite</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TicketPriority }))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <Badge className="bg-gray-100 text-gray-700">Basse</Badge>
                      </SelectItem>
                      <SelectItem value="normal">
                        <Badge className="bg-blue-100 text-blue-700">Normale</Badge>
                      </SelectItem>
                      <SelectItem value="high">
                        <Badge className="bg-orange-100 text-orange-700">Haute</Badge>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <Badge className="bg-red-100 text-red-700">Urgente</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categorie</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={categoriesLoading ? 'Chargement...' : 'Selectionner une categorie'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignedTo">Assigner a</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                    disabled={membersLoading}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder={membersLoading ? 'Chargement...' : 'Selectionner un agent'} />
                    </SelectTrigger>
                    <SelectContent>
                      {(members || []).map(member => {
                        const fullName = member.user
                          ? [member.user.firstName, member.user.lastName].filter(Boolean).join(' ') || member.user.email
                          : 'Membre inconnu'
                        return (
                          <SelectItem key={member.id} value={member.userId}>
                            {fullName}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Ajouter un tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Ajouter
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} &times;
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={createTicketMutation.isPending || !formData.subject}>
              {createTicketMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {createTicketMutation.isPending ? 'Creation...' : 'Creer le ticket'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
