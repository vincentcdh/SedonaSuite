// ===========================================
// KNOWLEDGE BASE PAGE (PRO FEATURE)
// ===========================================

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  BookOpen,
  Plus,
  Search,
  FolderOpen,
  FileText,
  Eye,
  ThumbsUp,
  Clock,
  Loader2,
  Trash2,
  Send,
  Archive,
  PlusCircle,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'
import { useOrganization, useSession } from '@/lib/auth'
import {
  useKbArticles,
  useKbCategories,
  useCreateKbCategory,
  useCreateKbArticle,
  useDeleteKbArticle,
  usePublishKbArticle,
  useArchiveKbArticle,
  type KbArticle,
} from '@sedona/tickets'

export const Route = createFileRoute('/_authenticated/tickets/knowledge-base/')({
  component: KnowledgeBasePage,
})

// PRO features to display in upgrade card
const kbFeatures = [
  { icon: BookOpen, label: 'Articles illimites' },
  { icon: FolderOpen, label: 'Categories personnalisees' },
  { icon: Search, label: 'Recherche intelligente' },
  { icon: Eye, label: 'Statistiques de consultation' },
]

function KnowledgeBasePage() {
  return (
    <ProFeatureMask
      requiredPlan="PRO"
      title="Base de connaissances"
      description="La base de connaissances vous permet de creer des articles d'aide pour reduire le volume de tickets et ameliorer la satisfaction client."
      features={kbFeatures}
    >
      <KnowledgeBaseContent />
    </ProFeatureMask>
  )
}

// ===========================================
// ACTUAL KNOWLEDGE BASE CONTENT
// ===========================================

function KnowledgeBaseContent() {
  const { organization } = useOrganization()
  const { data: session } = useSession()
  const organizationId = organization?.id || ''
  const userId = session?.user?.id

  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<KbArticle | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
  })

  // Fetch articles
  const { data: articlesData, isLoading: loadingArticles, refetch: refetchArticles } = useKbArticles(organizationId, {
    page: 1,
    pageSize: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  })
  const articles = articlesData?.data || []

  // Fetch KB categories (independent from ticket categories)
  const { data: categories = [], isLoading: loadingCategories } = useKbCategories(organizationId)

  // Mutations
  const createArticle = useCreateKbArticle(organizationId)
  const deleteArticle = useDeleteKbArticle(organizationId)
  const publishArticle = usePublishKbArticle()
  const archiveArticle = useArchiveKbArticle()
  const createCategory = useCreateKbCategory(organizationId)

  const isLoading = loadingArticles || loadingCategories

  // Calculate articles per category
  const categoriesWithCounts = categories.map(cat => {
    const articlesCount = articles.filter(a => a.categoryId === cat.id).length
    return {
      ...cat,
      articlesCount,
    }
  })

  // Filter articles based on search
  const filteredArticles = searchQuery
    ? articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : articles

  // Get recent articles (last 10)
  const recentArticles = filteredArticles.slice(0, 10)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      categoryId: '',
      status: 'draft',
    })
  }

  const handleCreateArticle = async () => {
    if (!formData.title || !formData.content) return

    console.log('Creating article with:', { formData, userId, organizationId })

    try {
      const result = await createArticle.mutateAsync({
        input: {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || undefined,
          categoryId: formData.categoryId || undefined,
          status: formData.status,
        },
        userId,
      })
      console.log('Article created:', result)
      resetForm()
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Error creating article:', err)
      alert(`Erreur creation article: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    }
  }

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return

    try {
      await deleteArticle.mutateAsync(articleToDelete.id)
      setArticleToDelete(null)
    } catch (err) {
      console.error('Error deleting article:', err)
      alert(`Erreur suppression: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    }
  }

  const handlePublishArticle = async (articleId: string) => {
    try {
      await publishArticle.mutateAsync(articleId)
      // Force refetch to update the list
      refetchArticles()
    } catch (err) {
      console.error('Error publishing article:', err)
    }
  }

  const handleArchiveArticle = async (articleId: string) => {
    try {
      await archiveArticle.mutateAsync(articleId)
      // Force refetch to update the list
      refetchArticles()
    } catch (err) {
      console.error('Error archiving article:', err)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    console.log('handleCreateCategory called', { organizationId, newCategoryName })

    try {
      const newCategory = await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        color: '#6B7280',
      })
      console.log('Category created successfully:', newCategory)
      setFormData(prev => ({ ...prev, categoryId: newCategory.id }))
      setNewCategoryName('')
      setIsAddingCategory(false)
    } catch (err) {
      console.error('Error creating category:', err)
      alert(`Erreur: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Base de connaissances
          </h1>
          <p className="text-muted-foreground mt-1">
            Creez et gerez vos articles d'aide pour vos clients
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvel article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Resume</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Court resume de l'article"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenu de l'article..."
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categorie</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger id="category" className="flex-1">
                        <SelectValue placeholder="Selectionner une categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: cat.color || '#6B7280' }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" type="button">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Nouvelle categorie</DialogTitle>
                          <DialogDescription>
                            Creez une nouvelle categorie pour organiser vos articles
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="category-name">Nom de la categorie</Label>
                            <Input
                              id="category-name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Ex: Guide d'utilisation"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleCreateCategory()
                                }
                              }}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNewCategoryName('')
                                setIsAddingCategory(false)
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={handleCreateCategory}
                              disabled={createCategory.isPending || !newCategoryName.trim()}
                            >
                              {createCategory.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Creer
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateArticle}
                  disabled={createArticle.isPending || !formData.title || !formData.content}
                >
                  {createArticle.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Creer l'article
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un article..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      {categoriesWithCounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriesWithCounts.map((category) => (
            <Card key={category.id} className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  >
                    <FolderOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.articlesCount} article{category.articlesCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Articles recents
          </CardTitle>
          <CardDescription>
            Les derniers articles publies ou mis a jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentArticles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun article pour le moment</p>
              <p className="text-sm mt-1">Creez votre premier article pour commencer</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentArticles.map((article) => {
                const category = categories.find(c => c.id === article.categoryId)
                return (
                  <div key={article.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                          {category && (
                            <Badge variant="secondary">{category.name}</Badge>
                          )}
                          <Badge variant={article.status === 'published' ? 'default' : 'outline'}>
                            {article.status === 'published' ? 'Publie' : article.status === 'draft' ? 'Brouillon' : 'Archive'}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.viewCount} vue{article.viewCount > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {article.helpfulCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(article.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {article.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublishArticle(article.id)}
                            disabled={publishArticle.isPending}
                          >
                            {publishArticle.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            <span className="ml-1">Publier</span>
                          </Button>
                        )}
                        {article.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveArticle(article.id)}
                            disabled={archiveArticle.isPending}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setArticleToDelete(article)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!articleToDelete} onOpenChange={(open) => !open && setArticleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer l'article "{articleToDelete?.title}" ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArticle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
