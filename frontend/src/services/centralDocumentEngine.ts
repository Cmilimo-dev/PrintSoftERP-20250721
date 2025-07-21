import { DocumentStorageService } from './documentStorageService';
import { UnifiedDocumentExportService } from './unifiedDocumentExportService';
import { DocumentWorkflowService } from './documentWorkflowService';
import { DocumentCompanyService } from './documentCompanyService';
import { PaymentIntegrationService } from './paymentIntegrationService';
import { SignatureService } from './signatureService';
import { BaseDocument, DocumentType } from '../types/businessDocuments';

export class CentralDocumentEngine {

  /**
   * Generate a document with unified styling and export
   */
  static async generateAndExportDocument(
    docData: BaseDocument,
    docType: DocumentType,
    options: { format: string; filename?: string }
  ): Promise<void> {
    try {
      // Prepare document information
      const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
      const paymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();
      const signatureData = SignatureService.getDocumentSignatureData();

      // Merge all necessary document data
      const enrichedDocument = {
        ...docData,
        company: companyInfo,
        paymentInfo,
        signature: signatureData.signature
      };

      // Use UnifiedDocumentExportService for exporting
      await UnifiedDocumentExportService.exportDocument(
        enrichedDocument,
        docType,
        {
          format: options.format as any,
          filename: options.filename,
          includeLogo: true,
          includeSignature: signatureData.isEnabled,
          colorMode: 'color'
        }
      );

      // Save document
      DocumentStorageService.saveDocument(docType, enrichedDocument);
    } catch (error) {
      console.error('Document generation and export failed:', error);
    }
  }
}

