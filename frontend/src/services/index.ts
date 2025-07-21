// Main Document Engine Services
export { ComprehensiveDocumentEngine, comprehensiveDocumentEngine } from './comprehensiveDocumentEngine';
export { BusinessDocumentService, businessDocumentService } from './businessDocumentService';
export { CentralDocumentEngine } from './centralDocumentEngine';

// Core Document Services
export { UnifiedDocumentExportService } from './unifiedDocumentExportService';
export { DocumentStorageService } from './documentStorageService';
export { DocumentWorkflowService } from './documentWorkflowService';
export { DocumentCompanyService } from './documentCompanyService';
export { DocumentSettingsIntegrationService } from './documentSettingsIntegrationService';

// Supporting Services
export { PaymentIntegrationService } from './paymentIntegrationService';
export { SignatureService } from './signatureService';
export { DepartmentSignatureService } from './departmentSignatureService';
export { AutoNumberingService } from './autoNumberingService';

// Export Service
export { EnhancedExportService } from './enhancedExportService';
export { ExportService } from './exportService';
export { ErpExportService } from './erpExportService';
export { HtmlDocumentService } from './htmlDocumentService';

// Re-export types for convenience
export type { DocumentGenerationOptions, DocumentCreationData } from './businessDocumentService';
export type { 
  DocumentData, 
  LineItem, 
  DocumentTemplate, 
  LayoutSettings, 
  StylingSettings, 
  ComponentSettings, 
  BrandingSettings, 
  GenerationOptions, 
  DocumentGenerationResult 
} from './comprehensiveDocumentEngine';

// Business Document Types
export type { 
  BaseDocument, 
  DocumentType, 
  LineItem as BusinessLineItem,
  Company,
  Customer,
  Vendor,
  TaxSettings,
  Invoice,
  Quote,
  SalesOrder,
  PaymentReceipt,
  DeliveryNote,
  PurchaseOrder,
  GoodsReceivingVoucher,
  FinancialReport
} from '../types/businessDocuments';

// Utility Functions
export { 
  convertQuoteToSalesOrder, 
  convertSalesOrderToInvoice, 
  convertInvoiceToPayment 
} from '../utils/documentFlow';

export { 
  calculateItemTotal, 
  calculateDocumentTotals 
} from '../utils/documentCalculations';

/**
 * Document Engine Factory
 * Provides easy access to the main document generation services
 */
export class DocumentEngineFactory {
  /**
   * Get the main comprehensive document engine instance
   */
  static getComprehensiveEngine(): ComprehensiveDocumentEngine {
    return comprehensiveDocumentEngine;
  }

  /**
   * Get the business document service instance
   */
  static getBusinessDocumentService(): BusinessDocumentService {
    return businessDocumentService;
  }

  /**
   * Get the unified document export service
   */
  static getUnifiedExportService(): typeof UnifiedDocumentExportService {
    return UnifiedDocumentExportService;
  }

  /**
   * Get the document storage service
   */
  static getStorageService(): typeof DocumentStorageService {
    return DocumentStorageService;
  }

  /**
   * Get the document workflow service
   */
  static getWorkflowService(): typeof DocumentWorkflowService {
    return DocumentWorkflowService;
  }

  /**
   * Get the document company service
   */
  static getCompanyService(): typeof DocumentCompanyService {
    return DocumentCompanyService;
  }

  /**
   * Get the payment integration service
   */
  static getPaymentService(): typeof PaymentIntegrationService {
    return PaymentIntegrationService;
  }

  /**
   * Get the signature service
   */
  static getSignatureService(): typeof SignatureService {
    return SignatureService;
  }

  /**
   * Get the department signature service
   */
  static getDepartmentSignatureService(): typeof DepartmentSignatureService {
    return DepartmentSignatureService;
  }
}

// Default export for convenience
export default DocumentEngineFactory;
