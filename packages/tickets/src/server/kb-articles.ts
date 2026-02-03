// ===========================================
// KNOWLEDGE BASE ARTICLES SERVER FUNCTIONS (PRO Feature)
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  KbArticle,
  CreateKbArticleInput,
  UpdateKbArticleInput,
  ArticleStatus,
  PaginationParams,
  PaginatedResult,
} from '../types'

// ===========================================
// GET ALL ARTICLES
// ===========================================

export async function getKbArticles(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<KbArticle>> {
  const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination

  // Get total count
  const { count, error: countError } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  if (countError) throw countError

  // Get paginated data
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('organization_id', organizationId)
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapKbArticleFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET PUBLISHED ARTICLES
// ===========================================

export async function getPublishedKbArticles(
  organizationId: string,
  pagination: PaginationParams = {}
): Promise<PaginatedResult<KbArticle>> {
  const { page = 1, pageSize = 20, sortBy = 'published_at', sortOrder = 'desc' } = pagination

  // Get total count
  const { count, error: countError } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'published')

  if (countError) throw countError

  // Get paginated data
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .order(toSnakeCase(sortBy), { ascending: sortOrder === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) throw error

  return {
    data: (data || []).map(mapKbArticleFromDb),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ===========================================
// GET ARTICLES BY CATEGORY
// ===========================================

export async function getKbArticlesByCategory(
  organizationId: string,
  categoryId: string,
  publishedOnly: boolean = true
): Promise<KbArticle[]> {
  let query = getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('kb_category_id', categoryId)
    .order('title', { ascending: true })

  if (publishedOnly) {
    query = query.eq('status', 'published')
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapKbArticleFromDb)
}

// ===========================================
// GET ARTICLE BY ID
// ===========================================

export async function getKbArticleById(id: string): Promise<KbArticle | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapKbArticleFromDb(data)
}

// ===========================================
// GET ARTICLE BY SLUG
// ===========================================

export async function getKbArticleBySlug(
  organizationId: string,
  slug: string
): Promise<KbArticle | null> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapKbArticleFromDb(data)
}

// ===========================================
// SEARCH ARTICLES
// ===========================================

export async function searchKbArticles(
  organizationId: string,
  searchTerm: string,
  publishedOnly: boolean = true,
  limit: number = 20
): Promise<KbArticle[]> {
  let query = getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('organization_id', organizationId)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (publishedOnly) {
    query = query.eq('status', 'published')
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(mapKbArticleFromDb)
}

// ===========================================
// GET POPULAR ARTICLES
// ===========================================

export async function getPopularKbArticles(
  organizationId: string,
  limit: number = 10
): Promise<KbArticle[]> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(mapKbArticleFromDb)
}

// ===========================================
// CREATE ARTICLE
// ===========================================

export async function createKbArticle(
  organizationId: string,
  input: CreateKbArticleInput,
  _userId?: string
): Promise<KbArticle> {
  // Generate slug if not provided
  const slug = input.slug || generateSlug(input.title)

  // Note: category_id is temporarily disabled until Supabase schema cache is refreshed
  // to use kb_category_id instead
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .insert({
      organization_id: organizationId,
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt,
      status: input.status || 'draft',
      published_at: input.status === 'published' ? new Date().toISOString() : null,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
    })
    .select()
    .single()

  if (error) throw error

  return mapKbArticleFromDb(data)
}

// ===========================================
// UPDATE ARTICLE
// ===========================================

export async function updateKbArticle(input: UpdateKbArticleInput): Promise<KbArticle> {
  // Get current article to check status change
  const current = await getKbArticleById(input.id)

  const updateData: any = {}

  if (input.title !== undefined) updateData.title = input.title
  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.content !== undefined) updateData.content = input.content
  if (input.excerpt !== undefined) updateData.excerpt = input.excerpt
  // Use kb_category_id for the new independent KB categories
  if (input.categoryId !== undefined) updateData.kb_category_id = input.categoryId
  if (input.status !== undefined) {
    updateData.status = input.status
    // Set published_at when publishing for the first time
    if (input.status === 'published' && current?.status !== 'published') {
      updateData.published_at = new Date().toISOString()
    }
  }
  if (input.metaTitle !== undefined) updateData.meta_title = input.metaTitle
  if (input.metaDescription !== undefined) updateData.meta_description = input.metaDescription
  if (input.tags !== undefined) updateData.tags = input.tags

  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw error

  return mapKbArticleFromDb(data)
}

// ===========================================
// DELETE ARTICLE
// ===========================================

export async function deleteKbArticle(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// PUBLISH ARTICLE
// ===========================================

export async function publishKbArticle(id: string): Promise<KbArticle> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapKbArticleFromDb(data)
}

// ===========================================
// ARCHIVE ARTICLE
// ===========================================

export async function archiveKbArticle(id: string): Promise<KbArticle> {
  const { data, error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapKbArticleFromDb(data)
}

// ===========================================
// INCREMENT VIEW COUNT
// ===========================================

export async function incrementKbArticleViewCount(id: string): Promise<void> {
  // Fetch current count and increment
  const { data: article } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('view_count')
    .eq('id', id)
    .single()

  if (article) {
    await getSupabaseClient()
      .from('tickets_kb_articles')
      .update({ view_count: (article.view_count || 0) + 1 })
      .eq('id', id)
  }
}

// ===========================================
// RECORD FEEDBACK
// ===========================================

export async function recordKbArticleFeedback(
  id: string,
  isHelpful: boolean
): Promise<void> {
  // First get the current count
  const { data: article } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .select('helpful_count, not_helpful_count')
    .eq('id', id)
    .single()

  if (!article) return

  const updateData = isHelpful
    ? { helpful_count: (article.helpful_count || 0) + 1 }
    : { not_helpful_count: (article.not_helpful_count || 0) + 1 }

  const { error } = await getSupabaseClient()
    .from('tickets_kb_articles')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// HELPERS
// ===========================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 100) // Limit length
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function mapKbArticleFromDb(data: any): KbArticle {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    title: data.title as string,
    slug: data.slug as string,
    content: data.content as string,
    excerpt: data.excerpt as string | null,
    // Use kb_category_id if available, fall back to category_id for backwards compatibility
    categoryId: (data.kb_category_id || data.category_id) as string | null,
    status: data.status as ArticleStatus,
    publishedAt: data.published_at as string | null,
    metaTitle: data.meta_title as string | null,
    metaDescription: data.meta_description as string | null,
    viewCount: data.view_count as number,
    helpfulCount: data.helpful_count as number,
    notHelpfulCount: data.not_helpful_count as number,
    tags: data.tags as string[],
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
