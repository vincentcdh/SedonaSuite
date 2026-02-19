// ===========================================
// INPUT VALIDATION UTILITIES
// ===========================================
// Reusable validation schemas and functions for server inputs

import { z } from 'zod'

// ===========================================
// COMMON SCHEMAS
// ===========================================

/**
 * UUID validation - strict format check
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')
  .min(1, 'ID is required')

/**
 * Organization ID validation
 */
export const organizationIdSchema = uuidSchema

/**
 * Email validation with sanitization
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .max(254, 'Email too long')

/**
 * Check for dangerous patterns (XSS prevention)
 */
function isDangerousString(val: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:/i,
    /vbscript:/i,
  ]
  return dangerousPatterns.some((pattern) => pattern.test(val))
}

/**
 * Safe string - prevents XSS and SQL injection patterns
 */
export const safeStringSchema = z
  .string()
  .trim()
  .refine((val) => !isDangerousString(val), { message: 'Invalid characters detected' })

/**
 * Safe text field (for names, titles, etc.)
 */
export const safeTextSchema = z
  .string()
  .trim()
  .max(500, 'Text too long')
  .refine((val) => !isDangerousString(val), { message: 'Invalid characters detected' })

/**
 * Safe long text field (for descriptions, notes, etc.)
 */
export const safeLongTextSchema = z
  .string()
  .trim()
  .max(10000, 'Text too long')
  .refine((val) => !isDangerousString(val), { message: 'Invalid characters detected' })

/**
 * Phone number validation (French format)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+33|0)[1-9](\d{2}){4}$|^(\+33|0)\d{9}$/,
    'Invalid phone number format'
  )
  .optional()
  .or(z.literal(''))

/**
 * International phone number
 */
export const internationalPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''))

/**
 * French postal code
 */
export const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, 'Invalid postal code')
  .optional()
  .or(z.literal(''))

/**
 * SIRET validation (14 digits)
 */
export const siretSchema = z
  .string()
  .trim()
  .regex(/^\d{14}$/, 'Invalid SIRET (14 digits required)')
  .optional()
  .or(z.literal(''))

/**
 * SIREN validation (9 digits)
 */
export const sirenSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, 'Invalid SIREN (9 digits required)')
  .optional()
  .or(z.literal(''))

/**
 * VAT number validation (EU format)
 */
export const vatNumberSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{2}[A-Z0-9]{2,13}$/, 'Invalid VAT number')
  .optional()
  .or(z.literal(''))

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL too long')
  .optional()
  .or(z.literal(''))

/**
 * Positive number
 */
export const positiveNumberSchema = z.coerce
  .number()
  .min(0, 'Must be positive')

/**
 * Percentage (0-100)
 */
export const percentageSchema = z.coerce
  .number()
  .min(0, 'Must be at least 0')
  .max(100, 'Must be at most 100')

/**
 * Currency amount (2 decimal places max)
 */
export const currencySchema = z.coerce
  .number()
  .min(0, 'Must be positive')
  .transform((val) => Math.round(val * 100) / 100)

/**
 * Date string (ISO format)
 */
export const dateStringSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ===========================================
// VALIDATION FUNCTIONS
// ===========================================

/**
 * Validate and sanitize input using a Zod schema
 * Throws a formatted error if validation fails
 */
export function validateInput<T>(
  schema: z.ZodType<T>,
  input: unknown,
  context?: string
): T {
  const result = schema.safeParse(input)

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')

    const prefix = context ? `${context}: ` : ''
    throw new Error(`${prefix}Validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Validate organization ID parameter
 */
export function validateOrganizationId(organizationId: unknown): string {
  return validateInput(organizationIdSchema, organizationId, 'Organization ID')
}

/**
 * Validate resource ID parameter
 */
export function validateResourceId(id: unknown, resourceName = 'Resource'): string {
  return validateInput(uuidSchema, id, `${resourceName} ID`)
}

/**
 * Validate pagination parameters
 */
export function validatePagination(params: unknown) {
  return validateInput(paginationSchema, params, 'Pagination')
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\\/g, '') // Remove backslashes
    .substring(0, 10000) // Limit length
}

/**
 * Sanitize HTML content for safe display
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
}

// ===========================================
// EXPORTS
// ===========================================

export { z }
