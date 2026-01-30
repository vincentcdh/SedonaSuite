import { z } from 'zod'

/**
 * Common Zod schemas for validation
 */

// Email validation
export const emailSchema = z.string().email('Adresse email invalide')

// French phone number validation
export const phoneSchema = z
  .string()
  .regex(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    'Numéro de téléphone invalide'
  )
  .optional()
  .or(z.literal(''))

// French SIRET validation (14 digits)
export const siretSchema = z
  .string()
  .regex(/^\d{14}$/, 'SIRET invalide (14 chiffres requis)')
  .optional()
  .or(z.literal(''))

// French SIREN validation (9 digits)
export const sirenSchema = z
  .string()
  .regex(/^\d{9}$/, 'SIREN invalide (9 chiffres requis)')
  .optional()
  .or(z.literal(''))

// French VAT number validation
export const vatNumberSchema = z
  .string()
  .regex(/^FR\d{11}$/, 'Numéro de TVA invalide (format: FR + 11 chiffres)')
  .optional()
  .or(z.literal(''))

// URL validation
export const urlSchema = z.string().url('URL invalide').optional().or(z.literal(''))

// Positive number validation
export const positiveNumberSchema = z.number().positive('Le nombre doit être positif')

// Non-negative number validation
export const nonNegativeNumberSchema = z.number().min(0, 'Le nombre ne peut pas être négatif')

// Price validation (2 decimal places max)
export const priceSchema = z
  .number()
  .min(0, 'Le prix ne peut pas être négatif')
  .multipleOf(0.01, 'Le prix doit avoir au maximum 2 décimales')

// Percentage validation (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'Le pourcentage doit être entre 0 et 100')
  .max(100, 'Le pourcentage doit être entre 0 et 100')

// UUID validation
export const uuidSchema = z.string().uuid('Identifiant invalide')

// Required string (non-empty)
export const requiredStringSchema = z.string().min(1, 'Ce champ est requis')

// Optional string that can be null or undefined
export const optionalStringSchema = z.string().optional().nullable()

// Date string validation (ISO format)
export const dateStringSchema = z.string().datetime('Date invalide')

// French postal code validation
export const postalCodeSchema = z
  .string()
  .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres requis)')
  .optional()
  .or(z.literal(''))

/**
 * Helper to create a paginated query schema
 */
export function createPaginationSchema(defaultLimit = 20, maxLimit = 100) {
  return z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(maxLimit).default(defaultLimit),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
}

/**
 * Helper to create a search query schema
 */
export function createSearchSchema() {
  return z.object({
    query: z.string().optional(),
    filters: z.record(z.unknown()).optional(),
  })
}
