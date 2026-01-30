// ===========================================
// KNOWLEDGE BASE ARTICLES HOOKS (PRO Feature)
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  KbArticle,
  CreateKbArticleInput,
  UpdateKbArticleInput,
  PaginationParams,
} from '../types'
import {
  getKbArticles,
  getPublishedKbArticles,
  getKbArticlesByCategory,
  getKbArticleById,
  getKbArticleBySlug,
  searchKbArticles,
  getPopularKbArticles,
  createKbArticle,
  updateKbArticle,
  deleteKbArticle,
  publishKbArticle,
  archiveKbArticle,
  incrementKbArticleViewCount,
  recordKbArticleFeedback,
} from '../server'

// ===========================================
// QUERY KEYS
// ===========================================

export const kbArticleKeys = {
  all: ['kb-articles'] as const,
  lists: () => [...kbArticleKeys.all, 'list'] as const,
  list: (organizationId: string, pagination?: PaginationParams) =>
    [...kbArticleKeys.lists(), organizationId, pagination] as const,
  published: (organizationId: string, pagination?: PaginationParams) =>
    [...kbArticleKeys.all, 'published', organizationId, pagination] as const,
  byCategory: (organizationId: string, categoryId: string, publishedOnly?: boolean) =>
    [...kbArticleKeys.all, 'category', organizationId, categoryId, publishedOnly] as const,
  search: (organizationId: string, searchTerm: string, publishedOnly?: boolean) =>
    [...kbArticleKeys.all, 'search', organizationId, searchTerm, publishedOnly] as const,
  popular: (organizationId: string, limit?: number) =>
    [...kbArticleKeys.all, 'popular', organizationId, limit] as const,
  details: () => [...kbArticleKeys.all, 'detail'] as const,
  detail: (id: string) => [...kbArticleKeys.details(), id] as const,
  bySlug: (organizationId: string, slug: string) =>
    [...kbArticleKeys.all, 'slug', organizationId, slug] as const,
}

// ===========================================
// USE KB ARTICLES
// ===========================================

export function useKbArticles(organizationId: string, pagination: PaginationParams = {}) {
  return useQuery({
    queryKey: kbArticleKeys.list(organizationId, pagination),
    queryFn: () => getKbArticles(organizationId, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE PUBLISHED KB ARTICLES
// ===========================================

export function usePublishedKbArticles(organizationId: string, pagination: PaginationParams = {}) {
  return useQuery({
    queryKey: kbArticleKeys.published(organizationId, pagination),
    queryFn: () => getPublishedKbArticles(organizationId, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE KB ARTICLES BY CATEGORY
// ===========================================

export function useKbArticlesByCategory(
  organizationId: string,
  categoryId: string,
  publishedOnly: boolean = true
) {
  return useQuery({
    queryKey: kbArticleKeys.byCategory(organizationId, categoryId, publishedOnly),
    queryFn: () => getKbArticlesByCategory(organizationId, categoryId, publishedOnly),
    enabled: !!organizationId && !!categoryId,
  })
}

// ===========================================
// USE SEARCH KB ARTICLES
// ===========================================

export function useSearchKbArticles(
  organizationId: string,
  searchTerm: string,
  publishedOnly: boolean = true
) {
  return useQuery({
    queryKey: kbArticleKeys.search(organizationId, searchTerm, publishedOnly),
    queryFn: () => searchKbArticles(organizationId, searchTerm, publishedOnly),
    enabled: !!organizationId && searchTerm.length >= 2,
  })
}

// ===========================================
// USE POPULAR KB ARTICLES
// ===========================================

export function usePopularKbArticles(organizationId: string, limit: number = 10) {
  return useQuery({
    queryKey: kbArticleKeys.popular(organizationId, limit),
    queryFn: () => getPopularKbArticles(organizationId, limit),
    enabled: !!organizationId,
  })
}

// ===========================================
// USE KB ARTICLE
// ===========================================

export function useKbArticle(id: string | undefined) {
  return useQuery({
    queryKey: kbArticleKeys.detail(id || ''),
    queryFn: () => getKbArticleById(id!),
    enabled: !!id,
  })
}

// ===========================================
// USE KB ARTICLE BY SLUG
// ===========================================

export function useKbArticleBySlug(organizationId: string, slug: string | undefined) {
  return useQuery({
    queryKey: kbArticleKeys.bySlug(organizationId, slug || ''),
    queryFn: () => getKbArticleBySlug(organizationId, slug!),
    enabled: !!organizationId && !!slug,
  })
}

// ===========================================
// USE CREATE KB ARTICLE
// ===========================================

export function useCreateKbArticle(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, userId }: { input: CreateKbArticleInput; userId?: string }) =>
      createKbArticle(organizationId, input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.lists() })
    },
  })
}

// ===========================================
// USE UPDATE KB ARTICLE
// ===========================================

export function useUpdateKbArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateKbArticleInput) => updateKbArticle(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.bySlug(data.organizationId, data.slug) })
    },
  })
}

// ===========================================
// USE DELETE KB ARTICLE
// ===========================================

export function useDeleteKbArticle(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteKbArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.list(organizationId) })
    },
  })
}

// ===========================================
// USE PUBLISH KB ARTICLE
// ===========================================

export function usePublishKbArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => publishKbArticle(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE ARCHIVE KB ARTICLE
// ===========================================

export function useArchiveKbArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveKbArticle(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.detail(data.id) })
    },
  })
}

// ===========================================
// USE INCREMENT VIEW COUNT
// ===========================================

export function useIncrementKbArticleViewCount() {
  return useMutation({
    mutationFn: (id: string) => incrementKbArticleViewCount(id),
  })
}

// ===========================================
// USE RECORD FEEDBACK
// ===========================================

export function useRecordKbArticleFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHelpful }: { id: string; isHelpful: boolean }) =>
      recordKbArticleFeedback(id, isHelpful),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: kbArticleKeys.detail(variables.id) })
    },
  })
}
