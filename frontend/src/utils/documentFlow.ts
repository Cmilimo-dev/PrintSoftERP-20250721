import { Quote, SalesOrder, Invoice, PaymentReceipt } from '@/types/businessDocuments';

export const convertQuoteToSalesOrder = (quote: Quote): SalesOrder => {
  return {
    ...quote,
    id: '', // New ID will be generated upon saving
    documentNumber: '',
    type: 'sales-order',
    customer: quote.customer,
    expectedDelivery: new Date().toISOString(),
    status: 'pending',
    relatedOrders: [quote.id],
  };
};

export const convertSalesOrderToInvoice = (salesOrder: SalesOrder): Invoice => {
  return {
    ...salesOrder,
    id: '',
    documentNumber: '',
    type: 'invoice',
    customer: salesOrder.customer,
    dueDate: new Date().toISOString(),
    status: 'pending',
    relatedOrders: [salesOrder.id],
  };
};

export const convertInvoiceToPayment = (invoice: Invoice): PaymentReceipt => {
  return {
    ...invoice,
    id: '',
    documentNumber: '',
    type: 'payment-receipt',
    paymentMethod: 'bank transfer',
    reference: '',
    amountPaid: invoice.total,
    status: 'completed',
    relatedInvoice: invoice.id,
  };
};
