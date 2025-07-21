
import React, { useEffect, useState } from 'react';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import PrintControls from './print/PrintControls';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import { BusinessDocumentService } from '@/services/businessDocumentService';

interface BusinessDocumentPrintProps {
  document: BaseDocument;
  documentType: DocumentType;
  onClose: () => void;
}

const BusinessDocumentPrint: React.FC<BusinessDocumentPrintProps> = ({
  document: businessDocument,
  documentType,
  onClose
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const generatePreview = async () => {
      try {
        // USE UNIFIED DOCUMENT SERVICES ONLY - NO CUSTOM HTML GENERATION
        const businessDocumentService = BusinessDocumentService.getInstance();
        const previewHtml = await businessDocumentService.generatePreviewHTML(
          businessDocument.id,
          documentType
        );
        setHtmlContent(previewHtml);
      } catch (error) {
        console.error('Error generating preview:', error);
        setHtmlContent('<p>Error generating preview</p>');
      }
    };
    
    generatePreview();
  }, [businessDocument, documentType]);

  const handlePrint = async () => {
    try {
      await UnifiedDocumentExportService.exportDocument(businessDocument, documentType, {
        format: 'print',
        includeLogo: true,
        includeSignature: true,
        // logoDisplayMode will be auto-determined from system settings
        colorMode: 'monochrome'
      });
    } catch (error) {
      console.error('Error printing document:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await UnifiedDocumentExportService.exportDocument(businessDocument, documentType, {
        format: 'html',
        filename: businessDocument.documentNumber,
        includeLogo: true,
        includeSignature: true,
        // logoDisplayMode will be auto-determined from system settings
        colorMode: 'color'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getDocumentTitle = (type: DocumentType) => {
    switch (type) {
      case 'purchase-order': return 'Purchase Order';
      case 'invoice': return 'Invoice';
      case 'quote': return 'Quote';
      case 'sales-order': return 'Sales Order';
      case 'payment-receipt': return 'Payment Receipt';
      case 'delivery-note': return 'Delivery Note';
      case 'financial-report': return 'Financial Report';
      default: return 'Document';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PrintControls
        documentNumber={businessDocument.documentNumber}
        onClose={onClose}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />

      {/* HTML Preview */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white print:p-0 print:m-0 print:shadow-none">
        <div 
          className="html-preview overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default BusinessDocumentPrint;
