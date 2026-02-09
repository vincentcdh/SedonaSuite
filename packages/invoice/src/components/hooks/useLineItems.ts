import { useState, useMemo, useCallback } from 'react'
import type { Product } from '../../types'
import type { LineItemFormData } from '../schemas'

interface UseLineItemsOptions {
  initialItems?: LineItemFormData[]
  defaultVatRate?: number
}

interface VatBreakdownItem {
  rate: number
  amount: number
}

interface UseLineItemsReturn {
  items: LineItemFormData[]
  addItem: () => void
  removeItem: (index: number) => void
  updateItem: (index: number, data: Partial<LineItemFormData>) => void
  selectProduct: (index: number, product: Product) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  setItems: (items: LineItemFormData[]) => void

  // Valeurs calculees
  subtotal: number
  vatBreakdown: VatBreakdownItem[]
  totalVat: number
  total: number
}

function createEmptyLineItem(defaultVatRate: number = 20): LineItemFormData {
  return {
    id: crypto.randomUUID(),
    productId: undefined,
    description: '',
    quantity: 1,
    unit: 'unite',
    unitPrice: 0,
    discountPercent: undefined,
    vatRate: defaultVatRate,
  }
}

function calculateLineTotal(item: LineItemFormData): number {
  const baseTotal = item.quantity * item.unitPrice
  const discount = item.discountPercent
    ? baseTotal * (item.discountPercent / 100)
    : 0
  return baseTotal - discount
}

function calculateLineVat(item: LineItemFormData): number {
  const lineTotal = calculateLineTotal(item)
  return lineTotal * (item.vatRate / 100)
}

export function useLineItems(options: UseLineItemsOptions = {}): UseLineItemsReturn {
  const { initialItems, defaultVatRate = 20 } = options

  const [items, setItems] = useState<LineItemFormData[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : [createEmptyLineItem(defaultVatRate)]
  )

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createEmptyLineItem(defaultVatRate)])
  }, [defaultVatRate])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateItem = useCallback((index: number, data: Partial<LineItemFormData>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    )
  }, [])

  const selectProduct = useCallback((index: number, product: Product) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: product.id,
              description: product.name,
              unitPrice: product.unitPrice,
              unit: product.unit,
              vatRate: product.vatExempt ? 0 : product.vatRate,
            }
          : item
      )
    )
  }, [])

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      const newItems = [...prev]
      const movedItem = newItems.splice(fromIndex, 1)[0]
      if (movedItem) {
        newItems.splice(toIndex, 0, movedItem)
      }
      return newItems
    })
  }, [])

  // Calculs des totaux
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  }, [items])

  const vatBreakdown = useMemo(() => {
    const breakdown = new Map<number, number>()

    items.forEach((item) => {
      const vatAmount = calculateLineVat(item)
      if (vatAmount > 0) {
        const current = breakdown.get(item.vatRate) || 0
        breakdown.set(item.vatRate, current + vatAmount)
      }
    })

    return Array.from(breakdown.entries())
      .map(([rate, amount]) => ({ rate, amount }))
      .sort((a, b) => a.rate - b.rate)
  }, [items])

  const totalVat = useMemo(() => {
    return vatBreakdown.reduce((sum, { amount }) => sum + amount, 0)
  }, [vatBreakdown])

  const total = useMemo(() => {
    return subtotal + totalVat
  }, [subtotal, totalVat])

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    selectProduct,
    moveItem,
    setItems,
    subtotal,
    vatBreakdown,
    totalVat,
    total,
  }
}
