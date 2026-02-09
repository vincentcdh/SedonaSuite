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
  Loader2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@sedona/ui'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useTags,
  useCreateTag,
  useDeleteTag,
  useCannedResponses,
  useCreateCannedResponse,
  useDeleteCannedResponse,
  type Category,
  type Tag as TagType,
  type CannedResponse,
} from '@sedona/tickets'
import { useOrganization } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated/tickets/settings/')({
  component: TicketSettingsPage,
})

// Simulated PRO status - TODO: Get from organization plan
const isPro = false

const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function TicketSettingsPage() {
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  // Category state
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Tag state
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null)

  // Canned response state
  const [newResponseDialogOpen, setNewResponseDialogOpen] = useState(false)
  const [newResponseName, setNewResponseName] = useState('')
  const [newResponseShortcut, setNewResponseShortcut] = useState('')
  const [newResponseContent, setNewResponseContent] = useState('')
  const [responseToDelete, setResponseToDelete] = useState<CannedResponse | null>(null)

  // Fetch data
  const { data: categories = [], isLoading: loadingCategories } = useCategories(organizationId)
  const { data: tags = [], isLoading: loadingTags } = useTags(organizationId)
  const { data: cannedResponses = [], isLoading: loadingResponses } = useCannedResponses(organizationId)

  // Category mutations
  const createCategory = useCreateCategory(organizationId)
  const updateCategory = useUpdateCategory(organizationId)
  const deleteCategory = useDeleteCategory(organizationId)

  // Tag mutations
  const createTag = useCreateTag(organizationId)
  const deleteTag = useDeleteTag(organizationId)

  // Canned response mutations
  const createCannedResponse = useCreateCannedResponse(organizationId)
  const deleteCannedResponse = useDeleteCannedResponse(organizationId)

  // Category handlers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        position: categories.length,
      })
      setNewCategoryName('')
      setNewCategoryColor('#3B82F6')
      setNewCategoryDialogOpen(false)
    } catch (err) {
      console.error('Error creating category:', err)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return
    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: editingCategory.name,
        color: editingCategory.color,
      })
      setEditingCategory(null)
    } catch (err) {
      console.error('Error updating category:', err)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

  // Tag handlers
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      await createTag.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor,
      })
      setNewTagName('')
      setNewTagColor('#3B82F6')
      setNewTagDialogOpen(false)
    } catch (err) {
      console.error('Error creating tag:', err)
    }
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete) return
    try {
      await deleteTag.mutateAsync(tagToDelete.id)
      setTagToDelete(null)
    } catch (err) {
      console.error('Error deleting tag:', err)
    }
  }

  // Canned response handlers
  const handleCreateCannedResponse = async () => {
    if (!newResponseName.trim() || !newResponseContent.trim()) return
    try {
      await createCannedResponse.mutateAsync({
        name: newResponseName.trim(),
        shortcut: newResponseShortcut.trim() || undefined,
        content: newResponseContent.trim(),
        isShared: true,
      })
      setNewResponseName('')
      setNewResponseShortcut('')
      setNewResponseContent('')
      setNewResponseDialogOpen(false)
    } catch (err) {
      console.error('Error creating canned response:', err)
    }
  }

  const handleDeleteCannedResponse = async () => {
    if (!responseToDelete) return
    try {
      await deleteCannedResponse.mutateAsync(responseToDelete.id)
      setResponseToDelete(null)
    } catch (err) {
      console.error('Error deleting canned response:', err)
    }
  }

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
                        <Input
                          id="cat-name"
                          placeholder="Ex: Support Technique"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Couleur</Label>
                        <div className="flex gap-2 mt-2">
                          {colorOptions.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={'w-8 h-8 rounded-full border-2 hover:border-gray-300 ' + (newCategoryColor === color ? 'border-primary' : 'border-transparent')}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewCategoryColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewCategoryDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>
                        {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Creer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune categorie</p>
                  <p className="text-sm">Creez votre premiere categorie pour organiser vos tickets</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      />
                      <span className="flex-1 font-medium">{category.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setCategoryToDelete(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                        <Input
                          id="tag-name"
                          placeholder="Ex: urgent"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Couleur</Label>
                        <div className="flex gap-2 mt-2">
                          {colorOptions.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={'w-8 h-8 rounded-full border-2 hover:border-gray-300 ' + (newTagColor === color ? 'border-primary' : 'border-transparent')}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewTagColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewTagDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateTag} disabled={createTag.isPending}>
                        {createTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Creer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTags ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun tag</p>
                  <p className="text-sm">Creez votre premier tag pour categoriser vos tickets</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <Badge style={{ backgroundColor: tag.color || '#6B7280' }}>{tag.name}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => setTagToDelete(tag)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                <Dialog open={newResponseDialogOpen} onOpenChange={setNewResponseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle reponse
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nouvelle reponse predefinie</DialogTitle>
                      <DialogDescription>
                        Creez un modele de reponse reutilisable
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="response-name">Nom</Label>
                          <Input
                            id="response-name"
                            placeholder="Ex: Bienvenue"
                            value={newResponseName}
                            onChange={(e) => setNewResponseName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="response-shortcut">Raccourci (optionnel)</Label>
                          <Input
                            id="response-shortcut"
                            placeholder="Ex: /bienvenue"
                            value={newResponseShortcut}
                            onChange={(e) => setNewResponseShortcut(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="response-content">Contenu</Label>
                        <Textarea
                          id="response-content"
                          placeholder="Bonjour, merci de nous avoir contacte..."
                          value={newResponseContent}
                          onChange={(e) => setNewResponseContent(e.target.value)}
                          rows={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewResponseDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateCannedResponse} disabled={createCannedResponse.isPending}>
                        {createCannedResponse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Creer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingResponses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : cannedResponses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune reponse predefinie</p>
                  <p className="text-sm">Creez des modeles de reponses pour gagner du temps</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cannedResponses.map(response => (
                    <div
                      key={response.id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{response.name}</p>
                        {response.shortcut && (
                          <p className="text-sm text-muted-foreground">
                            Raccourci: <code className="bg-muted px-1 rounded">{response.shortcut}</code>
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setResponseToDelete(response)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la categorie</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-cat-name">Nom</Label>
                <Input
                  id="edit-cat-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Couleur</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={'w-8 h-8 rounded-full border-2 hover:border-gray-300 ' + (editingCategory.color === color ? 'border-primary' : 'border-transparent')}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateCategory} disabled={updateCategory.isPending}>
              {updateCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la categorie</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer la categorie "{categoryToDelete?.name}" ?
              Les tickets associes ne seront pas supprimes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tag Confirmation */}
      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le tag</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer le tag "{tagToDelete?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Canned Response Confirmation */}
      <AlertDialog open={!!responseToDelete} onOpenChange={(open) => !open && setResponseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la reponse</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer la reponse "{responseToDelete?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCannedResponse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCannedResponse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
