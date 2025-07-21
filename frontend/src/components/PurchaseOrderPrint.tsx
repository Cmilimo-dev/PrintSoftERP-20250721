
import React, { useState, useEffect } from 'react';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { BaseDocument } from '@/types/businessDocuments';
import PrintControls from './print/PrintControls';
import { UnifiedDocumentExportService } from '@/services/unifiedDocumentExportService';
import { BusinessDocumentService } from '@/services/businessDocumentService';

interface PurchaseOrderPrintProps {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
}

const PurchaseOrderPrint: React.FC<PurchaseOrderPrintProps> = ({
  purchaseOrder,
  onClose
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const generatePreview = async () => {
      try {
        // USE UNIFIED DOCUMENT SERVICES ONLY - NO CUSTOM HTML GENERATION
        const businessDocumentService = BusinessDocumentService.getInstance();
        const previewHtml = await businessDocumentService.generatePreviewHTML(
          purchaseOrder.id,
          'purchase-order'
        );
        setHtmlContent(previewHtml);
      } catch (error) {
        console.error('Error generating preview:', error);
        setHtmlContent('<p>Error generating preview</p>');
      }
    };
    
    generatePreview();
  }, [purchaseOrder]);

  const handlePrint = async () => {
    try {
      await UnifiedDocumentExportService.exportDocument(purchaseOrder, 'purchase-order', {
        format: 'print',
        includeLogo: true,
        includeSignature: true,
        colorMode: 'monochrome'
      });
    } catch (error) {
      console.error('Error printing purchase order:', error);
    }
  };

  const handleDownload = async () => {
    try {
      await UnifiedDocumentExportService.exportDocument(purchaseOrder, 'purchase-order', {
        format: 'pdf',
        filename: purchaseOrder.documentNumber,
        includeLogo: true,
        includeSignature: true,
        colorMode: 'color'
      });
    } catch (error) {
      console.error('Error downloading purchase order:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PrintControls
        documentNumber={purchaseOrder.documentNumber}
        onClose={onClose}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />

      {/* HTML Preview from Unified Services */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white print:p-0 print:m-0 print:shadow-none">
        <div 
          className="html-preview overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderPrint;
