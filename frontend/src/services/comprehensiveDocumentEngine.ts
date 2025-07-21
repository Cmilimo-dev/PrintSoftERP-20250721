import { BusinessDocumentService, DocumentGenerationOptions, DocumentCreationData } from './businessDocumentService';
import { DocumentStorageService } from './documentStorageService';
import { DocumentWorkflowService } from './documentWorkflowService';
import { DocumentCompanyService } from './documentCompanyService';
import { UnifiedDocumentExportService } from './unifiedDocumentExportService';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { DocumentSettingsIntegrationService } from './documentSettingsIntegrationService';

// Document Types
export interface DocumentData {
  id: string;
  type: 'invoice' | 'quote' | 'salesOrder' | 'deliveryNote' | 'paymentReceipt' | 'purchaseOrder' | 'goodsReceiving' | 'proformaInvoice' | 'creditNote' | 'debitNote' | 'workOrder' | 'stockTransfer' | 'inventoryAdjustment' | 'returnNote' | 'serviceOrder' | 'maintenanceOrder' | 'billOfLading' | 'packingList' | 'timesheet' | 'expenseReport' | 'budgetReport' | 'statement' | 'reminder' | 'contractAgreement';
  number: string;
  date: string;
  dueDate?: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'cancelled' | 'pending' | 'received' | 'shipped' | 'delivered' | 'completed' | 'processing' | 'overdue';
  currency: string;
  
  // Company Information
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatNumber: string;
    logo?: string;
    website?: string;
  };
  
  // Customer Information
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    vatNumber?: string;
  };
  
  // Line Items
  items: LineItem[];
  
  // Financial Details
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  discount?: number;
  total: number;
  
  // Payment Information
  paymentTerms?: string;
  paymentMethod?: 'bank' | 'mpesa' | 'cash' | 'card';
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  mpesaDetails?: {
    payBill: string;
    accountReference: string;
    businessName: string;
  };
  
  // Additional Information
  notes?: string;
  terms?: string;
  signature?: {
    name: string;
    title: string;
    date: string;
    imageUrl?: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  printDate?: string;
  generatedFrom?: string;
}

export interface LineItem {
  id: string;
  partNumber?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  totalPrice: number;
  category?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  layout: LayoutSettings;
  styling: StylingSettings;
  components: ComponentSettings;
  branding: BrandingSettings;
}

export interface LayoutSettings {
  pageFormat: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  spacing: {
    lineHeight: number;
    paragraphSpacing: number;
    sectionSpacing: number;
  };
  grid: {
    columns: number;
    gutterWidth: number;
  };
}

export interface StylingSettings {
  typography: {
    fontFamily: string;
    baseFontSize: number;
    headingScale: number;
    lineHeight: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  borders: {
    style: 'solid' | 'dashed' | 'dotted';
    width: number;
    radius: number;
  };
  shadows: {
    enabled: boolean;
    color: string;
    blur: number;
    offset: { x: number; y: number };
  };
}

export interface ComponentSettings {
  header: {
    enabled: boolean;
    height: number;
    logoPosition: 'left' | 'center' | 'right';
    showCompanyInfo: boolean;
    showDocumentInfo: boolean;
  };
  customerSection: {
    enabled: boolean;
    position: 'left' | 'right' | 'center';
    showBillingAddress: boolean;
    showShippingAddress: boolean;
  };
  itemsTable: {
    enabled: boolean;
    showPartNumbers: boolean;
    showCategories: boolean;
    showVatColumn: boolean;
    alternateRowColors: boolean;
    headerBackground: string;
  };
  totalsSection: {
    enabled: boolean;
    position: 'right' | 'center';
    showSubtotal: boolean;
    showVat: boolean;
    showDiscount: boolean;
    highlightTotal: boolean;
  };
  paymentSection: {
    enabled: boolean;
    showBankDetails: boolean;
    showMpesaDetails: boolean;
    showTerms: boolean;
  };
  signature: {
    enabled: boolean;
    position: 'left' | 'right' | 'center';
    showDate: boolean;
    showTitle: boolean;
    allowDigitalSignature: boolean;
  };
  footer: {
    enabled: boolean;
    showGeneratedDate: boolean;
    showPageNumbers: boolean;
    showDisclaimer: boolean;
    customText?: string;
  };
  qrCode: {
    enabled: boolean;
    position: 'top-right' | 'bottom-right' | 'bottom-left';
    size: number;
    includeUrl: boolean;
    includeDocumentId: boolean;
  };
}

export interface BrandingSettings {
  logo: {
    enabled: boolean;
    url?: string;
    width: number;
    height: number;
    position: 'top-left' | 'top-center' | 'top-right';
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  watermark: {
    enabled: boolean;
    text: string;
    opacity: number;
    position: 'center' | 'diagonal';
  };
}

export interface GenerationOptions {
  template?: DocumentTemplate;
  format: 'html' | 'pdf' | 'excel' | 'word' | 'print';
  includeQrCode?: boolean;
  includeWatermark?: boolean;
  customStyling?: Partial<StylingSettings>;
  locale?: string;
  currency?: string;
  timezone?: string;
}

export interface DocumentGenerationResult {
  success: boolean;
  documentId: string;
  content: string;
  format: string;
  metadata: {
    generatedAt: string;
    templateUsed: string;
    fileSize: number;
    pageCount: number;
  };
  error?: string;
}

/**
 * Comprehensive Document Generation Engine
 * 
 * This engine orchestrates all document services and components to generate
 * professional business documents like invoices, quotes, sales orders, etc.
 */
export class ComprehensiveDocumentEngine {
  private static instance: ComprehensiveDocumentEngine;
  private templates: Map<string, DocumentTemplate> = new Map();
  private defaultTemplates: Map<string, DocumentTemplate> = new Map();
  
  private constructor() {
    this.initializeDefaultTemplates();
  }
  
  public static getInstance(): ComprehensiveDocumentEngine {
    if (!ComprehensiveDocumentEngine.instance) {
      ComprehensiveDocumentEngine.instance = new ComprehensiveDocumentEngine();
    }
    return ComprehensiveDocumentEngine.instance;
  }
  
  /**
   * Initialize default templates for different document types
   */
  private initializeDefaultTemplates(): void {
    // Invoice Template
    const invoiceTemplate: DocumentTemplate = {
      id: 'default-invoice',
      name: 'Professional Invoice',
      type: 'invoice',
      layout: {
        pageFormat: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        spacing: { lineHeight: 1.4, paragraphSpacing: 12, sectionSpacing: 24 },
        grid: { columns: 12, gutterWidth: 16 }
      },
      styling: {
        typography: {
          fontFamily: 'Inter, sans-serif',
          baseFontSize: 14,
          headingScale: 1.25,
          lineHeight: 1.5
        },
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#0ea5e9',
          text: '#1e293b',
          background: '#ffffff',
          border: '#e2e8f0'
        },
        borders: {
          style: 'solid',
          width: 1,
          radius: 4
        },
        shadows: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 4,
          offset: { x: 0, y: 2 }
        }
      },
      components: {
        header: {
          enabled: true,
          height: 120,
          logoPosition: 'left',
          showCompanyInfo: true,
          showDocumentInfo: true
        },
        customerSection: {
          enabled: true,
          position: 'left',
          showBillingAddress: true,
          showShippingAddress: false
        },
        itemsTable: {
          enabled: true,
          showPartNumbers: true,
          showCategories: false,
          showVatColumn: true,
          alternateRowColors: true,
          headerBackground: '#f8fafc'
        },
        totalsSection: {
          enabled: true,
          position: 'right',
          showSubtotal: true,
          showVat: true,
          showDiscount: false,
          highlightTotal: true
        },
        paymentSection: {
          enabled: true,
          showBankDetails: true,
          showMpesaDetails: true,
          showTerms: true
        },
        signature: {
          enabled: true,
          position: 'right',
          showDate: true,
          showTitle: true,
          allowDigitalSignature: true
        },
        footer: {
          enabled: true,
          showGeneratedDate: true,
          showPageNumbers: true,
          showDisclaimer: true
        },
        qrCode: {
          enabled: true,
          position: 'top-right',
          size: 80,
          includeUrl: true,
          includeDocumentId: true
        }
      },
      branding: {
        logo: {
          enabled: true,
          width: 120,
          height: 60,
          position: 'top-left'
        },
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#0ea5e9'
        },
        fonts: {
          primary: 'Inter, sans-serif',
          secondary: 'system-ui, sans-serif'
        },
        watermark: {
          enabled: false,
          text: 'CONFIDENTIAL',
          opacity: 0.1,
          position: 'diagonal'
        }
      }
    };
    
    // Create templates for other document types
    const quoteTemplate = { ...invoiceTemplate, id: 'default-quote', name: 'Professional Quote', type: 'quote' };
    const salesOrderTemplate = { ...invoiceTemplate, id: 'default-sales-order', name: 'Professional Sales Order', type: 'salesOrder' };
    const deliveryNoteTemplate = { ...invoiceTemplate, id: 'default-delivery-note', name: 'Professional Delivery Note', type: 'deliveryNote' };
    const paymentReceiptTemplate = { ...invoiceTemplate, id: 'default-payment-receipt', name: 'Professional Payment Receipt', type: 'paymentReceipt' };
    const purchaseOrderTemplate = { ...invoiceTemplate, id: 'default-purchase-order', name: 'Professional Purchase Order', type: 'purchaseOrder' };
    const goodsReceivingTemplate = { ...invoiceTemplate, id: 'default-goods-receiving', name: 'Professional Goods Receiving', type: 'goodsReceiving' };
    const proformaInvoiceTemplate = { ...invoiceTemplate, id: 'default-proforma-invoice', name: 'Professional Proforma Invoice', type: 'proformaInvoice' };
    const creditNoteTemplate = { ...invoiceTemplate, id: 'default-credit-note', name: 'Professional Credit Note', type: 'creditNote' };
    const debitNoteTemplate = { ...invoiceTemplate, id: 'default-debit-note', name: 'Professional Debit Note', type: 'debitNote' };
    const workOrderTemplate = { ...invoiceTemplate, id: 'default-work-order', name: 'Professional Work Order', type: 'workOrder' };
    const stockTransferTemplate = { ...invoiceTemplate, id: 'default-stock-transfer', name: 'Professional Stock Transfer', type: 'stockTransfer' };
    const inventoryAdjustmentTemplate = { ...invoiceTemplate, id: 'default-inventory-adjustment', name: 'Professional Inventory Adjustment', type: 'inventoryAdjustment' };
    const returnNoteTemplate = { ...invoiceTemplate, id: 'default-return-note', name: 'Professional Return Note', type: 'returnNote' };
    const serviceOrderTemplate = { ...invoiceTemplate, id: 'default-service-order', name: 'Professional Service Order', type: 'serviceOrder' };
    const maintenanceOrderTemplate = { ...invoiceTemplate, id: 'default-maintenance-order', name: 'Professional Maintenance Order', type: 'maintenanceOrder' };
    const billOfLadingTemplate = { ...invoiceTemplate, id: 'default-bill-of-lading', name: 'Professional Bill of Lading', type: 'billOfLading' };
    const packingListTemplate = { ...invoiceTemplate, id: 'default-packing-list', name: 'Professional Packing List', type: 'packingList' };
    const timesheetTemplate = { ...invoiceTemplate, id: 'default-timesheet', name: 'Professional Timesheet', type: 'timesheet' };
    const expenseReportTemplate = { ...invoiceTemplate, id: 'default-expense-report', name: 'Professional Expense Report', type: 'expenseReport' };
    const budgetReportTemplate = { ...invoiceTemplate, id: 'default-budget-report', name: 'Professional Budget Report', type: 'budgetReport' };
    const statementTemplate = { ...invoiceTemplate, id: 'default-statement', name: 'Professional Statement', type: 'statement' };
    const reminderTemplate = { ...invoiceTemplate, id: 'default-reminder', name: 'Professional Reminder', type: 'reminder' };
    const contractAgreementTemplate = { ...invoiceTemplate, id: 'default-contract-agreement', name: 'Professional Contract Agreement', type: 'contractAgreement' };
    
    // Store default templates
    this.defaultTemplates.set('invoice', invoiceTemplate);
    this.defaultTemplates.set('quote', quoteTemplate);
    this.defaultTemplates.set('salesOrder', salesOrderTemplate);
    this.defaultTemplates.set('deliveryNote', deliveryNoteTemplate);
    this.defaultTemplates.set('paymentReceipt', paymentReceiptTemplate);
    this.defaultTemplates.set('purchaseOrder', purchaseOrderTemplate);
    this.defaultTemplates.set('goodsReceiving', goodsReceivingTemplate);
    this.defaultTemplates.set('proformaInvoice', proformaInvoiceTemplate);
    this.defaultTemplates.set('creditNote', creditNoteTemplate);
    this.defaultTemplates.set('debitNote', debitNoteTemplate);
    this.defaultTemplates.set('workOrder', workOrderTemplate);
    this.defaultTemplates.set('stockTransfer', stockTransferTemplate);
    this.defaultTemplates.set('inventoryAdjustment', inventoryAdjustmentTemplate);
    this.defaultTemplates.set('returnNote', returnNoteTemplate);
    this.defaultTemplates.set('serviceOrder', serviceOrderTemplate);
    this.defaultTemplates.set('maintenanceOrder', maintenanceOrderTemplate);
    this.defaultTemplates.set('billOfLading', billOfLadingTemplate);
    this.defaultTemplates.set('packingList', packingListTemplate);
    this.defaultTemplates.set('timesheet', timesheetTemplate);
    this.defaultTemplates.set('expenseReport', expenseReportTemplate);
    this.defaultTemplates.set('budgetReport', budgetReportTemplate);
    this.defaultTemplates.set('statement', statementTemplate);
    this.defaultTemplates.set('reminder', reminderTemplate);
    this.defaultTemplates.set('contractAgreement', contractAgreementTemplate);
  }
  
  /**
   * Generate a complete document with all components
   */
  public async generateDocument(
    documentData: DocumentData,
    options: GenerationOptions = { format: 'html' }
  ): Promise<DocumentGenerationResult> {
    try {
      // Get template (custom or default)
      const template = options.template || this.getDefaultTemplate(documentData.type);
      
      // Generate HTML content
      const htmlContent = await this.generateHtmlContent(documentData, template, options);
      
      // Convert to requested format if needed
      let finalContent = htmlContent;
      let fileSize = new Blob([htmlContent]).size;
      
      if (options.format !== 'html') {
        const exportResult = await this.exportToFormat(htmlContent, options.format, documentData);
        finalContent = exportResult.content;
        fileSize = exportResult.fileSize;
      }
      
      // Save document
      await DocumentStorageService.saveDocument(documentData.id, {
        ...documentData,
        content: finalContent,
        format: options.format,
        template: template.id
      });
      
      return {
        success: true,
        documentId: documentData.id,
        content: finalContent,
        format: options.format,
        metadata: {
          generatedAt: new Date().toISOString(),
          templateUsed: template.id,
          fileSize,
          pageCount: this.estimatePageCount(htmlContent)
        }
      };
    } catch (error) {
      return {
        success: false,
        documentId: documentData.id,
        content: '',
        format: options.format,
        metadata: {
          generatedAt: new Date().toISOString(),
          templateUsed: '',
          fileSize: 0,
          pageCount: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Generate HTML content for a document
   */
  private async generateHtmlContent(
    documentData: DocumentData,
    template: DocumentTemplate,
    options: GenerationOptions
  ): Promise<string> {
    const styles = this.generateStyles(template);
    const header = this.generateHeader(documentData, template);
    const qrCode = options.includeQrCode ? this.generateQrCode(documentData, template) : '';
    
    // Generate document-specific content based on type
    const documentBody = this.generateDocumentBody(documentData, template);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${this.getDocumentTitle(documentData)}</title>
      ${styles}
    </head>
    <body>
      <div class="document-container">
        ${header}
        ${documentBody}
        ${qrCode}
      </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Generate CSS styles using unified document export service approach
   */
  private generateStyles(template: DocumentTemplate): string {
    const isColorMode = true; // Always use color mode for better appearance
    const isPrintFormat = false; // Optimize for screen view
    
    return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
      
      body {
        font-family: 'Trebuchet MS', 'Arial', 'Helvetica', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #2d3748;
        background: white;
        margin: 0;
        padding: 20px;
      }
      
      .document-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20px;
        background: white;
        position: relative;
        min-height: 297mm;
      }
      
      /* Header Section */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
        position: relative;
      }
      
      .company-info {
        flex: 1;
        padding-right: 15px;
      }
      
      .company-logo {
        margin-bottom: 8px;
      }
      
      .company-logo img {
        max-width: 120px;
        max-height: 60px;
        object-fit: contain;
      }
      
      .company-name {
        font-size: 16px;
        font-weight: bold;
        color: #1a202c;
        margin-bottom: 6px;
        line-height: 1.2;
      }
      
      .company-details {
        font-size: 9px;
        color: #4a5568;
        line-height: 1.4;
      }
      
      .company-details div {
        margin-bottom: 2px;
      }
      
      .document-info {
        text-align: right;
        flex: 1;
      }
      
      .document-title {
        font-family: 'Tahoma', sans-serif;
        font-size: 13px;
        font-weight: bold;
        color: #2b6cb0;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .document-number {
        font-size: 11px;
        color: #4a5568;
        margin-bottom: 4px;
      }
      
      .document-details {
        font-size: 9px;
        color: #4a5568;
        line-height: 1.4;
      }
      
      .document-details div {
        margin-bottom: 2px;
      }
      
      /* Customer Section */
      .customer-section {
        margin-bottom: 20px;
        padding: 10px;
        background: #f8f9fa;
        border-left: 3px solid #2b6cb0;
      }
      
      .section-title {
        font-size: 12px;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
      }
      
      .customer-details {
        font-size: 10px;
        color: #4a5568;
        line-height: 1.4;
      }
      
      /* Items Table */
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 10px;
      }
      
      .items-table th {
        background: #4a5568;
        color: white;
        font-weight: 600;
        padding: 10px 8px;
        text-align: left;
        border: 1px solid #2d3748;
        font-size: 10px;
        text-transform: uppercase;
      }
      
      .items-table td {
        padding: 8px;
        border: 1px solid #cbd5e0;
        font-size: 10px;
      }
      
      .items-table tbody tr:nth-child(even) {
        background: #f7fafc;
      }
      
      .items-table .text-center {
        text-align: center;
      }
      
      .items-table .text-right {
        text-align: right;
      }
      
      /* Payment Section */
      .payment-section {
        margin-bottom: 20px;
        display: flex;
        gap: 15px;
      }
      
      .payment-left {
        flex: 1;
      }
      
      .payment-terms {
        margin-bottom: 15px;
      }
      
      .payment-terms-title {
        font-size: 11px;
        font-weight: 600;
        color: #e53e3e;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .payment-terms-content {
        font-size: 9px;
        color: #4a5568;
        line-height: 1.4;
      }
      
      .payment-method {
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 4px;
        font-size: 9px;
      }
      
      .payment-method.bank {
        background: #fff7ed;
        border: 1px solid #fb923c;
      }
      
      .payment-method.mpesa {
        background: #f0fdf4;
        border: 1px solid #22c55e;
      }
      
      .payment-method-title {
        font-weight: 600;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .payment-method-details {
        color: #4a5568;
        line-height: 1.4;
      }
      
      /* Totals Section */
      .totals-section {
        width: 300px;
        margin-left: auto;
        margin-bottom: 20px;
      }
      
      .totals-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      
      .totals-table td {
        padding: 8px 12px;
        border: 1px solid #cbd5e0;
        font-size: 10px;
      }
      
      .totals-table .totals-label {
        text-align: right;
        font-weight: 500;
        background: #f8f9fa;
      }
      
      .totals-table .totals-amount {
        text-align: right;
        font-weight: 600;
        background: white;
      }
      
      .totals-table .total-row {
        background: #2b6cb0 !important;
        color: white !important;
        font-weight: 700;
        font-size: 11px;
      }
      
      .totals-table .total-row .totals-label,
      .totals-table .total-row .totals-amount {
        background: #2b6cb0 !important;
        color: white !important;
        font-weight: 700;
      }
      
      /* Signature Section */
      .signature-section {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        gap: 20px;
      }
      
      .signature-box {
        flex: 1;
        text-align: center;
        padding: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: #f8f9fa;
        font-size: 10px;
      }
      
      .signature-title {
        font-weight: 600;
        margin-bottom: 10px;
        color: #2d3748;
      }
      
      .signature-line {
        width: 100%;
        height: 40px;
        border-bottom: 1px solid #4a5568;
        margin: 20px 0 10px 0;
      }
      
      .signature-name {
        font-weight: 600;
        margin: 5px 0;
      }
      
      .signature-details {
        font-size: 8px;
        color: #6b7280;
        line-height: 1.2;
      }
      
      .authorized-signature {
        text-align: right;
        margin-top: 20px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        width: 250px;
        margin-left: auto;
      }
      
      .authorized-signature-title {
        font-size: 10px;
        font-weight: 600;
        color: #2b6cb0;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      
      .authorized-signature-content {
        font-size: 9px;
        color: #4a5568;
        line-height: 1.4;
      }
      
      .signature-name-cursive {
        font-family: 'Brush Script MT', cursive;
        font-size: 14px;
        color: #2d3748;
        margin: 10px 0;
      }
      
      /* Footer */
      .footer {
        text-align: center;
        font-size: 8px;
        color: #6b7280;
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
      }
      
      /* QR Code */
      .qr-code {
        position: absolute;
        top: 20mm;
        right: 20mm;
        width: 60px;
        height: 60px;
        border: 1px solid #e2e8f0;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .qr-code img {
        width: 50px;
        height: 50px;
      }
      
      /* Terms & Conditions */
      .terms-conditions {
        background: #fffbeb;
        border: 1px solid #f59e0b;
        border-radius: 4px;
        padding: 12px;
        margin-top: 15px;
        font-size: 9px;
      }
      
      .terms-title {
        font-weight: 600;
        color: #92400e;
        margin-bottom: 6px;
      }
      
      .terms-content {
        color: #78350f;
        line-height: 1.4;
      }
      
      /* Status Badge */
      .status-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 8px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-draft {
        background: #fef3c7;
        color: #92400e;
      }
      
      .status-paid {
        background: #d1fae5;
        color: #065f46;
      }
      
      /* Payment Receipt Specific */
      .payment-received {
        background: #dcfce7;
        border: 1px solid #16a34a;
        padding: 12px;
        margin: 15px 0;
        border-radius: 4px;
        font-size: 10px;
      }
      
      .payment-received-title {
        font-weight: 600;
        color: #000;
        margin-bottom: 8px;
      }
      
      .payment-status {
        border: 2px solid #16a34a;
        color: #16a34a;
        padding: 8px 15px;
        font-weight: bold;
        font-size: 12px;
        background: white;
        text-align: center;
        margin-top: 10px;
        text-transform: uppercase;
      }
      
      .payment-summary {
        background: #f9f9f9;
        border: 1px solid #ccc;
        padding: 12px;
        margin: 15px 0;
        font-size: 10px;
      }
      
      .payment-summary-title {
        font-size: 12px;
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 8px;
      }
      
      .payment-summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .payment-summary-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
      }
      
      /* Notes section */
      .notes-section {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 4px;
        padding: 12px;
        margin: 15px 0;
        font-size: 10px;
      }
      
      .notes-title {
        font-weight: 600;
        color: #92400e;
        margin-bottom: 6px;
      }
      
      .notes-content {
        color: #78350f;
        line-height: 1.4;
      }
      
      @media print {
        .document-container {
          margin: 0;
          padding: 15mm 20mm;
        }
        
        .qr-code {
          position: fixed;
        }
      }
    </style>
    `;
  }
  
  /**
   * Generate document header
   */
  private generateHeader(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.header.enabled) return '';
    
    const { company } = documentData;
    const documentTypeTitle = this.getDocumentTypeTitle(documentData.type);
    
    return `
    <div class="header">
      <div class="company-info">
        ${template.branding.logo.enabled && company.logo ? `<img src="${company.logo}" alt="${company.name}" style="width: ${template.branding.logo.width}px; height: ${template.branding.logo.height}px; margin-bottom: 12px;">` : ''}
        <div class="company-name">${company.name}</div>
        <div class="company-details">
          ${company.address}<br>
          Tel: ${company.phone}<br>
          Email: ${company.email}<br>
          VAT Number: ${company.vatNumber}
        </div>
      </div>
      <div class="document-info">
        <div class="document-type">${documentTypeTitle}</div>
        <div class="document-details">
          ${documentData.type === 'invoice' ? 'Invoice #:' : 
            documentData.type === 'quote' ? 'Quote #:' : 
            documentData.type === 'salesOrder' ? 'SO Number:' : 
            documentData.type === 'deliveryNote' ? 'Delivery #:' : 
            'Receipt #:'} ${documentData.number}<br>
          ${documentData.type === 'invoice' ? 'Invoice Date:' : 
            documentData.type === 'quote' ? 'Quote Date:' : 
            documentData.type === 'salesOrder' ? 'Order Date:' : 
            documentData.type === 'deliveryNote' ? 'Delivery Date:' : 
            'Receipt Date:'} ${this.formatDate(documentData.date)}<br>
          ${documentData.dueDate ? `Due Date: ${this.formatDate(documentData.dueDate)}<br>` : ''}
          Status: <span class="status-badge status-${documentData.status}">${documentData.status}</span><br>
          Currency: ${documentData.currency}<br>
          Print Date: ${this.formatDate(documentData.printDate || new Date().toISOString())}
        </div>
      </div>
    </div>
    `;
  }
  
  /**
   * Generate document body based on document type using unified service approach
   */
  private generateDocumentBody(documentData: DocumentData, template: DocumentTemplate): string {
    const { type } = documentData;
    
    // For now, use our existing standard document generation until we can access unified service methods
    switch (type) {
      case 'invoice':
      case 'quote':
      case 'salesOrder':
      case 'deliveryNote':
      case 'paymentReceipt':
        return this.generateStandardDocumentBody(documentData, template);
      case 'purchaseOrder':
        return this.generatePurchaseOrderBody(documentData, template);
      case 'workOrder':
        return this.generateWorkOrderBody(documentData, template);
      case 'stockTransfer':
        return this.generateStockTransferBody(documentData, template);
      case 'inventoryAdjustment':
        return this.generateInventoryAdjustmentBody(documentData, template);
      case 'timesheet':
        return this.generateTimesheetBody(documentData, template);
      case 'expenseReport':
        return this.generateExpenseReportBody(documentData, template);
      case 'budgetReport':
        return this.generateBudgetReportBody(documentData, template);
      case 'statement':
        return this.generateStatementBody(documentData, template);
      case 'reminder':
        return this.generateReminderBody(documentData, template);
      case 'contractAgreement':
        return this.generateContractAgreementBody(documentData, template);
      case 'serviceOrder':
        return this.generateServiceOrderBody(documentData, template);
      case 'maintenanceOrder':
        return this.generateMaintenanceOrderBody(documentData, template);
      case 'billOfLading':
        return this.generateBillOfLadingBody(documentData, template);
      case 'packingList':
        return this.generatePackingListBody(documentData, template);
      case 'returnNote':
        return this.generateReturnNoteBody(documentData, template);
      case 'creditNote':
        return this.generateCreditNoteBody(documentData, template);
      case 'debitNote':
        return this.generateDebitNoteBody(documentData, template);
      case 'goodsReceiving':
        return this.generateGoodsReceivingBody(documentData, template);
      case 'proformaInvoice':
        return this.generateProformaInvoiceBody(documentData, template);
      default:
        return this.generateStandardDocumentBody(documentData, template);
    }
  }

  /**
   * Map DocumentData type to UnifiedDocumentType
   */
  private mapToUnifiedDocumentType(type: string): DocumentType {
    switch (type) {
      case 'invoice':
        return 'invoice';
      case 'quote':
        return 'quote';
      case 'salesOrder':
        return 'sales-order';
      case 'deliveryNote':
        return 'delivery-note';
      case 'paymentReceipt':
        return 'payment-receipt';
      case 'purchaseOrder':
        return 'purchase-order';
      default:
        return 'standard';
    }
  }

  /**
   * Convert DocumentData to BaseDocument format used by UnifiedDocumentExportService
   */
  private convertToBaseDocument(documentData: DocumentData): BaseDocument {
    return {
      documentNumber: documentData.number,
      date: documentData.date,
      dueDate: documentData.dueDate,
      customer: documentData.customer,
      items: documentData.items,
      total: documentData.total,
      currency: documentData.currency,
      notes: documentData.notes,
      terms: documentData.terms
    };
  }

  private generatePurchaseOrderBody(documentData: DocumentData, template: DocumentTemplate): string {
    const vendorSection = this.generateVendorSection(documentData, template);
    const itemsTable = this.generatePurchaseOrderItemsTable(documentData, template);
    const totalsSection = this.generateTotalsSection(documentData, template);
    const signature = this.generatePurchaseOrderSignature(documentData, template);
    const termsConditions = this.generatePurchaseOrderTerms(documentData, template);
    const footer = this.generateFooter(documentData, template);
    
    return `
      ${vendorSection}
      ${itemsTable}
      ${totalsSection}
      ${signature}
      ${termsConditions}
      ${footer}
    `;
  }

  private generateWorkOrderBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateStockTransferBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateInventoryAdjustmentBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateTimesheetBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateExpenseReportBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateBudgetReportBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateStatementBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateReminderBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateContractAgreementBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateServiceOrderBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateMaintenanceOrderBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateBillOfLadingBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generatePackingListBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateReturnNoteBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateCreditNoteBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateDebitNoteBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateGoodsReceivingBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }

  private generateProformaInvoiceBody(documentData: DocumentData, template: DocumentTemplate): string {
    return this.generateStandardDocumentBody(documentData, template);
  }
  
  /**
   * Generate vendor section for Purchase Order
   */
  private generateVendorSection(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.customerSection.enabled) return '';
    
    const { customer } = documentData; // In Purchase Order, this would be vendor info
    
    return `
    <div class="customer-section">
      <div class="section-title">Vendor Information</div>
      <div>${customer.name || 'N/A'}</div>
      ${customer.email ? `<div>Email: ${customer.email}</div>` : ''}
      ${customer.phone ? `<div>Phone: ${customer.phone}</div>` : ''}
      ${customer.address ? `<div>Address: ${customer.address}</div>` : ''}
      ${customer.vatNumber ? `<div>VAT Number: ${customer.vatNumber}</div>` : ''}
    </div>
    `;
  }
  
  /**
   * Generate items table for Purchase Order
   */
  private generatePurchaseOrderItemsTable(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.itemsTable.enabled) return '';
    
    const { items } = documentData;
    
    const headerRow = `
      <tr>
        <th>LN</th>
        <th>PART DESCRIPTION</th>
        <th>QUANTITY</th>
        <th>UNIT PRICE</th>
        <th>TOTAL PRICE</th>
      </tr>
    `;
    
    const itemRows = items.map((item, index) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${item.description}</td>
        <td class="text-center">${item.quantity.toFixed(2)} ${item.unit}</td>
        <td class="text-right">${documentData.currency} ${item.unitPrice.toFixed(2)}</td>
        <td class="text-right">${documentData.currency} ${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');
    
    return `
    <table class="items-table">
      <thead>
        ${headerRow}
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    `;
  }
  
  /**
   * Generate Purchase Order signature section
   */
  private generatePurchaseOrderSignature(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.signature.enabled) return '';
    
    const { signature } = documentData;
    
    return `
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-title" style="color: #22c55e; font-weight: 600;">VENDOR SIGNATURE</div>
          <div style="font-size: 10px; margin-bottom: 8px;">Vendor Representative</div>
          <div class="signature-line"></div>
          <div style="font-size: 9px; margin-top: 8px;">Name & Title</div>
          <div style="font-size: 9px; margin-top: 4px;">Date: __________</div>
        </div>
        <div class="signature-box">
          <div class="signature-title" style="color: #2b6cb0; font-weight: 600;">AUTHORIZED SIGNATURE</div>
          <div style="font-size: 10px; margin-bottom: 8px;">Purchasing Manager Signature</div>
          ${signature && signature.imageUrl ? `<img src="${signature.imageUrl}" alt="Signature" style="max-width: 120px; height: auto; margin: 10px 0;">` : '<div class="signature-line"></div>'}
          <div class="signature-name-cursive" style="font-family: 'Brush Script MT', cursive; font-size: 14px; margin: 8px 0;">${signature ? signature.name : 'D. Martinez'}</div>
          <div style="font-size: 9px; font-weight: 600;">${signature ? signature.name : 'David Martinez'}</div>
          <div style="font-size: 9px; color: #4a5568;">${signature ? signature.title : 'Purchasing Manager'}</div>
          <div style="font-size: 9px; color: #4a5568;">Date: ${signature ? this.formatDate(signature.date) : this.formatDate(new Date().toISOString())}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Generate Purchase Order terms & conditions
   */
  private generatePurchaseOrderTerms(documentData: DocumentData, template: DocumentTemplate): string {
    return `
    <div class="terms-conditions">
      <div class="terms-title">Terms & Conditions:</div>
      <div class="terms-content">
        Payment Terms: Net 30 Days<br>
        Delivery: As specified<br>
        Warranty: As per manufacturer terms
      </div>
    </div>
    `;
  }
  
  /**
   * Generate standard document body for invoice, quote, sales order, delivery note, payment receipt
   */
  private generateStandardDocumentBody(documentData: DocumentData, template: DocumentTemplate): string {
    const customerSection = this.generateCustomerSection(documentData, template);
    const itemsTable = this.generateItemsTable(documentData, template);
    const totalsSection = this.generateTotalsSection(documentData, template);
    const paymentSection = this.generatePaymentSection(documentData, template);
    const signature = this.generateSignature(documentData, template);
    const footer = this.generateFooter(documentData, template);
    
    return `
      ${customerSection}
      ${itemsTable}
      ${totalsSection}
      ${paymentSection}
      ${signature}
      ${footer}
    `;
  }
  
  /**
   * Generate customer section
   */
  private generateCustomerSection(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.customerSection.enabled) return '';
    
    const { customer } = documentData;
    
    return `
    <div class="customer-section">
      <div class="section-title">Customer Information</div>
      <div>${customer.name}</div>
      ${customer.email ? `<div>Email: ${customer.email}</div>` : ''}
      ${customer.phone ? `<div>Phone: ${customer.phone}</div>` : ''}
      ${customer.address ? `<div>Address: ${customer.address}</div>` : ''}
      ${customer.vatNumber ? `<div>VAT Number: ${customer.vatNumber}</div>` : ''}
    </div>
    `;
  }
  
  /**
   * Generate items table
   */
  private generateItemsTable(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.itemsTable.enabled) return '';
    
    const { items } = documentData;
    const showPartNumbers = template.components.itemsTable.showPartNumbers;
    const showVatColumn = template.components.itemsTable.showVatColumn;
    
    const headerRow = `
      <tr>
        <th>LN</th>
        ${showPartNumbers ? '<th>PART NUMBER</th>' : ''}
        <th>PART DESCRIPTION</th>
        <th>QUANTITY</th>
        <th>UNIT PRICE</th>
        ${showVatColumn ? '<th>VAT RATE</th>' : ''}
        <th>TOTAL PRICE</th>
      </tr>
    `;
    
    const itemRows = items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        ${showPartNumbers ? `<td>${item.partNumber || ''}</td>` : ''}
        <td>${item.description}</td>
        <td>${item.quantity.toFixed(2)} ${item.unit}</td>
        <td>${documentData.currency} ${item.unitPrice.toLocaleString()}</td>
        ${showVatColumn ? `<td>${item.vatRate}%</td>` : ''}
        <td>${documentData.currency} ${item.totalPrice.toLocaleString()}</td>
      </tr>
    `).join('');
    
    return `
    <table class="items-table">
      <thead>
        ${headerRow}
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    `;
  }
  
  /**
   * Generate totals section
   */
  private generateTotalsSection(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.totalsSection.enabled) return '';
    
    const { subtotal, vatAmount, total, currency } = documentData;
    const { showSubtotal, showVat, showDiscount } = template.components.totalsSection;
    
    let totalsRows = '';
    
    // Add subtotal row if enabled
    if (showSubtotal) {
      totalsRows += `
        <tr>
          <td class="totals-label">Subtotal</td>
          <td class="totals-amount">${currency} ${subtotal.toLocaleString()}</td>
        </tr>
      `;
    }
    
    // Add VAT row if enabled and VAT amount exists
    if (showVat && vatAmount > 0) {
      totalsRows += `
        <tr>
          <td class="totals-label">VAT (${documentData.vatRate || 16}%)</td>
          <td class="totals-amount">${currency} ${vatAmount.toLocaleString()}</td>
        </tr>
      `;
    }
    
    // Add discount row if enabled (placeholder for future implementation)
    if (showDiscount && documentData.discount && documentData.discount > 0) {
      totalsRows += `
        <tr>
          <td class="totals-label">Discount</td>
          <td class="totals-amount">-${currency} ${documentData.discount.toLocaleString()}</td>
        </tr>
      `;
    }
    
    // Always add total row
    totalsRows += `
      <tr class="total-row">
        <td class="totals-label total-final">TOTAL (${currency})</td>
        <td class="totals-amount total-final">${currency} ${total.toLocaleString()}</td>
      </tr>
    `;
    
    return `
    <div class="totals-section">
      <table class="totals-table">
        ${totalsRows}
      </table>
    </div>
    `;
  }
  
  /**
   * Generate payment section using unified service approach
   */
  private generatePaymentSection(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.paymentSection.enabled) return '';
    
    const { bankDetails, mpesaDetails, paymentTerms, paymentMethod } = documentData;
    
    let paymentContent = '';
    
    // Payment terms section
    if (paymentTerms) {
      paymentContent += `
        <div class="payment-terms">
          <div class="payment-terms-title">💳 Payment Terms</div>
          <div class="payment-terms-content">
            <strong>Standard Terms Apply</strong><br>
            • Goods belong to the company until completion of payments<br>
            • Payment due on delivery<br>
            • Standard warranty applies
          </div>
        </div>
      `;
    }
    
    // Payment methods section
    paymentContent += '<div class="payment-methods">';
    
    // Bank transfer method
    if (bankDetails && template.components.paymentSection.showBankDetails) {
      paymentContent += `
        <div class="payment-method bank">
          <div class="payment-method-title">🏦 Bank Transfer</div>
          <div class="payment-method-details">
            <div><strong>Bank:</strong> ${bankDetails.bankName}</div>
            <div><strong>Account Name:</strong> ${bankDetails.accountName}</div>
            <div><strong>Account No:</strong> ${bankDetails.accountNumber}</div>
          </div>
        </div>
      `;
    }
    
    // M-Pesa method  
    if (mpesaDetails && template.components.paymentSection.showMpesaDetails) {
      paymentContent += `
        <div class="payment-method mpesa">
          <div class="payment-method-title">📱 M-Pesa Payment</div>
          <div class="payment-method-details">
            <div><strong>Pay Bill:</strong> ${mpesaDetails.payBill}</div>
            <div><strong>Account Reference:</strong> ${mpesaDetails.accountReference}</div>
            <div><strong>Business Name:</strong> ${mpesaDetails.businessName}</div>
          </div>
        </div>
      `;
    }
    
    paymentContent += '</div>';
    
    return `
      <div class="payment-section">
        <div class="payment-left">
          ${paymentContent}
        </div>
      </div>
    `;
  }
  
  /**
   * Generate signature section
   */
  private generateSignature(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.signature.enabled) return '';
    
    const { signature } = documentData;
    
    if (!signature) {
      return `
        <div class="signature-section">
          <div class="signature-box">
            <div>Sent By</div>
            <div class="signature-line"></div>
            <div>Date: __________</div>
            <div>Signature</div>
          </div>
          <div class="signature-box">
            <div>Received By</div>
            <div class="signature-line"></div>
            <div>Date: __________</div>
            <div>Signature</div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="signature-section">
        <div style="margin-left: auto; text-align: center;">
          <div style="margin-bottom: 12px;"><strong>AUTHORIZED SIGNATURE</strong></div>
          <div style="margin-bottom: 8px;">${signature.title}</div>
          ${signature.imageUrl ? `<img src="${signature.imageUrl}" alt="Signature" style="max-width: 150px; height: auto;">` : ''}
          <div style="font-style: italic; margin-top: 8px;">${signature.name}</div>
          <div style="font-size: 12px; color: #666;">${signature.name}</div>
          <div style="font-size: 12px; color: #666;">${signature.title}</div>
          <div style="font-size: 12px; color: #666;">Date: ${this.formatDate(signature.date)}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Generate footer
   */
  private generateFooter(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.footer.enabled) return '';
    
    const generatedDate = this.formatDate(new Date().toISOString());
    const generatedTime = new Date().toLocaleTimeString();
    
    return `
    <div class="footer">
      Generated on ${generatedDate}, ${generatedTime}<br>
      This is a computer-generated document and does not require a signature unless specified.
    </div>
    `;
  }
  
  /**
   * Generate QR code
   */
  private generateQrCode(documentData: DocumentData, template: DocumentTemplate): string {
    if (!template.components.qrCode.enabled) return '';
    
    // Generate QR code data
    const qrData = JSON.stringify({
      type: documentData.type,
      number: documentData.number,
      id: documentData.id,
      amount: documentData.total,
      currency: documentData.currency
    });
    
    // For now, return a placeholder. In a real implementation, you'd generate the actual QR code
    return `
    <div class="qr-code">
      <div style="font-size: 8px; text-align: center;">
        QR Code<br>
        📱<br>
        ${documentData.number}
      </div>
    </div>
    `;
  }
  
  /**
   * Export to different formats
   */
  private async exportToFormat(htmlContent: string, format: string, documentData: DocumentData): Promise<{ content: string; fileSize: number }> {
    switch (format) {
      case 'pdf':
        return await EnhancedExportService.generatePDF(htmlContent, documentData);
      case 'excel':
        return await EnhancedExportService.generateExcel(documentData);
      case 'word':
        return await EnhancedExportService.generateWord(htmlContent, documentData);
      case 'print':
        return { content: htmlContent, fileSize: new Blob([htmlContent]).size };
      default:
        return { content: htmlContent, fileSize: new Blob([htmlContent]).size };
    }
  }
  
  /**
   * Helper methods
   */
  private getDefaultTemplate(documentType: string): DocumentTemplate {
    return this.defaultTemplates.get(documentType) || this.defaultTemplates.get('invoice')!;
  }
  
  private getDocumentTitle(documentData: DocumentData): string {
    const titles = {
      invoice: 'Invoice',
      quote: 'Quotation',
      salesOrder: 'Sales Order',
      deliveryNote: 'Delivery Note',
      paymentReceipt: 'Payment Receipt',
      purchaseOrder: 'Purchase Order',
      goodsReceiving: 'Goods Receiving Note',
      proformaInvoice: 'Proforma Invoice',
      creditNote: 'Credit Note',
      debitNote: 'Debit Note',
      workOrder: 'Work Order',
      stockTransfer: 'Stock Transfer',
      inventoryAdjustment: 'Inventory Adjustment',
      returnNote: 'Return Note',
      serviceOrder: 'Service Order',
      maintenanceOrder: 'Maintenance Order',
      billOfLading: 'Bill of Lading',
      packingList: 'Packing List',
      timesheet: 'Timesheet',
      expenseReport: 'Expense Report',
      budgetReport: 'Budget Report',
      statement: 'Statement',
      reminder: 'Payment Reminder',
      contractAgreement: 'Contract Agreement'
    };
    return `${titles[documentData.type] || 'Document'} ${documentData.number}`;
  }
  
  private getDocumentTypeTitle(documentType: string): string {
    const titles = {
      invoice: 'INVOICE',
      quote: 'QUOTATION',
      salesOrder: 'SALES ORDER',
      deliveryNote: 'DELIVERY NOTE',
      paymentReceipt: 'PAYMENT RECEIPT',
      purchaseOrder: 'PURCHASE ORDER',
      goodsReceiving: 'GOODS RECEIVING NOTE',
      proformaInvoice: 'PROFORMA INVOICE',
      creditNote: 'CREDIT NOTE',
      debitNote: 'DEBIT NOTE',
      workOrder: 'WORK ORDER',
      stockTransfer: 'STOCK TRANSFER',
      inventoryAdjustment: 'INVENTORY ADJUSTMENT',
      returnNote: 'RETURN NOTE',
      serviceOrder: 'SERVICE ORDER',
      maintenanceOrder: 'MAINTENANCE ORDER',
      billOfLading: 'BILL OF LADING',
      packingList: 'PACKING LIST',
      timesheet: 'TIMESHEET',
      expenseReport: 'EXPENSE REPORT',
      budgetReport: 'BUDGET REPORT',
      statement: 'STATEMENT',
      reminder: 'PAYMENT REMINDER',
      contractAgreement: 'CONTRACT AGREEMENT'
    };
    return titles[documentType] || 'DOCUMENT';
  }
  
  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB');
  }
  
  private estimatePageCount(htmlContent: string): number {
    // Simple estimation based on content length
    const contentLength = htmlContent.length;
    const averageCharsPerPage = 3000;
    return Math.ceil(contentLength / averageCharsPerPage);
  }
  
  /**
   * Batch document generation
   */
  public async generateMultipleDocuments(
    documentsData: DocumentData[],
    options: GenerationOptions = { format: 'html' }
  ): Promise<DocumentGenerationResult[]> {
    const results: DocumentGenerationResult[] = [];
    
    for (const documentData of documentsData) {
      const result = await this.generateDocument(documentData, options);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Create a new document using the BusinessDocumentService
   */
  public async createDocument(data: DocumentCreationData): Promise<BaseDocument> {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.createDocument(data);
  }
  
  /**
   * Export document using the BusinessDocumentService
   */
  public async exportDocument(
    documentId: string,
    documentType: DocumentType,
    options: DocumentGenerationOptions = { format: 'html' }
  ): Promise<void> {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.exportDocument(documentId, documentType, options);
  }
  
  /**
   * Convert document between types using the BusinessDocumentService
   */
  public async convertDocument(
    sourceDocumentId: string,
    sourceType: DocumentType,
    targetType: DocumentType
  ): Promise<BaseDocument> {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.convertDocument(sourceDocumentId, sourceType, targetType);
  }
  
  /**
   * Get documents using the BusinessDocumentService
   */
  public getDocuments(documentType: DocumentType): BaseDocument[] {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.getDocuments(documentType);
  }
  
  /**
   * Get a specific document using the BusinessDocumentService
   */
  public getDocument(documentType: DocumentType, documentId: string): BaseDocument | null {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.getDocument(documentType, documentId);
  }
  
  /**
   * Generate preview HTML using the BusinessDocumentService
   */
  public async generatePreviewHTML(
    documentId: string,
    documentType: DocumentType
  ): Promise<string> {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.generatePreviewHTML(documentId, documentType);
  }
  
  /**
   * Batch export documents using the BusinessDocumentService
   */
  public async batchExportDocuments(
    documents: Array<{ id: string; type: DocumentType }>,
    options: DocumentGenerationOptions = { format: 'pdf' }
  ): Promise<void> {
    const businessDocumentService = BusinessDocumentService.getInstance();
    return businessDocumentService.batchExportDocuments(documents, options);
  }
  
  /**
   * Template management
   */
  public saveTemplate(template: DocumentTemplate): void {
    this.templates.set(template.id, template);
  }
  
  public getTemplate(templateId: string): DocumentTemplate | undefined {
    return this.templates.get(templateId);
  }
  
  public getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }
  
  public deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }
}

// Export singleton instance
export const comprehensiveDocumentEngine = ComprehensiveDocumentEngine.getInstance();
