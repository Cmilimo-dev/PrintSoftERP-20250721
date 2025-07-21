
import { DocumentType } from '@/types/businessDocuments';

export const getDocumentTitle = (documentType: DocumentType) => {
  switch (documentType) {
    case 'purchase-order': return 'PURCHASE ORDER';
    case 'invoice': return 'INVOICE';
    case 'quote': return 'QUOTE';
    case 'sales-order': return 'SALES ORDER';
    case 'payment-receipt': return 'RECEIPT';
    case 'delivery-note': return 'DELIVERY NOTE';
    case 'financial-report': return 'FINANCIAL REPORT';
    default: return 'DOCUMENT';
  }
};
