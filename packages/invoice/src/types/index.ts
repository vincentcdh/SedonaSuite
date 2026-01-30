// ===========================================
// INVOICE MODULE TYPES
// ===========================================

// ===========================================
// CLIENT TYPES (Client facturable)
// ===========================================

export interface InvoiceClient {
  id: string
  organizationId: string

  // Informations entreprise
  name: string
  legalName: string | null
  siret: string | null
  vatNumber: string | null
  legalForm: string | null

  // Adresse de facturation
  billingAddressLine1: string | null
  billingAddressLine2: string | null
  billingCity: string | null
  billingPostalCode: string | null
  billingCountry: string

  // Contact facturation
  billingEmail: string | null
  billingPhone: string | null
  contactName: string | null

  // Conditions de paiement
  paymentTerms: number
  paymentMethod: PaymentMethod
  defaultCurrency: string

  // Liens CRM
  crmCompanyId: string | null
  crmContactId: string | null

  // Notes
  notes: string | null

  // Metadata
  customFields: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Computed (optional)
  invoicesCount?: number
  totalRevenue?: number
  outstandingAmount?: number
}

export type PaymentMethod = 'transfer' | 'card' | 'check' | 'cash' | 'direct_debit'

export interface CreateClientInput {
  name: string
  legalName?: string
  siret?: string
  vatNumber?: string
  legalForm?: string
  billingAddressLine1?: string
  billingAddressLine2?: string
  billingCity?: string
  billingPostalCode?: string
  billingCountry?: string
  billingEmail?: string
  billingPhone?: string
  contactName?: string
  paymentTerms?: number
  paymentMethod?: PaymentMethod
  defaultCurrency?: string
  crmCompanyId?: string
  crmContactId?: string
  notes?: string
  customFields?: Record<string, unknown>
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string
}

export interface ClientFilters {
  search?: string
  hasOutstanding?: boolean
}

// ===========================================
// PRODUCT TYPES
// ===========================================

export interface Product {
  id: string
  organizationId: string

  name: string
  description: string | null
  sku: string | null
  type: ProductType

  // Prix
  unitPrice: number
  currency: string
  unit: string

  // TVA
  vatRate: number
  vatExempt: boolean

  // Categorisation
  category: string | null

  // Comptabilite
  accountingCode: string | null

  // Status
  isActive: boolean

  // Metadata
  customFields: Record<string, unknown>
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ProductType = 'product' | 'service'

export interface CreateProductInput {
  name: string
  description?: string
  sku?: string
  type?: ProductType
  unitPrice: number
  currency?: string
  unit?: string
  vatRate?: number
  vatExempt?: boolean
  category?: string
  accountingCode?: string
  isActive?: boolean
  customFields?: Record<string, unknown>
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

export interface ProductFilters {
  search?: string
  type?: ProductType
  category?: string
  isActive?: boolean
}

// ===========================================
// QUOTE TYPES
// ===========================================

export interface Quote {
  id: string
  organizationId: string
  clientId: string
  client?: InvoiceClient

  quoteNumber: string
  status: QuoteStatus

  // Dates
  issueDate: string
  validUntil: string | null
  acceptedAt: string | null
  rejectedAt: string | null

  // Montants
  subtotal: number
  discountAmount: number
  discountPercent: number | null
  vatAmount: number
  total: number
  currency: string

  // Contenu
  subject: string | null
  introduction: string | null
  terms: string | null
  notes: string | null
  footer: string | null

  // Liens
  convertedToInvoiceId: string | null
  dealId: string | null

  // Metadata
  customFields: Record<string, unknown>
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  lineItems?: LineItem[]
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'

export interface CreateQuoteInput {
  clientId: string
  issueDate?: string
  validUntil?: string
  subject?: string
  introduction?: string
  terms?: string
  notes?: string
  footer?: string
  discountAmount?: number
  discountPercent?: number
  dealId?: string
  customFields?: Record<string, unknown>
  lineItems?: CreateLineItemInput[]
}

export interface UpdateQuoteInput extends Partial<Omit<CreateQuoteInput, 'lineItems'>> {
  id: string
  status?: QuoteStatus
}

export interface QuoteFilters {
  search?: string
  clientId?: string
  status?: QuoteStatus
  issueDateAfter?: string
  issueDateBefore?: string
}

// ===========================================
// INVOICE TYPES
// ===========================================

export interface Invoice {
  id: string
  organizationId: string
  clientId: string
  client?: InvoiceClient

  invoiceNumber: string
  status: InvoiceStatus

  // Dates
  issueDate: string
  dueDate: string
  sentAt: string | null
  paidAt: string | null

  // Montants
  subtotal: number
  discountAmount: number
  discountPercent: number | null
  vatAmount: number
  total: number
  amountPaid: number
  amountDue: number
  currency: string

  // Contenu
  subject: string | null
  introduction: string | null
  terms: string | null
  notes: string | null
  footer: string | null
  paymentInstructions: string | null

  // Origine
  quoteId: string | null

  // Relances
  reminderCount: number
  lastReminderAt: string | null

  // Liens CRM
  dealId: string | null

  // Metadata
  customFields: Record<string, unknown>
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  lineItems?: LineItem[]
  payments?: Payment[]
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'

export interface CreateInvoiceInput {
  clientId: string
  issueDate?: string
  dueDate?: string
  subject?: string
  introduction?: string
  terms?: string
  notes?: string
  footer?: string
  paymentInstructions?: string
  discountAmount?: number
  discountPercent?: number
  quoteId?: string
  dealId?: string
  customFields?: Record<string, unknown>
  lineItems?: CreateLineItemInput[]
}

export interface UpdateInvoiceInput extends Partial<Omit<CreateInvoiceInput, 'lineItems'>> {
  id: string
  status?: InvoiceStatus
}

export interface InvoiceFilters {
  search?: string
  clientId?: string
  status?: InvoiceStatus
  issueDateAfter?: string
  issueDateBefore?: string
  dueDateAfter?: string
  dueDateBefore?: string
  isOverdue?: boolean
}

// ===========================================
// CREDIT NOTE TYPES
// ===========================================

export interface CreditNote {
  id: string
  organizationId: string
  clientId: string
  client?: InvoiceClient
  invoiceId: string | null
  invoice?: Invoice

  creditNoteNumber: string
  status: CreditNoteStatus

  // Dates
  issueDate: string
  appliedAt: string | null

  // Montants
  subtotal: number
  vatAmount: number
  total: number
  currency: string

  // Raison
  reason: string | null

  // Metadata
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  lineItems?: LineItem[]
}

export type CreditNoteStatus = 'draft' | 'sent' | 'applied' | 'refunded'

export interface CreateCreditNoteInput {
  clientId: string
  invoiceId?: string
  issueDate?: string
  reason?: string
  lineItems?: CreateLineItemInput[]
}

export interface UpdateCreditNoteInput {
  id: string
  status?: CreditNoteStatus
  reason?: string
}

// ===========================================
// LINE ITEM TYPES
// ===========================================

export interface LineItem {
  id: string
  documentType: 'quote' | 'invoice' | 'credit_note'
  documentId: string

  position: number
  productId: string | null
  product?: Product

  description: string
  quantity: number
  unit: string
  unitPrice: number

  // Remise
  discountPercent: number | null
  discountAmount: number | null

  // TVA
  vatRate: number
  vatAmount: number

  // Totaux
  lineTotal: number // HT
  lineTotalWithVat: number // TTC

  createdAt: string
  updatedAt: string
}

export interface CreateLineItemInput {
  productId?: string
  description: string
  quantity?: number
  unit?: string
  unitPrice: number
  discountPercent?: number
  discountAmount?: number
  vatRate?: number
}

export interface UpdateLineItemInput extends Partial<CreateLineItemInput> {
  id: string
}

// ===========================================
// PAYMENT TYPES
// ===========================================

export interface Payment {
  id: string
  organizationId: string
  invoiceId: string

  amount: number
  currency: string
  paymentDate: string
  paymentMethod: PaymentMethod
  reference: string | null
  notes: string | null

  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentInput {
  invoiceId: string
  amount: number
  paymentDate?: string
  paymentMethod: PaymentMethod
  reference?: string
  notes?: string
}

export interface UpdatePaymentInput extends Partial<Omit<CreatePaymentInput, 'invoiceId'>> {
  id: string
}

// ===========================================
// RECURRING TEMPLATE TYPES
// ===========================================

export interface RecurringTemplate {
  id: string
  organizationId: string
  clientId: string
  client?: InvoiceClient

  name: string
  frequency: RecurringFrequency
  dayOfMonth: number | null
  monthOfYear: number | null

  // Dates
  startDate: string
  endDate: string | null
  nextInvoiceDate: string | null

  // Contenu
  subject: string | null
  introduction: string | null
  terms: string | null
  notes: string | null
  footer: string | null

  // Status
  isActive: boolean
  lastGeneratedAt: string | null
  invoicesGenerated: number

  // Metadata
  createdBy: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  // Relations
  lineItems?: RecurringLineItem[]
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringLineItem {
  id: string
  templateId: string
  position: number
  productId: string | null
  description: string
  quantity: number
  unit: string
  unitPrice: number
  vatRate: number
  createdAt: string
}

export interface CreateRecurringTemplateInput {
  clientId: string
  name: string
  frequency: RecurringFrequency
  dayOfMonth?: number
  monthOfYear?: number
  startDate: string
  endDate?: string
  subject?: string
  introduction?: string
  terms?: string
  notes?: string
  footer?: string
  isActive?: boolean
  lineItems?: Omit<RecurringLineItem, 'id' | 'templateId' | 'createdAt'>[]
}

export interface UpdateRecurringTemplateInput extends Partial<Omit<CreateRecurringTemplateInput, 'lineItems'>> {
  id: string
}

// ===========================================
// ORGANIZATION SETTINGS TYPES
// ===========================================

export interface InvoiceSettings {
  id: string
  organizationId: string

  // Informations entreprise
  companyName: string | null
  legalName: string | null
  siret: string | null
  vatNumber: string | null
  legalForm: string | null
  capital: string | null

  // Adresse
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  postalCode: string | null
  country: string

  // Contact
  email: string | null
  phone: string | null
  website: string | null

  // Logo
  logoUrl: string | null

  // Coordonnees bancaires
  bankName: string | null
  iban: string | null
  bic: string | null

  // Conditions par defaut
  defaultPaymentTerms: number
  defaultQuoteValidity: number
  defaultVatRate: number
  defaultCurrency: string

  // Mentions legales
  legalMentions: string | null
  latePaymentPenalty: string | null
  discountTerms: string | null

  // Templates
  invoiceNotesTemplate: string | null
  invoiceFooterTemplate: string | null
  quoteNotesTemplate: string | null
  quoteFooterTemplate: string | null

  // Email templates
  invoiceEmailSubject: string | null
  invoiceEmailBody: string | null
  quoteEmailSubject: string | null
  quoteEmailBody: string | null
  reminderEmailSubject: string | null
  reminderEmailBody: string | null

  createdAt: string
  updatedAt: string
}

export interface UpdateInvoiceSettingsInput {
  companyName?: string
  legalName?: string
  siret?: string
  vatNumber?: string
  legalForm?: string
  capital?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  email?: string
  phone?: string
  website?: string
  logoUrl?: string
  bankName?: string
  iban?: string
  bic?: string
  defaultPaymentTerms?: number
  defaultQuoteValidity?: number
  defaultVatRate?: number
  defaultCurrency?: string
  legalMentions?: string
  latePaymentPenalty?: string
  discountTerms?: string
  invoiceNotesTemplate?: string
  invoiceFooterTemplate?: string
  quoteNotesTemplate?: string
  quoteFooterTemplate?: string
  invoiceEmailSubject?: string
  invoiceEmailBody?: string
  quoteEmailSubject?: string
  quoteEmailBody?: string
  reminderEmailSubject?: string
  reminderEmailBody?: string
}

// ===========================================
// VAT RATE TYPES
// ===========================================

export interface VatRate {
  id: string
  organizationId: string
  name: string
  rate: number
  isDefault: boolean
  createdAt: string
}

export interface CreateVatRateInput {
  name: string
  rate: number
  isDefault?: boolean
}

// ===========================================
// STATS TYPES
// ===========================================

export interface InvoiceStats {
  quotes: {
    total: number
    draft: number
    sent: number
    accepted: number
    acceptanceRate: number
    totalValue: number
    averageValue: number
  }
  invoices: {
    total: number
    draft: number
    sent: number
    paid: number
    overdue: number
    totalRevenue: number
    outstandingAmount: number
    averagePaymentDays: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    thisYear: number
    growth: number // % par rapport au mois precedent
  }
  topClients: Array<{
    client: InvoiceClient
    totalRevenue: number
    invoicesCount: number
  }>
}

// ===========================================
// PAGINATION TYPES
// ===========================================

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ===========================================
// NUMBER SEQUENCE TYPES
// ===========================================

export interface NumberSequence {
  id: string
  organizationId: string
  type: 'invoice' | 'quote' | 'credit_note'
  prefix: string
  suffix: string
  currentNumber: number
  padding: number
  resetFrequency: 'never' | 'yearly' | 'monthly'
  lastResetAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateNumberSequenceInput {
  type: 'invoice' | 'quote' | 'credit_note'
  prefix?: string
  suffix?: string
  padding?: number
  resetFrequency?: 'never' | 'yearly' | 'monthly'
}
