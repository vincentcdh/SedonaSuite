import { z } from 'zod'

// ===========================================
// CLIENT FORM SCHEMA
// ===========================================

export const clientFormSchema = z.object({
  // Informations generales
  name: z.string().min(1, 'Le nom est requis'),
  legalName: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  legalForm: z.string().optional(),

  // Contact
  billingEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  billingPhone: z.string().optional(),
  contactName: z.string().optional(),

  // Adresse de facturation
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.string().default('France'),

  // Conditions de paiement
  paymentTerms: z.coerce.number().min(0).default(30),
  paymentMethod: z.enum(['transfer', 'card', 'check', 'cash', 'direct_debit']).default('transfer'),
  defaultCurrency: z.string().default('EUR'),

  // Liens CRM
  crmCompanyId: z.string().optional(),
  crmContactId: z.string().optional(),

  // Notes
  notes: z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientFormSchema>

// ===========================================
// PRODUCT FORM SCHEMA
// ===========================================

export const productFormSchema = z.object({
  // Informations
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(['product', 'service']).default('service'),

  // Tarification
  unitPrice: z.coerce.number().min(0, 'Le prix doit etre positif'),
  currency: z.string().default('EUR'),
  unit: z.string().default('unite'),

  // TVA
  vatRate: z.coerce.number().min(0).max(100).default(20),
  vatExempt: z.boolean().default(false),

  // Categorisation
  category: z.string().optional(),
  accountingCode: z.string().optional(),

  // Statut
  isActive: z.boolean().default(true),
})

export type ProductFormData = z.infer<typeof productFormSchema>

// ===========================================
// LINE ITEM SCHEMA
// ===========================================

export const lineItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  quantity: z.coerce.number().min(0.01, 'La quantite doit etre positive').default(1),
  unit: z.string().default('unite'),
  unitPrice: z.coerce.number().min(0, 'Le prix doit etre positif'),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  vatRate: z.coerce.number().min(0).max(100).default(20),
})

export type LineItemFormData = z.infer<typeof lineItemSchema>

// ===========================================
// INVOICE FORM SCHEMA
// ===========================================

export const invoiceFormSchema = z.object({
  // Client
  clientId: z.string().min(1, 'Le client est requis'),

  // Dates
  issueDate: z.string(),
  dueDate: z.string().optional(),

  // Contenu
  subject: z.string().optional(),
  introduction: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  footer: z.string().optional(),
  paymentInstructions: z.string().optional(),

  // Remise globale
  discountAmount: z.coerce.number().min(0).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),

  // Lignes
  lineItems: z.array(lineItemSchema).min(1, 'Au moins une ligne est requise'),

  // Liens
  dealId: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>

// ===========================================
// QUOTE FORM SCHEMA
// ===========================================

export const quoteFormSchema = z.object({
  // Client
  clientId: z.string().min(1, 'Le client est requis'),

  // Dates
  issueDate: z.string(),
  validUntil: z.string().optional(),

  // Contenu
  subject: z.string().optional(),
  introduction: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  footer: z.string().optional(),

  // Remise globale
  discountAmount: z.coerce.number().min(0).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),

  // Lignes
  lineItems: z.array(lineItemSchema).min(1, 'Au moins une ligne est requise'),

  // Liens
  dealId: z.string().optional(),
})

export type QuoteFormData = z.infer<typeof quoteFormSchema>
