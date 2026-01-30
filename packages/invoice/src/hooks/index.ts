// ===========================================
// INVOICE HOOKS EXPORTS
// ===========================================

// Clients
export {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from './useClients'

// Products
export {
  useProducts,
  useProduct,
  useProductCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './useProducts'

// Invoices
export {
  useInvoices,
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useSendInvoice,
  useMarkInvoiceAsPaid,
  useAddInvoiceLineItem,
  useDeleteInvoiceLineItem,
} from './useInvoices'

// Quotes
export {
  useQuotes,
  useQuote,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  useSendQuote,
  useAcceptQuote,
  useRejectQuote,
  useConvertQuoteToInvoice,
  useAddQuoteLineItem,
  useDeleteQuoteLineItem,
} from './useQuotes'

// Payments
export {
  usePayments,
  usePaymentsByInvoice,
  usePayment,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from './usePayments'

// Settings
export {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  useVatRates,
  useCreateVatRate,
  useDeleteVatRate,
  useNumberSequences,
  useUpdateNumberSequence,
} from './useSettings'
