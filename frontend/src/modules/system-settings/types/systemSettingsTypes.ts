// Independent System Settings module
// Define system-wide configuration and persistent settings

import { AuthorizedSignature, SignatureSettings } from './signatureTypes';

export interface SystemSettings {
  currency: string;
  tax: TaxConfig;
  companyInfo: CompanyInfo;
  documentDefaults: DocumentDefaults;
  integrations: IntegrationSettings;
  applicationSettings: ApplicationSettings;
  companyDisplay: CompanyDisplaySettings;
  autoNumbering: AutoNumberingSettings;
  documentSettings: DocumentSettings[];
  etimsSettings: EnhancedEtimsSettings;
  documentLayout: DocumentLayoutSettings;
  signatures: SignatureSettings;
  authorizedSignatures: AuthorizedSignature[];
}
}

export interface TaxConfig {
  defaultRate: number; // e.g., 0.2 means 20%
  inclusive: boolean; // Tax included in prices or added
  customRates: { [category: string]: number };
}

export interface CompanyInfo {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl?: string;
  website?: string;
  
  // Deprecated Metadata
  establishedYear?: number;
  industry?: string;
  
  // Localization
  primaryLanguage: string;
  timeZone: string;
  dateFormat: string;
  fiscalYearStart: string; // Month-day format
  
  // Contacts
  contacts: Array<Contact>;
}

export interface Contact {
  name: string;
  position: string;
  phone: string;
  email: string;
}

export interface DocumentDefaults {
  invoice: DocumentDefaultSettings;
  quote: DocumentDefaultSettings;
  purchaseOrder: DocumentDefaultSettings;
  salesOrder: DocumentDefaultSettings;
  
  // Simplified external references
  externalDocumentTypes?: Array<{ code: string; name: string }>;
}

export interface DocumentDefaultSettings {
  prefix: string;
  nextNumber: number;
  resetFrequency: 'never' | 'yearly' | 'monthly';
  numberFormat: string; // e.g., "INV-{year}-{number:0000}"
  currency: string;
  taxRate: number;
}

export interface IntegrationSettings {
  etims: EtimsIntegrationSettings;
  paymentGateways: { [providerName: string]: PaymentIntegrationSettings };
  payments: PaymentInfo;
  
  // Simplified partner connection
  partners?: Array<{
    name: string;
    apiKey: string;
    webhookUrl: string;
  }>;
}

export interface EtimsIntegrationSettings {
  enabled: boolean;
  sandboxMode: boolean;
  apiUrl: string;
  pin: string;
  alias: string;
}

export interface PaymentIntegrationSettings {
  enabled: boolean;
  providerName: string;
  apiKey: string;
  accountId?: string;
  currenciesSupported: string[];
  webhookUrl: string;
}

export interface PaymentInfo {
  // Payment Terms Configuration
  paymentTerms: {
    enabled: boolean;
    standardTerms: string;
    defaultTerms: string;
    customTermsEnabled: boolean;
    customTermsList: Array<{
      label: string;
      description: string;
    }>;
    warrantyText: string;
    ownershipText: string;
    deliveryTerms: string;
  };
  
  // Bank Transfer Details
  bank: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode: string;
  };
  
  // M-Pesa Payment Details
  mpesa: {
    enabled: boolean;
    businessShortCode: string;
    tillNumber: string;
    payBillNumber: string;
    accountReference: string;
    businessName: string;
  };
  
  // General Settings
  instructions: string;
  showInDocuments: boolean;
  
  // Layout Configuration
  displaySettings: {
    showPaymentTerms: boolean;
    showBankDetails: boolean;
    showMpesaDetails: boolean;
    layoutStyle: 'compact' | 'detailed' | 'minimal';
    sectionOrder: Array<'terms' | 'bank' | 'mpesa'>;
  };
}

export interface ApplicationSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    sound: boolean;
    email: {
      enabled: boolean;
      emailAddress?: string;
    }
  };
  
  // Simplified analytics tracking
  analyticsTrackingId?: string;
}

// Additional Settings for UI functionality
export interface CompanyDisplaySettings {
  logoPosition: 'only-logo' | 'left-logo-with-name' | 'top-logo-with-name' | 'no-logo';
  showCompanyName: boolean;
  showLogo: boolean;
  showAddress: boolean;
  showContactInfo: boolean;
  showRegistrationDetails: boolean;
  logoUrl?: string;
  headerDisplayFormat: 'logo-only' | 'name-only' | 'logo-with-name' | 'none';
  customLogoSize?: {
    width: number;
    height: number;
  };
}

export interface AutoNumberingSettings {
  customers: {
    enabled: boolean;
    prefix: string;
    startFrom: number;
    increment: number;
    nextNumber: number;
    format: string;
  };
  vendors: {
    enabled: boolean;
    prefix: string;
    startFrom: number;
    increment: number;
    nextNumber: number;
    format: string;
  };
  items: {
    enabled: boolean;
    prefix: string;
    startFrom: number;
    increment: number;
    nextNumber: number;
    format: string;
  };
}

export interface DocumentSettings {
  documentType: string;
  prefix: string;
  nextNumber: number;
  numberLength: number;
  resetPeriod: 'never' | 'yearly' | 'monthly';
  format: string;
  enabled: boolean;
}

export interface EnhancedEtimsSettings {
  enabled: boolean;
  sandboxMode: boolean;
  pin: string;
  alias: string;
  apiUrl: string;
  environment: 'sandbox' | 'production';
  autoSubmit: boolean;
}

export interface DocumentLayoutSettings {
  // Page Layout
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Typography
  fontFamily: string;
  baseFontSize: number;
  headerFontSize: number;
  lineHeight: number;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderColor: string;
  
  // Layout Components
  showHeader: boolean;
  showFooter: boolean;
  showWatermark: boolean;
  watermarkText?: string;
  
  // Table Settings
  tableHeaderBg: string;
  tableRowAlternating: boolean;
  tableBorderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // Alignment
  headerAlignment: 'left' | 'center' | 'right';
  footerAlignment: 'left' | 'center' | 'right';
  
  // Spacing
  sectionSpacing: number;
  itemSpacing: number;
}
