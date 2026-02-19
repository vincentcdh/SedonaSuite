import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@sedona/ui'
import { Loader2 } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/lib/auth'
import { useMemo } from 'react'
import {
  useCreateInvoice,
  useClients,
  useProducts,
  useInvoiceSettings,
  useCreateClient,
  InvoiceForm,
  type CreateInvoiceInput,
  type CrmEntry,
} from '@sedona/invoice'
import { useContacts, useCompanies } from '@sedona/crm'

export const Route = createFileRoute('/_authenticated/invoices/new')({
  component: NewInvoicePage,
})

function NewInvoicePage() {
  const navigate = useNavigate()
  const { organization } = useOrganization()
  const organizationId = organization?.id || ''

  const { data: clientsData, isLoading: isLoadingClients } = useClients(organizationId)
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(organizationId, { isActive: true })
  const { data: settings } = useInvoiceSettings(organizationId)

  // Charger les donnees CRM
  const { data: contactsData } = useContacts(organizationId, {}, { pageSize: 100 })
  const { data: companiesData } = useCompanies(organizationId, {}, { pageSize: 100 })

  const createInvoice = useCreateInvoice(organizationId)
  const createClient = useCreateClient(organizationId)

  const isLoading = isLoadingClients || isLoadingProducts

  // Transformer les contacts et entreprises CRM en CrmEntry
  const crmEntries = useMemo<CrmEntry[]>(() => {
    const entries: CrmEntry[] = []

    // Ajouter les entreprises CRM
    if (companiesData?.data) {
      for (const company of companiesData.data) {
        entries.push({
          id: company.id,
          type: 'company',
          name: company.name,
          email: company.email,
          siret: company.siret,
          addressLine1: company.addressLine1,
          addressLine2: company.addressLine2,
          city: company.city,
          postalCode: company.postalCode,
          country: company.country,
          phone: company.phone,
        })
      }
    }

    // Ajouter les contacts CRM (avec nom complet)
    if (contactsData?.data) {
      for (const contact of contactsData.data) {
        const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Contact sans nom'
        entries.push({
          id: contact.id,
          type: 'contact',
          name: fullName,
          email: contact.email,
          addressLine1: contact.addressLine1,
          addressLine2: contact.addressLine2,
          city: contact.city,
          postalCode: contact.postalCode,
          country: contact.country,
          phone: contact.phone || contact.mobile,
        })
      }
    }

    return entries
  }, [contactsData, companiesData])

  // Creer un client de facturation depuis une entree CRM
  const handleCreateClientFromCrm = async (entry: CrmEntry) => {
    const newClient = await createClient.mutateAsync({
      name: entry.name,
      billingEmail: entry.email || undefined,
      siret: entry.siret || undefined,
      billingAddressLine1: entry.addressLine1 || undefined,
      billingAddressLine2: entry.addressLine2 || undefined,
      billingCity: entry.city || undefined,
      billingPostalCode: entry.postalCode || undefined,
      billingCountry: entry.country || 'France',
      billingPhone: entry.phone || undefined,
      // Lier au CRM
      crmCompanyId: entry.type === 'company' ? entry.id : undefined,
      crmContactId: entry.type === 'contact' ? entry.id : undefined,
    })
    return newClient
  }

  const handleSubmit = async (data: CreateInvoiceInput) => {
    const invoice = await createInvoice.mutateAsync(data)
    navigate({ to: '/invoices/$invoiceId', params: { invoiceId: invoice.id } })
  }

  const handleCancel = () => {
    navigate({ to: '/invoices' })
  }

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold font-heading">Nouvelle facture</h1>
      </div>

      {/* Form */}
      <InvoiceForm
        clients={clientsData?.data || []}
        products={productsData?.data || []}
        settings={settings}
        crmEntries={crmEntries}
        onCreateClientFromCrm={handleCreateClientFromCrm}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createInvoice.isPending}
      />
    </div>
  )
}
