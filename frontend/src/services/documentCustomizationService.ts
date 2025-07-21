import { 
  DocumentCustomizationSettings, 
  DocumentCustomizationPreset,
  CustomizationContext,
  CustomizationRule
} from '@/types/documentCustomization';
import { DocumentType, ExportFormat } from '@/types/businessDocuments';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { DocumentCompanyService } from './documentCompanyService';
import { Customer } from '@/contexts/ERPContext';
import { AuthorizedSignature } from '@/modules/system-settings/types/signatureTypes';

/**
 * Document Customization Service
 * Manages customizable settings for document generation without interfering with ERP functionality
 */
export class DocumentCustomizationService {
  private static instance: DocumentCustomizationService | null = null;
  private static readonly STORAGE_KEY = 'document-customization-settings';
  private static readonly PRESETS_KEY = 'document-customization-presets';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DocumentCustomizationService {
    if (!DocumentCustomizationService.instance) {
      DocumentCustomizationService.instance = new DocumentCustomizationService();
    }
    return DocumentCustomizationService.instance;
  }
  
  /**
   * Get default customization settings for a document type
   */
  static getDefaultSettings(documentType: DocumentType): DocumentCustomizationSettings {
    return {
      id: `default-${documentType}`,
      name: `Default ${documentType} Template`,
      documentType,
      isDefault: true,
      
      layout: {
        pageFormat: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        spacing: { lineHeight: 1.4, paragraphSpacing: 12, sectionSpacing: 20 }
      },
      
      header: {
        enabled: true,
        height: 80,
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 2,
        showLogo: true,
        showCompanyName: true,
        showCompanyDetails: true,
        showDocumentInfo: true,
        logoPosition: 'left',
        logoMaxWidth: 120,
        logoMaxHeight: 60
      },
      
      footer: {
        enabled: true,
        height: 40,
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        showGeneratedDate: true,
        showPageNumbers: false,
        showDisclaimer: true,
        disclaimerText: 'This is a computer-generated document and does not require a signature unless specified.',
        position: 'center'
      },
      
      typography: {
        documentTitleFont: 'Tahoma, sans-serif',
        bodyFont: 'Trebuchet MS, Arial, sans-serif',
        headingFont: 'Tahoma, sans-serif',
        documentTitleSize: 19,
        headingSize: 14,
        bodyFontSize: 12,
        smallFontSize: 10,
        lineHeight: 1.4,
        documentTitleColor: '#2b6cb0',
        headingColor: '#2d3748',
        bodyColor: '#2d3748',
        accentColor: '#2b6cb0',
        fontWeight: {
          documentTitle: 700,
          heading: 600,
          body: 400,
          bold: 600
        }
      },
      
      colors: {
        primary: '#2b6cb0',
        secondary: '#4a5568',
        accent: '#2b6cb0',
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        neutral: '#6b7280',
        background: '#ffffff',
        surface: '#f8f9fa',
        border: '#e2e8f0',
        text: '#2d3748',
        textSecondary: '#4a5568',
        textMuted: '#6b7280'
      },
      
      elements: {
        companySection: {
          enabled: true,
          position: 'header',
          showLogo: true,
          showName: true,
          showAddress: true,
          showContactInfo: true,
          showTaxInfo: true,
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 0,
          padding: 0,
          borderRadius: 0
        },
        
        partySection: {
          enabled: true,
          position: 'left',
          showBillingAddress: true,
          showShippingAddress: false,
          showContactInfo: true,
          showTaxInfo: true,
          backgroundColor: '#f7fafc',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 15,
          borderRadius: 8
        },
        
        documentInfo: {
          enabled: true,
          position: 'header-right',
          showDocumentNumber: true,
          showDate: true,
          showDueDate: true,
          showValidUntil: true,
          showStatus: true,
          showCurrency: true,
          showPrintDate: true,
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 0,
          padding: 0,
          borderRadius: 0
        },
        
        itemsTable: {
          enabled: true,
          style: 'detailed',
          showLineNumbers: true,
          showItemCodes: true,
          showCategories: false,
          showUnits: true,
          showTaxColumn: true,
          showDiscountColumn: false,
          alternateRowColors: true,
          headerBackgroundColor: '#4a5568',
          headerTextColor: '#ffffff',
          evenRowColor: '#f8f9fa',
          oddRowColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          cellPadding: 10,
          fontSize: 10,
          headerFontWeight: 600
        },
        
        totalsSection: {
          enabled: true,
          position: 'right',
          showSubtotal: true,
          showTax: true,
          showDiscount: false,
          showShipping: false,
          highlightTotal: true,
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 0,
          borderRadius: 8,
          totalBackgroundColor: '#2b6cb0',
          totalTextColor: '#ffffff',
          fontSize: 12,
          fontWeight: 600
        },
        
        paymentSection: {
          enabled: true,
          position: 'left',
          showBankDetails: true,
          showMpesaDetails: true,
          showPaymentTerms: true,
          showOwnershipClause: true,
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 8,
          borderRadius: 3,
          fontSize: 11
        },
        
        signatureSection: {
          enabled: true,
          position: 'side-by-side',
          showAuthorizedSignature: true,
          showVendorSignature: true,
          showCustomerSignature: false,
          includeDate: true,
          includePrintedName: true,
          includeTitle: true,
          signatureHeight: 30,
          backgroundColor: '#f8f9fa',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 8,
          borderRadius: 4,
          fontSize: 10,
          fontFamily: 'Brush Script MT, cursive'
        },
        
        qrCode: {
          enabled: true,
          position: 'header-right',
          size: 120,
          includeDocumentNumber: true,
          includeCompanyInfo: false,
          includeUrl: false,
          borderColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderRadius: 4,
          errorCorrectionLevel: 'M'
        },
        
        watermark: {
          enabled: false,
          text: 'COPY',
          opacity: 0.1,
          fontSize: 72,
          color: '#000000',
          rotation: -45,
          position: 'center'
        },
        
        notesSection: {
          enabled: true,
          position: 'after-payment',
          showNotes: true,
          showTerms: true,
          backgroundColor: '#fffbeb',
          borderColor: '#fbbf24',
          borderWidth: 1,
          padding: 15,
          borderRadius: 6,
          fontSize: 11
        }
      },
      
      print: {
        showColors: true,
        showBackgrounds: true,
        showBorders: true,
        economicMode: false,
        pageBreaks: {
          avoidInsideTable: true,
          avoidInsideSection: true,
          addAfterSection: false
        }
      },
      
      export: {
        defaultFormat: 'pdf',
        includeMetadata: true,
        compressionLevel: 6,
        passwordProtection: false,
        watermarkOnExport: false,
        optimizeForSize: false,
        embedFonts: true
      },
      
      advanced: {
        conditionalFormatting: {
          enabled: false,
          rules: []
        }
      },
      
      responsive: {
        enabled: true,
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200
        },
        adaptiveLayout: true,
        scaleFonts: true,
        hideElements: []
      },
      
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        version: '1.0.0',
        description: `Default template for ${documentType} documents`,
        tags: ['default', documentType]
      }
    };
  }
  
  /**
   * Get all customization settings
   */
  static getAllSettings(): DocumentCustomizationSettings[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const settings = stored ? JSON.parse(stored) : [];
    
    // Ensure default settings exist for all document types
    const documentTypes: DocumentType[] = [
      'invoice', 'quote', 'sales-order', 'purchase-order', 
      'payment-receipt', 'delivery-note', 'financial-report', 
      'goods-receiving-voucher', 'credit-note', 'payment',
      'customer-return', 'goods-return', 'vendor'
    ];
    
    for (const docType of documentTypes) {
      const exists = settings.find((s: DocumentCustomizationSettings) => 
        s.documentType === docType && s.isDefault
      );
      
      if (!exists) {
        settings.push(this.getDefaultSettings(docType));
      }
    }
    
    return settings;
  }
  
  /**
   * Get customization settings for a specific document type
   */
  static getSettingsForDocumentType(documentType: DocumentType): DocumentCustomizationSettings[] {
    return this.getAllSettings().filter(s => s.documentType === documentType);
  }
  
  /**
   * Get default settings for a document type
   */
  static getDefaultSettingsForType(documentType: DocumentType): DocumentCustomizationSettings {
    const settings = this.getSettingsForDocumentType(documentType);
    const defaultSetting = settings.find(s => s.isDefault);
    
    return defaultSetting || this.getDefaultSettings(documentType);
  }
  
  /**
   * Save customization settings
   */
  static saveSettings(settings: DocumentCustomizationSettings): boolean {
    try {
      const allSettings = this.getAllSettings();
      const existingIndex = allSettings.findIndex(s => s.id === settings.id);
      
      // Update metadata
      settings.metadata.updatedAt = new Date().toISOString();
      
      if (existingIndex >= 0) {
        allSettings[existingIndex] = settings;
      } else {
        allSettings.push(settings);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSettings));
      return true;
    } catch (error) {
      console.error('Failed to save customization settings:', error);
      return false;
    }
  }
  
  /**
   * Delete customization settings
   */
  static deleteSettings(settingsId: string): boolean {
    try {
      const allSettings = this.getAllSettings();
      const filtered = allSettings.filter(s => s.id !== settingsId || s.isDefault);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete customization settings:', error);
      return false;
    }
  }
  
  /**
   * Clone customization settings
   */
  static cloneSettings(settingsId: string, newName: string): DocumentCustomizationSettings | null {
    try {
      const allSettings = this.getAllSettings();
      const original = allSettings.find(s => s.id === settingsId);
      
      if (!original) return null;
      
      const cloned: DocumentCustomizationSettings = {
        ...JSON.parse(JSON.stringify(original)),
        id: `${original.documentType}-${Date.now()}`,
        name: newName,
        isDefault: false,
        metadata: {
          ...original.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          description: `Cloned from ${original.name}`
        }
      };
      
      if (this.saveSettings(cloned)) {
        return cloned;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to clone customization settings:', error);
      return null;
    }
  }
  
  /**
   * Get built-in presets
   */
  static getBuiltInPresets(): DocumentCustomizationPreset[] {
    return [
      {
        id: 'professional',
        name: 'Professional',
        description: 'Clean and professional layout with company branding',
        documentTypes: ['invoice', 'quote', 'sales-order'],
        isBuiltIn: true,
        settings: {
          colors: {
            primary: '#1e40af',
            secondary: '#374151',
            accent: '#2563eb'
          },
          typography: {
            documentTitleFont: 'Inter, sans-serif',
            bodyFont: 'Inter, sans-serif',
            documentTitleSize: 24,
            bodyFontSize: 14
          },
          elements: {
            itemsTable: {
              headerBackgroundColor: '#1e40af',
              alternateRowColors: true
            }
          }
        }
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and minimal design with essential information only',
        documentTypes: ['invoice', 'quote', 'delivery-note'],
        isBuiltIn: true,
        settings: {
          header: {
            height: 60
          },
          footer: {
            enabled: false
          },
          elements: {
            itemsTable: {
              style: 'minimal',
              showLineNumbers: false,
              showItemCodes: false
            },
            paymentSection: {
              enabled: false
            },
            signatureSection: {
              enabled: false
            }
          }
        }
      },
      {
        id: 'colorful',
        name: 'Colorful',
        description: 'Vibrant colors with enhanced visual appeal',
        documentTypes: ['invoice', 'quote'],
        isBuiltIn: true,
        settings: {
          colors: {
            primary: '#16a34a',
            secondary: '#059669',
            accent: '#10b981'
          },
          elements: {
            itemsTable: {
              headerBackgroundColor: '#16a34a',
              evenRowColor: '#f0fdf4'
            },
            totalsSection: {
              totalBackgroundColor: '#16a34a'
            }
          }
        }
      }
    ];
  }
  
  /**
   * Apply customization context
   */
  static applyCustomizationContext(
    settings: DocumentCustomizationSettings,
    context: CustomizationContext
  ): DocumentCustomizationSettings {
    const contextualSettings = { ...settings };
    
    // Apply format-specific adjustments
    if (context.format === 'print' || context.format === 'pdf') {
      contextualSettings.print.showColors = true;
      contextualSettings.typography.bodyFontSize = Math.max(contextualSettings.typography.bodyFontSize - 1, 10);
    }
    
    // Apply preview mode adjustments
    if (context.isPreview) {
      contextualSettings.elements.qrCode.enabled = false;
      contextualSettings.elements.signatureSection.enabled = false;
    }
    
    // Apply responsive adjustments for mobile
    if (context.userPreferences?.isMobile) {
      contextualSettings.layout.margins = { top: 10, right: 10, bottom: 10, left: 10 };
      contextualSettings.typography.bodyFontSize = Math.max(contextualSettings.typography.bodyFontSize + 2, 14);
    }
    
    return contextualSettings;
  }
  
  /**
   * Validate customization settings
   */
  static validateSettings(settings: DocumentCustomizationSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate required fields
    if (!settings.id) errors.push('ID is required');
    if (!settings.name) errors.push('Name is required');
    if (!settings.documentType) errors.push('Document type is required');
    
    // Validate layout settings
    if (settings.layout.margins.top < 0) errors.push('Top margin must be non-negative');
    if (settings.layout.margins.bottom < 0) errors.push('Bottom margin must be non-negative');
    if (settings.layout.margins.left < 0) errors.push('Left margin must be non-negative');
    if (settings.layout.margins.right < 0) errors.push('Right margin must be non-negative');
    
    // Validate typography
    if (settings.typography.bodyFontSize < 8) errors.push('Body font size must be at least 8px');
    if (settings.typography.documentTitleSize < 10) errors.push('Document title size must be at least 10px');
    
    // Validate colors (basic hex validation)
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    Object.entries(settings.colors).forEach(([key, value]) => {
      if (value && !hexPattern.test(value)) {
        errors.push(`Invalid color format for ${key}: ${value}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Export settings to JSON
   */
  static exportSettings(settingsIds?: string[]): string {
    const allSettings = this.getAllSettings();
    const settingsToExport = settingsIds 
      ? allSettings.filter(s => settingsIds.includes(s.id))
      : allSettings;
    
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      settings: settingsToExport
    }, null, 2);
  }
  
  /**
   * Import settings from JSON
   */
  static importSettings(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;
      
      if (!data.settings || !Array.isArray(data.settings)) {
        return { success: false, imported: 0, errors: ['Invalid import format'] };
      }
      
      for (const settings of data.settings) {
        const validation = this.validateSettings(settings);
        if (validation.valid) {
          // Generate new ID to avoid conflicts
          settings.id = `${settings.documentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          settings.metadata.createdAt = new Date().toISOString();
          settings.metadata.updatedAt = new Date().toISOString();
          
          if (this.saveSettings(settings)) {
            imported++;
          } else {
            errors.push(`Failed to save settings: ${settings.name}`);
          }
        } else {
          errors.push(`Invalid settings "${settings.name}": ${validation.errors.join(', ')}`);
        }
      }
      
      return {
        success: imported > 0,
        imported,
        errors
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  // Instance methods for compatibility
  /**
   * Get default customization settings (instance method)
   */
  getDefaultCustomizationSettings(documentType: DocumentType = 'invoice'): DocumentCustomizationSettings {
    return DocumentCustomizationService.getDefaultSettings(documentType);
  }

  /**
   * Create a preset (instance method)
   */
  createPreset(
    name: string,
    settings: DocumentCustomizationSettings,
    documentTypes: DocumentType[]
  ): string {
    try {
      const presetId = `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a preset based on the settings
      const preset: DocumentCustomizationPreset = {
        id: presetId,
        name,
        description: `Custom preset: ${name}`,
        documentTypes,
        isBuiltIn: false,
        settings: {
          colors: settings.colors,
          typography: settings.typography,
          layout: settings.layout,
          elements: settings.elements
        }
      };
      
      // Get existing presets
      const existingPresets = this.getCustomPresets();
      existingPresets.push(preset);
      
      // Save to localStorage
      localStorage.setItem(DocumentCustomizationService.PRESETS_KEY, JSON.stringify(existingPresets));
      
      return presetId;
    } catch (error) {
      console.error('Failed to create preset:', error);
      throw error;
    }
  }

  /**
   * Get custom presets (instance method)
   */
  getCustomPresets(): DocumentCustomizationPreset[] {
    try {
      const stored = localStorage.getItem(DocumentCustomizationService.PRESETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get custom presets:', error);
      return [];
    }
  }

  /**
   * Get all presets (built-in + custom) (instance method)
   */
  getAllPresets(): DocumentCustomizationPreset[] {
    const builtInPresets = DocumentCustomizationService.getBuiltInPresets();
    const customPresets = this.getCustomPresets();
    return [...builtInPresets, ...customPresets];
  }

  /**
   * Apply preset to settings (instance method)
   */
  applyPreset(presetId: string, baseSettings: DocumentCustomizationSettings): DocumentCustomizationSettings {
    const allPresets = this.getAllPresets();
    const preset = allPresets.find(p => p.id === presetId);
    
    if (!preset) {
      throw new Error(`Preset with ID '${presetId}' not found`);
    }
    
    // Merge preset settings with base settings
    return {
      ...baseSettings,
      ...preset.settings,
      // Preserve important metadata
      id: baseSettings.id,
      name: baseSettings.name,
      documentType: baseSettings.documentType,
      isDefault: baseSettings.isDefault,
      metadata: {
        ...baseSettings.metadata,
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Delete preset (instance method)
   */
  deletePreset(presetId: string): boolean {
    try {
      const customPresets = this.getCustomPresets();
      const filtered = customPresets.filter(p => p.id !== presetId);
      
      localStorage.setItem(DocumentCustomizationService.PRESETS_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete preset:', error);
      return false;
    }
  }

  // ERP Integration Methods
  /**
   * Get settings integrated with ERP system data
   */
  static getERPIntegratedSettings(documentType: DocumentType): DocumentCustomizationSettings {
    const baseSettings = this.getDefaultSettingsForType(documentType);
    return this.applyERPIntegration(baseSettings);
  }

  /**
   * Apply ERP system data to customization settings
   */
  static applyERPIntegration(settings: DocumentCustomizationSettings): DocumentCustomizationSettings {
    const integratedSettings = { ...settings };
    
    try {
      // Integrate company branding
      const companyInfo = DocumentCompanyService.getCompanyInfoForDocuments();
      const systemSettings = SystemSettingsService.getSettings();
      
      // Update company section with actual company data
      integratedSettings.elements.companySection = {
        ...integratedSettings.elements.companySection,
        showLogo: companyInfo.displaySettings.showLogo,
        showName: companyInfo.displaySettings.showCompanyName,
        showAddress: companyInfo.displaySettings.showAddress,
        showContactInfo: companyInfo.displaySettings.showContactInfo,
        showTaxInfo: companyInfo.displaySettings.showRegistrationDetails
      };

      // Update payment section with actual payment settings
      const paymentSettings = systemSettings.integrations.payments;
      integratedSettings.elements.paymentSection = {
        ...integratedSettings.elements.paymentSection,
        enabled: paymentSettings.showInDocuments,
        showBankDetails: paymentSettings.displaySettings.showBankDetails,
        showMpesaDetails: paymentSettings.displaySettings.showMpesaDetails,
        showPaymentTerms: paymentSettings.displaySettings.showPaymentTerms
      };

      // Update layout from system settings
      const layoutSettings = systemSettings.documentLayout;
      integratedSettings.layout = {
        ...integratedSettings.layout,
        pageFormat: layoutSettings.pageSize as 'A4' | 'Letter',
        orientation: layoutSettings.orientation,
        margins: layoutSettings.margins
      };

      // Update typography from system settings
      integratedSettings.typography = {
        ...integratedSettings.typography,
        bodyFont: `${layoutSettings.fontFamily}, sans-serif`,
        bodyFontSize: layoutSettings.baseFontSize,
        documentTitleSize: layoutSettings.headerFontSize,
        lineHeight: layoutSettings.lineHeight
      };

      // Update colors from system settings
      integratedSettings.colors = {
        ...integratedSettings.colors,
        primary: layoutSettings.primaryColor,
        secondary: layoutSettings.secondaryColor,
        text: layoutSettings.textColor,
        border: layoutSettings.borderColor
      };

      // Update header/footer settings
      integratedSettings.header.enabled = layoutSettings.showHeader;
      integratedSettings.footer.enabled = layoutSettings.showFooter;
      
      // Update watermark settings
      integratedSettings.elements.watermark = {
        ...integratedSettings.elements.watermark,
        enabled: layoutSettings.showWatermark,
        text: layoutSettings.watermarkText
      };

    } catch (error) {
      console.error('Error applying ERP integration:', error);
    }
    
    return integratedSettings;
  }

  /**
   * Get customer-specific customization settings
   */
  static getCustomerSpecificSettings(
    documentType: DocumentType, 
    customer: Customer
  ): DocumentCustomizationSettings {
    const baseSettings = this.getERPIntegratedSettings(documentType);
    
    // Apply customer-specific customizations
    const customerSettings = { ...baseSettings };
    
    // Check if customer has specific customizations stored
    const customerCustomizations = this.getCustomerCustomizations(customer.id);
    if (customerCustomizations) {
      return this.mergeSettings(customerSettings, customerCustomizations);
    }
    
    // Apply customer type-based customizations
    if (customer.company) {
      // B2B customer customizations
      customerSettings.elements.signatureSection.showVendorSignature = true;
      customerSettings.elements.paymentSection.showPaymentTerms = true;
      customerSettings.elements.documentInfo.showValidUntil = true;
    } else {
      // B2C customer customizations
      customerSettings.elements.signatureSection.showVendorSignature = false;
      customerSettings.elements.paymentSection.showPaymentTerms = false;
      customerSettings.typography.bodyFontSize += 1; // Slightly larger for readability
    }
    
    return customerSettings;
  }

  /**
   * Save customer-specific customizations
   */
  static saveCustomerCustomizations(
    customerId: number, 
    customizations: Partial<DocumentCustomizationSettings>
  ): boolean {
    try {
      const key = `customer-customizations-${customerId}`;
      localStorage.setItem(key, JSON.stringify(customizations));
      return true;
    } catch (error) {
      console.error('Failed to save customer customizations:', error);
      return false;
    }
  }

  /**
   * Get customer-specific customizations
   */
  static getCustomerCustomizations(customerId: number): Partial<DocumentCustomizationSettings> | null {
    try {
      const key = `customer-customizations-${customerId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get customer customizations:', error);
      return null;
    }
  }

  /**
   * Apply conditional formatting based on document data
   */
  static applyConditionalFormatting(
    settings: DocumentCustomizationSettings,
    documentData: any
  ): DocumentCustomizationSettings {
    const conditionalSettings = { ...settings };
    
    try {
      // Apply amount-based formatting
      if (documentData.total) {
        const total = parseFloat(documentData.total);
        
        // High-value orders get premium styling
        if (total > 100000) {
          conditionalSettings.colors.primary = '#d4af37'; // Gold
          conditionalSettings.elements.totalsSection.totalBackgroundColor = '#d4af37';
          conditionalSettings.elements.watermark = {
            ...conditionalSettings.elements.watermark,
            enabled: true,
            text: 'PREMIUM ORDER',
            opacity: 0.05
          };
        }
        
        // Low-value orders get simplified layout
        if (total < 5000) {
          conditionalSettings.elements.signatureSection.enabled = false;
          conditionalSettings.elements.qrCode.enabled = false;
        }
      }
      
      // Apply status-based formatting
      if (documentData.status) {
        switch (documentData.status) {
          case 'urgent':
            conditionalSettings.colors.accent = '#dc2626'; // Red
            conditionalSettings.elements.watermark = {
              ...conditionalSettings.elements.watermark,
              enabled: true,
              text: 'URGENT',
              color: '#dc2626',
              opacity: 0.1
            };
            break;
          case 'draft':
            conditionalSettings.elements.watermark = {
              ...conditionalSettings.elements.watermark,
              enabled: true,
              text: 'DRAFT',
              opacity: 0.2
            };
            break;
        }
      }
      
      // Apply industry-specific formatting
      if (documentData.customer?.industry) {
        switch (documentData.customer.industry) {
          case 'healthcare':
            conditionalSettings.colors.primary = '#16a34a'; // Green for healthcare
            break;
          case 'technology':
            conditionalSettings.colors.primary = '#2563eb'; // Blue for tech
            break;
          case 'finance':
            conditionalSettings.colors.primary = '#7c2d12'; // Dark orange for finance
            break;
        }
      }
      
    } catch (error) {
      console.error('Error applying conditional formatting:', error);
    }
    
    return conditionalSettings;
  }

  /**
   * Get role-based customization settings
   */
  static getRoleBasedSettings(
    documentType: DocumentType,
    userRole: string
  ): DocumentCustomizationSettings {
    const baseSettings = this.getERPIntegratedSettings(documentType);
    const roleSettings = { ...baseSettings };
    
    try {
      switch (userRole) {
        case 'sales':
          // Sales team gets emphasis on customer info and totals
          roleSettings.elements.partySection.backgroundColor = '#f0f9ff';
          roleSettings.elements.partySection.borderColor = '#0284c7';
          roleSettings.elements.totalsSection.fontSize = 14;
          break;
          
        case 'finance':
          // Finance team gets detailed payment and tax info
          roleSettings.elements.paymentSection.enabled = true;
          roleSettings.elements.totalsSection.showTax = true;
          roleSettings.elements.totalsSection.showSubtotal = true;
          roleSettings.elements.documentInfo.showDueDate = true;
          break;
          
        case 'purchasing':
          // Purchasing team gets vendor-focused layout
          roleSettings.elements.signatureSection.showVendorSignature = true;
          roleSettings.elements.signatureSection.showAuthorizedSignature = true;
          roleSettings.elements.itemsTable.showCategories = true;
          break;
          
        case 'executive':
          // Executive team gets premium, minimal layout
          roleSettings.colors.primary = '#1f2937';
          roleSettings.typography.documentTitleSize = 22;
          roleSettings.elements.itemsTable.style = 'minimal';
          roleSettings.elements.qrCode.enabled = false;
          break;
      }
    } catch (error) {
      console.error('Error applying role-based settings:', error);
    }
    
    return roleSettings;
  }

  /**
   * Get signature settings from ERP system
   */
  static getSignatureSettings(documentType: DocumentType): AuthorizedSignature[] {
    try {
      const systemSettings = SystemSettingsService.getSettings();
      const signatures = systemSettings.authorizedSignatures || [];
      
      // Filter signatures based on document type
      switch (documentType) {
        case 'purchase-order':
          return signatures.filter(sig => 
            ['Purchasing', 'Executive', 'Finance'].includes(sig.department)
          );
        case 'invoice':
        case 'quote':
          return signatures.filter(sig => 
            ['Sales', 'Executive', 'Finance'].includes(sig.department)
          );
        default:
          return signatures;
      }
    } catch (error) {
      console.error('Error getting signature settings:', error);
      return [];
    }
  }

  /**
   * Merge multiple settings objects
   */
  static mergeSettings(
    baseSettings: DocumentCustomizationSettings,
    overrideSettings: Partial<DocumentCustomizationSettings>
  ): DocumentCustomizationSettings {
    const merged = { ...baseSettings };
    
    // Deep merge specific sections
    if (overrideSettings.colors) {
      merged.colors = { ...merged.colors, ...overrideSettings.colors };
    }
    
    if (overrideSettings.typography) {
      merged.typography = { ...merged.typography, ...overrideSettings.typography };
    }
    
    if (overrideSettings.layout) {
      merged.layout = { ...merged.layout, ...overrideSettings.layout };
    }
    
    if (overrideSettings.elements) {
      Object.keys(overrideSettings.elements).forEach(key => {
        merged.elements[key] = {
          ...merged.elements[key],
          ...overrideSettings.elements![key]
        };
      });
    }
    
    return merged;
  }

  /**
   * Sync customization settings with system settings changes
   */
  static syncWithSystemSettings(): boolean {
    try {
      const allSettings = this.getAllSettings();
      let updated = false;
      
      // Update all non-custom settings with current system data
      for (const settings of allSettings) {
        if (settings.isDefault) {
          const integratedSettings = this.applyERPIntegration(settings);
          if (JSON.stringify(settings) !== JSON.stringify(integratedSettings)) {
            this.saveSettings(integratedSettings);
            updated = true;
          }
        }
      }
      
      return updated;
    } catch (error) {
      console.error('Error syncing with system settings:', error);
      return false;
    }
  }

  /**
   * Get document-specific business rules
   */
  static getBusinessRules(documentType: DocumentType): CustomizationRule[] {
    const rules: CustomizationRule[] = [];
    
    try {
      const systemSettings = SystemSettingsService.getSettings();
      const taxRate = systemSettings.tax.defaultRate;
      
      // Add tax-related rules
      rules.push({
        id: 'tax-display',
        name: 'Tax Display Rule',
        condition: { field: 'total', operator: '>', value: 0 },
        action: {
          type: 'show-element',
          target: 'totalsSection.showTax',
          value: true
        },
        priority: 1
      });
      
      // Add document-specific rules
      if (documentType === 'invoice') {
        rules.push({
          id: 'invoice-payment-terms',
          name: 'Invoice Payment Terms',
          condition: { field: 'status', operator: '==', value: 'pending' },
          action: {
            type: 'show-element',
            target: 'paymentSection.enabled',
            value: true
          },
          priority: 2
        });
      }
      
      if (documentType === 'quote') {
        rules.push({
          id: 'quote-validity',
          name: 'Quote Validity Display',
          condition: { field: 'validUntil', operator: 'exists', value: true },
          action: {
            type: 'show-element',
            target: 'documentInfo.showValidUntil',
            value: true
          },
          priority: 2
        });
      }
      
    } catch (error) {
      console.error('Error getting business rules:', error);
    }
    
    return rules;
  }
  
  /**
   * Generate CSS for customization settings with enhanced totals section support
   */
  static generateCustomCSS(
    settings: DocumentCustomizationSettings,
    format: 'print' | 'screen' = 'screen'
  ): string {
    const isPrint = format === 'print';
    const colors = settings.colors;
    const typography = settings.typography;
    const layout = settings.layout;
    const totalsSection = settings.elements.totalsSection;
    
    return `
      /* Document Layout Customizations */
      .document-container {
        font-family: ${typography.bodyFont};
        font-size: ${typography.bodyFontSize}px;
        line-height: ${typography.lineHeight || 1.4};
        color: ${colors.text};
        margin: ${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left}px;
      }
      
      .document-title {
        font-family: ${typography.documentTitleFont};
        font-size: ${typography.documentTitleSize}px;
        color: ${colors.primary};
        font-weight: ${typography.fontWeight.documentTitle};
      }
      
      /* Enhanced Totals Section - Supports both table and flexible div layouts */
      .totals-section {
        margin-top: ${isPrint ? '15px' : '30px'};
        display: flex;
        justify-content: ${totalsSection.position === 'left' ? 'flex-start' : totalsSection.position === 'center' ? 'center' : 'flex-end'};
        page-break-inside: avoid;
        clear: both;
        position: relative;
        z-index: 1;
      }
      
      /* Table-based totals styling (legacy support) */
      .totals-table {
        min-width: ${isPrint ? '280px' : '300px'};
        border-collapse: collapse;
        border: ${totalsSection.borderWidth}px solid ${colors.border};
        border-radius: ${totalsSection.borderRadius}px;
        overflow: hidden;
        background: ${totalsSection.backgroundColor};
        position: relative;
        z-index: 200;
      }
      
      /* Flexible div-based totals styling (new enhanced support) */
      .totals-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: ${isPrint ? '280px' : '300px'};
        border: ${totalsSection.borderWidth}px solid ${colors.border};
        background: ${totalsSection.backgroundColor};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        position: relative;
        z-index: 1;
      }
      
      .totals-row.subtotal,
      .totals-row.tax {
        border-bottom: ${totalsSection.borderWidth}px solid ${colors.border};
      }
      
      .totals-row.total {
        background: ${totalsSection.totalBackgroundColor} !important;
        color: ${totalsSection.totalTextColor} !important;
        font-weight: ${totalsSection.fontWeight};
        border: ${totalsSection.borderWidth}px solid ${totalsSection.totalBackgroundColor};
      }
      
      .totals-row.total .totals-label,
      .totals-row.total .totals-amount {
        background: ${totalsSection.totalBackgroundColor} !important;
        color: ${totalsSection.totalTextColor} !important;
      }
      
      /* Unified label and amount styling (works for both table and div) */
      .totals-label {
        background-color: ${colors.surface};
        font-weight: bold;
        text-align: right;
        width: 60%;
        padding: ${isPrint ? '8px 12px' : '12px 16px'};
        font-size: ${isPrint ? Math.max(totalsSection.fontSize - 2, 10) : totalsSection.fontSize}px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color: ${colors.text};
        z-index: 1;
        border-right: ${totalsSection.borderWidth}px solid ${colors.border};
      }
      
      .totals-amount {
        text-align: right;
        width: 40%;
        padding: ${isPrint ? '8px 12px' : '12px 16px'};
        font-size: ${isPrint ? Math.max(totalsSection.fontSize - 2, 10) : totalsSection.fontSize}px;
        background: ${totalsSection.backgroundColor};
        color: ${colors.text};
        z-index: 1;
      }
      
      /* Final total row styling (works for both table and div) */
      .total-final {
        background-color: ${totalsSection.totalBackgroundColor} !important;
        color: ${totalsSection.totalTextColor} !important;
        font-weight: ${totalsSection.fontWeight};
        font-size: ${isPrint ? Math.max(totalsSection.fontSize - 1, 10) : totalsSection.fontSize + 1}px;
        padding: ${isPrint ? '8px 12px' : '12px 16px'};
        border: ${totalsSection.borderWidth}px solid ${totalsSection.totalBackgroundColor};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        z-index: 1;
      }
      
      /* Print-specific adjustments */
      @media print {
        .totals-section {
          margin-top: 15px;
        }
        
        .totals-row {
          border: 1px solid #666;
        }
        
        .totals-label,
        .totals-amount {
          padding: 8px 12px;
          font-size: ${Math.max(totalsSection.fontSize - 2, 10)}px;
        }
        
        .totals-row.total {
          background: ${totalsSection.totalBackgroundColor} !important;
          color: ${totalsSection.totalTextColor} !important;
        }
        
        .total-final {
          background: ${totalsSection.totalBackgroundColor} !important;
          color: ${totalsSection.totalTextColor} !important;
          font-size: ${Math.max(totalsSection.fontSize - 1, 10)}px;
          padding: 8px 12px;
        }
      }
      
      /* Responsive adjustments */
      @media only screen and (max-width: 768px) {
        .totals-section {
          justify-content: center;
          margin: 20px 0;
        }
        
        .totals-row,
        .totals-table {
          min-width: 280px;
          width: 100%;
          max-width: 320px;
        }
        
        .totals-label,
        .totals-amount,
        .totals-table td {
          font-size: ${Math.min(totalsSection.fontSize + 2, 16)}px;
          padding: 12px 10px;
        }
      }
      
      /* Additional customization-specific styles */
      .party-info-section {
        background: ${settings.elements.partySection.backgroundColor};
        border-color: ${settings.elements.partySection.borderColor};
        border-width: ${settings.elements.partySection.borderWidth}px;
        padding: ${settings.elements.partySection.padding}px;
        border-radius: ${settings.elements.partySection.borderRadius}px;
      }
      
      .items-table th {
        background: ${settings.elements.itemsTable.headerBackgroundColor} !important;
        color: ${settings.elements.itemsTable.headerTextColor} !important;
        font-weight: ${settings.elements.itemsTable.headerFontWeight};
        font-size: ${settings.elements.itemsTable.fontSize}px;
        padding: ${settings.elements.itemsTable.cellPadding}px;
      }
      
      .items-table td {
        font-size: ${settings.elements.itemsTable.fontSize}px;
        padding: ${settings.elements.itemsTable.cellPadding}px;
        border-color: ${settings.elements.itemsTable.borderColor};
        border-width: ${settings.elements.itemsTable.borderWidth}px;
      }
      
      .items-table tbody tr:nth-child(even) {
        background: ${settings.elements.itemsTable.evenRowColor} !important;
      }
      
      .items-table tbody tr:nth-child(odd) {
        background: ${settings.elements.itemsTable.oddRowColor} !important;
      }
    `;
  }
  
  /**
   * Get CSS for totals section specifically (for backward compatibility)
   */
  static getTotalsSectionCSS(
    settings: DocumentCustomizationSettings,
    format: 'print' | 'screen' = 'screen'
  ): string {
    const fullCSS = this.generateCustomCSS(settings, format);
    // Extract only totals-related CSS
    const totalsStart = fullCSS.indexOf('/* Enhanced Totals Section');
    const responsiveStart = fullCSS.indexOf('/* Responsive adjustments */');
    const responsiveEnd = fullCSS.indexOf('/* Additional customization-specific styles */');
    
    if (totalsStart !== -1 && responsiveEnd !== -1) {
      return fullCSS.substring(totalsStart, responsiveEnd);
    }
    
    // Fallback to basic totals CSS if extraction fails
    return this.generateBasicTotalsCSS(settings, format);
  }
  
  /**
   * Generate basic totals CSS as fallback
   */
  private static generateBasicTotalsCSS(
    settings: DocumentCustomizationSettings,
    format: 'print' | 'screen' = 'screen'
  ): string {
    const isPrint = format === 'print';
    const totalsSection = settings.elements.totalsSection;
    
    return `
      .totals-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: ${isPrint ? '280px' : '300px'};
        border: ${totalsSection.borderWidth}px solid ${settings.colors.border};
        background: ${totalsSection.backgroundColor};
      }
      
      .totals-label {
        background-color: ${settings.colors.surface};
        font-weight: bold;
        text-align: right;
        width: 60%;
        padding: ${isPrint ? '8px 12px' : '12px 16px'};
        font-size: ${isPrint ? Math.max(totalsSection.fontSize - 2, 10) : totalsSection.fontSize}px;
      }
      
      .totals-amount {
        text-align: right;
        width: 40%;
        padding: ${isPrint ? '8px 12px' : '12px 16px'};
        font-size: ${isPrint ? Math.max(totalsSection.fontSize - 2, 10) : totalsSection.fontSize}px;
        background: ${totalsSection.backgroundColor};
      }
    `;
  }
}
