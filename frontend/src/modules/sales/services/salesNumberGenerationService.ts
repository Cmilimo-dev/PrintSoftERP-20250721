import { SalesDocumentType } from '../types/salesTypes';

interface NumberConfig {
  prefix: string;
  currentNumber: number;
  format: string;
}

interface SalesNumberConfig {
  [key: string]: NumberConfig;
}

const DEFAULT_NUMBER_CONFIG: SalesNumberConfig = {
  'quote': {
    prefix: 'QT',
    currentNumber: 1000,
    format: 'QT-{YYYY}-{NNNN}'
  },
  'sales-order': {
    prefix: 'SO',
    currentNumber: 1000,
    format: 'SO-{YYYY}-{NNNN}'
  },
  'invoice': {
    prefix: 'INV',
    currentNumber: 1000,
    format: 'INV-{YYYY}-{NNNN}'
  },
  'delivery-note': {
    prefix: 'DN',
    currentNumber: 1000,
    format: 'DN-{YYYY}-{NNNN}'
  },
  'credit-note': {
    prefix: 'CN',
    currentNumber: 1000,
    format: 'CN-{YYYY}-{NNNN}'
  },
  'payment': {
    prefix: 'PAY',
    currentNumber: 1000,
    format: 'PAY-{YYYY}-{NNNN}'
  },
  'customer': {
    prefix: 'CUST',
    currentNumber: 1000,
    format: 'CUST-{NNNN}'
  },
  'product': {
    prefix: 'PROD',
    currentNumber: 1000,
    format: 'PROD-{NNNN}'
  },
  'sales-lead': {
    prefix: 'LEAD',
    currentNumber: 1000,
    format: 'LEAD-{YYYY}-{NNNN}'
  },
  'sales-opportunity': {
    prefix: 'OPP',
    currentNumber: 1000,
    format: 'OPP-{YYYY}-{NNNN}'
  }
};

const STORAGE_KEY = 'sales_module_number_config';

export class SalesNumberGenerationService {
  
  /**
   * Generate next document number for a specific document type
   */
  static generateDocumentNumber(documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity'): string {
    try {
      const config = this.getNumberConfig();
      const docConfig = config[documentType];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for document type: ${documentType}`);
      }

      // Increment the current number
      docConfig.currentNumber += 1;
      
      // Save updated config
      this.saveNumberConfig(config);
      
      // Generate the formatted number
      return this.formatNumber(docConfig.format, docConfig.currentNumber);
    } catch (error) {
      console.error('Error generating document number:', error);
      // Fallback to timestamp-based number
      return `${DEFAULT_NUMBER_CONFIG[documentType]?.prefix || 'DOC'}-${Date.now()}`;
    }
  }

  /**
   * Generate next customer number
   */
  static generateCustomerNumber(): string {
    return this.generateDocumentNumber('customer');
  }

  /**
   * Generate next product number
   */
  static generateProductNumber(): string {
    return this.generateDocumentNumber('product');
  }

  /**
   * Generate next sales lead number
   */
  static generateLeadNumber(): string {
    return this.generateDocumentNumber('sales-lead');
  }

  /**
   * Generate next sales opportunity number
   */
  static generateOpportunityNumber(): string {
    return this.generateDocumentNumber('sales-opportunity');
  }

  /**
   * Preview next number without incrementing
   */
  static previewNextNumber(documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity'): string {
    try {
      const config = this.getNumberConfig();
      const docConfig = config[documentType];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for document type: ${documentType}`);
      }

      // Preview next number without incrementing
      const nextNumber = docConfig.currentNumber + 1;
      return this.formatNumber(docConfig.format, nextNumber);
    } catch (error) {
      console.error('Error previewing next number:', error);
      return `${DEFAULT_NUMBER_CONFIG[documentType]?.prefix || 'DOC'}-${Date.now()}`;
    }
  }

  /**
   * Get current number configuration
   */
  static getNumberConfig(): SalesNumberConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Merge with defaults to ensure all document types are covered
        return { ...DEFAULT_NUMBER_CONFIG, ...config };
      }
      return { ...DEFAULT_NUMBER_CONFIG };
    } catch (error) {
      console.error('Error getting number config:', error);
      return { ...DEFAULT_NUMBER_CONFIG };
    }
  }

  /**
   * Save number configuration
   */
  static saveNumberConfig(config: SalesNumberConfig): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving number config:', error);
      return false;
    }
  }

  /**
   * Update number configuration for a specific document type
   */
  static updateDocumentConfig(
    documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity',
    updates: Partial<NumberConfig>
  ): boolean {
    try {
      const config = this.getNumberConfig();
      
      if (!config[documentType]) {
        config[documentType] = { ...DEFAULT_NUMBER_CONFIG[documentType] };
      }
      
      config[documentType] = { ...config[documentType], ...updates };
      
      return this.saveNumberConfig(config);
    } catch (error) {
      console.error('Error updating document config:', error);
      return false;
    }
  }

  /**
   * Reset numbering for a specific document type
   */
  static resetNumbering(
    documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity',
    startNumber: number = 1000
  ): boolean {
    try {
      return this.updateDocumentConfig(documentType, { currentNumber: startNumber - 1 });
    } catch (error) {
      console.error('Error resetting numbering:', error);
      return false;
    }
  }

  /**
   * Get current number for a document type
   */
  static getCurrentNumber(documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity'): number {
    const config = this.getNumberConfig();
    return config[documentType]?.currentNumber || 0;
  }

  /**
   * Set current number for a document type
   */
  static setCurrentNumber(
    documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity',
    number: number
  ): boolean {
    return this.updateDocumentConfig(documentType, { currentNumber: number });
  }

  /**
   * Format number according to format string
   */
  private static formatNumber(format: string, number: number): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    
    return format
      .replace('{YYYY}', year.toString())
      .replace('{YY}', year.toString().slice(-2))
      .replace('{MM}', month)
      .replace('{DD}', day)
      .replace('{NNNNNN}', number.toString().padStart(6, '0'))
      .replace('{NNNNN}', number.toString().padStart(5, '0'))
      .replace('{NNNN}', number.toString().padStart(4, '0'))
      .replace('{NNN}', number.toString().padStart(3, '0'))
      .replace('{NN}', number.toString().padStart(2, '0'))
      .replace('{N}', number.toString());
  }

  /**
   * Validate and fix number sequences
   */
  static validateAndFixNumbering(): {
    fixed: boolean;
    issues: string[];
    summary: { [key: string]: { current: number; shouldBe: number; fixed: boolean } };
  } {
    const issues: string[] = [];
    const summary: { [key: string]: { current: number; shouldBe: number; fixed: boolean } } = {};
    let hasIssues = false;

    try {
      const config = this.getNumberConfig();
      
      // Import storage service for validation
      const { SalesStorageService } = require('./salesStorageService');
      
      Object.keys(DEFAULT_NUMBER_CONFIG).forEach(docType => {
        const currentNumber = config[docType]?.currentNumber || 0;
        let maxUsedNumber = 0;
        
        // Check document numbers in storage
        if (['customer', 'product', 'sales-lead', 'sales-opportunity'].includes(docType)) {
          // Handle special document types
          if (docType === 'sales-lead') {
            const leads = SalesStorageService.getLeads();
            leads.forEach((lead: any) => {
              const numMatch = lead.leadNumber?.match(/\d+/);
              if (numMatch) {
                maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
              }
            });
          } else if (docType === 'sales-opportunity') {
            const opportunities = SalesStorageService.getOpportunities();
            opportunities.forEach((opp: any) => {
              const numMatch = opp.opportunityNumber?.match(/\d+/);
              if (numMatch) {
                maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
              }
            });
          }
          // For customer and product, we'd need to check their respective storage
        } else {
          // Regular sales documents
          const documents = SalesStorageService.getDocuments(docType as SalesDocumentType);
          documents.forEach(doc => {
            const numMatch = doc.documentNumber?.match(/\d+/);
            if (numMatch) {
              maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
            }
          });
        }

        const shouldBe = Math.max(maxUsedNumber, currentNumber);
        summary[docType] = {
          current: currentNumber,
          shouldBe,
          fixed: false
        };

        if (currentNumber < maxUsedNumber) {
          hasIssues = true;
          issues.push(`${docType}: Current number (${currentNumber}) is less than max used number (${maxUsedNumber})`);
          
          // Fix the issue
          config[docType] = { ...config[docType], currentNumber: maxUsedNumber };
          summary[docType].fixed = true;
        }
      });

      if (hasIssues) {
        this.saveNumberConfig(config);
      }

      return {
        fixed: hasIssues,
        issues,
        summary
      };
    } catch (error) {
      console.error('Error validating numbering:', error);
      return {
        fixed: false,
        issues: [`Error during validation: ${error}`],
        summary
      };
    }
  }

  /**
   * Generate batch of numbers (for bulk operations)
   */
  static generateBatchNumbers(
    documentType: SalesDocumentType | 'customer' | 'product' | 'sales-lead' | 'sales-opportunity',
    count: number
  ): string[] {
    try {
      const numbers: string[] = [];
      const config = this.getNumberConfig();
      const docConfig = config[documentType];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for document type: ${documentType}`);
      }

      for (let i = 0; i < count; i++) {
        docConfig.currentNumber += 1;
        numbers.push(this.formatNumber(docConfig.format, docConfig.currentNumber));
      }
      
      // Save updated config
      this.saveNumberConfig(config);
      
      return numbers;
    } catch (error) {
      console.error('Error generating batch numbers:', error);
      return [];
    }
  }

  /**
   * Export number configuration
   */
  static exportConfig(): object {
    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      module: 'sales',
      type: 'number_configuration',
      data: this.getNumberConfig()
    };
  }

  /**
   * Import number configuration
   */
  static importConfig(importData: any): boolean {
    try {
      if (!importData.data || importData.module !== 'sales' || importData.type !== 'number_configuration') {
        throw new Error('Invalid import data for sales number configuration');
      }

      return this.saveNumberConfig(importData.data);
    } catch (error) {
      console.error('Error importing number configuration:', error);
      return false;
    }
  }

  /**
   * Reset all numbering to defaults
   */
  static resetAllNumbering(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error resetting all numbering:', error);
      return false;
    }
  }

  /**
   * Get numbering statistics
   */
  static getNumberingStats(): {
    totalGenerated: number;
    byDocumentType: { [key: string]: number };
    configVersion: string;
  } {
    try {
      const config = this.getNumberConfig();
      let totalGenerated = 0;
      const byDocumentType: { [key: string]: number } = {};

      Object.entries(config).forEach(([docType, docConfig]) => {
        const generated = docConfig.currentNumber - (DEFAULT_NUMBER_CONFIG[docType]?.currentNumber || 0);
        byDocumentType[docType] = Math.max(0, generated);
        totalGenerated += Math.max(0, generated);
      });

      return {
        totalGenerated,
        byDocumentType,
        configVersion: '1.0'
      };
    } catch (error) {
      console.error('Error getting numbering stats:', error);
      return {
        totalGenerated: 0,
        byDocumentType: {},
        configVersion: '1.0'
      };
    }
  }
}
