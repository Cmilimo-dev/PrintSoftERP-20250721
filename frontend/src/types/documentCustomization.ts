import { ExportFormat, DocumentType } from './businessDocuments';

export interface DocumentCustomizationSettings {
  id: string;
  name: string;
  documentType: DocumentType;
  isDefault: boolean;
  
  // Layout Settings
  layout: {
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
  };
  
  // Header Settings
  header: {
    enabled: boolean;
    height: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    showLogo: boolean;
    showCompanyName: boolean;
    showCompanyDetails: boolean;
    showDocumentInfo: boolean;
    logoPosition: 'left' | 'center' | 'right';
    logoMaxWidth: number;
    logoMaxHeight: number;
    customContent?: string;
  };
  
  // Footer Settings
  footer: {
    enabled: boolean;
    height: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    showGeneratedDate: boolean;
    showPageNumbers: boolean;
    showDisclaimer: boolean;
    disclaimerText: string;
    customContent?: string;
    position: 'left' | 'center' | 'right';
  };
  
  // Typography Settings
  typography: {
    documentTitleFont: string;
    bodyFont: string;
    headingFont: string;
    documentTitleSize: number;
    headingSize: number;
    bodyFontSize: number;
    smallFontSize: number;
    lineHeight: number;
    documentTitleColor: string;
    headingColor: string;
    bodyColor: string;
    accentColor: string;
    fontWeight: {
      documentTitle: number;
      heading: number;
      body: number;
      bold: number;
    };
  };
  
  // Color Scheme
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
  };
  
  // Document Elements
  elements: {
    // Company Section
    companySection: {
      enabled: boolean;
      position: 'header' | 'separate-section';
      showLogo: boolean;
      showName: boolean;
      showAddress: boolean;
      showContactInfo: boolean;
      showTaxInfo: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
    };
    
    // Customer/Vendor Section
    partySection: {
      enabled: boolean;
      position: 'left' | 'right' | 'center' | 'full-width';
      showBillingAddress: boolean;
      showShippingAddress: boolean;
      showContactInfo: boolean;
      showTaxInfo: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
    };
    
    // Document Info Section
    documentInfo: {
      enabled: boolean;
      position: 'header-right' | 'separate-section' | 'sidebar';
      showDocumentNumber: boolean;
      showDate: boolean;
      showDueDate: boolean;
      showValidUntil: boolean;
      showStatus: boolean;
      showCurrency: boolean;
      showPrintDate: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
    };
    
    // Line Items Table
    itemsTable: {
      enabled: boolean;
      style: 'detailed' | 'compact' | 'minimal';
      showLineNumbers: boolean;
      showItemCodes: boolean;
      showCategories: boolean;
      showUnits: boolean;
      showTaxColumn: boolean;
      showDiscountColumn: boolean;
      alternateRowColors: boolean;
      headerBackgroundColor: string;
      headerTextColor: string;
      evenRowColor: string;
      oddRowColor: string;
      borderColor: string;
      borderWidth: number;
      cellPadding: number;
      fontSize: number;
      headerFontWeight: number;
    };
    
    // Totals Section
    totalsSection: {
      enabled: boolean;
      position: 'right' | 'center' | 'full-width';
      showSubtotal: boolean;
      showTax: boolean;
      showDiscount: boolean;
      showShipping: boolean;
      highlightTotal: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
      totalBackgroundColor: string;
      totalTextColor: string;
      fontSize: number;
      fontWeight: number;
    };
    
    // Payment Information
    paymentSection: {
      enabled: boolean;
      position: 'left' | 'right' | 'center' | 'full-width';
      showBankDetails: boolean;
      showMpesaDetails: boolean;
      showPaymentTerms: boolean;
      showOwnershipClause: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
      fontSize: number;
    };
    
    // Signature Section
    signatureSection: {
      enabled: boolean;
      position: 'left' | 'right' | 'center' | 'side-by-side';
      showAuthorizedSignature: boolean;
      showVendorSignature: boolean;
      showCustomerSignature: boolean;
      includeDate: boolean;
      includePrintedName: boolean;
      includeTitle: boolean;
      signatureHeight: number;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
      fontSize: number;
      fontFamily: string;
    };
    
    // QR Code
    qrCode: {
      enabled: boolean;
      position: 'header-right' | 'header-left' | 'footer-center' | 'footer-right' | 'document-info';
      size: number;
      includeDocumentNumber: boolean;
      includeCompanyInfo: boolean;
      includeUrl: boolean;
      customData?: string;
      borderColor: string;
      backgroundColor: string;
      borderWidth: number;
      borderRadius: number;
      errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    };
    
    // Watermark
    watermark: {
      enabled: boolean;
      text: string;
      opacity: number;
      fontSize: number;
      color: string;
      rotation: number;
      position: 'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
    
    // Notes and Terms
    notesSection: {
      enabled: boolean;
      position: 'after-items' | 'before-totals' | 'after-payment' | 'footer';
      showNotes: boolean;
      showTerms: boolean;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      borderRadius: number;
      fontSize: number;
    };
  };
  
  // Print Settings
  print: {
    showColors: boolean;
    showBackgrounds: boolean;
    showBorders: boolean;
    economicMode: boolean;
    pageBreaks: {
      avoidInsideTable: boolean;
      avoidInsideSection: boolean;
      addAfterSection: boolean;
    };
  };
  
  // Export Settings
  export: {
    defaultFormat: ExportFormat;
    includeMetadata: boolean;
    compressionLevel: number;
    passwordProtection: boolean;
    watermarkOnExport: boolean;
    optimizeForSize: boolean;
    embedFonts: boolean;
  };
  
  // Advanced Customization
  advanced: {
    customCSS?: string;
    customHTML?: string;
    customJavaScript?: string;
    conditionalFormatting: {
      enabled: boolean;
      rules: Array<{
        condition: string;
        property: string;
        value: string;
      }>;
    };
  };
  
  // Responsive Settings
  responsive: {
    enabled: boolean;
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    adaptiveLayout: boolean;
    scaleFonts: boolean;
    hideElements: string[];
  };
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: string;
    description?: string;
    tags: string[];
  };
}

export interface DocumentCustomizationPreset {
  id: string;
  name: string;
  description: string;
  documentTypes: DocumentType[];
  settings: Partial<DocumentCustomizationSettings>;
  isBuiltIn: boolean;
  previewImage?: string;
}

export interface CustomizationContext {
  documentType: DocumentType;
  format: ExportFormat;
  isPreview: boolean;
  userPreferences: Record<string, any>;
  companySettings: Record<string, any>;
}

export interface CustomizationRule {
  id: string;
  name: string;
  condition: string;
  action: 'show' | 'hide' | 'modify';
  target: string;
  value?: any;
  priority: number;
}
