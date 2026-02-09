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
    // Update - build update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}

    if (input.companyName !== undefined) updateData['company_name'] = input.companyName
    if (input.legalName !== undefined) updateData['legal_name'] = input.legalName
    if (input.siret !== undefined) updateData['siret'] = input.siret
    if (input.vatNumber !== undefined) updateData['vat_number'] = input.vatNumber
    if (input.legalForm !== undefined) updateData['legal_form'] = input.legalForm
    if (input.capital !== undefined) updateData['capital'] = input.capital
    if (input.addressLine1 !== undefined) updateData['address_line1'] = input.addressLine1
    if (input.addressLine2 !== undefined) updateData['address_line2'] = input.addressLine2
    if (input.city !== undefined) updateData['city'] = input.city
    if (input.postalCode !== undefined) updateData['postal_code'] = input.postalCode
    if (input.country !== undefined) updateData['country'] = input.country
    if (input.email !== undefined) updateData['email'] = input.email
    if (input.phone !== undefined) updateData['phone'] = input.phone
    if (input.website !== undefined) updateData['website'] = input.website
    if (input.logoUrl !== undefined) updateData['logo_url'] = input.logoUrl
    if (input.bankName !== undefined) updateData['bank_name'] = input.bankName
    if (input.iban !== undefined) updateData['iban'] = input.iban
    if (input.bic !== undefined) updateData['bic'] = input.bic
    if (input.defaultPaymentTerms !== undefined) updateData['default_payment_terms'] = input.defaultPaymentTerms
    if (input.defaultQuoteValidity !== undefined) updateData['default_quote_validity'] = input.defaultQuoteValidity
    if (input.defaultVatRate !== undefined) updateData['default_vat_rate'] = input.defaultVatRate
    if (input.defaultCurrency !== undefined) updateData['default_currency'] = input.defaultCurrency
    if (input.legalMentions !== undefined) updateData['legal_mentions'] = input.legalMentions
    if (input.latePaymentPenalty !== undefined) updateData['late_payment_penalty'] = input.latePaymentPenalty
    if (input.discountTerms !== undefined) updateData['discount_terms'] = input.discountTerms
    if (input.invoiceNotesTemplate !== undefined) updateData['invoice_notes_template'] = input.invoiceNotesTemplate
    if (input.invoiceFooterTemplate !== undefined) updateData['invoice_footer_template'] = input.invoiceFooterTemplate
    if (input.quoteNotesTemplate !== undefined) updateData['quote_notes_template'] = input.quoteNotesTemplate
    if (input.quoteFooterTemplate !== undefined) updateData['quote_footer_template'] = input.quoteFooterTemplate
    if (input.invoiceEmailSubject !== undefined) updateData['invoice_email_subject'] = input.invoiceEmailSubject
    if (input.invoiceEmailBody !== undefined) updateData['invoice_email_body'] = input.invoiceEmailBody
    if (input.quoteEmailSubject !== undefined) updateData['quote_email_subject'] = input.quoteEmailSubject
    if (input.quoteEmailBody !== undefined) updateData['quote_email_body'] = input.quoteEmailBody
    if (input.reminderEmailSubject !== undefined) updateData['reminder_email_subject'] = input.reminderEmailSubject
    if (input.reminderEmailBody !== undefined) updateData['reminder_email_body'] = input.reminderEmailBody

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
    .eq('document_type', input.type)
    .single()

  if (existing) {
    // Update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (input.prefix !== undefined) updateData['prefix'] = input.prefix
    if (input.suffix !== undefined) updateData['suffix'] = input.suffix
    if (input.padding !== undefined) updateData['padding'] = input.padding
    if (input.resetFrequency !== undefined) updateData['reset_frequency'] = input.resetFrequency

    const { data, error } = await client
      .from('invoice_number_sequences')
      .update(updateData)
      .eq('id', (existing as any).id)
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
        document_type: input.type,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSettingsFromDb(row: any): InvoiceSettings {
  return {
    id: row.id,
    organizationId: row.organization_id,
    companyName: row.company_name,
    legalName: row.legal_name,
    siret: row.siret,
    vatNumber: row.vat_number,
    legalForm: row.legal_form,
    capital: row.capital,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country || 'France',
    email: row.email,
    phone: row.phone,
    website: row.website,
    logoUrl: row.logo_url,
    bankName: row.bank_name,
    iban: row.iban,
    bic: row.bic,
    defaultPaymentTerms: row.default_payment_terms || 30,
    defaultQuoteValidity: row.default_quote_validity || 30,
    defaultVatRate: Number(row.default_vat_rate) || 20,
    defaultCurrency: row.default_currency || 'EUR',
    legalMentions: row.legal_mentions,
    latePaymentPenalty: row.late_payment_penalty,
    discountTerms: row.discount_terms,
    invoiceNotesTemplate: row.invoice_notes_template,
    invoiceFooterTemplate: row.invoice_footer_template,
    quoteNotesTemplate: row.quote_notes_template,
    quoteFooterTemplate: row.quote_footer_template,
    invoiceEmailSubject: row.invoice_email_subject,
    invoiceEmailBody: row.invoice_email_body,
    quoteEmailSubject: row.quote_email_subject,
    quoteEmailBody: row.quote_email_body,
    reminderEmailSubject: row.reminder_email_subject,
    reminderEmailBody: row.reminder_email_body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVatRateFromDb(row: any): VatRate {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    rate: Number(row.rate),
    isDefault: row.is_default,
    createdAt: row.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSequenceFromDb(row: any): NumberSequence {
  return {
    id: row.id,
    organizationId: row.organization_id,
    type: row.document_type,
    prefix: row.prefix || '',
    suffix: row.suffix || '',
    currentNumber: row.current_number || 0,
    padding: row.padding || 4,
    resetFrequency: row.reset_frequency || 'never',
    lastResetAt: row.last_reset_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
