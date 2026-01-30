import { z } from 'zod'

// ===========================================
// AUTHENTICATION SCHEMAS
// ===========================================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Adresse email requise')
  .email('Adresse email invalide')
  .max(255, 'Adresse email trop longue')

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(100, 'Le mot de passe est trop long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
  )

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom est trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides')

/**
 * Organization name validation schema
 */
export const organizationNameSchema = z
  .string()
  .min(2, 'Le nom de l\'organisation doit contenir au moins 2 caractères')
  .max(255, 'Le nom de l\'organisation est trop long')

/**
 * Sign in form schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional(),
})

export type SignInFormData = z.infer<typeof signInSchema>

/**
 * Sign up form schema
 */
export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise'),
  organizationName: organizationNameSchema.optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type SignUpFormData = z.infer<typeof signUpSchema>

/**
 * Forgot password form schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password form schema
 */
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Update password form schema
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmation du mot de passe requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>

/**
 * Update profile form schema
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  locale: z.enum(['fr', 'en']).optional(),
  timezone: z.string().optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

/**
 * Two-factor verification schema
 */
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Le code doit contenir 6 chiffres')
    .regex(/^\d+$/, 'Le code doit contenir uniquement des chiffres'),
})

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>

/**
 * Invite member form schema
 */
export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
})

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>

/**
 * Create organization form schema
 */
export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: z
    .string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(50, 'Le slug est trop long')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets')
    .optional(),
})

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>
