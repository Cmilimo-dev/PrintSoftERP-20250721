import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { CompanyInfo, CompanyDisplaySettings, TaxConfig } from '@/modules/system-settings/types/systemSettingsTypes';

export interface DocumentCompanyInfo {
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
  fullAddress: string;
  displaySettings: CompanyDisplaySettings;
  taxConfig: TaxConfig;
}

/**
 * Service to provide properly formatted company information for documents
 */
export class DocumentCompanyService {
  /**
   * Get formatted company information for use in documents
   */
  static getCompanyInfoForDocuments(): DocumentCompanyInfo {
    try {
      const settings = SystemSettingsService.getSettings();
      const companyInfo = settings.companyInfo;
      const displaySettings = settings.companyDisplay;
      const taxConfig = settings.tax;

      return {
        companyName: companyInfo.companyName || 'Your Company Name',
        address: companyInfo.address || 'Your Company Address',
        city: companyInfo.city || 'City',
        state: companyInfo.state || 'State',
        zip: companyInfo.zip || 'ZIP',
        phone: companyInfo.phone || '+1 (555) 000-0000',
        email: companyInfo.email || 'contact@yourcompany.com',
        taxId: companyInfo.taxId || 'TAX000000000',
        logoUrl: displaySettings.logoUrl || companyInfo.logoUrl,
        website: companyInfo.website,
        fullAddress: this.formatFullAddress(companyInfo),
        displaySettings,
        taxConfig
      };
    } catch (error) {
      console.error('Error loading company info for documents:', error);
      return this.getDefaultCompanyInfo();
    }
  }

  /**
   * Format the complete address string
   */
  private static formatFullAddress(companyInfo: CompanyInfo): string {
    const addressParts = [
      companyInfo.address,
      [companyInfo.city, companyInfo.state, companyInfo.zip]
        .filter(Boolean)
        .join(', ')
    ].filter(Boolean);

    return addressParts.join('\n');
  }

  /**
   * Get default company info if settings are not available
   */
  private static getDefaultCompanyInfo(): DocumentCompanyInfo {
    return {
      companyName: 'Your Company Name',
      address: 'Your Company Address',
      city: 'City',
      state: 'State',
      zip: 'ZIP',
      phone: '+1 (555) 000-0000',
      email: 'contact@yourcompany.com',
      taxId: 'TAX000000000',
      fullAddress: 'Your Company Address\nCity, State ZIP',
      displaySettings: {
        logoPosition: 'left-logo-with-name',
        showCompanyName: true,
        showAddress: true,
        showContactInfo: true,
        showRegistrationDetails: true,
        customLogoSize: { width: 100, height: 50 }
      },
      taxConfig: {
        defaultRate: 0.18,
        inclusive: true,
        customRates: {}
      }
    };
  }

  /**
   * Get tax rate for a specific category or default
   */
  static getTaxRate(category?: string): number {
    try {
      const taxConfig = SystemSettingsService.getTaxConfig();
      
      if (category && taxConfig.customRates[category] !== undefined) {
        return taxConfig.customRates[category];
      }
      
      return taxConfig.defaultRate;
    } catch (error) {
      console.error('Error getting tax rate:', error);
      return 0.18; // Default 18%
    }
  }

  /**
   * Check if tax is inclusive in pricing
   */
  static isTaxInclusive(): boolean {
    try {
      const taxConfig = SystemSettingsService.getTaxConfig();
      return taxConfig.inclusive;
    } catch (error) {
      console.error('Error checking tax inclusive setting:', error);
      return true; // Default to inclusive
    }
  }

  /**
   * Calculate tax amount based on settings
   */
  static calculateTax(amount: number, category?: string): {
    taxAmount: number;
    netAmount: number;
    grossAmount: number;
  } {
    const taxRate = this.getTaxRate(category);
    const isInclusive = this.isTaxInclusive();

    if (isInclusive) {
      // Tax is included in the amount
      const netAmount = amount / (1 + taxRate);
      const taxAmount = amount - netAmount;
      return {
        taxAmount,
        netAmount,
        grossAmount: amount
      };
    } else {
      // Tax is added to the amount
      const taxAmount = amount * taxRate;
      const grossAmount = amount + taxAmount;
      return {
        taxAmount,
        netAmount: amount,
        grossAmount
      };
    }
  }

  /**
   * Update company info (convenience method)
   */
  static updateCompanyInfo(updates: Partial<CompanyInfo>): boolean {
    return SystemSettingsService.updateCompanyInfo(updates);
  }

  /**
   * Get currency symbol from settings
   */
  static getCurrency(): string {
    try {
      const settings = SystemSettingsService.getSettings();
      return settings.currency || 'KES';
    } catch (error) {
      console.error('Error getting currency:', error);
      return 'KES';
    }
  }

  /**
   * Format currency amount based on settings
   */
  static formatCurrency(amount: number): string {
    const currency = this.getCurrency();
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback if currency is not supported
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Get document number format for a document type
   */
  static getDocumentNumberFormat(documentType: 'invoice' | 'quote' | 'purchaseOrder' | 'salesOrder'): {
    prefix: string;
    nextNumber: number;
    format: string;
  } {
    try {
      const settings = SystemSettingsService.getSettings();
      const docDefaults = settings.documentDefaults[documentType];
      
      return {
        prefix: docDefaults.prefix,
        nextNumber: docDefaults.nextNumber,
        format: docDefaults.numberFormat
      };
    } catch (error) {
      console.error('Error getting document number format:', error);
      return {
        prefix: 'DOC',
        nextNumber: 1001,
        format: 'DOC-{year}-{number:0000}'
      };
    }
  }

  /**
   * Generate next document number
   */
  static generateDocumentNumber(documentType: 'invoice' | 'quote' | 'purchaseOrder' | 'salesOrder'): string {
    const { format, nextNumber } = this.getDocumentNumberFormat(documentType);
    const currentYear = new Date().getFullYear();
    
    return format
      .replace('{year}', currentYear.toString())
      .replace('{number:0000}', nextNumber.toString().padStart(4, '0'))
      .replace('{number:000}', nextNumber.toString().padStart(3, '0'));
  }
}
