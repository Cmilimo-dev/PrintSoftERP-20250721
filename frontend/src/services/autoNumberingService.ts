import { DocumentType, DocumentSettings, SystemSettings } from '@/types/businessDocuments';

export class AutoNumberingService {
  private static instance: AutoNumberingService;
  private settings: SystemSettings | null = null;

  private constructor() {}

  public static getInstance(): AutoNumberingService {
    if (!AutoNumberingService.instance) {
      AutoNumberingService.instance = new AutoNumberingService();
    }
    return AutoNumberingService.instance;
  }

  public setSettings(settings: SystemSettings): void {
    this.settings = settings;
  }

  public getSettings(): any {
    // Load from localStorage if no settings in memory
    if (!this.settings) {
      const savedSettings = localStorage.getItem('erp-settings');
      if (savedSettings) {
        try {
          this.settings = JSON.parse(savedSettings);
        } catch (error) {
          console.error('Failed to parse saved settings:', error);
          return this.getDefaultSettings();
        }
      } else {
        return this.getDefaultSettings();
      }
    }
    
    return this.settings?.autoNumbering || this.getDefaultSettings();
  }

  public saveSettings(settings: any): void {
    // Update the autoNumbering part of system settings
    if (!this.settings) {
      this.settings = {
        documentSettings: [],
        autoNumbering: settings
      };
    } else {
      this.settings.autoNumbering = settings;
    }
    
    // Save to localStorage
    localStorage.setItem('erp-settings', JSON.stringify(this.settings));
  }

  private getDefaultSettings(): any {
    return {
      customers: {
        enabled: true,
        prefix: 'CUST',
        startFrom: 10001,
        increment: 1,
        nextNumber: 10001,
        format: '{prefix}-{number:0000}'
      },
      vendors: {
        enabled: true,
        prefix: 'VEN',
        startFrom: 10001,
        increment: 1,
        nextNumber: 10001,
        format: '{prefix}-{number:0000}'
      },
      items: {
        enabled: true,
        prefix: 'PROD',
        startFrom: 100001,
        increment: 1,
        nextNumber: 100001,
        format: '{prefix}-{number:00000}'
      }
    };
  }

  public generateDocumentNumber(documentType: DocumentType): string {
    if (!this.settings) {
      throw new Error('Settings not initialized');
    }

    const documentSetting = this.settings.documentSettings.find(
      ds => ds.documentType === documentType && ds.enabled
    );

    if (!documentSetting) {
      // Fallback to simple numbering if no setting found
      return `${documentType.toUpperCase()}-${Date.now()}`;
    }

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const number = documentSetting.nextNumber.toString().padStart(documentSetting.numberLength, '0');

    // Check if we need to reset numbering
    if (documentSetting.resetPeriod === 'yearly') {
      // In a real implementation, you'd check if it's a new year and reset accordingly
    } else if (documentSetting.resetPeriod === 'monthly') {
      // In a real implementation, you'd check if it's a new month and reset accordingly
    }

    let documentNumber = documentSetting.format
      .replace('{prefix}', documentSetting.prefix)
      .replace('{year}', year.toString())
      .replace('{month}', month)
      .replace('{number:0000}', number)
      .replace('{number}', number);

    // Increment the next number
    this.incrementDocumentNumber(documentType);

    return documentNumber;
  }

  public generateCustomerNumber(): string {
    if (!this.settings?.autoNumbering.customers.enabled) {
      return '';
    }

    const config = this.settings.autoNumbering.customers;
    const number = config.nextNumber.toString().padStart(4, '0');
    
    const customerNumber = config.format
      .replace('{prefix}', config.prefix)
      .replace('{number}', number)
      .replace('{number:0000}', number);

    // Increment the next number
    this.incrementCustomerNumber();

    return customerNumber;
  }

  public generateVendorNumber(): string {
    if (!this.settings?.autoNumbering.vendors.enabled) {
      return '';
    }

    const config = this.settings.autoNumbering.vendors;
    const number = config.nextNumber.toString().padStart(4, '0');
    
    const vendorNumber = config.format
      .replace('{prefix}', config.prefix)
      .replace('{number}', number)
      .replace('{number:0000}', number);

    // Increment the next number
    this.incrementVendorNumber();

    return vendorNumber;
  }

  public generateItemCode(): string {
    if (!this.settings?.autoNumbering.items.enabled) {
      return '';
    }

    const config = this.settings.autoNumbering.items;
    const number = config.nextNumber.toString().padStart(4, '0');
    
    const itemCode = config.format
      .replace('{prefix}', config.prefix)
      .replace('{number}', number)
      .replace('{number:0000}', number);

    // Increment the next number
    this.incrementItemNumber();

    return itemCode;
  }

  private incrementDocumentNumber(documentType: DocumentType): void {
    if (!this.settings) return;

    const documentSettingIndex = this.settings.documentSettings.findIndex(
      ds => ds.documentType === documentType
    );

    if (documentSettingIndex !== -1) {
      this.settings.documentSettings[documentSettingIndex].nextNumber++;
      // In a real implementation, you'd persist this change to storage
      this.persistSettings();
    }
  }

  private incrementCustomerNumber(): void {
    if (this.settings) {
      this.settings.autoNumbering.customers.nextNumber++;
      this.persistSettings();
    }
  }

  private incrementVendorNumber(): void {
    if (this.settings) {
      this.settings.autoNumbering.vendors.nextNumber++;
      this.persistSettings();
    }
  }

  private incrementItemNumber(): void {
    if (this.settings) {
      this.settings.autoNumbering.items.nextNumber++;
      this.persistSettings();
    }
  }

  private persistSettings(): void {
    if (this.settings) {
      // In a real implementation, save to localStorage, API, or database
      localStorage.setItem('erp-settings', JSON.stringify(this.settings));
    }
  }

  public previewDocumentNumber(documentType: DocumentType): string {
    if (!this.settings) return 'N/A';

    const documentSetting = this.settings.documentSettings.find(
      ds => ds.documentType === documentType && ds.enabled
    );

    if (!documentSetting) return 'N/A';

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const number = documentSetting.nextNumber.toString().padStart(documentSetting.numberLength, '0');

    return documentSetting.format
      .replace('{prefix}', documentSetting.prefix)
      .replace('{year}', year.toString())
      .replace('{month}', month)
      .replace('{number:0000}', number)
      .replace('{number}', number);
  }

  public validateDocumentNumber(documentNumber: string, documentType: DocumentType): boolean {
    // Basic validation - can be enhanced based on requirements
    return documentNumber.length > 0 && documentNumber.includes(documentType.charAt(0).toUpperCase());
  }
}

export const autoNumberingService = AutoNumberingService.getInstance();
