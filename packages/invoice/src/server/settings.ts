// ===========================================
// INVOICE SETTINGS SERVER FUNCTIONS
// ===========================================

import { getSupabaseClient } from '@sedona/database'
import type {
  InvoiceSettings,
  UpdateInvoiceSettingsInput,
  VatRate,
  CreateVatRateInput,
  NumberSequence,
  UpdateNumberSequenceInput,
} from '../types'

// Helper to get Supabase client (public schema)
function getClient() {
  return getSupabaseClient()
}

// ===========================================
// GET ORGANIZATION SETTINGS
// ===========================================

export async function getInvoiceSettings(organizationId: string): Promise<InvoiceSettings | null> {
  const { data, error } = await getClient()
    .from('invoice_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapSettingsFromDb(data)
}

// ===========================================
// CREATE OR UPDATE SETTINGS
// ===========================================

export async function updateInvoiceSettings(
  organizationId: string,
  input: UpdateInvoiceSettingsInput
): Promise<InvoiceSettings> {
  const client = getClient()

  // Check if settings exist
  const existing = await getInvoiceSettings(organizationId)

  if (existing) {
    // Update
    const updateData: Record<string, unknown> = {}

    if (input.companyName !== undefined) updateData.company_name = input.companyName
    if (input.legalName !== undefined) updateData.legal_name = input.legalName
    if (input.siret !== undefined) updateData.siret = input.siret
    if (input.vatNumber !== undefined) updateData.vat_number = input.vatNumber
    if (input.legalForm !== undefined) updateData.legal_form = input.legalForm
    if (input.capital !== undefined) updateData.capital = input.capital
    if (input.addressLine1 !== undefined) updateData.address_line1 = input.addressLine1
    if (input.addressLine2 !== undefined) updateData.address_line2 = input.addressLine2
    if (input.city !== undefined) updateData.city = input.city
    if (input.postalCode !== undefined) updateData.postal_code = input.postalCode
    if (input.country !== undefined) updateData.country = input.country
    if (input.email !== undefined) updateData.email = input.email
    if (input.phone !== undefined) updateData.phone = input.phone
    if (input.website !== undefined) updateData.website = input.website
    if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl
    if (input.bankName !== undefined) updateData.bank_name = input.bankName
    if (input.iban !== undefined) updateData.iban = input.iban
    if (input.bic !== undefined) updateData.bic = input.bic
    if (input.defaultPaymentTerms !== undefined) updateData.default_payment_terms = input.defaultPaymentTerms
    if (input.defaultQuoteValidity !== undefined) updateData.default_quote_validity = input.defaultQuoteValidity
    if (input.defaultVatRate !== undefined) updateData.default_vat_rate = input.defaultVatRate
    if (input.defaultCurrency !== undefined) updateData.default_currency = input.defaultCurrency
    if (input.legalMentions !== undefined) updateData.legal_mentions = input.legalMentions
    if (input.latePaymentPenalty !== undefined) updateData.late_payment_penalty = input.latePaymentPenalty
    if (input.discountTerms !== undefined) updateData.discount_terms = input.discountTerms
    if (input.invoiceNotesTemplate !== undefined) updateData.invoice_notes_template = input.invoiceNotesTemplate
    if (input.invoiceFooterTemplate !== undefined) updateData.invoice_footer_template = input.invoiceFooterTemplate
    if (input.quoteNotesTemplate !== undefined) updateData.quote_notes_template = input.quoteNotesTemplate
    if (input.quoteFooterTemplate !== undefined) updateData.quote_footer_template = input.quoteFooterTemplate
    if (input.invoiceEmailSubject !== undefined) updateData.invoice_email_subject = input.invoiceEmailSubject
    if (input.invoiceEmailBody !== undefined) updateData.invoice_email_body = input.invoiceEmailBody
    if (input.quoteEmailSubject !== undefined) updateData.quote_email_subject = input.quoteEmailSubject
    if (input.quoteEmailBody !== undefined) updateData.quote_email_body = input.quoteEmailBody
    if (input.reminderEmailSubject !== undefined) updateData.reminder_email_subject = input.reminderEmailSubject
    if (input.reminderEmailBody !== undefined) updateData.reminder_email_body = input.reminderEmailBody

    const { data, error } = await client
      .from('invoice_settings')
      .update(updateData)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error
    return mapSettingsFromDb(data)
  } else {
    // Insert
    const { data, error } = await client
      .from('invoice_settings')
      .insert({
        organization_id: organizationId,
        company_name: input.companyName,
        legal_name: input.legalName,
        siret: input.siret,
        vat_number: input.vatNumber,
        legal_form: input.legalForm,
        capital: input.capital,
        address_line1: input.addressLine1,
        address_line2: input.addressLine2,
        city: input.city,
        postal_code: input.postalCode,
        country: input.country || 'France',
        email: input.email,
        phone: input.phone,
        website: input.website,
        logo_url: input.logoUrl,
        bank_name: input.bankName,
        iban: input.iban,
        bic: input.bic,
        default_payment_terms: input.defaultPaymentTerms || 30,
        default_quote_validity: input.defaultQuoteValidity || 30,
        default_vat_rate: input.defaultVatRate || 20,
        default_currency: input.defaultCurrency || 'EUR',
        legal_mentions: input.legalMentions,
        late_payment_penalty: input.latePaymentPenalty,
        discount_terms: input.discountTerms,
        invoice_notes_template: input.invoiceNotesTemplate,
        invoice_footer_template: input.invoiceFooterTemplate,
        quote_notes_template: input.quoteNotesTemplate,
        quote_footer_template: input.quoteFooterTemplate,
        invoice_email_subject: input.invoiceEmailSubject,
        invoice_email_body: input.invoiceEmailBody,
        quote_email_subject: input.quoteEmailSubject,
        quote_email_body: input.quoteEmailBody,
        reminder_email_subject: input.reminderEmailSubject,
        reminder_email_body: input.reminderEmailBody,
      })
      .select()
      .single()

    if (error) throw error
    return mapSettingsFromDb(data)
  }
}

// ===========================================
// VAT RATES
// ===========================================

export async function getVatRates(organizationId: string): Promise<VatRate[]> {
  const { data, error } = await getClient()
    .from('invoice_vat_rates')
    .select('*')
    .eq('organization_id', organizationId)
    .order('rate', { ascending: false })

  if (error) throw error

  return (data || []).map(mapVatRateFromDb)
}

export async function createVatRate(
  organizationId: string,
  input: CreateVatRateInput
): Promise<VatRate> {
  const client = getClient()

  // If this is the default, unset other defaults first
  if (input.isDefault) {
    await client
      .from('invoice_vat_rates')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
  }

  const { data, error } = await client
    .from('invoice_vat_rates')
    .insert({
      organization_id: organizationId,
      name: input.name,
      rate: input.rate,
      is_default: input.isDefault || false,
    })
    .select()
    .single()

  if (error) throw error

  return mapVatRateFromDb(data)
}

export async function deleteVatRate(id: string): Promise<void> {
  const { error } = await getClient()
    .from('invoice_vat_rates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ===========================================
// NUMBER SEQUENCES
// ===========================================

export async function getNumberSequences(organizationId: string): Promise<NumberSequence[]> {
  const { data, error } = await getClient()
    .from('invoice_number_sequences')
    .select('*')
    .eq('organization_id', organizationId)

  if (error) throw error

  return (data || []).map(mapSequenceFromDb)
}

export async function updateNumberSequence(
  organizationId: string,
  input: UpdateNumberSequenceInput
): Promise<NumberSequence> {
  const client = getClient()

  // Check if sequence exists
  const { data: existing } = await client
    .from('invoice_number_sequences')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('type', input.type)
    .single()

  if (existing) {
    // Update
    const updateData: Record<string, unknown> = {}
    if (input.prefix !== undefined) updateData.prefix = input.prefix
    if (input.suffix !== undefined) updateData.suffix = input.suffix
    if (input.padding !== undefined) updateData.padding = input.padding
    if (input.resetFrequency !== undefined) updateData.reset_frequency = input.resetFrequency

    const { data, error } = await client
      .from('invoice_number_sequences')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return mapSequenceFromDb(data)
  } else {
    // Create
    const { data, error } = await client
      .from('invoice_number_sequences')
      .insert({
        organization_id: organizationId,
        type: input.type,
        prefix: input.prefix || getDefaultPrefix(input.type),
        suffix: input.suffix || '',
        current_number: 0,
        padding: input.padding || 4,
        reset_frequency: input.resetFrequency || 'never',
      })
      .select()
      .single()

    if (error) throw error
    return mapSequenceFromDb(data)
  }
}

function getDefaultPrefix(type: string): string {
  switch (type) {
    case 'invoice': return 'FAC-'
    case 'quote': return 'DEV-'
    case 'credit_note': return 'AVO-'
    default: return ''
  }
}

// ===========================================
// HELPERS
// ===========================================

function mapSettingsFromDb(data: Record<string, unknown>): InvoiceSettings {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    companyName: data.company_name as string | null,
    legalName: data.legal_name as string | null,
    siret: data.siret as string | null,
    vatNumber: data.vat_number as string | null,
    legalForm: data.legal_form as string | null,
    capital: data.capital as string | null,
    addressLine1: data.address_line1 as string | null,
    addressLine2: data.address_line2 as string | null,
    city: data.city as string | null,
    postalCode: data.postal_code as string | null,
    country: (data.country as string) || 'France',
    email: data.email as string | null,
    phone: data.phone as string | null,
    website: data.website as string | null,
    logoUrl: data.logo_url as string | null,
    bankName: data.bank_name as string | null,
    iban: data.iban as string | null,
    bic: data.bic as string | null,
    defaultPaymentTerms: (data.default_payment_terms as number) || 30,
    defaultQuoteValidity: (data.default_quote_validity as number) || 30,
    defaultVatRate: Number(data.default_vat_rate) || 20,
    defaultCurrency: (data.default_currency as string) || 'EUR',
    legalMentions: data.legal_mentions as string | null,
    latePaymentPenalty: data.late_payment_penalty as string | null,
    discountTerms: data.discount_terms as string | null,
    invoiceNotesTemplate: data.invoice_notes_template as string | null,
    invoiceFooterTemplate: data.invoice_footer_template as string | null,
    quoteNotesTemplate: data.quote_notes_template as string | null,
    quoteFooterTemplate: data.quote_footer_template as string | null,
    invoiceEmailSubject: data.invoice_email_subject as string | null,
    invoiceEmailBody: data.invoice_email_body as string | null,
    quoteEmailSubject: data.quote_email_subject as string | null,
    quoteEmailBody: data.quote_email_body as string | null,
    reminderEmailSubject: data.reminder_email_subject as string | null,
    reminderEmailBody: data.reminder_email_body as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function mapVatRateFromDb(data: Record<string, unknown>): VatRate {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    name: data.name as string,
    rate: Number(data.rate),
    isDefault: data.is_default as boolean,
    createdAt: data.created_at as string,
  }
}

function mapSequenceFromDb(data: Record<string, unknown>): NumberSequence {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    type: data.type as NumberSequence['type'],
    prefix: (data.prefix as string) || '',
    suffix: (data.suffix as string) || '',
    currentNumber: (data.current_number as number) || 0,
    padding: (data.padding as number) || 4,
    resetFrequency: (data.reset_frequency as NumberSequence['resetFrequency']) || 'never',
    lastResetAt: data.last_reset_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
