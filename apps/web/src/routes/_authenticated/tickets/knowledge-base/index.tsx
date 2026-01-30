// ===========================================
// KNOWLEDGE BASE PAGE (PRO FEATURE)
// ===========================================

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
} from '@sedona/ui'
import { ProFeatureMask } from '@/components/pro'

export const Route = createFileRoute('/_authenticated/tickets/knowledge-base/')({
  component: KnowledgeBasePage,
})

// Mock data
const mockCategories = [
  { id: '1', name: 'Guide de demarrage', articlesCount: 8, icon: '🚀' },
  { id: '2', name: 'FAQ', articlesCount: 15, icon: '❓' },
  { id: '3', name: 'Tutoriels', articlesCount: 12, icon: '📚' },
  { id: '4', name: 'Depannage', articlesCount: 6, icon: '🔧' },
]

const mockArticles = [
  {
    id: '1',
    title: 'Comment creer un compte',
    category: 'Guide de demarrage',
    views: 1250,
    helpful: 48,
    updatedAt: '2024-02-10',
  },
  {
    id: '2',
    title: 'Reinitialiser son mot de passe',
    category: 'FAQ',
    views: 890,
    helpful: 32,
    updatedAt: '2024-02-08',
  },
  {
    id: '3',
    title: 'Configurer les notifications',
    category: 'Tutoriels',
    views: 654,
    helpful: 28,
    updatedAt: '2024-02-05',
  },
]

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un article..." className="pl-10" />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockCategories.map((category) => (
          <Card key={category.id} className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.articlesCount} articles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
          <div className="divide-y">
            {mockArticles.map((article) => (
              <div key={article.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <Badge variant="secondary">{article.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} vues
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.helpful}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.updatedAt}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
