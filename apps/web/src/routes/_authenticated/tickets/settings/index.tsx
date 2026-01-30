// ===========================================
// TICKETS SETTINGS PAGE
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Tag,
  Folder,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Lock,
  Sparkles,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@sedona/ui'

export const Route = createFileRoute('/_authenticated/tickets/settings/')({
  component: TicketSettingsPage,
})

// Simulated PRO status
const isPro = false

// Mock categories
const mockCategories = [
  { id: '1', name: 'Support Technique', color: '#3B82F6', icon: 'wrench', ticketCount: 45 },
  { id: '2', name: 'Facturation', color: '#10B981', icon: 'credit-card', ticketCount: 28 },
  { id: '3', name: 'Commercial', color: '#F59E0B', icon: 'briefcase', ticketCount: 15 },
  { id: '4', name: 'Autre', color: '#6B7280', icon: 'folder', ticketCount: 12 },
]

// Mock tags
const mockTags = [
  { id: '1', name: 'urgent', color: '#EF4444', ticketCount: 8 },
  { id: '2', name: 'bug', color: '#F97316', ticketCount: 12 },
  { id: '3', name: 'feature', color: '#3B82F6', ticketCount: 5 },
  { id: '4', name: 'documentation', color: '#8B5CF6', ticketCount: 3 },
]

// Mock canned responses
const mockCannedResponses = [
  { id: '1', name: 'Bienvenue', shortcut: '/bienvenue', category: 'General' },
  { id: '2', name: 'Demande d\'informations', shortcut: '/info', category: 'General' },
  { id: '3', name: 'Resolution confirmee', shortcut: '/resolu', category: 'Cloture' },
  { id: '4', name: 'En attente de retour', shortcut: '/attente', category: 'Suivi' },
]

function TicketSettingsPage() {
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false)
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parametres des tickets</h1>
        <p className="text-muted-foreground">Configurez les categories, tags et reponses predefinies</p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories" className="gap-2">
            <Folder className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="canned" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Reponses
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="h-4 w-4" />
            SLA
            {!isPro && <Lock className="h-3 w-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Organisez vos tickets par categories pour un meilleur tri
                  </CardDescription>
                </div>
                <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle categorie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle categorie</DialogTitle>
                      <DialogDescription>
                        Creez une nouvelle categorie pour organiser vos tickets
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="cat-name">Nom</Label>
                        <Input id="cat-name" placeholder="Ex: Support Technique" />
                      </div>
                      <div>
                        <Label htmlFor="cat-color">Couleur</Label>
                        <div className="flex gap-2 mt-2">
                          {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewCategoryDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={() => setNewCategoryDialogOpen(false)}>
                        Creer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockCategories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.ticketCount} tickets</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Utilisez les tags pour ajouter des informations supplementaires aux tickets
                  </CardDescription>
                </div>
                <Dialog open={newTagDialogOpen} onOpenChange={setNewTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau tag</DialogTitle>
                      <DialogDescription>
                        Creez un nouveau tag pour categoriser vos tickets
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="tag-name">Nom</Label>
                        <Input id="tag-name" placeholder="Ex: urgent" />
                      </div>
                      <div>
                        <Label htmlFor="tag-color">Couleur</Label>
                        <div className="flex gap-2 mt-2">
                          {['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map(color => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewTagDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={() => setNewTagDialogOpen(false)}>
                        Creer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {mockTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <Badge style={{ backgroundColor: tag.color }}>{tag.name}</Badge>
                    <span className="text-sm text-muted-foreground">{tag.ticketCount}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Canned Responses Tab */}
        <TabsContent value="canned" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reponses predefinies</CardTitle>
                  <CardDescription>
                    Creez des modeles de reponses pour gagner du temps
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle reponse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockCannedResponses.map(response => (
                  <div
                    key={response.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{response.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Raccourci: <code className="bg-muted px-1 rounded">{response.shortcut}</code>
                      </p>
                    </div>
                    <Badge variant="outline">{response.category}</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Tab */}
        <TabsContent value="sla" className="space-y-4">
          {!isPro ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Politiques SLA - Fonctionnalite PRO</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Definissez des temps de reponse et de resolution pour garantir la qualite de votre support client.
                  </p>
                  <ul className="text-sm text-left max-w-sm mx-auto mb-6 space-y-2">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Temps de premiere reponse par priorite
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Temps de resolution par priorite
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Heures ouvrables configurables
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Alertes de depassement SLA
                    </li>
                  </ul>
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Passer a PRO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Politique SLA par defaut</CardTitle>
                <CardDescription>
                  Definissez les delais de reponse et de resolution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Premiere reponse - Urgent</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Resolution - Urgent</Label>
                    <Select defaultValue="240">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="120">2 heures</SelectItem>
                        <SelectItem value="240">4 heures</SelectItem>
                        <SelectItem value="480">8 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Heures ouvrables uniquement</Label>
                    <p className="text-sm text-muted-foreground">
                      Ne compter que les heures de travail
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
