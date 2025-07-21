
import React from 'react';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';

interface TermsSectionProps {
  document: BaseDocument;
  documentType: DocumentType;
}

const TermsSection: React.FC<TermsSectionProps> = ({ document, documentType }) => {
  const getDocumentLabel = () => {
    switch (documentType) {
      case 'purchase-order': return 'PO';
      case 'invoice': return 'Invoice';
      case 'quote': return 'Quote';
      case 'sales-order': return 'SO';
      default: return 'Doc';
    }
  };

  return (
    <div className="terms-column flex-1">
      <div className="section-title font-bold mb-2 text-xs text-gray-800 print:mb-1">Terms & Conditions:</div>
      <div className="terms-text text-xs leading-relaxed text-gray-600 print:text-xs print:leading-normal">
        <div className="mb-1">{getDocumentLabel()} Number: <span className="font-semibold">{document.documentNumber}</span></div>
        <div className="mb-1">Currency: <span className="font-semibold">{document.currency}</span></div>
        <div className="mb-1">Tax Type: <span className="font-semibold">{document.taxSettings.type}</span></div>
        {document.terms && (
          <div className="mt-2 whitespace-pre-line">{document.terms}</div>
        )}
      </div>
    </div>
  );
};

export default TermsSection;
