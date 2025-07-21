
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { getCurrencySymbol } from '@/components/CurrencySelector';
import { createBaseTemplate } from './templates/baseTemplate';
import { generateHeader } from './templates/headerTemplate';
import { generateVendorCustomerSection, generateItemsTable, generateFooter } from './templates/commonSections';
import { generatePaymentReceiptContent } from './templates/paymentReceiptTemplate';
import { generateFinancialReportContent } from './templates/financialReportTemplate';
import { generateDeliveryNoteContent } from './templates/deliveryNoteTemplate';
import { generateTotalsSection } from './templates/totalsTemplate';
import { generateAmountInWords, generateSignatureSection } from './templates/signatureTemplate';
import { getDocumentTitle } from './templates/documentTitles';

export const generateHTMLTemplate = (document: BaseDocument, documentType: DocumentType): string => {
  // Default to KES (Kenyan Shilling) currency
  const defaultCurrency = document.currency || 'KES';
  const currencySymbol = defaultCurrency === 'KES' ? 'KSh' : getCurrencySymbol(defaultCurrency);

  const content = `
    ${generateHeader(document, documentType, defaultCurrency)}
    ${generateVendorCustomerSection(document, documentType)}
    ${documentType === 'payment-receipt' ? generatePaymentReceiptContent(document, currencySymbol) : ''}
    ${documentType === 'financial-report' ? generateFinancialReportContent(document, currencySymbol) : ''}
    ${documentType === 'delivery-note' ? generateDeliveryNoteContent(document) : ''}
    ${generateItemsTable(document, documentType, currencySymbol)}
    ${generateTotalsSection(document, documentType, currencySymbol, defaultCurrency)}
    ${generateAmountInWords(document, documentType, defaultCurrency)}
    ${generateSignatureSection(document, documentType)}

    ${document.notes ? `
      <div style="margin: 20px 0;">
        <div style="font-weight: bold; font-size: 12px; color: #2d3748; margin-bottom: 8px;">Notes:</div>
        <div style="font-size: 10px; color: #4a5568; line-height: 1.4; white-space: pre-line; padding: 8px; border: 1px solid #e2e8f0; background-color: #f7fafc;">
          ${document.notes}
        </div>
      </div>
    ` : ''}

    ${generateFooter(document)}
  `;

  return createBaseTemplate(content, getDocumentTitle(documentType), document.documentNumber);
};
