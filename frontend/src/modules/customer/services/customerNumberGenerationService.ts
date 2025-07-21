import { CustomerType } from '../types/customerTypes';

interface NumberConfig {
  prefix: string;
  currentNumber: number;
  format: string;
}

interface CustomerNumberConfig {
  [key: string]: NumberConfig;
}

const DEFAULT_NUMBER_CONFIG: CustomerNumberConfig = {
  'individual': {
    prefix: 'IND',
    currentNumber: 1000,
    format: 'IND-{YYYY}-{NNNN}'
  },
  'company': {
    prefix: 'COM',
    currentNumber: 1000,
    format: 'COM-{YYYY}-{NNNN}'
  },
  'category': {
    prefix: 'CAT',
    currentNumber: 100,
    format: 'CAT-{NNN}'
  },
  'tag': {
    prefix: 'TAG',
    currentNumber: 100,
    format: 'TAG-{NNN}'
  },
  'communication': {
    prefix: 'COMM',
    currentNumber: 1000,
    format: 'COMM-{YYYY}-{NNNN}'
  },
  'document': {
    prefix: 'DOC',
    currentNumber: 1000,
    format: 'DOC-{YYYY}-{NNNN}'
  },
  'segment': {
    prefix: 'SEG',
    currentNumber: 100,
    format: 'SEG-{NNN}'
  },
  'ticket': {
    prefix: 'TKT',
    currentNumber: 1000,
    format: 'TKT-{YYYY}-{NNNN}'
  }
};

const STORAGE_KEY = 'customer_module_number_config';

export class CustomerNumberGenerationService {
  
  /**
   * Generate next customer number based on customer type
   */
  static generateCustomerNumber(customerType: CustomerType): string {
    try {
      const config = this.getNumberConfig();
      const docConfig = config[customerType];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for customer type: ${customerType}`);
      }

      // Increment the current number
      docConfig.currentNumber += 1;
      
      // Save updated config
      this.saveNumberConfig(config);
      
      // Generate the formatted number
      return this.formatNumber(docConfig.format, docConfig.currentNumber);
    } catch (error) {
      console.error('Error generating customer number:', error);
      // Fallback to timestamp-based number
      return `${DEFAULT_NUMBER_CONFIG[customerType]?.prefix || 'CUST'}-${Date.now()}`;
    }
  }

  /**
   * Generate category number
   */
  static generateCategoryNumber(): string {
    return this.generateNumber('category');
  }

  /**
   * Generate tag number
   */
  static generateTagNumber(): string {
    return this.generateNumber('tag');
  }

  /**
   * Generate communication number
   */
  static generateCommunicationNumber(): string {
    return this.generateNumber('communication');
  }

  /**
   * Generate document number
   */
  static generateDocumentNumber(): string {
    return this.generateNumber('document');
  }

  /**
   * Generate segment number
   */
  static generateSegmentNumber(): string {
    return this.generateNumber('segment');
  }

  /**
   * Generate support ticket number
   */
  static generateTicketNumber(): string {
    return this.generateNumber('ticket');
  }

  /**
   * Generic number generation method
   */
  private static generateNumber(type: string): string {
    try {
      const config = this.getNumberConfig();
      const docConfig = config[type];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for type: ${type}`);
      }

      // Increment the current number
      docConfig.currentNumber += 1;
      
      // Save updated config
      this.saveNumberConfig(config);
      
      // Generate the formatted number
      return this.formatNumber(docConfig.format, docConfig.currentNumber);
    } catch (error) {
      console.error('Error generating number:', error);
      // Fallback to timestamp-based number
      return `${DEFAULT_NUMBER_CONFIG[type]?.prefix || 'NUM'}-${Date.now()}`;
    }
  }

  /**
   * Preview next number without incrementing
   */
  static previewNextNumber(type: CustomerType | 'category' | 'tag' | 'communication' | 'document' | 'segment' | 'ticket'): string {
    try {
      const config = this.getNumberConfig();
      const docConfig = config[type];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for type: ${type}`);
      }

      // Preview next number without incrementing
      const nextNumber = docConfig.currentNumber + 1;
      return this.formatNumber(docConfig.format, nextNumber);
    } catch (error) {
      console.error('Error previewing next number:', error);
      return `${DEFAULT_NUMBER_CONFIG[type]?.prefix || 'NUM'}-${Date.now()}`;
    }
  }

  /**
   * Get current number configuration
   */
  static getNumberConfig(): CustomerNumberConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Merge with defaults to ensure all types are covered
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
  static saveNumberConfig(config: CustomerNumberConfig): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving number config:', error);
      return false;
    }
  }

  /**
   * Update number configuration for a specific type
   */
  static updateNumberConfig(
    type: CustomerType | 'category' | 'tag' | 'communication' | 'document' | 'segment' | 'ticket',
    updates: Partial<NumberConfig>
  ): boolean {
    try {
      const config = this.getNumberConfig();
      
      if (!config[type]) {
        config[type] = { ...DEFAULT_NUMBER_CONFIG[type] };
      }
      
      config[type] = { ...config[type], ...updates };
      
      return this.saveNumberConfig(config);
    } catch (error) {
      console.error('Error updating number config:', error);
      return false;
    }
  }

  /**
   * Reset numbering for a specific type
   */
  static resetNumbering(
    type: CustomerType | 'category' | 'tag' | 'communication' | 'document' | 'segment' | 'ticket',
    startNumber: number = 1000
  ): boolean {
    try {
      return this.updateNumberConfig(type, { currentNumber: startNumber - 1 });
    } catch (error) {
      console.error('Error resetting numbering:', error);
      return false;
    }
  }

  /**
   * Get current number for a type
   */
  static getCurrentNumber(type: CustomerType | 'category' | 'tag' | 'communication' | 'document' | 'segment' | 'ticket'): number {
    const config = this.getNumberConfig();
    return config[type]?.currentNumber || 0;
  }

  /**
   * Set current number for a type
   */
  static setCurrentNumber(
    type: CustomerType | 'category' | 'tag' | 'communication' | 'document' | 'segment' | 'ticket',
    number: number
  ): boolean {
    return this.updateNumberConfig(type, { currentNumber: number });
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
      const { CustomerStorageService } = require('./customerStorageService');
      
      Object.keys(DEFAULT_NUMBER_CONFIG).forEach(type => {
        const currentNumber = config[type]?.currentNumber || 0;
        let maxUsedNumber = 0;
        
        // Check numbers in storage based on type
        if (['individual', 'company'].includes(type)) {
          const customers = CustomerStorageService.getCustomers();
          customers.forEach((customer: any) => {
            if (customer.customerType === type) {
              const numMatch = customer.customerNumber?.match(/\d+/);
              if (numMatch) {
                maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
              }
            }
          });
        } else if (type === 'category') {
          const categories = CustomerStorageService.getCategories();
          categories.forEach((category: any) => {
            const numMatch = category.id?.match(/\d+/);
            if (numMatch) {
              maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
            }
          });
        } else if (type === 'tag') {
          const tags = CustomerStorageService.getTags();
          tags.forEach((tag: any) => {
            const numMatch = tag.id?.match(/\d+/);
            if (numMatch) {
              maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
            }
          });
        } else if (type === 'communication') {
          const communications = CustomerStorageService.getCommunications();
          communications.forEach((comm: any) => {
            const numMatch = comm.id?.match(/\d+/);
            if (numMatch) {
              maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
            }
          });
        } else if (type === 'document') {
          const documents = CustomerStorageService.getDocuments();
          documents.forEach((doc: any) => {
            const numMatch = doc.id?.match(/\d+/);
            if (numMatch) {
              maxUsedNumber = Math.max(maxUsedNumber, parseInt(numMatch[0]));
            }
          });
        }

        const shouldBe = Math.max(maxUsedNumber, currentNumber);
        summary[type] = {
          current: currentNumber,
          shouldBe,
          fixed: false
        };

        if (currentNumber < maxUsedNumber) {
          hasIssues = true;
          issues.push(`${type}: Current number (${currentNumber}) is less than max used number (${maxUsedNumber})`);
          
          // Fix the issue
          config[type] = { ...config[type], currentNumber: maxUsedNumber };
          summary[type].fixed = true;
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
    type: CustomerType | 'category' | 'tag' | 'communication' | 'document' | 'segment' | 'ticket',
    count: number
  ): string[] {
    try {
      const numbers: string[] = [];
      const config = this.getNumberConfig();
      const docConfig = config[type];
      
      if (!docConfig) {
        throw new Error(`No number configuration found for type: ${type}`);
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
      module: 'customer',
      type: 'number_configuration',
      data: this.getNumberConfig()
    };
  }

  /**
   * Import number configuration
   */
  static importConfig(importData: any): boolean {
    try {
      if (!importData.data || importData.module !== 'customer' || importData.type !== 'number_configuration') {
        throw new Error('Invalid import data for customer number configuration');
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
    byType: { [key: string]: number };
    configVersion: string;
  } {
    try {
      const config = this.getNumberConfig();
      let totalGenerated = 0;
      const byType: { [key: string]: number } = {};

      Object.entries(config).forEach(([type, typeConfig]) => {
        const generated = typeConfig.currentNumber - (DEFAULT_NUMBER_CONFIG[type]?.currentNumber || 0);
        byType[type] = Math.max(0, generated);
        totalGenerated += Math.max(0, generated);
      });

      return {
        totalGenerated,
        byType,
        configVersion: '1.0'
      };
    } catch (error) {
      console.error('Error getting numbering stats:', error);
      return {
        totalGenerated: 0,
        byType: {},
        configVersion: '1.0'
      };
    }
  }

  /**
   * Generate a unique identifier for internal use
   */
  static generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate number format
   */
  static validateNumberFormat(format: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check for required placeholders
    const validPlaceholders = ['{YYYY}', '{YY}', '{MM}', '{DD}', '{NNNNNN}', '{NNNNN}', '{NNNN}', '{NNN}', '{NN}', '{N}'];
    const hasNumberPlaceholder = validPlaceholders.some(placeholder => 
      placeholder.includes('N') && format.includes(placeholder)
    );
    
    if (!hasNumberPlaceholder) {
      errors.push('Format must include at least one number placeholder (e.g., {NNNN})');
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(format)) {
      errors.push('Format contains invalid characters that cannot be used in file names');
    }
    
    // Check length
    if (format.length > 50) {
      errors.push('Format is too long (maximum 50 characters)');
    }
    
    if (format.length < 3) {
      errors.push('Format is too short (minimum 3 characters)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
