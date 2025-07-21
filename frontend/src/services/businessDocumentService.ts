import { DocumentStorageService } from './documentStorageService';
import { UnifiedDocumentExportService } from './unifiedDocumentExportService';
import { DocumentWorkflowService } from './documentWorkflowService';
import { DocumentCompanyService } from './documentCompanyService';
import { PaymentIntegrationService } from './paymentIntegrationService';
import { SignatureService } from './signatureService';
import { DepartmentSignatureService } from './departmentSignatureService';
import { AutoNumberingService } from './autoNumberingService';
import { 
  BaseDocument, 
  DocumentType, 
  LineItem, 
  PurchaseOrder, 
  Invoice, 
  Quote, 
  SalesOrder, 
  PaymentReceipt, 
  DeliveryNote 
} from '../types/businessDocuments';
import { calculateDocumentTotals } from '../utils/documentCalculations';
import { 
  convertQuoteToSalesOrder, 
  convertSalesOrderToInvoice, 
  convertInvoiceToPayment 
} from '../utils/documentFlow';

export interface DocumentGenerationOptions {
  format: 'html' | 'pdf' | 'word' | 'excel' | 'mht' | 'print' | 'view';
  filename?: string;
  includeLogo?: boolean;
  includeSignature?: boolean;
  colorMode?: 'color' | 'monochrome';
  watermark?: string;
  logoDisplayMode?: 'none' | 'logo-only' | 'logo-with-name' | 'name-only';
  customStyling?: {
    fontFamily?: string;
    fontSize?: string;
    primaryColor?: string;
  };
}

export interface DocumentCreationData {
  documentType: DocumentType;
  items: LineItem[];
  customer?: any;
  vendor?: any;
  notes?: string;
  terms?: string;
  dueDate?: string;
  customFields?: { [key: string]: any };
}

export class BusinessDocumentService {
  private static instance: BusinessDocumentService;
  private autoNumberingService: AutoNumberingService;

  private constructor() {
    this.autoNumberingService = AutoNumberingService.getInstance();
  }

  public static getInstance(): BusinessDocumentService {
    if (!BusinessDocumentService.instance) {
      BusinessDocumentService.instance = new BusinessDocumentService();
    }
    return BusinessDocumentService.instance;
  }

  /**
   * Create a new business document
   */
  async createDocument(data: DocumentCreationData): Promise<BaseDocument> {
    try {
      // Get company information
      const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
      
      // Generate document number
      const documentNumber = this.generateDocumentNumber(data.documentType);
      
      // Calculate totals
      const totals = calculateDocumentTotals(data.items, {
        type: 'exclusive',
        defaultRate: companyInfo.taxConfig.defaultRate * 100
      });

      // Create base document
      const baseDocument: BaseDocument = {
        id: this.generateUniqueId(),
        documentNumber,
        date: new Date().toISOString().split('T')[0],
        company: {
          name: companyInfo.companyName,
          address: companyInfo.address,
          city: companyInfo.city,
          state: companyInfo.state,
          zip: companyInfo.zip,
          country: 'Kenya',
          phone: companyInfo.phone,
          email: companyInfo.email,
          taxId: companyInfo.taxId,
          logo: companyInfo.logoUrl,
          website: companyInfo.website
        },
        items: data.items,
        total: totals.total,
        currency: DocumentCompanyService.getCurrency(),
        taxSettings: {
          type: 'exclusive',
          defaultRate: companyInfo.taxConfig.defaultRate * 100
        },
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        notes: data.notes,
        terms: data.terms
      };

      // Add document-specific fields
      const specificDocument = this.enhanceDocumentByType(baseDocument, data);

      // Save document
      DocumentStorageService.saveDocument(data.documentType, specificDocument);

      return specificDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Generate and export document
   */
  async exportDocument(
    documentId: string,
    documentType: DocumentType,
    options: DocumentGenerationOptions = { format: 'html' }
  ): Promise<void> {
    try {
      // Get document
      const document = DocumentStorageService.getDocument(documentType, documentId);
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // Get signature data for this document type
      const signatureData = DepartmentSignatureService.getDocumentSignatureData(
        this.mapDocumentTypeToDepartmentType(documentType),
        options.includeSignature ? undefined : 'none'
      );

      // Get payment information
      const paymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();

      // Enhance document with latest information
      const enhancedDocument = {
        ...document,
        signature: signatureData.signature ? {
          enabled: signatureData.isEnabled,
          signatureId: signatureData.signature.id,
          documentType: documentType
        } : undefined,
        paymentInfo: paymentInfo.showInDocuments ? paymentInfo : undefined
      };

      // Export using UnifiedDocumentExportService
      await UnifiedDocumentExportService.exportDocument(
        enhancedDocument,
        documentType,
        {
          format: options.format as any,
          filename: options.filename || `${document.documentNumber}`,
          includeLogo: options.includeLogo ?? true,
          includeSignature: signatureData.isEnabled,
          colorMode: options.colorMode || 'color',
          watermark: options.watermark,
          logoDisplayMode: options.logoDisplayMode || 'logo-with-name'
        }
      );

    } catch (error) {
      console.error('Error exporting document:', error);
      throw error;
    }
  }

  /**
   * Convert document between types
   */
  async convertDocument(
    sourceDocumentId: string,
    sourceType: DocumentType,
    targetType: DocumentType
  ): Promise<BaseDocument> {
    try {
      const sourceDocument = DocumentStorageService.getDocument(sourceType, sourceDocumentId);
      if (!sourceDocument) {
        throw new Error(`Source document not found: ${sourceDocumentId}`);
      }

      let convertedDocument: BaseDocument;

      // Handle different conversion types
      if (sourceType === 'quote' && targetType === 'sales-order') {
        convertedDocument = convertQuoteToSalesOrder(sourceDocument as Quote);
      } else if (sourceType === 'sales-order' && targetType === 'invoice') {
        convertedDocument = convertSalesOrderToInvoice(sourceDocument as SalesOrder);
      } else if (sourceType === 'invoice' && targetType === 'payment-receipt') {
        convertedDocument = convertInvoiceToPayment(sourceDocument as Invoice);
      } else {
        throw new Error(`Conversion from ${sourceType} to ${targetType} not supported`);
      }

      // Generate new document number and ID
      convertedDocument.id = this.generateUniqueId();
      convertedDocument.documentNumber = this.generateDocumentNumber(targetType);
      convertedDocument.date = new Date().toISOString().split('T')[0];

      // Save converted document
      DocumentStorageService.saveDocument(targetType, convertedDocument);

      return convertedDocument;
    } catch (error) {
      console.error('Error converting document:', error);
      throw error;
    }
  }

  /**
   * Get all documents of a specific type
   */
  getDocuments(documentType: DocumentType): BaseDocument[] {
    return DocumentStorageService.getDocuments(documentType);
  }

  /**
   * Get a specific document
   */
  getDocument(documentType: DocumentType, documentId: string): BaseDocument | null {
    return DocumentStorageService.getDocument(documentType, documentId);
  }

  /**
   * Update document status
   */
  updateDocumentStatus(documentType: DocumentType, documentId: string, status: string): boolean {
    return DocumentStorageService.updateDocumentStatus(documentType, documentId, status);
  }

  /**
   * Delete document
   */
  deleteDocument(documentType: DocumentType, documentId: string): boolean {
    return DocumentStorageService.deleteDocument(documentType, documentId);
  }

  /**
   * Search documents
   */
  searchDocuments(documentType: DocumentType, searchTerm: string): BaseDocument[] {
    return DocumentStorageService.searchDocuments(documentType, searchTerm);
  }

  /**
   * Get documents by status
   */
  getDocumentsByStatus(documentType: DocumentType, status: string): BaseDocument[] {
    return DocumentStorageService.getDocumentsByStatus(documentType, status);
  }

  /**
   * Batch export documents
   */
  async batchExportDocuments(
    documents: Array<{ id: string; type: DocumentType }>,
    options: DocumentGenerationOptions = { format: 'pdf' }
  ): Promise<void> {
    try {
      for (const doc of documents) {
        await this.exportDocument(doc.id, doc.type, {
          ...options,
          filename: `${doc.type}-${doc.id}`
        });
      }
    } catch (error) {
      console.error('Error in batch export:', error);
      throw error;
    }
  }

  /**
   * Generate preview HTML for document
   */
  async generatePreviewHTML(
    documentId: string,
    documentType: DocumentType
  ): Promise<string> {
    try {
      const document = DocumentStorageService.getDocument(documentType, documentId);
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // Get signature data
      const signatureData = DepartmentSignatureService.getDocumentSignatureData(
        this.mapDocumentTypeToDepartmentType(documentType)
      );

      // Get payment info
      const paymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();

      // Create enhanced document
      const enhancedDocument = {
        ...document,
        signature: signatureData.signature ? {
          enabled: signatureData.isEnabled,
          signatureId: signatureData.signature.id,
          documentType: documentType
        } : undefined,
        paymentInfo: paymentInfo.showInDocuments ? paymentInfo : undefined
      };

      // Generate HTML using UnifiedDocumentExportService public method
      return await UnifiedDocumentExportService.generatePreviewHTML(
        enhancedDocument,
        documentType,
        {
          format: 'view',
          colorMode: 'color',
          includeLogo: true,
          includeSignature: signatureData.isEnabled,
          logoDisplayMode: 'logo-with-name'
        }
      );
    } catch (error) {
      console.error('Error generating preview HTML:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private generateDocumentNumber(documentType: DocumentType): string {
    try {
      return this.autoNumberingService.generateDocumentNumber(documentType);
    } catch (error) {
      // Fallback to simple numbering
      const timestamp = Date.now();
      const prefixes = {
        'invoice': 'INV',
        'quote': 'QUO',
        'sales-order': 'SO',
        'purchase-order': 'PO',
        'payment-receipt': 'PR',
        'delivery-note': 'DN',
        'goods-receiving-voucher': 'GRV',
        'financial-report': 'FR'
      };
      
      const prefix = prefixes[documentType] || 'DOC';
      return `${prefix}-${timestamp}`;
    }
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private enhanceDocumentByType(baseDocument: BaseDocument, data: DocumentCreationData): BaseDocument {
    switch (data.documentType) {
      case 'purchase-order':
        return {
          ...baseDocument,
          vendor: data.vendor,
          status: 'draft',
          approvalStatus: 'pending'
        } as PurchaseOrder;

      case 'invoice':
        return {
          ...baseDocument,
          customer: data.customer,
          dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          invoiceDate: baseDocument.date,
          status: 'draft'
        } as Invoice;

      case 'quote':
        return {
          ...baseDocument,
          customer: data.customer,
          validUntil: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'draft'
        } as Quote;

      case 'sales-order':
        return {
          ...baseDocument,
          customer: data.customer,
          expectedDelivery: data.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        } as SalesOrder;

      case 'payment-receipt':
        return {
          ...baseDocument,
          customer: data.customer,
          paymentMethod: data.customFields?.paymentMethod || 'bank-transfer',
          reference: data.customFields?.reference || `REF-${Date.now()}`,
          amountPaid: baseDocument.total,
          receiptType: 'customer',
          status: 'draft'
        } as PaymentReceipt;

      case 'delivery-note':
        return {
          ...baseDocument,
          customer: data.customer,
          deliveryDate: baseDocument.date,
          deliveryAddress: data.customer?.address || ''
        } as DeliveryNote;

      default:
        return baseDocument;
    }
  }

  private mapDocumentTypeToDepartmentType(documentType: DocumentType): 'quotation' | 'sales_order' | 'invoice' | 'purchase_order' | 'vendor_invoice' | 'payment_receipt' {
    const mapping: { [key: string]: any } = {
      'quote': 'quotation',
      'sales-order': 'sales_order',
      'invoice': 'invoice',
      'purchase-order': 'purchase_order',
      'payment-receipt': 'payment_receipt'
    };
    
    return mapping[documentType] || 'invoice';
  }
}

// Export singleton instance
export const businessDocumentService = BusinessDocumentService.getInstance();
