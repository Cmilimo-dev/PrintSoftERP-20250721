import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { getCurrencySymbol } from '@/components/CurrencySelector';
import { ExportSettings } from '@/contexts/ExportSettingsContext';
import { DocumentCompanyService } from './documentCompanyService';
import { PaymentIntegrationService } from './paymentIntegrationService';
import { DepartmentSignatureService, DocumentType as DeptDocumentType } from './departmentSignatureService';
import { AutoNumberingService } from './autoNumberingService';
import { DocumentCustomizationService } from './documentCustomizationService';
import { DocumentCustomizationSettings, CustomizationContext } from '@/types/documentCustomization';
import QRCode from 'qrcode';

export type ExportFormat = 'mht' | 'word' | 'pdf' | 'html' | 'print' | 'view';

interface UnifiedExportOptions {
  format: ExportFormat;
  filename?: string;
  includeLogo?: boolean;
  includeSignature?: boolean;
  watermark?: string;
  colorMode?: 'color' | 'monochrome';
  logoDisplayMode?: 'none' | 'logo-only' | 'logo-with-name' | 'name-only';
  logoUrl?: string;
  customizationSettingsId?: string;
  useCustomization?: boolean;
}

/**
 * Unified Document Export Service
 * Combines the excellent logic structure from print components 
 * with the beautiful color styling from enhanced export service
 */
export class UnifiedDocumentExportService {
  
  /**
   * Export document with unified styling that adapts to format
   */
  static async generatePreviewHTML(
    document: BaseDocument, 
    documentType: DocumentType, 
    options: UnifiedExportOptions = {}
  ): Promise<string> {
    try {
      const finalOptions = {
        format: 'view' as ExportFormat,
        colorMode: 'color' as const,
        includeLogo: true,
        includeSignature: true,
        logoDisplayMode: 'logo-with-name' as const,
        ...options
      };

      return await this.generateUnifiedDocumentHTML(document, documentType, finalOptions);
    } catch (error) {
      console.error('Error generating preview HTML:', error);
      throw error;
    }
  }

  static async exportDocument(
    document: BaseDocument, 
    documentType: DocumentType, 
    options: UnifiedExportOptions
  ): Promise<void> {
    const { format, filename } = options;
    const baseFilename = filename || `${document.documentNumber}`;

    switch (format) {
      case 'mht':
        await this.exportAsMHT(document, documentType, baseFilename, options);
        break;
      case 'word':
        await this.exportAsWord(document, documentType, baseFilename, options);
        break;
      case 'pdf':
        await this.exportAsPDF(document, documentType, baseFilename, options);
        break;
      case 'html':
        await this.exportAsHTML(document, documentType, baseFilename, options);
        break;
      case 'print':
        await this.openPrintView(document, documentType, options);
        break;
      case 'view':
        await this.openViewWindow(document, documentType, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate unified CSS that adapts based on format and color mode with customization support
   */
  private static getUnifiedCSS(
    format: ExportFormat, 
    colorMode: 'color' | 'monochrome' = 'color',
    customSettings?: DocumentCustomizationSettings
  ): string {
    const isColorMode = colorMode === 'color' && format !== 'print';
    const isPrintFormat = format === 'print' || format === 'pdf';
    const isMobileView = format === 'html'; // Mobile optimizations for HTML view
    
    // Use custom settings if provided
    const settings = customSettings;
    const colors = settings?.colors;
    const typography = settings?.typography;
    const layout = settings?.layout;
    
    // Determine font sizes based on format and custom settings
    const baseFontSize = settings ? 
      (isPrintFormat ? Math.max(settings.typography.bodyFontSize - 1, 8) : 
       isMobileView ? settings.typography.bodyFontSize + 2 : 
       settings.typography.bodyFontSize) :
      (isPrintFormat ? 11 : isMobileView ? 14 : 12);
    
    const titleFontSize = settings ? 
      (isPrintFormat ? Math.max(settings.typography.documentTitleSize - 2, 12) : 
       settings.typography.documentTitleSize) :
      (isPrintFormat ? 13 : isColorMode ? 19 : 15);
    
    const headingFontSize = settings ? 
      (isPrintFormat ? Math.max(settings.typography.headingSize - 1, 10) : 
       settings.typography.headingSize) :
      (isPrintFormat ? 10 : 14);

    return `
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
        font-family: ${typography?.bodyFont || "'Trebuchet MS', 'Arial', 'Helvetica', sans-serif"};
        font-size: ${baseFontSize}px;
        line-height: ${settings?.typography.lineHeight || 1.4};
        color: ${colors?.text || (isColorMode ? '#2d3748' : '#000')};
        background: ${colors?.background || 'white'};
        margin: 0;
        padding: ${isPrintFormat ? '0' : isMobileView ? '10px' : `${layout?.margins.top || 20}px`};
        font-weight: ${typography?.fontWeight.body || 400};
      }

      .document-container {
        max-width: ${isPrintFormat ? 'none' : isMobileView ? '100%' : 
          (layout?.pageFormat === 'Letter' ? '216mm' : 
           layout?.pageFormat === 'Legal' ? '216mm' : 
           layout?.pageFormat === 'A3' ? '297mm' : '210mm')};
        margin: 0 auto;
        padding: ${isPrintFormat ? `${layout?.margins.top || 15}mm ${layout?.margins.right || 20}mm` : 
                   isMobileView ? '15px' : 
                   `${layout?.margins.top || 20}px`};
        background: ${colors?.background || 'white'};
        position: relative;
        min-height: ${isPrintFormat ? 'auto' : '297mm'};
      }

      /* Mobile responsiveness */
      @media only screen and (max-width: 768px) {
        body {
          font-size: 16px;
          padding: 5px;
        }
        
        .document-container {
          max-width: 100%;
          padding: 10px;
          margin: 0;
        }
      }

      /* Header Section - Maintaining print logic structure */
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: ${isPrintFormat ? '20px' : '30px'};
        padding-bottom: ${isPrintFormat ? '12px' : '20px'};
        border-bottom: 2px solid ${isColorMode ? '#e2e8f0' : '#2d3748'};
        page-break-inside: avoid;
        position: relative;
        z-index: 1;
      }

      .company-info {
        flex: 1;
        padding-right: ${isPrintFormat ? '15px' : '20px'};
      }

      .company-name {
        font-size: ${isPrintFormat ? '16px' : isColorMode ? '24px' : '18px'};
        font-weight: ${isColorMode ? '700' : 'bold'};
        color: ${isColorMode ? '#1a202c' : '#2d3748'};
        margin-bottom: ${isPrintFormat ? '6px' : '10px'};
        line-height: 1.2;
      }

      /* Logo styling */
      .company-logo {
        margin-bottom: ${isPrintFormat ? '8px' : '12px'};
      }

      .company-logo img {
        max-width: ${isPrintFormat ? '120px' : '150px'};
        max-height: ${isPrintFormat ? '60px' : '80px'};
        object-fit: contain;
      }

      /* Logo with name inline styling */
      .company-header-inline {
        display: flex;
        align-items: center;
        gap: ${isPrintFormat ? '8px' : '12px'};
        margin-bottom: ${isPrintFormat ? '8px' : '12px'};
      }

      .company-logo-small {
        flex-shrink: 0;
      }

      .company-logo-small img {
        max-width: ${isPrintFormat ? '40px' : '50px'};
        max-height: ${isPrintFormat ? '40px' : '50px'};
        object-fit: contain;
      }

      .company-name-inline {
        font-size: ${isPrintFormat ? '16px' : isColorMode ? '24px' : '18px'};
        font-weight: ${isColorMode ? '700' : 'bold'};
        color: ${isColorMode ? '#1a202c' : '#2d3748'};
        line-height: 1.2;
        margin: 0;
      }

      .company-details {
        font-size: ${isPrintFormat ? '9px' : '11px'};
        color: ${isColorMode ? '#4a5568' : '#4a5568'};
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
        font-family: ${typography?.documentTitleFont || "'Tahoma', sans-serif"};
        font-size: ${titleFontSize}px;
        font-weight: ${typography?.fontWeight.documentTitle || (isColorMode ? 700 : 600)};
        color: ${colors?.primary || (isColorMode || isPrintFormat ? '#2b6cb0' : '#4a5568')};
        margin-bottom: ${isPrintFormat ? '8px' : '10px'};
        line-height: 1;
      }

      .document-number {
        font-size: ${isPrintFormat ? '14px' : '18px'};
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 15px;
      }

      .document-meta {
        font-size: ${isPrintFormat ? '9px' : '11px'};
        color: #2d3748;
        line-height: 1.4;
        margin-bottom: 12px;
      }

      .document-meta div {
        margin-bottom: 2px;
      }

      .qr-code {
        margin-top: ${isPrintFormat ? '8px' : '15px'};
        text-align: right;
      }

      .qr-code img {
        width: ${isPrintFormat ? '80px' : '120px'};
        height: ${isPrintFormat ? '80px' : '120px'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#ccc'};
        border-radius: ${isColorMode ? '4px' : '0'};
      }

      /* Vendor/Customer Section - Enhanced with color options */
      .party-info-section {
        margin: ${isPrintFormat ? '15px 0' : '25px 0'};
        padding: ${isPrintFormat ? '10px' : '15px'};
        background: ${isColorMode ? '#f7fafc' : '#f9f9f9'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#ddd'};
        border-radius: ${isColorMode ? '8px' : '4px'};
        page-break-inside: avoid;
      }

      .section-header {
        font-size: ${headingFontSize}px;
        font-weight: ${typography?.fontWeight.heading || 600};
        color: ${colors?.text || (isColorMode ? '#2d3748' : '#333')};
        margin-bottom: ${isPrintFormat ? '6px' : '10px'};
        border-bottom: 1px solid ${colors?.border || (isColorMode ? '#cbd5e0' : '#ccc')};
        padding-bottom: ${isPrintFormat ? '3px' : '5px'};
      }

      .party-details {
        font-size: ${isPrintFormat ? '9px' : '11px'};
        line-height: 1.4;
      }

      .party-details p {
        margin: 3px 0;
      }

      .vendor-name, .customer-name {
        font-weight: bold;
        margin-bottom: 6px;
        color: #2d3748;
      }

      /* Items Table - Maintaining excellent print table logic */
      .line-items-section {
        margin: ${isPrintFormat ? '12px 0' : '25px 0'};
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: ${isPrintFormat ? '0.5px' : '1px'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#2d3748'};
        page-break-inside: avoid;
        position: relative;
        z-index: 1;
        background: white;
      }

      .items-table th {
        background: ${isColorMode ? '#4a5568' : '#4a5568'};
        color: white;
        padding: ${isPrintFormat ? '6px 4px' : '12px 8px'};
        text-align: left;
        font-weight: 600;
        font-size: ${isPrintFormat ? '9px' : '11px'};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: 1px solid ${isColorMode ? '#2d3748' : '#333'};
      }

      .items-table td {
        padding: ${isPrintFormat ? '5px 4px' : '10px 8px'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#cbd5e0'};
        font-size: ${isPrintFormat ? '8px' : '10px'};
        vertical-align: top;
        background: white;
        line-height: 1.3;
      }

      .items-table tbody tr:nth-child(even) {
        background: ${isColorMode ? '#f8f9fa' : '#f7fafc'};
      }

      .items-table tbody tr:hover {
        background: ${isColorMode ? '#e6fffa' : '#f1f5f9'};
      }

      /* Column widths - Maintaining print logic */
      .col-ln { width: 8%; }
      .col-code { width: 15%; }
      .col-description { width: 40%; }
      .col-qty { width: 10%; }
      .col-price { width: 15%; }
      .col-tax { width: 10%; }
      .col-total { width: 15%; }

      .text-center { text-align: center; }
      .text-right { text-align: right; }

      .item-code {
        font-weight: normal;
        color: #6b7280;
        font-size: ${isPrintFormat ? '7px' : '8px'};
        display: inline;
        margin-right: 8px;
      }

      .item-description {
        color: #2d3748;
        font-size: ${isPrintFormat ? '9px' : '11px'};
        font-weight: bold;
        display: inline;
      }

      /* Totals Section - Enhanced styling with flexible layout support */
      .totals-section {
        margin: ${isPrintFormat ? '15px 0' : '30px 0'};
        display: flex;
        justify-content: flex-end;
        page-break-inside: avoid;
        clear: both;
        position: relative;
        z-index: 1;
      }

      /* Table-based totals styling (legacy support) */
      .totals-table {
        min-width: ${isPrintFormat ? '280px' : '300px'};
        border-collapse: collapse;
        border: ${isPrintFormat ? '1px solid #666' : `1px solid ${isColorMode ? '#e2e8f0' : '#ddd'}`};
        border-radius: ${isColorMode && !isPrintFormat ? '8px' : '0'};
        overflow: hidden;
        background: white;
        position: relative;
        z-index: 200;
      }
      
      /* Flexible div-based totals styling (enhanced support) */
      .totals-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: ${isPrintFormat ? '280px' : '300px'};
        border: ${isPrintFormat ? '1px solid #666' : `1px solid ${isColorMode ? '#e2e8f0' : '#ddd'}`};
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        position: relative;
        z-index: 1;
      }
      
      .totals-row.subtotal,
      .totals-row.tax {
        border-bottom: ${isPrintFormat ? '1px solid #666' : `1px solid ${isColorMode ? '#e2e8f0' : '#ddd'}`};
      }
      
      .totals-row.total {
        background: ${isColorMode || isPrintFormat ? '#2b6cb0' : '#2d3748'} !important;
        color: white !important;
        font-weight: bold;
        border: 1px solid ${isColorMode || isPrintFormat ? '#2b6cb0' : '#2d3748'};
      }
      
      .totals-row.total .totals-label,
      .totals-row.total .totals-amount {
        background: ${isColorMode || isPrintFormat ? '#2b6cb0' : '#2d3748'} !important;
        color: white !important;
      }

      /* Unified label and amount styling (works for both table and div approaches) */
      .totals-label {
        background: ${isColorMode ? '#f7fafc' : '#f7fafc'};
        padding: ${isPrintFormat ? '8px 12px' : '12px 16px'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#cbd5e0'};
        font-weight: bold;
        text-align: right;
        font-size: ${isPrintFormat ? '10px' : '12px'};
        width: 60%;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        z-index: 1;
      }
      
      /* For div-based layout, remove table-specific borders */
      .totals-row .totals-label {
        border-right: ${isPrintFormat ? '1px solid #666' : `1px solid ${isColorMode ? '#e2e8f0' : '#ddd'}`};
        border-top: none;
        border-bottom: none;
        border-left: none;
      }

      .totals-amount {
        padding: ${isPrintFormat ? '8px 12px' : '12px 16px'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#cbd5e0'};
        text-align: right;
        background: white;
        font-size: ${isPrintFormat ? '10px' : '12px'};
        width: 40%;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        z-index: 1;
      }
      
      /* For div-based layout, remove table-specific borders */
      .totals-row .totals-amount {
        border-left: none;
        border-top: none;
        border-bottom: none;
        border-right: ${isPrintFormat ? '1px solid #666' : `1px solid ${isColorMode ? '#e2e8f0' : '#ddd'}`};
      }

      .total-final {
        background: ${isColorMode || isPrintFormat ? '#2b6cb0' : '#2d3748'} !important;
        color: white !important;
        font-size: ${isPrintFormat ? '10px' : '12px'};
        font-weight: bold;
        padding: ${isPrintFormat ? '8px 12px' : '12px 16px'};
        border: 1px solid ${isColorMode || isPrintFormat ? '#2b6cb0' : '#2d3748'};
        text-align: right;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        z-index: 1;
      }

      /* Notes and Terms - Enhanced appearance */
      .notes-section, .terms-section {
        margin: ${isPrintFormat ? '15px 0' : '20px 0'};
        padding: ${isPrintFormat ? '10px' : '15px'};
        background: ${isColorMode ? '#fffbeb' : '#f9f9f9'};
        border: 1px solid ${isColorMode ? '#fbbf24' : '#ddd'};
        border-radius: ${isColorMode ? '6px' : '4px'};
      }

      .notes-section h4, .terms-section h4 {
        font-size: ${isPrintFormat ? '10px' : '14px'};
        font-weight: 600;
        color: ${isColorMode ? '#92400e' : '#333'};
        margin-bottom: ${isPrintFormat ? '6px' : '8px'};
      }

      .notes-section p, .terms-section p {
        color: ${isColorMode ? '#451a03' : '#555'};
        line-height: 1.5;
        white-space: pre-line;
        font-size: ${isPrintFormat ? '9px' : '11px'};
      }

      /* Signature Section */
      .signature-section {
        margin: ${isPrintFormat ? '20px 0 15px 0' : '40px 0 20px 0'};
        page-break-inside: avoid;
      }

      .signature-line {
        display: flex;
        justify-content: space-between;
        gap: ${isPrintFormat ? '15px' : '40px'};
      }

      .signature-box {
        flex: 1;
        text-align: center;
        padding: ${isPrintFormat ? '15px' : '20px'};
        border: 1px solid ${isColorMode ? '#e2e8f0' : '#ddd'};
        border-radius: ${isColorMode ? '8px' : '4px'};
        background: ${isColorMode ? '#f8f9fa' : '#f9f9f9'};
      }

      .signature-space {
        height: ${isPrintFormat ? '50px' : '60px'};
        border-bottom: 2px solid #4a5568;
        margin: ${isPrintFormat ? '15px 0 8px 0' : '20px 0 10px 0'};
      }

      .signature-name {
        font-weight: 600;
        margin: 5px 0;
        font-size: ${isPrintFormat ? '9px' : '11px'};
      }

      .signature-title {
        font-size: ${isPrintFormat ? '8px' : '10px'};
        color: #6b7280;
        margin: 3px 0;
      }

      .signature-date {
        font-size: ${isPrintFormat ? '8px' : '10px'};
        color: #6b7280;
        margin-top: ${isPrintFormat ? '8px' : '10px'};
      }

      /* Footer */
      .document-footer {
        margin-top: ${isPrintFormat ? '20px' : '40px'};
        padding-top: ${isPrintFormat ? '15px' : '20px'};
        border-top: 1px solid ${isColorMode ? '#e2e8f0' : '#ddd'};
        text-align: center;
        color: #6b7280;
        font-size: ${isPrintFormat ? '8px' : '10px'};
      }

      .document-footer p {
        margin: 3px 0;
      }

      /* Print-specific media queries */
      @media print {
        @page {
          size: A4;
          margin: 15mm 20mm;
        }

        body {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 10px !important;
          background: white !important;
        }

        .document-container {
          margin: 0 !important;
          padding: 0 !important;
          max-width: none !important;
          width: 100% !important;
          min-height: auto !important;
        }

        /* Force colors for document title and totals even in print */
        .document-title {
          color: #2b6cb0 !important;
        }
        
        .total-final {
          background: #2b6cb0 !important;
          color: white !important;
        }

        .items-table th {
          background: #4a5568 !important;
          color: white !important;
        }

        .party-info-section {
          background: #f7fafc !important;
        }

        .signature-box {
          background: #f8f9fa !important;
        }

        .notes-section, .terms-section {
          background: #fffbeb !important;
        }
      }

      /* Watermark */
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        color: rgba(0, 0, 0, 0.1);
        z-index: -1;
        pointer-events: none;
        font-weight: bold;
      }
    `;
  }

  /**
   * Generate QR Code as data URL
   */
  private static async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  /**
   * Format number with commas
   */
  private static formatNumber(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) {
      num = 0;
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Generate unified document HTML using print component logic with enhanced styling
   */
  private static async generateUnifiedDocumentHTML(
    document: BaseDocument, 
    documentType: DocumentType, 
    options: UnifiedExportOptions
  ): Promise<string> {
    // Ensure document has a document number
    const documentWithNumber = this.ensureDocumentNumber(document, documentType);
    const currencySymbol = documentWithNumber.currency === 'KES' ? 'KSh' : getCurrencySymbol(documentWithNumber.currency);
    const docTitle = this.getDocumentTitle(documentType);
    // Only generate QR codes for invoices (E-tims compliance)
    const qrCodeData = documentType === 'invoice' ? await this.generateQRCode(documentWithNumber.qrCodeData || documentWithNumber.documentNumber) : null;
    const isColorMode = options.colorMode === 'color' && options.format !== 'print';

    return `
    <div class="document-container">
        ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}
        
        <!-- Header Section - Using print component structure -->
        <div class="header-section">
            <div class="company-info">
                ${this.generateCompanyHeaderFromSettings(options)}
                <div class="company-details">
                    ${this.generateCompanyDetailsFromSettings()}
                </div>
            </div>
            <div class="document-info">
                <div class="document-title">${docTitle.toUpperCase()}</div>
                <div class="document-meta">
                    ${this.getDocumentSpecificMeta(documentWithNumber, documentType)}
                    <div><strong>Status:</strong> ${((documentWithNumber as any).status || 'draft').toUpperCase()}</div>
                    ${documentType === 'goods-receiving-voucher' ? ((documentWithNumber as any).qualityCheck ? `<div><strong>Quality Check:</strong> ${((documentWithNumber as any).qualityCheck).toUpperCase()}</div>` : '') : ''}
                    <div><strong>Currency:</strong> ${documentWithNumber.currency}</div>
                    <div><strong>Print Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
                </div>
                ${qrCodeData ? `<div class="qr-code"><img src="${qrCodeData}" alt="QR Code" /></div>` : ''}
            </div>
        </div>

        <!-- Party Information Section - Enhanced styling -->
        ${this.generatePartyInformation(documentWithNumber, documentType)}

        ${this.generateDocumentContent(documentWithNumber, documentType, currencySymbol)}

        <!-- Notes for business documents (sales-order, invoice, quote) positioned after payment info -->
        ${(documentType === 'sales-order' || documentType === 'invoice' || documentType === 'quote') && documentWithNumber.notes ? `
            <div class="notes-section" style="margin-top: 20px;">
                <h4>Notes:</h4>
                <p>${documentWithNumber.notes}</p>
            </div>
        ` : ''}
        
        <!-- Notes and Terms for other documents (not delivery notes or main business docs) -->
        ${documentType !== 'delivery-note' && documentType !== 'sales-order' && documentType !== 'invoice' && documentType !== 'quote' && documentWithNumber.notes ? `
            <div class="notes-section">
                <h4>Notes:</h4>
                <p>${documentWithNumber.notes}</p>
            </div>
        ` : ''}

        ${documentType !== 'delivery-note' && documentWithNumber.terms ? `
            <div class="terms-section">
                <h4>Terms & Conditions:</h4>
                <p>${documentWithNumber.terms}</p>
            </div>
        ` : ''}

        <!-- Payment Receipt Signature Section - Right-aligned after terms -->
        ${documentType === 'payment-receipt' && (documentWithNumber as any).signature?.enabled ? `
            <div style="margin: 30px 0 20px 0; page-break-inside: avoid; display: flex; justify-content: flex-end;">
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; min-width: 180px; max-width: 220px;">
                    <h3 style="color: #1e40af; font-size: 10px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; text-align: center;">Authorized By:</h3>
                    <div style="text-align: center; padding: 6px; background: white; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        <p style="font-size: 9px; font-weight: bold; margin: 0 0 4px 0; color: #2d3748;">Finance Manager Signature</p>
                        <div style="height: 30px; border-bottom: 1px solid #4a5568; margin: 8px 0 6px 0; position: relative;">
                            <!-- Signature will be loaded dynamically by the main signature handler -->
                        </div>
                        <p style="font-size: 8px; font-weight: 600; margin: 2px 0; color: #1a202c;">Finance Manager</p>
                        <p style="font-size: 7px; color: #6b7280; margin: 1px 0;">Finance Department</p>
                        <p style="font-size: 7px; color: #6b7280; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </div>
            </div>
        ` : ''}

        <!-- Signature Section -->
        ${await this.generateSignatureSection(documentWithNumber, documentType, options)}

        <!-- Footer -->
        <div class="document-footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>This is a computer-generated document and does not require a signature unless specified.</p>
        </div>
    </div>`;
  }

  /**
   * Generate company header from settings
   */
  private static generateCompanyHeaderFromSettings(options: UnifiedExportOptions): string {
    const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
    const displaySettings = companyInfo.displaySettings;
    
    // Use system settings if logoDisplayMode is not explicitly set
    const logoDisplayMode = options.logoDisplayMode || displaySettings.headerDisplayFormat || 'logo-with-name';
    const logoUrl = options.logoUrl || companyInfo.logoUrl;

    switch (logoDisplayMode) {
      case 'logo-only':
        return logoUrl ? `
          <div class="company-logo">
            <img src="${logoUrl}" alt="${companyInfo.companyName}" />
          </div>
        ` : `
          <div class="company-logo">
            <div style="width: 120px; height: 60px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">
              LOGO
            </div>
          </div>
        `;

      case 'logo-with-name':
        return `
          <div class="company-header-inline">
            ${logoUrl ? `
              <div class="company-logo-small">
                <img src="${logoUrl}" alt="${companyInfo.companyName}" />
              </div>
            ` : `
              <div class="company-logo-small">
                <div style="width: 40px; height: 40px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #666;">
                  LOGO
                </div>
              </div>
            `}
            <div class="company-name-inline">${companyInfo.companyName}</div>
          </div>
        `;

      case 'name-only':
        return `<div class="company-name">${companyInfo.companyName}</div>`;

      case 'none':
        return '';

      default:
        return `<div class="company-name">${companyInfo.companyName}</div>`;
    }
  }

  /**
   * Generate company details from settings
   */
  private static generateCompanyDetailsFromSettings(): string {
    const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
    
    return `
      <div>${companyInfo.fullAddress}</div>
      <div>Tel: ${companyInfo.phone}</div>
      <div>Email: ${companyInfo.email}</div>
      ${companyInfo.website ? `<div>Web: ${companyInfo.website}</div>` : ''}
      <div>VAT Number: ${companyInfo.taxId}</div>
    `;
  }

  /**
   * Generate company header with flexible logo options (legacy method)
   */
  private static generateCompanyHeader(company: any, options: UnifiedExportOptions): string {
    const logoDisplayMode = options.logoDisplayMode || (options.includeLogo ? 'logo-with-name' : 'name-only');
    const logoUrl = options.logoUrl || company.logo;

    switch (logoDisplayMode) {
      case 'logo-only':
        // Show only logo, no company name text
        return logoUrl ? `
          <div class="company-logo">
            <img src="${logoUrl}" alt="${company.name}" />
          </div>
        ` : `
          <div class="company-logo">
            <div style="width: 120px; height: 60px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">
              LOGO
            </div>
          </div>
        `;

      case 'logo-with-name':
        // Show logo and name on the same line
        return `
          <div class="company-header-inline">
            ${logoUrl ? `
              <div class="company-logo-small">
                <img src="${logoUrl}" alt="${company.name}" />
              </div>
            ` : `
              <div class="company-logo-small">
                <div style="width: 40px; height: 40px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #666;">
                  LOGO
                </div>
              </div>
            `}
            <div class="company-name-inline">${company.name}</div>
          </div>
        `;

      case 'name-only':
        // Show only company name (default behavior)
        return `<div class="company-name">${company.name}</div>`;

      case 'none':
        // Show neither logo nor name
        return '';

      default:
        return `<div class="company-name">${company.name}</div>`;
    }
  }

  /**
   * Generate party information section
   */
  private static generatePartyInformation(document: BaseDocument, documentType: DocumentType): string {
    const isPurchaseDoc = ['purchase-order', 'goods-receiving-voucher'].includes(documentType);
    const party = isPurchaseDoc ? (document as any).vendor : (document as any).customer;
    const partyTitle = isPurchaseDoc ? 'Vendor Information' : 'Customer Information';

    if (!party) return '';

    return `
        <div class="party-info-section">
            <div class="section-header">${partyTitle}</div>
            <div class="party-details">
                <p class="${isPurchaseDoc ? 'vendor-name' : 'customer-name'}">${party.name || 'N/A'}</p>
                ${party.address ? `<p>${party.address}</p>` : ''}
                ${party.city || party.state || party.zip ? 
                    `<p>${[party.city, party.state, party.zip].filter(Boolean).join(', ')}</p>` : ''}
                ${party.phone ? `<p>Phone: ${party.phone}</p>` : ''}
                ${party.email ? `<p>Email: ${party.email}</p>` : ''}
                ${party.taxId ? `<p>Tax ID: ${party.taxId}</p>` : ''}
            </div>
        </div>
    `;
  }

  /**
   * Generate document-specific content based on document type
   */
  private static generateDocumentContent(document: BaseDocument, documentType: DocumentType, currencySymbol: string): string {
    console.log('🎯 generateDocumentContent called for:', documentType);
    
    if (documentType === 'payment-receipt') {
      console.log('💳 Generating payment receipt content (no payment info section)');
      return this.generatePaymentReceiptContent(document, currencySymbol);
    } else if (documentType === 'delivery-note') {
      console.log('🚚 Generating delivery note content (no payment info section)');
      return this.generateDeliveryNoteContent(document, currencySymbol);
    } else if (documentType === 'financial-report') {
      console.log('📊 Generating financial report content (no payment info section)');
      return this.generateFinancialReportContent(document, currencySymbol);
    } else {
      // For documents with line items (invoices, purchase orders, etc.)
      console.log('📝 Generating line items content (includes payment info section)');
      return this.generateLineItemsContent(document, documentType, currencySymbol);
    }
  }

  /**
   * Generate payment receipt specific content with business logic - Compact Layout
   */
  private static generatePaymentReceiptContent(document: BaseDocument, currencySymbol: string): string {
    const receipt = document as any;
    
    // Calculate payment status with overpayment logic
    const calculatePaymentStatus = () => {
      const amountPaid = receipt.amountPaid || 0;
      const totalAmount = receipt.invoiceTotal || document.total || 0;
      
      if (totalAmount === 0) return { status: 'PAID IN FULL', percentage: 100, isOverpaid: false };
      
      const percentage = Math.round((amountPaid / totalAmount) * 100);
      
      if (percentage > 100) {
        return { status: 'OVERPAID', percentage, isOverpaid: true };
      } else if (percentage >= 100) {
        return { status: 'PAID IN FULL', percentage: 100, isOverpaid: false };
      } else {
        return { status: `${percentage}% PAID`, percentage, isOverpaid: false };
      }
    };

    const paymentStatus = calculatePaymentStatus();
    const remainingBalance = (receipt.invoiceTotal || 0) - (receipt.amountPaid || 0);
    const isOverpaid = remainingBalance < 0;
    const overpaymentAmount = Math.abs(Math.min(0, remainingBalance));
    const actualBalance = Math.max(0, remainingBalance);
    
    return `
        <!-- Compact Payment Status Banner -->
        <div style="background: #dcfce7; border: 1px solid #16a34a; padding: 10px; margin: 8px 0; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
                <div style="flex: 1;">
                    <div style="font-size: 12px; font-weight: bold; color: #000; margin-bottom: 4px;">Payment Received</div>
                    <div style="font-size: 10px; color: #000; margin-bottom: 2px;"><strong>Amount:</strong> ${currencySymbol} ${this.formatNumber(receipt.amountPaid || 0)}</div>
                    ${receipt.invoiceTotal ? `<div style="font-size: 10px; color: #000; margin-bottom: 2px;"><strong>Invoice:</strong> ${currencySymbol} ${this.formatNumber(receipt.invoiceTotal)}</div>` : ''}
                    <div style="font-size: 10px; color: #000; margin-bottom: 2px;">
                        <strong>Method:</strong> 
                        <span style="background: #1e40af; color: white; padding: 1px 4px; border-radius: 2px; font-size: 9px; margin-left: 4px;">
                            ${receipt.paymentMethod || 'N/A'}
                        </span>
                    </div>
                    <div style="font-size: 10px; color: #000;"><strong>Ref:</strong> ${receipt.reference || 'N/A'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="border: 2px solid ${paymentStatus.isOverpaid ? '#f59e0b' : '#16a34a'}; color: ${paymentStatus.isOverpaid ? '#f59e0b' : '#16a34a'}; padding: 6px 12px; font-weight: bold; font-size: 12px; background: white;">
                        ${paymentStatus.status}
                    </div>
                    ${paymentStatus.isOverpaid ? `
                        <div style="margin-top: 4px; font-size: 9px; color: #f59e0b; font-weight: bold;">
                            Credit: ${currencySymbol} ${this.formatNumber(overpaymentAmount)}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Compact Payment Summary Section -->
        <div style="margin: 12px 0; border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
            <div style="font-size: 12px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">Payment Summary</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Amount Paid:</span>
                    <span style="font-weight: bold;">${currencySymbol} ${this.formatNumber(receipt.amountPaid || 0)}</span>
                </div>
                ${receipt.invoiceTotal ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span>Invoice Total:</span>
                        <span>${currencySymbol} ${this.formatNumber(receipt.invoiceTotal)}</span>
                    </div>
                    ${isOverpaid ? `
                        <div style="display: flex; justify-content: space-between;">
                            <span>Overpayment:</span>
                            <span style="color: #f59e0b; font-weight: bold;">${currencySymbol} ${this.formatNumber(overpaymentAmount)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Customer Credit:</span>
                            <span style="color: #f59e0b; font-weight: bold;">${currencySymbol} ${this.formatNumber(overpaymentAmount)}</span>
                        </div>
                    ` : `
                        <div style="display: flex; justify-content: space-between;">
                            <span>Remaining Balance:</span>
                            <span style="${actualBalance <= 0 ? 'color: #16a34a;' : 'color: #dc2626;'}">${currencySymbol} ${this.formatNumber(actualBalance)}</span>
                        </div>
                    `}
                ` : ''}
            </div>
            <div style="border-top: 1px solid #1e40af; padding-top: 6px; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="font-weight: bold;">Payment Status:</span>
                    <span style="font-weight: bold; color: ${paymentStatus.isOverpaid ? '#f59e0b' : '#16a34a'};">${paymentStatus.status}</span>
                </div>
                ${isOverpaid ? `
                    <div style="margin-top: 6px; padding: 6px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 3px;">
                        <div style="font-size: 10px; font-weight: bold; color: #92400e; margin-bottom: 3px;">⚠️ Overpayment Notice</div>
                        <div style="font-size: 9px; color: #92400e;">Customer overpaid by ${currencySymbol} ${this.formatNumber(overpaymentAmount)}. Options:</div>
                        <div style="font-size: 8px; color: #92400e; margin-top: 2px; line-height: 1.2;">
                            • Credit to future purchases • Refund to customer • Hold on account
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Compact Receipt Information -->
        <div style="margin: 12px 0;">
            <div style="font-size: 11px; font-weight: bold; color: #1e40af; margin-bottom: 4px;">Receipt Information:</div>
            <div style="font-size: 9px; line-height: 1.3; color: #000;">
                <div>• Payment received confirmation • Retain for records • Contact: ${document.company.phone} or ${document.company.email}</div>
                ${receipt.relatedInvoice ? `<div>• Related Invoice: ${receipt.relatedInvoice}</div>` : ''}
            </div>
        </div>
    `;
  }

  /**
   * Generate delivery note specific content with simplified item display
   */
  private static generateDeliveryNoteContent(document: BaseDocument, currencySymbol: string): string {
    const deliveryNote = document as any;
    
    return `
        <!-- Items Table - Simplified -->
        <div style="margin: 30px 0;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #1e40af; background: white;">
                <thead>
                    <tr style="background: #1e40af; color: white;">
                        <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold; border: 1px solid #1e40af; width: 10%;">#</th>
                        <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold; border: 1px solid #1e40af; width: 70%;">Item Description</th>
                        <th style="padding: 12px; text-align: center; font-size: 14px; font-weight: bold; border: 1px solid #1e40af; width: 20%;">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${document.items.map((item, index) => `
                        <tr style="${index % 2 === 1 ? 'background: #f8f9fa;' : 'background: white;'}">
                            <td style="padding: 10px; text-align: center; border: 1px solid #cbd5e0; font-weight: bold; color: #4a5568;">${index + 1}</td>
                            <td style="padding: 10px; border: 1px solid #cbd5e0;">
                                <div style="color: #4a5568; font-size: 13px;">${item.description}</div>
                            </td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #cbd5e0; font-weight: bold; font-size: 16px; color: #1e40af;">${item.quantity.toFixed(2)} ${item.unit || 'ea'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Signature Section for Delivery -->
        <div style="margin: 40px 0 20px 0; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; gap: 40px;">
                <div style="flex: 1; text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8f9fa;">
                    <p style="font-weight: bold; margin-bottom: 10px;">Sent By</p>
                    <div style="height: 60px; border-bottom: 2px solid #4a5568; margin: 20px 0 10px 0;"></div>
                    <p style="font-weight: 600; margin: 5px 0;">_________________________</p>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0;">Date: _______________</p>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0;">Signature</p>
                </div>
                <div style="flex: 1; text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8f9fa;">
                    <p style="font-weight: bold; margin-bottom: 10px;">Received By</p>
                    <div style="height: 60px; border-bottom: 2px solid #4a5568; margin: 20px 0 10px 0;"></div>
                    <p style="font-weight: 600; margin: 5px 0;">_________________________</p>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0;">Date: _______________</p>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0;">Signature</p>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate financial report specific content with business analytics
   */
  private static generateFinancialReportContent(document: BaseDocument, currencySymbol: string): string {
    const report = document as any;
    
    return `
        <!-- Financial Summary Cards -->
        <div style="margin: 20px 0;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                <div style="border: 2px solid #0369a1; padding: 15px; text-align: center; background-color: #f0f9ff;">
                    <div style="font-size: 12px; color: #0369a1; margin-bottom: 5px; font-weight: bold;">TOTAL REVENUE</div>
                    <div style="font-size: 20px; font-weight: bold; color: #059669;">${currencySymbol} ${report.totalRevenue?.toLocaleString() || '0'}</div>
                </div>
                <div style="border: 2px solid #dc2626; padding: 15px; text-align: center; background-color: #fef2f2;">
                    <div style="font-size: 12px; color: #dc2626; margin-bottom: 5px; font-weight: bold;">TOTAL EXPENSES</div>
                    <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${currencySymbol} ${report.totalExpenses?.toLocaleString() || '0'}</div>
                </div>
                <div style="border: 2px solid #059669; padding: 15px; text-align: center; background-color: #f0fdf4;">
                    <div style="font-size: 12px; color: #059669; margin-bottom: 5px; font-weight: bold;">NET PROFIT</div>
                    <div style="font-size: 20px; font-weight: bold; color: #059669;">${currencySymbol} ${report.netProfit?.toLocaleString() || '0'}</div>
                </div>
                <div style="border: 2px solid #2563eb; padding: 15px; text-align: center; background-color: #eff6ff;">
                    <div style="font-size: 12px; color: #2563eb; margin-bottom: 5px; font-weight: bold;">CASH FLOW</div>
                    <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${currencySymbol} ${report.cashFlow?.toLocaleString() || '0'}</div>
                </div>
            </div>
        </div>

        <!-- Recent Transactions -->
        ${report.transactions && report.transactions.length > 0 ? `
            <div style="margin: 30px 0;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #2d3748; border-bottom: 2px solid #2d3748; padding-bottom: 8px;">Recent Transactions</div>
                <table style="width: 100%; border-collapse: collapse; border: 2px solid #2d3748;">
                    <thead>
                        <tr>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Date</th>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Description</th>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Type</th>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.transactions.map((transaction: any, index: number) => `
                            <tr style="${index % 2 === 1 ? 'background-color: #f7fafc;' : ''}">
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px;">${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px;">${transaction.description}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px;">
                                    <span style="color: ${transaction.type === 'credit' ? '#059669' : '#dc2626'}; font-weight: bold; text-transform: capitalize;">
                                        ${transaction.type}
                                    </span>
                                </td>
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">
                                    <span style="color: ${transaction.type === 'credit' ? '#059669' : '#dc2626'}; font-weight: bold;">
                                        ${currencySymbol} ${this.formatNumber(transaction.amount)}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        <!-- Budget Analysis -->
        ${report.budgetAnalysis && report.budgetAnalysis.length > 0 ? `
            <div style="margin: 30px 0;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #2d3748; border-bottom: 2px solid #2d3748; padding-bottom: 8px;">Budget Analysis</div>
                <table style="width: 100%; border-collapse: collapse; border: 2px solid #2d3748;">
                    <thead>
                        <tr>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Category</th>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Budgeted</th>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Actual</th>
                            <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Variance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.budgetAnalysis.map((item: any, index: number) => `
                            <tr style="${index % 2 === 1 ? 'background-color: #f7fafc;' : ''}">
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; font-weight: bold;">${item.category}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">${currencySymbol} ${this.formatNumber(item.budgeted)}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">${currencySymbol} ${this.formatNumber(item.actual)}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">
                                    <span style="color: ${item.variance >= 0 ? '#059669' : '#dc2626'}; font-weight: bold;">
                                        ${currencySymbol} ${this.formatNumber(item.variance)}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
    `;
  }

  /**
   * Generate line items content for documents with items
   */
  private static generateLineItemsContent(document: BaseDocument, documentType: DocumentType, currencySymbol: string): string {
    console.log('📋 generateLineItemsContent called for:', documentType);
    return `
        <!-- Line Items Section - Using original print table structure -->
        <div class="line-items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="col-ln">Ln</th>
                        <th class="col-description">Part Description</th>
                        <th class="col-qty">Quantity</th>
                        <th class="col-price">Unit Price</th>
                        ${document.taxSettings?.type === 'per_item' && (document.taxSettings?.defaultRate || 0) > 0 ? '<th class="col-tax">VAT Rate</th>' : ''}
                        <th class="col-total">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${document.items.map((item, index) => `
                        <tr class="${index % 2 === 1 ? 'row-even' : ''}">
                            <td class="col-ln text-center">${index + 1}</td>
                            <td class="col-description">
                                <span class="item-code">${item.itemCode || ''}</span>
                                <span class="item-description">${item.description}</span>
                            </td>
                            <td class="col-qty text-center">${(item.quantity || 0).toFixed(2)} ea</td>
                            <td class="col-price text-right">${currencySymbol} ${this.formatNumber(item.unitPrice || 0)}</td>
                            ${document.taxSettings?.type === 'per_item' && (document.taxSettings?.defaultRate || 0) > 0 ? 
                                `<td class="col-tax text-center">${(item.taxRate || 0).toFixed(1)}%</td>` : ''}
                            <td class="col-total text-right">${currencySymbol} ${this.formatNumber(item.total || 0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Payment Information and Totals Section - Two Column Layout -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; gap: 20px;">
            <!-- Payment Information Section (Left Column) -->
            <div style="flex: 1; max-width: 400px;">
                ${this.generatePaymentInformationSection(document, documentType, currencySymbol)}
            </div>
            
            <!-- Totals Section (Right Column) -->
            <div class="totals-section" style="flex: 0 0 auto;">
                <table class="totals-table">
                    <tbody>
                        <tr>
                            <td class="totals-label">Subtotal</td>
                            <td class="totals-amount">${currencySymbol} ${this.formatNumber(document.subtotal || 0)}</td>
                        </tr>
                        ${(document.taxSettings?.defaultRate || 0) > 0 ? `
                        <tr>
                            <td class="totals-label">VAT (${document.taxSettings?.defaultRate || 0}%)</td>
                            <td class="totals-amount">${currencySymbol} ${this.formatNumber(document.taxAmount || 0)}</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td class="totals-label total-final">TOTAL (${document.currency})</td>
                            <td class="totals-amount total-final">${currencySymbol} ${this.formatNumber(document.total || 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Authorized Signature Section (if applicable) -->
        ${(documentType === 'sales-order' || documentType === 'invoice' || documentType === 'quote') && this.shouldIncludeAuthorizedSignature(documentType) ? `
            <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; min-width: 180px; max-width: 220px;">
                    <h3 style="color: #1e40af; font-size: 10px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; text-align: center;">Authorized Signature</h3>
                    <div style="text-align: center; padding: 6px; background: white; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        <p style="font-size: 9px; font-weight: bold; margin: 0 0 4px 0; color: #2d3748;">${this.getAuthorizedSignatureTitle(documentType)}</p>
                        <div style="height: 30px; border-bottom: 1px solid #4a5568; margin: 8px 0 6px 0; position: relative;">
                            <div style="font-family: 'Brush Script MT', cursive; font-size: 14px; color: #2d3748; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);">
                                ${this.getSignatureName(document, documentType)}
                            </div>
                        </div>
                        <p style="font-size: 8px; font-weight: 600; margin: 2px 0; color: #1a202c;">${this.getUserName(document, documentType)}</p>
                        <p style="font-size: 7px; color: #6b7280; margin: 1px 0;">${this.getAuthorizedPersonTitle(document, documentType)}</p>
                        <p style="font-size: 7px; color: #6b7280; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <!-- Signature Section for Purchase Orders (side-by-side layout) -->
        ${documentType === 'purchase-order' && this.shouldIncludeAuthorizedSignature(documentType) ? `
            <div style="margin-top: 2px; display: flex; justify-content: space-between; gap: 20px;">
                <!-- Vendor Signature (Left Side) -->
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; min-width: 180px; max-width: 220px;">
                    <h3 style="color: #16a34a; font-size: 10px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; text-align: center;">Vendor Signature</h3>
                    <div style="text-align: center; padding: 6px; background: white; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        <p style="font-size: 9px; font-weight: bold; margin: 0 0 4px 0; color: #2d3748;">Vendor Representative</p>
                        <div style="height: 30px; border-bottom: 1px solid #4a5568; margin: 8px 0 6px 0;"></div>
                        <p style="font-size: 8px; margin: 2px 0; color: #1a202c;">_____________________</p>
                        <p style="font-size: 7px; color: #6b7280; margin: 1px 0;">Name & Title</p>
                        <p style="font-size: 7px; color: #6b7280; margin-top: 4px;">Date: ___________</p>
                    </div>
                </div>
                
                <!-- Authorized Signature (Right Side) -->
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; min-width: 180px; max-width: 220px;">
                    <h3 style="color: #1e40af; font-size: 10px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; text-align: center;">Authorized Signature</h3>
                    <div style="text-align: center; padding: 6px; background: white; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        <p style="font-size: 9px; font-weight: bold; margin: 0 0 4px 0; color: #2d3748;">${this.getAuthorizedSignatureTitle(documentType)}</p>
                        <div style="height: 30px; border-bottom: 1px solid #4a5568; margin: 8px 0 6px 0; position: relative;">
                            <div style="font-family: 'Brush Script MT', cursive; font-size: 14px; color: #2d3748; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);">
                                ${this.getSignatureName(document, documentType)}
                            </div>
                        </div>
                        <p style="font-size: 8px; font-weight: 600; margin: 2px 0; color: #1a202c;">${this.getUserName(document, documentType)}</p>
                        <p style="font-size: 7px; color: #6b7280; margin: 1px 0;">${this.getAuthorizedPersonTitle(document, documentType)}</p>
                        <p style="font-size: 7px; color: #6b7280; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <!-- Authorized Signature Section for other document types -->
        ${documentType !== 'sales-order' && documentType !== 'invoice' && documentType !== 'quote' && documentType !== 'purchase-order' && this.shouldIncludeAuthorizedSignature(documentType) ? `
            <div style="margin-top: 2px; display: flex; justify-content: flex-end;">
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; min-width: 180px; max-width: 220px;">
                    <h3 style="color: #1e40af; font-size: 10px; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase; text-align: center;">Authorized Signature</h3>
                    <div style="text-align: center; padding: 6px; background: white; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                        <p style="font-size: 9px; font-weight: bold; margin: 0 0 4px 0; color: #2d3748;">${this.getAuthorizedSignatureTitle(documentType)}</p>
                        <div style="height: 30px; border-bottom: 1px solid #4a5568; margin: 8px 0 6px 0; position: relative;">
                            <div style="font-family: 'Brush Script MT', cursive; font-size: 14px; color: #2d3748; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);">
                                ${this.getSignatureName(document, documentType)}
                            </div>
                        </div>
                        <p style="font-size: 8px; font-weight: 600; margin: 2px 0; color: #1a202c;">${this.getUserName(document, documentType)}</p>
                        <p style="font-size: 7px; color: #6b7280; margin: 1px 0;">${this.getAuthorizedPersonTitle(document, documentType)}</p>
                        <p style="font-size: 7px; color: #6b7280; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                    ${documentType === 'goods-receiving-voucher' ? `
                        <div style="text-align: center; padding: 6px; background: white; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); margin-top: 4px;">
                            <p style="font-size: 9px; font-weight: bold; margin: 0 0 4px 0; color: #2d3748;">Vendor Signature</p>
                            <div style="height: 30px; border-bottom: 1px solid #4a5568; margin: 8px 0 6px 0;"></div>
                            <p style="font-size: 8px; margin: 2px 0; color: #1a202c;">_____________________</p>
                            <p style="font-size: 7px; color: #6b7280; margin: 1px 0;">Name & Title</p>
                            <p style="font-size: 7px; color: #6b7280; margin-top: 4px;">Date: ___________</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}
    `;
  }

  /**
   * Get document-specific metadata
   */
  private static getDocumentSpecificMeta(document: BaseDocument, documentType: DocumentType): string {
    switch (documentType) {
      case 'invoice':
        const invoice = document as any;
        return `
            <div><strong>Invoice #:</strong> ${document.documentNumber}</div>
            <div><strong>Invoice Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            ${invoice.dueDate ? `<div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}</div>` : ''}
        `;
      case 'quote':
        const quote = document as any;
        return `
            <div><strong>Quote #:</strong> ${document.documentNumber}</div>
            <div><strong>Quote Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            ${quote.validUntil ? `<div><strong>Valid Until:</strong> ${new Date(quote.validUntil).toLocaleDateString('en-GB')}</div>` : ''}
            ${quote.validityPeriod ? `<div><strong>Validity:</strong> ${quote.validityPeriod} days</div>` : ''}
        `;
      case 'purchase-order':
        const po = document as any;
        return `
            <div><strong>PO Number:</strong> ${document.documentNumber}</div>
            <div><strong>Order Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            ${po.vendor?.expectedDelivery ? `<div><strong>Expected Delivery:</strong> ${new Date(po.vendor.expectedDelivery).toLocaleDateString('en-GB')}</div>` : ''}
            ${po.approvalStatus ? `<div><strong>Approval:</strong> ${po.approvalStatus.toUpperCase()}</div>` : ''}
        `;
      case 'sales-order':
        const so = document as any;
        return `
            <div><strong>SO Number:</strong> ${document.documentNumber}</div>
            <div><strong>Order Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            ${so.expectedDelivery ? `<div><strong>Expected Delivery:</strong> ${new Date(so.expectedDelivery).toLocaleDateString('en-GB')}</div>` : ''}
        `;
      case 'goods-receiving-voucher':
        const grv = document as any;
        return `
            <div><strong>GRV Number:</strong> ${grv.grvNumber}</div>
            <div><strong>Received Date:</strong> ${new Date(grv.receivedDate).toLocaleDateString('en-GB')}</div>
        `;
      case 'financial-report':
        const report = document as any;
        return `
            <div><strong>Report #:</strong> ${document.documentNumber}</div>
            <div><strong>Report Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            <div><strong>Report Type:</strong> ${(report.reportType || 'financial').toUpperCase()}</div>
            <div><strong>Period:</strong> ${report.reportPeriod || 'Current Period'}</div>
            ${report.fromDate && report.toDate ? `<div><strong>Date Range:</strong> ${new Date(report.fromDate).toLocaleDateString('en-GB')} - ${new Date(report.toDate).toLocaleDateString('en-GB')}</div>` : ''}
        `;
      case 'payment-receipt':
        const receipt = document as any;
        return `
            <div><strong>Receipt #:</strong> ${document.documentNumber}</div>
            <div><strong>Receipt Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            ${receipt.relatedInvoice ? `<div><strong>Invoice #:</strong> ${receipt.relatedInvoice}</div>` : ''}
        `;
      case 'delivery-note':
        const delivery = document as any;
        return `
            <div><strong>Delivery #:</strong> ${document.documentNumber}</div>
            <div><strong>Delivery Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
            ${delivery.deliveryAddress ? `<div><strong>Delivery To:</strong> ${delivery.deliveryAddress}</div>` : ''}
        `;
      default:
        return `
            <div><strong>Document #:</strong> ${document.documentNumber}</div>
            <div><strong>Date:</strong> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
        `;
    }
  }

  /**
   * Ensure document has a document number, generate one if missing
   */
  private static ensureDocumentNumber(document: BaseDocument, documentType: DocumentType): BaseDocument {
    if (!document.documentNumber) {
      try {
        const autoNumberingService = AutoNumberingService.getInstance();
        const generatedNumber = autoNumberingService.generateDocumentNumber(documentType);
        return {
          ...document,
          documentNumber: generatedNumber || `${documentType.toUpperCase()}-${Date.now()}`
        };
      } catch (error) {
        console.warn('Failed to generate document number, using fallback:', error);
        return {
          ...document,
          documentNumber: `${documentType.toUpperCase()}-${Date.now()}`
        };
      }
    }
    return document;
  }

  /**
   * Get document title based on type
   */
  private static getDocumentTitle(documentType: DocumentType): string {
    const titles: { [key in DocumentType]: string } = {
      'purchase-order': 'Purchase Order',
      'invoice': 'Invoice',
      'quote': 'Quotation',
      'sales-order': 'Sales Order',
      'payment-receipt': 'Payment Receipt',
      'delivery-note': 'Delivery Note',
      'financial-report': 'Financial Report',
      'goods-receiving-voucher': 'Goods Receiving Voucher',
      'credit-note': 'Credit Note',
      'payment': 'Payment',
      'customer-return': 'Customer Return',
      'goods-return': 'Goods Return',
      'vendor': 'Vendor Document'
    };
    
    return titles[documentType] || 'Document';
  }

  // Export methods
  private static async exportAsMHT(document: BaseDocument, documentType: DocumentType, filename: string, options: UnifiedExportOptions): Promise<void> {
    // Get customization settings if provided
    const customSettings = options.useCustomization ? this.getCustomizationSettings(documentType, options) : undefined;
    
    const htmlContent = await this.generateUnifiedDocumentHTML(document, documentType, { ...options, colorMode: 'color' });
    const cssContent = this.getUnifiedCSS('mht', 'color', customSettings);
    
    const boundary = `----=_NextPart_${Date.now()}`;
    const mhtContent = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${this.getDocumentTitle(documentType)} - ${document.documentNumber}</title>
    <style type="text/css">
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>

--${boundary}--`;

    const blob = new Blob([mhtContent], { type: 'message/rfc822' });
    this.downloadBlob(blob, `${filename}.mht`);
  }

  private static async exportAsWord(document: BaseDocument, documentType: DocumentType, filename: string, options: UnifiedExportOptions): Promise<void> {
    // Get customization settings if provided
    const customSettings = options.useCustomization ? this.getCustomizationSettings(documentType, options) : undefined;
    
    const htmlContent = await this.generateUnifiedDocumentHTML(document, documentType, { ...options, colorMode: 'color' });
    const cssContent = this.getUnifiedCSS('word', 'color', customSettings);
    
    const wordContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word">
    <title>${this.getDocumentTitle(documentType)} - ${document.documentNumber}</title>
    <style>
        ${cssContent}
    </style>
</head>
<body lang=EN-US style='tab-interval:.5in'>
    ${htmlContent}
</body>
</html>`;

    const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    this.downloadBlob(blob, `${filename}.doc`);
  }

  private static async exportAsPDF(document: BaseDocument, documentType: DocumentType, filename: string, options: UnifiedExportOptions): Promise<void> {
    // Get customization settings if provided
    const customSettings = options.useCustomization ? this.getCustomizationSettings(documentType, options) : undefined;
    
    const htmlContent = await this.generateUnifiedDocumentHTML(document, documentType, { ...options, colorMode: 'monochrome' });
    const cssContent = this.getUnifiedCSS('pdf', 'monochrome', customSettings);
    
    const pdfContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${this.getDocumentTitle(documentType)} - ${document.documentNumber}</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(#bgGradient)"/><path d="M8 6h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6v8h-4V6zm4 4v6h6c1.1 0 2-.9 2-2s-.9-2-2-2h-6z" fill="#ffffff"/></svg>`)}" />
    <style type="text/css">
        ${cssContent}
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
    }
  }

  private static async exportAsHTML(document: BaseDocument, documentType: DocumentType, filename: string, options: UnifiedExportOptions): Promise<void> {
    // Get customization settings if provided
    const customSettings = options.useCustomization ? this.getCustomizationSettings(documentType, options) : undefined;
    
    const htmlContent = await this.generateUnifiedDocumentHTML(document, documentType, { ...options, colorMode: 'color' });
    const cssContent = this.getUnifiedCSS('html', 'color', customSettings);
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getDocumentTitle(documentType)} - ${document.documentNumber}</title>
    <style type="text/css">
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    this.downloadBlob(blob, `${filename}.html`);
  }

  private static async openPrintView(document: BaseDocument, documentType: DocumentType, options: UnifiedExportOptions): Promise<void> {
    // Get customization settings if provided
    const customSettings = options.useCustomization ? this.getCustomizationSettings(documentType, options) : undefined;
    
    const htmlContent = await this.generateUnifiedDocumentHTML(document, documentType, { ...options, colorMode: 'monochrome' });
    const cssContent = this.getUnifiedCSS('print', 'monochrome', customSettings);
    
    const printContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${this.getDocumentTitle(documentType)} - ${document.documentNumber}</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(#bgGradient)"/><path d="M8 6h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6v8h-4V6zm4 4v6h6c1.1 0 2-.9 2-2s-.9-2-2-2h-6z" fill="#ffffff"/></svg>`)}" />
    <style type="text/css">
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  }

  private static async openViewWindow(document: BaseDocument, documentType: DocumentType, options: UnifiedExportOptions): Promise<void> {
    try {
      // Get customization settings if provided
      const customSettings = options.useCustomization ? this.getCustomizationSettings(documentType, options) : undefined;
      
      const htmlContent = await this.generateUnifiedDocumentHTML(document, documentType, { ...options, colorMode: 'color' });
      const cssContent = this.getUnifiedCSS('view', 'color', customSettings);
      
      const viewContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getDocumentTitle(documentType)} - ${document.documentNumber}</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(#bgGradient)"/><path d="M8 6h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6v8h-4V6zm4 4v6h6c1.1 0 2-.9 2-2s-.9-2-2-2h-6z" fill="#ffffff"/></svg>`)}" />
    <style type="text/css">
        ${cssContent}
        body {
          background: #f5f5f5;
          padding: 20px;
        }
        .document-container {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background: white;
          border-radius: 8px;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

      // Use a timeout to ensure this runs in response to user gesture
      setTimeout(() => {
        const viewWindow = window.open('', '_blank');
        if (viewWindow) {
          viewWindow.document.write(viewContent);
          viewWindow.document.close();
          viewWindow.focus();
        } else {
          console.warn('Failed to open view window - popup may be blocked');
        }
      }, 0);
    } catch (error) {
      console.error('Error opening view window:', error);
    }
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Determine if authorized signature should be included for document type
   */
  private static shouldIncludeAuthorizedSignature(documentType: DocumentType): boolean {
    const businessDocuments = [
      'sales-order',
      'purchase-order', 
      'invoice',
      'payment-receipt',
      'quote'
    ];
    return businessDocuments.includes(documentType);
  }

  /**
   * Get the appropriate signature title based on document type using DepartmentSignatureService
   */
  private static getAuthorizedSignatureTitle(documentType: DocumentType): string {
    // Try to get title from DepartmentSignatureService first
    try {
      const deptDocType = this.mapDocumentTypeToDepartmentType(documentType);
      if (deptDocType) {
        const defaultSignature = DepartmentSignatureService.getDefaultSignatureForDocument(deptDocType);
        if (defaultSignature?.title) {
          return `${defaultSignature.title} Signature`;
        }
      }
    } catch (error) {
      console.warn('Failed to get signature title from DepartmentSignatureService:', error);
    }
    
    // Fallback to default titles
    const titles: { [key in DocumentType]?: string } = {
      'sales-order': 'Sales Manager Signature',
      'purchase-order': 'Procurement Manager Signature',
      'invoice': 'Accounts Manager Signature',
      'payment-receipt': 'Finance Manager Signature',
      'quote': 'Sales Manager Signature'
    };
    return titles[documentType] || 'Authorized Signature';
  }

  /**
   * Get the appropriate person title based on document type using DepartmentSignatureService
   */
  private static getAuthorizedPersonTitle(document: BaseDocument, documentType: DocumentType): string {
    // Try to get title from DepartmentSignatureService first
    try {
      const deptDocType = this.mapDocumentTypeToDepartmentType(documentType);
      if (deptDocType) {
        const defaultSignature = DepartmentSignatureService.getDefaultSignatureForDocument(deptDocType);
        if (defaultSignature?.title) {
          return defaultSignature.title;
        }
      }
    } catch (error) {
      console.warn('Failed to get title from DepartmentSignatureService:', error);
    }
    
    // Fallback to default titles
    const titles: { [key in DocumentType]?: string } = {
      'sales-order': 'Sales Manager',
      'purchase-order': 'Procurement Manager',
      'invoice': 'Accounts Manager',
      'payment-receipt': 'Finance Manager',
      'quote': 'Sales Manager'
    };
    return titles[documentType] || 'Name & Title';
  }

  /**
   * Get user name from document or system context using DepartmentSignatureService
   */
  private static getUserName(document: BaseDocument, documentType: DocumentType): string {
    // Try to get user name from various possible sources in the document
    const docAny = document as any;
    
    // Check for user/creator information in document
    if (docAny.createdBy?.name) return docAny.createdBy.name;
    if (docAny.authorizedBy?.name) return docAny.authorizedBy.name;
    if (docAny.preparedBy?.name) return docAny.preparedBy.name;
    if (docAny.user?.name) return docAny.user.name;
    
    // Check for company contact person
    if (document.company?.contactPerson) return document.company.contactPerson;
    
    // Use DepartmentSignatureService to get real signature data
    try {
      const deptDocType = this.mapDocumentTypeToDepartmentType(documentType);
      if (deptDocType) {
        const defaultSignature = DepartmentSignatureService.getDefaultSignatureForDocument(deptDocType);
        if (defaultSignature) {
          return defaultSignature.name;
        }
      }
    } catch (error) {
      console.warn('Failed to get signature from DepartmentSignatureService:', error);
    }
    
    // Fallback to system default
    return 'System Administrator';
  }

  /**
   * Generate signature name (stylized version of user name) using DepartmentSignatureService
   */
  private static getSignatureName(document: BaseDocument, documentType: DocumentType): string {
    // Try to get signature text from DepartmentSignatureService first
    try {
      const deptDocType = this.mapDocumentTypeToDepartmentType(documentType);
      if (deptDocType) {
        const defaultSignature = DepartmentSignatureService.getDefaultSignatureForDocument(deptDocType);
        if (defaultSignature?.signatureText) {
          return defaultSignature.signatureText;
        }
      }
    } catch (error) {
      console.warn('Failed to get signature text from DepartmentSignatureService:', error);
    }
    
    // Fallback to generating from user name
    const userName = this.getUserName(document, documentType);
    
    // Convert to a more stylized signature format
    const nameParts = userName.split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      return `${firstName.charAt(0)}. ${lastName}`;
    }
    
    return userName;
  }

  /**
   * Generate payment information section for invoices, quotes, and sales orders
   */
  private static generatePaymentInformationSection(document: BaseDocument, documentType: DocumentType, currencySymbol: string): string {
    console.log('🚀 Document generation started for payment section:', documentType);
    
    // Only show payment information for documents that require payment
    const paymentDocuments = ['invoice', 'quote', 'sales-order'];
    if (!paymentDocuments.includes(documentType)) {
      console.log('❌ Document type not eligible for payment info:', documentType);
      return '';
    }

    const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
    let paymentInfo: any = {};
    
    // Try to get payment settings from PaymentIntegrationService
    try {
      paymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();
      console.log('✅ Successfully retrieved payment info from service:', paymentInfo);
      
      // Check if payment info should be shown in documents
      if (paymentInfo.showInDocuments === false) {
        return '';
      }
    } catch (error) {
      console.warn('PaymentIntegrationService not available, using defaults:', error);
      // Continue with default payment info
    }

    const sections = [];
    
    // Add payment terms if enabled (default: true)
    if (paymentInfo.showPaymentTerms !== false) {
      sections.push(this.generatePaymentTermsSection(paymentInfo.paymentTerms || {}, companyInfo));
    }
    
    // Add bank details if enabled (default: true)
    if (paymentInfo.showBankDetails !== false) {
      sections.push(this.generateBankDetailsSection(paymentInfo.bankDetails || {}, companyInfo));
    }
    
    // Add M-Pesa details if enabled (default: true)
    if (paymentInfo.showMpesaDetails !== false) {
      sections.push(this.generateMpesaDetailsSection(paymentInfo.mpesaDetails || {}, companyInfo));
    }
    
    // If no sections are generated, show default payment terms
    if (sections.length === 0) {
      sections.push(this.generateDefaultPaymentTermsSection(companyInfo));
    }
    
    return `
      <!-- Payment Information Section - Left Column -->
      <div style="margin-bottom: 20px; max-width: 400px;">
        ${sections.join('')}
      </div>
    `;
  }

  /**
   * Generate payment terms section
   */
  private static generatePaymentTermsSection(paymentTerms: any, companyInfo: any): string {
    const ownershipText = paymentTerms?.ownershipText || 'Goods belong to {companyName} until completion of payments';
    const processedOwnership = ownershipText.replace('{companyName}', companyInfo.companyName);
    
    return `
      <!-- Payment Terms Section -->
      <div style="margin-bottom: 8px;">
        <div style="padding: 8px; background: white; border-radius: 3px;">
          <h4 style="color: #dc2626; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; display: flex; align-items: center; gap: 4px;">📄 Payment Terms</h4>
          <div style="font-size: 11px; line-height: 1.3; color: #4a5568;">
            <div><strong>${paymentTerms?.standardTerms || 'Standard Terms Apply'}</strong></div>
            <div style="margin-top: 4px; font-style: italic; color: #7f1d1d;">
              <div>• ${processedOwnership}</div>
              <div>• ${paymentTerms?.deliveryTerms || 'Payment due on delivery'}</div>
              <div>• ${paymentTerms?.warrantyText || 'Standard warranty applies'}</div>
              ${paymentTerms?.customTermsList?.map((term: any) => `<div>• ${term.description}</div>`).join('') || ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate bank details section
   */
  private static generateBankDetailsSection(bankDetails: any, companyInfo: any): string {
    // Get live payment info from PaymentIntegrationService to match preview
    let livePaymentInfo: any = {};
    
    try {
      livePaymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();
      console.log('🔄 Using live payment info for bank details:', livePaymentInfo.bankDetails);
    } catch (error) {
      console.warn('PaymentIntegrationService not available for bank details, using passed data');
    }
    
    // Use live data if available, otherwise fall back to passed bankDetails
    const bank = livePaymentInfo.bankDetails || bankDetails || {};
    console.log('🏦 Final bank data for document generation:', bank);
    
    // Helper function to check if a value is valid
    const isValidValue = (value: any): boolean => {
      return value && 
             value !== 'Not configured' && 
             value !== '-' && 
             value.toString().trim() !== '' &&
             value !== 'undefined' &&
             value !== 'null';
    };
    
    // Build only the fields that have valid values
    const bankFields = [];
    
    if (isValidValue(bank.bankName)) {
      bankFields.push(`<div><strong>Bank:</strong> ${bank.bankName}</div>`);
    }
    
    if (isValidValue(bank.accountName)) {
      bankFields.push(`<div><strong>Account Name:</strong> ${bank.accountName}</div>`);
    }
    
    if (isValidValue(bank.accountNumber)) {
      bankFields.push(`<div><strong>Account No:</strong> ${bank.accountNumber}</div>`);
    }
    
    if (isValidValue(bank.branchCode)) {
      bankFields.push(`<div><strong>Branch Code:</strong> ${bank.branchCode}</div>`);
    }
    
    if (isValidValue(bank.swiftCode)) {
      bankFields.push(`<div><strong>SWIFT:</strong> ${bank.swiftCode}</div>`);
    }
    
    // Only show the section if there are valid fields
    if (bankFields.length === 0) {
      return '';
    }
    
    return `
      <!-- Bank Transfer Section -->
      <div style="margin-bottom: 8px;">
        <div style="padding: 8px; background: white; border-radius: 3px;">
          <h4 style="color: #dc2626; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; display: flex; align-items: center; gap: 4px;">🏦 Bank Transfer</h4>
          <div style="font-size: 11px; line-height: 1.3; color: #4a5568;">
            ${bankFields.join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate M-Pesa details section
   */
  private static generateMpesaDetailsSection(mpesaDetails: any, companyInfo: any): string {
    // Get live payment info from PaymentIntegrationService to match preview
    let livePaymentInfo: any = {};
    
    try {
      livePaymentInfo = PaymentIntegrationService.getDocumentPaymentInfo();
      console.log('🔄 Using live payment info for M-Pesa details:', livePaymentInfo.mpesaDetails);
    } catch (error) {
      console.warn('PaymentIntegrationService not available for M-Pesa details, using passed data');
    }
    
    // Use live data if available, otherwise fall back to passed mpesaDetails
    const mpesa = livePaymentInfo.mpesaDetails || mpesaDetails || {};
    console.log('📱 Final M-Pesa data for document generation:', mpesa);
    
    // Helper function to check if a value is valid
    const isValidValue = (value: any): boolean => {
      return value && 
             value !== 'Not configured' && 
             value !== '-' && 
             value.toString().trim() !== '' &&
             value !== 'undefined' &&
             value !== 'null';
    };
    
    // Build only the fields that have valid values
    const mpesaFields = [];
    
    if (isValidValue(mpesa.payBillNumber)) {
      mpesaFields.push(`<div><strong>Pay Bill:</strong> ${mpesa.payBillNumber}</div>`);
    }
    
    if (isValidValue(mpesa.tillNumber)) {
      mpesaFields.push(`<div><strong>Till Number:</strong> ${mpesa.tillNumber}</div>`);
    }
    
    if (isValidValue(mpesa.businessShortCode)) {
      mpesaFields.push(`<div><strong>Business Short Code:</strong> ${mpesa.businessShortCode}</div>`);
    }
    
    if (isValidValue(mpesa.accountReference)) {
      mpesaFields.push(`<div><strong>Account Reference:</strong> ${mpesa.accountReference}</div>`);
    }
    
    if (isValidValue(mpesa.businessName)) {
      mpesaFields.push(`<div><strong>Business Name:</strong> ${mpesa.businessName}</div>`);
    }
    
    // Only show the section if there are valid fields
    if (mpesaFields.length === 0) {
      return '';
    }
    
    return `
      <!-- M-Pesa Payment Section -->
      <div style="margin-bottom: 8px;">
        <div style="padding: 8px; background: #dcfce7; border-radius: 3px;">
          <h4 style="color: #15803d; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; display: flex; align-items: center; gap: 4px;">📱 M-Pesa Payment</h4>
          <div style="font-size: 11px; line-height: 1.3; color: #166534;">
            ${mpesaFields.join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate vertical payment terms information for vertical card layout
   */
  private static generateVerticalPaymentTermsInfo(docAny: any, documentType: DocumentType): string {
    const companyName = docAny.company?.name || 'Company';
    
    if (documentType === 'invoice' && docAny.paymentTerms) {
      const dueDate = docAny.dueDate ? new Date(docAny.dueDate).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="padding: 6px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #dc2626; font-size: 10px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
          <div style="font-size: 9px; line-height: 1.2; color: #4a5568;">
            <div><strong>Terms:</strong> ${docAny.paymentTerms}</div>
            <div><strong>Due Date:</strong> ${dueDate}</div>
            ${docAny.paymentMethod ? `<div><strong>Method:</strong> ${docAny.paymentMethod}</div>` : ''}
            <div style="margin-top: 4px; font-style: italic; color: #dc2626; font-size: 8px;">
              <div>• Goods belong to ${companyName}</div>
              <div>until completion of payments</div>
              <div>• Late payment charges apply</div>
              <div>• No returns after 7 days</div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (documentType === 'quote' && docAny.paymentTerms) {
      const validUntil = docAny.validUntil ? new Date(docAny.validUntil).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="padding: 6px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #16a34a; font-size: 10px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
          <div style="font-size: 9px; line-height: 1.2; color: #4a5568;">
            <div><strong>Terms:</strong> ${docAny.paymentTerms}</div>
            <div><strong>Valid Until:</strong> ${validUntil}</div>
            ${docAny.validityPeriod ? `<div><strong>Period:</strong> ${docAny.validityPeriod} days</div>` : ''}
            <div style="margin-top: 4px; font-style: italic; color: #16a34a; font-size: 8px;">
              <div>• Goods belong to ${companyName}</div>
              <div>until completion of payments</div>
              <div>• Quote subject to stock availability</div>
              <div>• Prices may change after expiry</div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (documentType === 'sales-order' && docAny.paymentTerms) {
      const expectedDelivery = docAny.expectedDelivery ? new Date(docAny.expectedDelivery).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="padding: 6px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h4 style="color: #2563eb; font-size: 10px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
          <div style="font-size: 9px; line-height: 1.2; color: #4a5568;">
            <div><strong>Terms:</strong> ${docAny.paymentTerms}</div>
            ${docAny.paymentStatus ? `<div><strong>Status:</strong> ${docAny.paymentStatus.toUpperCase()}</div>` : ''}
            <div><strong>Delivery:</strong> ${expectedDelivery}</div>
            <div style="margin-top: 4px; font-style: italic; color: #2563eb; font-size: 8px;">
              <div>• Goods belong to ${companyName}</div>
              <div>until completion of payments</div>
              <div>• Delivery upon payment confirmation</div>
              <div>• Order cancellation charges apply</div>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div style="padding: 6px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h4 style="color: #6b7280; font-size: 10px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
        <div style="font-size: 9px; line-height: 1.2; color: #4a5568;">
          <div><strong>Standard Terms Apply</strong></div>
          <div style="margin-top: 4px; font-style: italic; color: #6b7280; font-size: 8px;">
            <div>• Goods belong to ${companyName}</div>
            <div>until completion of payments</div>
            <div>• Payment due on delivery</div>
            <div>• Standard warranty applies</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate compact payment terms information for horizontal layout
   */
  private static generateCompactPaymentTermsInfo(docAny: any, documentType: DocumentType): string {
    const companyName = docAny.company?.name || 'Company';
    
    if (documentType === 'invoice' && docAny.paymentTerms) {
      const dueDate = docAny.dueDate ? new Date(docAny.dueDate).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 3px;">
          <h4 style="color: #dc2626; font-size: 9px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
          <div style="font-size: 6px; line-height: 1.1; color: #4a5568;">
            <div><strong>Terms:</strong> ${docAny.paymentTerms}</div>
            <div><strong>Due:</strong> ${dueDate}</div>
            ${docAny.paymentMethod ? `<div><strong>Method:</strong> ${docAny.paymentMethod}</div>` : ''}
            <div style="margin-top: 3px; font-style: italic; color: #dc2626;">
              <div>• Goods belong to ${companyName}</div>
              <div>until completion of payments</div>
              <div>• Late payment charges apply</div>
              <div>• No returns after 7 days</div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (documentType === 'quote' && docAny.paymentTerms) {
      const validUntil = docAny.validUntil ? new Date(docAny.validUntil).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 3px;">
          <h4 style="color: #16a34a; font-size: 9px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
          <div style="font-size: 6px; line-height: 1.1; color: #4a5568;">
            <div><strong>Terms:</strong> ${docAny.paymentTerms}</div>
            <div><strong>Valid Until:</strong> ${validUntil}</div>
            ${docAny.validityPeriod ? `<div><strong>Period:</strong> ${docAny.validityPeriod} days</div>` : ''}
            <div style="margin-top: 3px; font-style: italic; color: #16a34a;">
              <div>• Goods belong to ${companyName}</div>
              <div>until completion of payments</div>
              <div>• Quote subject to stock availability</div>
              <div>• Prices may change after expiry</div>
            </div>
          </div>
        </div>
      `;
    }
    
    if (documentType === 'sales-order' && docAny.paymentTerms) {
      const expectedDelivery = docAny.expectedDelivery ? new Date(docAny.expectedDelivery).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 3px;">
          <h4 style="color: #2563eb; font-size: 9px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
          <div style="font-size: 6px; line-height: 1.1; color: #4a5568;">
            <div><strong>Terms:</strong> ${docAny.paymentTerms}</div>
            ${docAny.paymentStatus ? `<div><strong>Status:</strong> ${docAny.paymentStatus.toUpperCase()}</div>` : ''}
            <div><strong>Delivery:</strong> ${expectedDelivery}</div>
            <div style="margin-top: 3px; font-style: italic; color: #2563eb;">
              <div>• Goods belong to ${companyName}</div>
              <div>until completion of payments</div>
              <div>• Delivery upon payment confirmation</div>
              <div>• Order cancellation charges apply</div>
            </div>
          </div>
        </div>
      `;
    }
    
    return `
      <div style="padding: 6px; background: white; border: 1px solid #cbd5e0; border-radius: 3px;">
        <h4 style="color: #6b7280; font-size: 9px; font-weight: bold; margin: 0 0 4px 0;">💳 Payment Terms</h4>
        <div style="font-size: 6px; line-height: 1.1; color: #4a5568;">
          <div><strong>Standard Terms Apply</strong></div>
          <div style="margin-top: 3px; font-style: italic; color: #6b7280;">
            <div>• Goods belong to ${companyName}</div>
            <div>until completion of payments</div>
            <div>• Payment due on delivery</div>
            <div>• Standard warranty applies</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate payment terms information
   */
  private static generatePaymentTermsInfo(docAny: any, documentType: DocumentType): string {
    if (documentType === 'invoice' && docAny.paymentTerms) {
      const dueDate = docAny.dueDate ? new Date(docAny.dueDate).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="margin-bottom: 12px; padding: 8px; background: white; border-left: 4px solid #dc2626; border-radius: 2px;">
          <div style="font-size: 11px; color: #dc2626; font-weight: bold;">Payment Terms: ${docAny.paymentTerms}</div>
          <div style="font-size: 10px; color: #7f1d1d;">Due Date: ${dueDate}</div>
          ${docAny.paymentMethod ? `<div style="font-size: 10px; color: #7f1d1d;">Preferred: ${docAny.paymentMethod}</div>` : ''}
        </div>
      `;
    }
    
    if (documentType === 'quote' && docAny.paymentTerms) {
      const validUntil = docAny.validUntil ? new Date(docAny.validUntil).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="margin-bottom: 12px; padding: 8px; background: white; border-left: 4px solid #16a34a; border-radius: 2px;">
          <div style="font-size: 11px; color: #16a34a; font-weight: bold;">Payment Terms: ${docAny.paymentTerms}</div>
          <div style="font-size: 10px; color: #15803d;">Quote Valid Until: ${validUntil}</div>
          ${docAny.validityPeriod ? `<div style="font-size: 10px; color: #15803d;">Validity: ${docAny.validityPeriod} days</div>` : ''}
        </div>
      `;
    }
    
    if (documentType === 'sales-order' && docAny.paymentTerms) {
      const expectedDelivery = docAny.expectedDelivery ? new Date(docAny.expectedDelivery).toLocaleDateString('en-GB') : 'N/A';
      return `
        <div style="margin-bottom: 12px; padding: 8px; background: white; border-left: 4px solid #2563eb; border-radius: 2px;">
          <div style="font-size: 11px; color: #2563eb; font-weight: bold;">Payment Terms: ${docAny.paymentTerms}</div>
          ${docAny.paymentStatus ? `<div style="font-size: 10px; color: #1d4ed8;">Payment Status: ${docAny.paymentStatus.toUpperCase()}</div>` : ''}
          <div style="font-size: 10px; color: #1d4ed8;">Expected Delivery: ${expectedDelivery}</div>
        </div>
      `;
    }
    
    return '';
  }

  /**
   * Generate payment status information
   */
  private static generatePaymentStatusInfo(docAny: any, documentType: DocumentType): string {
    if (documentType === 'invoice' && docAny.status) {
      const statusColors = {
        'paid': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
        'sent': { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8' },
        'overdue': { bg: '#fecaca', border: '#dc2626', text: '#b91c1c' },
        'draft': { bg: '#f3f4f6', border: '#6b7280', text: '#374151' }
      };
      
      const colors = statusColors[docAny.status as keyof typeof statusColors] || statusColors.draft;
      
      return `
        <div style="margin-top: 15px; padding: 10px; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 4px;">
          <div style="font-size: 11px; font-weight: bold; color: ${colors.text}; margin-bottom: 4px;">Invoice Status</div>
          <div style="font-size: 10px; color: ${colors.text}; text-transform: uppercase; font-weight: bold;">${docAny.status}</div>
        </div>
      `;
    }
    
    if (documentType === 'sales-order' && docAny.paymentStatus) {
      const statusColors = {
        'paid': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
        'pending': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
        'overdue': { bg: '#fecaca', border: '#dc2626', text: '#b91c1c' }
      };
      
      const colors = statusColors[docAny.paymentStatus as keyof typeof statusColors] || statusColors.pending;
      
      return `
        <div style="margin-top: 15px; padding: 10px; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 4px;">
          <div style="font-size: 11px; font-weight: bold; color: ${colors.text}; margin-bottom: 4px;">Payment Status</div>
          <div style="font-size: 10px; color: ${colors.text}; text-transform: uppercase; font-weight: bold;">${docAny.paymentStatus}</div>
        </div>
      `;
    }
    
    return '';
  }

  // Export list data functionality
  static async exportListData(
    exportData: {
      title: string;
      data: any[];
      columns: { key: string; label: string }[];
    },
    format: 'pdf' | 'excel' | 'csv',
    settings: ExportSettings
  ): Promise<void> {
    try {
      switch (format) {
        case 'pdf':
          await this.exportListToPDF(exportData, settings);
          break;
        case 'excel':
          this.exportListToExcel(exportData, settings);
          break;
        case 'csv':
          this.exportListToCSV(exportData, settings);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  private static async exportListToPDF(
    exportData: { title: string; data: any[]; columns: { key: string; label: string }[] },
    settings: ExportSettings
  ): Promise<void> {
    const html = this.generateListHTML(exportData, settings);
    await this.generatePDF(html, `${exportData.title}.pdf`);
  }

  private static exportListToExcel(
    exportData: { title: string; data: any[]; columns: { key: string; label: string }[] },
    settings: ExportSettings
  ): void {
    // Create worksheet data
    const wsData = [
      exportData.columns.map(col => col.label), // Headers
      ...exportData.data.map(row => 
        exportData.columns.map(col => {
          const value = this.getNestedValue(row, col.key);
          return value !== undefined ? value : '';
        })
      )
    ];

    // Create CSV content
    const csvContent = wsData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Download as Excel-compatible CSV
    this.downloadFile(csvContent, `${exportData.title}.csv`, 'text/csv');
  }

  private static exportListToCSV(
    exportData: { title: string; data: any[]; columns: { key: string; label: string }[] },
    settings: ExportSettings
  ): void {
    const headers = exportData.columns.map(col => col.label);
    const rows = exportData.data.map(row => 
      exportData.columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        return value !== undefined ? `"${value}"` : '""';
      })
    );
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    this.downloadFile(csvContent, `${exportData.title}.csv`, 'text/csv');
  }

  private static generateListHTML(
    exportData: { title: string; data: any[]; columns: { key: string; label: string }[] },
    settings: ExportSettings
  ): string {
    const companyInfo = this.generateCompanyHeader(settings.company, settings.logo);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${exportData.title}</title>
        <style>
          ${this.getBaseStyles(settings.typography)}
          .list-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .list-table th,
          .list-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .list-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .list-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .list-title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            color: ${settings.typography.headingColor};
          }
          .export-info {
            margin: 10px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        ${companyInfo}
        <div class="list-title">${exportData.title}</div>
        <div class="export-info">
          Generated on: ${new Date().toLocaleString()}<br>
          Total Records: ${exportData.data.length}
        </div>
        <table class="list-table">
          <thead>
            <tr>
              ${exportData.columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${exportData.data.map(row => `
              <tr>
                ${exportData.columns.map(col => {
                  const value = this.getNestedValue(row, col.key);
                  return `<td>${value !== undefined ? value : ''}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${settings.includeFooter ? `<div class="footer">${settings.footerText || ''}</div>` : ''}
      </body>
      </html>
    `;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static downloadFile(content: any, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }


  private static getBaseStyles(typography: any): string {
    return `
      body {
        font-family: '${typography.bodyFont}', Arial, sans-serif;
        font-size: ${typography.bodyFontSize}px;
        color: ${typography.bodyColor};
        line-height: 1.4;
        margin: 0;
        padding: 20px;
      }
      .company-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e2e8f0;
      }
      .company-name {
        font-family: '${typography.documentTitleFont}', Arial, sans-serif;
        font-size: ${typography.documentTitleSize}px;
        font-weight: bold;
        color: ${typography.headingColor};
        margin-bottom: 10px;
      }
      .company-address {
        font-size: 11px;
        color: #4a5568;
        line-height: 1.4;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        color: #6b7280;
        font-size: 10px;
      }
    `;
  }

  private static async generatePDF(html: string, filename: string): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
    }
  }

  /**
   * Generate default payment info when service fails
   */
  private static generateDefaultPaymentInfo(): string {
    return `
      <!-- Default Payment Information -->
      <div style="margin-bottom: 20px;">
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; max-width: 400px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 12px; font-weight: bold; margin: 0 0 12px 0; text-transform: uppercase;">Payment Information</h3>
          <div style="padding: 6px; background: white; border-radius: 3px; border: 1px solid #e2e8f0;">
            <h4 style="color: #dc2626; font-size: 9px; font-weight: bold; margin: 0 0 4px 0; display: flex; align-items: center; gap: 3px;">📄 Payment Terms</h4>
            <div style="font-size: 8px; line-height: 1.2; color: #4a5568;">
              <div><strong>Standard Terms Apply</strong></div>
              <div style="margin-top: 3px; font-style: italic; color: #7f1d1d;">
                <div>• Payment due on delivery</div>
                <div>• Standard warranty applies</div>
                <div>• Contact us for payment details</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Map UnifiedDocumentExportService document types to DepartmentSignatureService document types
   */
  private static mapDocumentTypeToDepartmentType(documentType: DocumentType): DeptDocumentType | null {
    const mapping: { [key in DocumentType]?: DeptDocumentType } = {
      'sales-order': 'sales_order',
      'quote': 'quotation',
      'invoice': 'invoice',
      'purchase-order': 'purchase_order',
      'payment-receipt': 'payment_receipt'
    };
    return mapping[documentType] || null;
  }

  /**
   * Generate default payment terms section
   */
  private static generateDefaultPaymentTermsSection(companyInfo: any): string {
    return `
      <!-- Default Payment Terms Section -->
      <div style="margin-bottom: 8px;">
        <div style="padding: 8px; background: white; border-radius: 3px;">
          <h4 style="color: #dc2626; font-size: 12px; font-weight: bold; margin: 0 0 6px 0; display: flex; align-items: center; gap: 4px;">📄 Payment Terms</h4>
          <div style="font-size: 11px; line-height: 1.3; color: #4a5568;">
            <div><strong>Standard Terms Apply</strong></div>
            <div style="margin-top: 4px; font-style: italic; color: #7f1d1d;">
              <div>• Goods belong to ${companyInfo.companyName}</div>
              <div>• Payment due on delivery</div>
              <div>• Standard warranty applies</div>
              <div>• Contact ${companyInfo.phone} for details</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate signature section for documents that support signatures
   */
  private static async generateSignatureSection(
    document: BaseDocument, 
    documentType: DocumentType, 
    options: UnifiedExportOptions
  ): Promise<string> {
    // Check if signatures should be included
    if (!options.includeSignature) {
      return '';
    }

    // Check if document has signature data
    const docWithSignature = document as any;
    if (!docWithSignature.signature?.enabled || !docWithSignature.signature?.signatureId) {
      return '';
    }

    try {
      // Get signature data from DepartmentSignatureService
      const signature = await DepartmentSignatureService.getSignatureById(
        docWithSignature.signature.signatureId
      );

      if (!signature) {
        console.warn('Signature not found for ID:', docWithSignature.signature.signatureId);
        return '';
      }

      const isPrintFormat = options.format === 'print' || options.format === 'pdf';

      return `
        <!-- Document Signature Section -->
        <div class="signature-section">
          <div style="display: flex; justify-content: space-between; align-items: end; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; min-width: 200px;">
              <div style="border-bottom: 2px solid #333; margin-bottom: ${isPrintFormat ? '8px' : '10px'}; height: ${isPrintFormat ? '50px' : '60px'}; display: flex; align-items: end; justify-content: center;">
                ${signature.imageUrl ? `<img src="${signature.imageUrl}" alt="Signature" style="max-height: ${isPrintFormat ? '45px' : '55px'}; max-width: 180px;" />` : ''}
              </div>
              <div style="font-size: ${isPrintFormat ? '10px' : '12px'}; color: #4a5568;">
                <div style="font-weight: bold; margin-bottom: 2px;">${signature.name}</div>
                <div>${signature.title}</div>
                <div>${signature.department} Department</div>
              </div>
            </div>
            <div style="text-align: center; min-width: 150px;">
              <div style="border-bottom: 2px solid #333; margin-bottom: ${isPrintFormat ? '8px' : '10px'}; height: 20px;"></div>
              <div style="font-size: ${isPrintFormat ? '10px' : '12px'}; color: #4a5568;">Date</div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error generating signature section:', error);
      return '';
    }
  }

  /**
   * Get customization settings for the document
   */
  private static getCustomizationSettings(
    documentType: DocumentType,
    options: UnifiedExportOptions
  ): DocumentCustomizationSettings | undefined {
    if (!options.customizationSettingsId) {
      return undefined;
    }

    try {
      // Get customization settings from DocumentCustomizationService
      const customizationService = DocumentCustomizationService.getInstance();
      const settings = customizationService.getCustomizationSettings(options.customizationSettingsId);
      
      if (!settings) {
        console.warn('Customization settings not found for ID:', options.customizationSettingsId);
        return undefined;
      }

      return settings;
    } catch (error) {
      console.error('Error getting customization settings:', error);
      return undefined;
    }
  }

  /**
   * Enhanced export methods with customization support
   */
  static async exportWithCustomization(
    document: BaseDocument,
    documentType: DocumentType,
    options: UnifiedExportOptions & {
      customizationSettingsId?: string;
      customContext?: CustomizationContext;
    }
  ): Promise<void> {
    // Create enhanced options with customization
    const enhancedOptions: UnifiedExportOptions = {
      ...options,
      useCustomization: true,
      customizationSettingsId: options.customizationSettingsId
    };

    // Apply custom context if provided
    if (options.customContext) {
      try {
        const customizationService = DocumentCustomizationService.getInstance();
        const contextSettings = customizationService.applyCustomizationContext(
          documentType,
          options.customContext
        );
        
        // Store temporary settings for this export
        const tempId = `temp_${Date.now()}`;
        customizationService.saveCustomizationSettings(tempId, contextSettings);
        enhancedOptions.customizationSettingsId = tempId;
      } catch (error) {
        console.error('Error applying custom context:', error);
      }
    }

    // Execute export with customization
    return this.exportDocument(document, documentType, enhancedOptions);
  }

  /**
   * Generate preview with customization
   */
  static async generatePreviewWithCustomization(
    document: BaseDocument,
    documentType: DocumentType,
    customizationSettingsId?: string,
    customContext?: CustomizationContext
  ): Promise<string> {
    const options: UnifiedExportOptions = {
      format: 'view',
      colorMode: 'color',
      includeLogo: true,
      includeSignature: true,
      logoDisplayMode: 'logo-with-name',
      useCustomization: true,
      customizationSettingsId
    };

    // Apply custom context if provided
    if (customContext) {
      try {
        const customizationService = DocumentCustomizationService.getInstance();
        const contextSettings = customizationService.applyCustomizationContext(
          documentType,
          customContext
        );
        
        // Store temporary settings for this preview
        const tempId = `temp_preview_${Date.now()}`;
        customizationService.saveCustomizationSettings(tempId, contextSettings);
        options.customizationSettingsId = tempId;
      } catch (error) {
        console.error('Error applying custom context for preview:', error);
      }
    }

    return this.generateUnifiedDocumentHTML(document, documentType, options);
  }

  /**
   * Get available customization presets for a document type
   */
  static getAvailableCustomizationPresets(documentType: DocumentType): string[] {
    try {
      const customizationService = DocumentCustomizationService.getInstance();
      return customizationService.getAvailablePresets(documentType);
    } catch (error) {
      console.error('Error getting customization presets:', error);
      return [];
    }
  }

  /**
   * Create a new customization preset
   */
  static createCustomizationPreset(
    name: string,
    settings: DocumentCustomizationSettings,
    documentTypes: DocumentType[]
  ): string {
    try {
      const customizationService = DocumentCustomizationService.getInstance();
      return customizationService.createPreset(name, settings, documentTypes);
    } catch (error) {
      console.error('Error creating customization preset:', error);
      throw error;
    }
  }

  /**
   * Update existing customization settings
   */
  static updateCustomizationSettings(
    settingsId: string,
    settings: Partial<DocumentCustomizationSettings>
  ): boolean {
    try {
      const customizationService = DocumentCustomizationService.getInstance();
      return customizationService.updateCustomizationSettings(settingsId, settings);
    } catch (error) {
      console.error('Error updating customization settings:', error);
      return false;
    }
  }

  /**
   * Delete customization settings
   */
  static deleteCustomizationSettings(settingsId: string): boolean {
    try {
      const customizationService = DocumentCustomizationService.getInstance();
      return customizationService.deleteCustomizationSettings(settingsId);
    } catch (error) {
      console.error('Error deleting customization settings:', error);
      return false;
    }
  }

  /**
   * Export with specific customization preset
   */
  static async exportWithPreset(
    document: BaseDocument,
    documentType: DocumentType,
    presetName: string,
    exportOptions: Pick<UnifiedExportOptions, 'format' | 'filename' | 'watermark'>
  ): Promise<void> {
    try {
      const customizationService = DocumentCustomizationService.getInstance();
      const presetSettings = customizationService.getPresetSettings(presetName);
      
      if (!presetSettings) {
        throw new Error(`Customization preset '${presetName}' not found`);
      }

      // Store temporary settings for this export
      const tempId = `temp_preset_${Date.now()}`;
      customizationService.saveCustomizationSettings(tempId, presetSettings);

      const options: UnifiedExportOptions = {
        ...exportOptions,
        useCustomization: true,
        customizationSettingsId: tempId,
        includeLogo: true,
        includeSignature: true,
        logoDisplayMode: 'logo-with-name',
        colorMode: exportOptions.format === 'pdf' || exportOptions.format === 'print' ? 'monochrome' : 'color'
      };

      return this.exportDocument(document, documentType, options);
    } catch (error) {
      console.error('Error exporting with preset:', error);
      throw error;
    }
  }
}
