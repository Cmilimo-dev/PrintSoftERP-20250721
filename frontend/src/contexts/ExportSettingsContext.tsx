import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExportFormat } from '@/services/unifiedDocumentExportService';

export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  taxId: string;
  contactPerson?: string;
  registrationNumber?: string;
  vatNumber?: string;
}

export interface LogoSettings {
  enabled: boolean;
  url?: string;
  displayMode: 'none' | 'logo-only' | 'logo-with-name' | 'name-only';
  maxWidth: number;
  maxHeight: number;
  position: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderRadius: number;
}

export interface QRCodeSettings {
  enabled: boolean;
  size: number;
  position: 'header-right' | 'header-left' | 'footer-center' | 'custom';
  includeDocumentNumber: boolean;
  includeCompanyInfo: boolean;
  customData?: string;
  borderColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface SignatureSettings {
  enabled: boolean;
  showAuthorizedSignature: boolean;
  showVendorSignature: boolean;
  defaultSignatureName: string;
  defaultTitle: string;
  includeDate: boolean;
  includePrintedName: boolean;
  signatureHeight: number;
  fontFamily: string;
  fontSize: number;
  position: 'side-by-side' | 'stacked' | 'right-only';
}

export interface DocumentElementSettings {
  showDocumentNumber: boolean;
  showDate: boolean;
  showCurrency: boolean;
  showPrintDate: boolean;
  showDueDate: boolean;
  showValidUntil: boolean;
  showStatus: boolean;
  showPaymentTerms: boolean;
  showPaymentStatus: boolean;
  showNotes: boolean;
  showTermsConditions: boolean;
  compactLayout: boolean;
  itemTableStyle: 'detailed' | 'compact' | 'minimal';
}

export interface PaymentInfoSettings {
  showBankDetails: boolean;
  showMpesaDetails: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  mpesaPaybill: string;
  mpesaTillNumber: string;
  mpesaBusinessName: string;
  paymentTermsText: string;
  ownershipClause: string;
}

export interface TypographySettings {
  documentTitleFont: string;
  bodyFont: string;
  documentTitleSize: number;
  bodyFontSize: number;
  headingColor: string;
  bodyColor: string;
  accentColor: string;
}

export interface ExportSettings {
  defaultFormat: ExportFormat;
  defaultColorMode: 'color' | 'monochrome';
  defaultWatermark?: string;
  includeFooter: boolean;
  footerText?: string;
  company: CompanySettings;
  logo: LogoSettings;
  qrCode: QRCodeSettings;
  signature: SignatureSettings;
  documentElements: DocumentElementSettings;
  paymentInfo: PaymentInfoSettings;
  typography: TypographySettings;
}

interface ExportSettingsContextType {
  exportSettings: ExportSettings;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  resetToDefaults: () => void;
}

const defaultExportSettings: ExportSettings = {
  defaultFormat: 'pdf',
  defaultColorMode: 'color',
  defaultWatermark: '',
  includeFooter: true,
  footerText: 'This is a computer-generated document and does not require a signature unless specified.',
  
  company: {
    name: 'Your Company Name',
    address: '123 Business Street',
    city: 'Business City',
    state: 'State',
    zip: '12345',
    country: 'Country',
    phone: '+1 (555) 123-4567',
    email: 'info@yourcompany.com',
    website: 'www.yourcompany.com',
    taxId: 'TAX123456789',
    contactPerson: 'John Doe',
    registrationNumber: 'REG123456',
    vatNumber: 'VAT123456789'
  },
  
  logo: {
    enabled: true,
    displayMode: 'logo-with-name',
    maxWidth: 120,
    maxHeight: 60,
    position: 'left',
    borderRadius: 4
  },
  
  qrCode: {
    enabled: true,
    size: 120,
    position: 'header-right',
    includeDocumentNumber: true,
    includeCompanyInfo: false,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M'
  },
  
  signature: {
    enabled: true,
    showAuthorizedSignature: true,
    showVendorSignature: true,
    defaultSignatureName: 'John Smith',
    defaultTitle: 'Manager',
    includeDate: true,
    includePrintedName: true,
    signatureHeight: 30,
    fontFamily: 'Brush Script MT',
    fontSize: 14,
    position: 'side-by-side'
  },
  
  documentElements: {
    showDocumentNumber: true,
    showDate: true,
    showCurrency: true,
    showPrintDate: true,
    showDueDate: true,
    showValidUntil: true,
    showStatus: true,
    showPaymentTerms: true,
    showPaymentStatus: false,
    showNotes: true,
    showTermsConditions: true,
    compactLayout: true,
    itemTableStyle: 'detailed'
  },
  
  paymentInfo: {
    showBankDetails: true,
    showMpesaDetails: true,
    bankName: 'Equity Bank Kenya Ltd.',
    accountName: 'Your Company Name',
    accountNumber: '0240291234567',
    bankCode: 'EQBLKENA',
    mpesaPaybill: '400200',
    mpesaTillNumber: '5678901',
    mpesaBusinessName: 'Your Company Name',
    paymentTermsText: 'Payment due within 30 days',
    ownershipClause: 'Goods belong to company until completion of payments'
  },
  
  typography: {
    documentTitleFont: 'Tahoma',
    bodyFont: 'Trebuchet MS',
    documentTitleSize: 24,
    bodyFontSize: 12,
    headingColor: '#2b6cb0',
    bodyColor: '#2d3748',
    accentColor: '#1e40af'
  }
};

const ExportSettingsContext = createContext<ExportSettingsContextType | undefined>(undefined);

interface ExportSettingsProviderProps {
  children: ReactNode;
}

export const ExportSettingsProvider: React.FC<ExportSettingsProviderProps> = ({ children }) => {
  const [exportSettings, setExportSettings] = useState<ExportSettings>(defaultExportSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('exportSettings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setExportSettings({ ...defaultExportSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing stored export settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('exportSettings', JSON.stringify(exportSettings));
  }, [exportSettings]);

  const updateExportSettings = (newSettings: Partial<ExportSettings>) => {
    setExportSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setExportSettings(defaultExportSettings);
    localStorage.removeItem('exportSettings');
  };

  const value: ExportSettingsContextType = {
    exportSettings,
    updateExportSettings,
    resetToDefaults
  };

  return (
    <ExportSettingsContext.Provider value={value}>
      {children}
    </ExportSettingsContext.Provider>
  );
};

export const useExportSettings = (): ExportSettingsContextType => {
  const context = useContext(ExportSettingsContext);
  if (!context) {
    throw new Error('useExportSettings must be used within an ExportSettingsProvider');
  }
  return context;
};

export default ExportSettingsContext;
