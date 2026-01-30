// ===========================================
// PRODUCT HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  PaginationParams,
} from '../types'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from '../server/products'

// Query keys
const productKeys = {
  all: ['invoice-products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: ProductFilters, pagination?: PaginationParams) =>
    [...productKeys.lists(), organizationId, filters, pagination] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: (organizationId: string) => [...productKeys.all, 'categories', organizationId] as const,
}

// ===========================================
// LIST PRODUCTS
// ===========================================

export function useProducts(
  organizationId: string,
  filters?: ProductFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: productKeys.list(organizationId, filters, pagination),
    queryFn: () => getProducts(organizationId, filters, pagination),
    enabled: !!organizationId,
  })
}

// ===========================================
// GET PRODUCT BY ID
// ===========================================

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id || ''),
    queryFn: () => getProductById(id!),
    enabled: !!id,
  })
}

// ===========================================
// GET PRODUCT CATEGORIES
// ===========================================

export function useProductCategories(organizationId: string) {
  return useQuery({
    queryKey: productKeys.categories(organizationId),
    queryFn: () => getProductCategories(organizationId),
    enabled: !!organizationId,
  })
}

// ===========================================
// CREATE PRODUCT
// ===========================================

export function useCreateProduct(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.categories(organizationId) })
    },
  })
}

// ===========================================
// UPDATE PRODUCT
// ===========================================

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.setQueryData(productKeys.detail(data.id), data)
    },
  })
}

// ===========================================
// DELETE PRODUCT
// ===========================================

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
