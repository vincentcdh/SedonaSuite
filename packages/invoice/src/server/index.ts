// ===========================================
// INVOICE SERVER EXPORTS
// ===========================================

// Clients
export {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from './clients'

// Products
export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from './products'

// Invoices
export {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  markInvoiceAsPaid,
  addInvoiceLineItem,
  deleteInvoiceLineItem,
} from './invoices'

// Quotes
export {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  sendQuote,
  acceptQuote,
  rejectQuote,
  convertQuoteToInvoice,
  addQuoteLineItem,
  deleteQuoteLineItem,
} from './quotes'

// Payments
export {
  getPayments,
  getPaymentsByInvoice,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from './payments'

// Settings
export {
  getInvoiceSettings,
  updateInvoiceSettings,
  getVatRates,
  createVatRate,
  deleteVatRate,
  getNumberSequences,
  updateNumberSequence,
} from './settings'
