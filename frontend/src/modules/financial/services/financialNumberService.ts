// Financial Module Independent Number Generation Service

export interface FinancialNumberConfig {
  prefix: string;
  startingNumber: number;
  padLength: number;
  format: 'sequential' | 'date_based' | 'custom';
  dateFormat?: string; // e.g., 'YYYYMM', 'YYYY', 'MMYY'
  customPattern?: string; // e.g., '{prefix}-{date}-{sequence}'
  resetFrequency?: 'never' | 'yearly' | 'monthly' | 'daily';
  numberType: 'invoice' | 'bill' | 'journal' | 'payment';
}

export interface FinancialNumberCounter {
  lastNumber: number;
  lastResetDate?: string;
  resetFrequency: string;
  numberType: string;
}

export class FinancialNumberService {
  // Storage Keys by Number Type
  private static readonly CONFIG_KEYS = {
    invoice: 'financial_invoice_number_config',
    bill: 'financial_bill_number_config',
    journal: 'financial_journal_number_config',
    payment: 'financial_payment_number_config'
  };

  private static readonly COUNTER_KEYS = {
    invoice: 'financial_invoice_number_counter',
    bill: 'financial_bill_number_counter',
    journal: 'financial_journal_number_counter',
    payment: 'financial_payment_number_counter'
  };

  private static readonly USED_NUMBERS_KEYS = {
    invoice: 'financial_invoice_used_numbers',
    bill: 'financial_bill_used_numbers',
    journal: 'financial_journal_used_numbers',
    payment: 'financial_payment_used_numbers'
  };

  private static defaultConfigs: Recordstring, FinancialNumberConfig = {
    invoice: {
      prefix: 'INV',
      startingNumber: 1,
      padLength: 8,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'invoice'
    },
    bill: {
      prefix: 'BIL',
      startingNumber: 1,
      padLength: 8,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'bill'
    },
    journal: {
      prefix: 'JRNL',
      startingNumber: 1,
      padLength: 8,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'journal'
    },
    payment: {
      prefix: 'PMT',
      startingNumber: 1,
      padLength: 8,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'payment'
    }
  };

  /**
   * Initialize all number services with default configurations
   */
  static initializeAll(): void {
    try {
      Object.keys(this.defaultConfigs).forEach(numberType => {
        this.initialize(numberType as any);
      });
      console.log('All financial number services initialized');
    } catch (error) {
      console.error('Error initializing financial number services:', error);
      throw new Error('Failed to initialize financial number services');
    }
  }

  /**
   * Initialize specific number service with default configuration
   */
  static initialize(numberType: keyof typeof this.CONFIG_KEYS): void {
    try {
      const existingConfig = this.getConfig(numberType);
      if (!existingConfig) {
        this.saveConfig(numberType, this.defaultConfigs[numberType]);
        this.initializeCounter(numberType);
        console.log(`Financial ${numberType} number service initialized`);
      }
    } catch (error) {
      console.error(`Error initializing financial ${numberType} number service:`, error);
      throw new Error(`Failed to initialize financial ${numberType} number service`);
    }
  }

  /**
   * Get current configuration for a number type
   */
  static getConfig(numberType: keyof typeof this.CONFIG_KEYS): FinancialNumberConfig | null {
    try {
      const configKey = this.CONFIG_KEYS[numberType];
      const config = localStorage.getItem(configKey);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error(`Error retrieving financial ${numberType} number config:`, error);
      return null;
    }
  }

  /**
   * Save configuration for a number type
   */
  static saveConfig(numberType: keyof typeof this.CONFIG_KEYS, config: FinancialNumberConfig): void {
    try {
      const configKey = this.CONFIG_KEYS[numberType];
      localStorage.setItem(configKey, JSON.stringify(config));
      console.log(`Financial ${numberType} number configuration saved:`, config);
    } catch (error) {
      console.error(`Error saving financial ${numberType} number config:`, error);
      throw new Error(`Failed to save financial ${numberType} number configuration`);
    }
  }

  /**
   * Update configuration for a number type
   */
  static updateConfig(numberType: keyof typeof this.CONFIG_KEYS, updates: Partial<FinancialNumberConfig>): void {
    try {
      const currentConfig = this.getConfig(numberType) || this.defaultConfigs[numberType];
      const newConfig = { ...currentConfig, ...updates };
      this.saveConfig(numberType, newConfig);
    } catch (error) {
      console.error(`Error updating financial ${numberType} number config:`, error);
      throw new Error(`Failed to update financial ${numberType} number configuration`);
    }
  }

  /**
   * Get current counter state for a number type
   */
  static getCounter(numberType: keyof typeof this.CONFIG_KEYS): FinancialNumberCounter {
    try {
      const counterKey = this.COUNTER_KEYS[numberType];
      const counter = localStorage.getItem(counterKey);
      if (counter) {
        return JSON.parse(counter);
      }
      
      // Initialize with default counter
      const defaultCounter: FinancialNumberCounter = {
        lastNumber: 0,
        resetFrequency: 'never',
        numberType: numberType
      };
      this.saveCounter(numberType, defaultCounter);
      return defaultCounter;
    } catch (error) {
      console.error(`Error retrieving financial ${numberType} number counter:`, error);
      return { lastNumber: 0, resetFrequency: 'never', numberType: numberType };
    }
  }

  /**
   * Save counter state for a number type
   */
  static saveCounter(numberType: keyof typeof this.CONFIG_KEYS, counter: FinancialNumberCounter): void {
    try {
      const counterKey = this.COUNTER_KEYS[numberType];
      localStorage.setItem(counterKey, JSON.stringify(counter));
    } catch (error) {
      console.error(`Error saving financial ${numberType} number counter:`, error);
      throw new Error(`Failed to save financial ${numberType} number counter`);
    }
  }

  /**
   * Initialize counter with starting number for a number type
   */
  private static initializeCounter(numberType: keyof typeof this.CONFIG_KEYS): void {
    const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
    const counter: FinancialNumberCounter = {
      lastNumber: config.startingNumber - 1,
      resetFrequency: config.resetFrequency || 'never',
      numberType: numberType
    };
    this.saveCounter(numberType, counter);
  }

  /**
   * Get all used numbers for a number type
   */
  static getUsedNumbers(numberType: keyof typeof this.CONFIG_KEYS): Set<string> {
    try {
      const usedNumbersKey = this.USED_NUMBERS_KEYS[numberType];
      const usedNumbers = localStorage.getItem(usedNumbersKey);
      return usedNumbers ? new Set(JSON.parse(usedNumbers)) : new Set();
    } catch (error) {
      console.error(`Error retrieving used financial ${numberType} numbers:`, error);
      return new Set();
    }
  }

  /**
   * Save used numbers for a number type
   */
  static saveUsedNumbers(numberType: keyof typeof this.CONFIG_KEYS, usedNumbers: Set<string>): void {
    try {
      const usedNumbersKey = this.USED_NUMBERS_KEYS[numberType];
      localStorage.setItem(usedNumbersKey, JSON.stringify([...usedNumbers]));
    } catch (error) {
      console.error(`Error saving used financial ${numberType} numbers:`, error);
      throw new Error(`Failed to save used financial ${numberType} numbers`);
    }
  }

  /**
   * Add number to used numbers set for a number type
   */
  static markNumberAsUsed(numberType: keyof typeof this.CONFIG_KEYS, number: string): void {
    try {
      const usedNumbers = this.getUsedNumbers(numberType);
      usedNumbers.add(number);
      this.saveUsedNumbers(numberType, usedNumbers);
    } catch (error) {
      console.error(`Error marking financial ${numberType} number as used:`, error);
      throw new Error(`Failed to mark financial ${numberType} number as used`);
    }
  }

  /**
   * Remove number from used numbers set for a number type
   */
  static markNumberAsUnused(numberType: keyof typeof this.CONFIG_KEYS, number: string): void {
    try {
      const usedNumbers = this.getUsedNumbers(numberType);
      usedNumbers.delete(number);
      this.saveUsedNumbers(numberType, usedNumbers);
    } catch (error) {
      console.error(`Error marking financial ${numberType} number as unused:`, error);
      throw new Error(`Failed to mark financial ${numberType} number as unused`);
    }
  }

  /**
   * Check if number reset is needed based on frequency
   */
  private static shouldResetCounter(counter: FinancialNumberCounter, config: FinancialNumberConfig): boolean {
    if (!config.resetFrequency || config.resetFrequency === 'never') {
      return false;
    }

    if (!counter.lastResetDate) {
      return true;
    }

    const lastReset = new Date(counter.lastResetDate);
    const now = new Date();

    switch (config.resetFrequency) {
      case 'yearly':
        return lastReset.getFullYear() < now.getFullYear();
      case 'monthly':
        return lastReset.getFullYear() < now.getFullYear() || 
               (lastReset.getFullYear() === now.getFullYear() && lastReset.getMonth() < now.getMonth());
      case 'daily':
        return lastReset.toDateString() !== now.toDateString();
      default:
        return false;
    }
  }

  /**
   * Reset counter based on frequency for a number type
   */
  private static resetCounterIfNeeded(numberType: keyof typeof this.CONFIG_KEYS): void {
    try {
      const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
      const counter = this.getCounter(numberType);

      if (this.shouldResetCounter(counter, config)) {
        const resetCounter: FinancialNumberCounter = {
          lastNumber: config.startingNumber - 1,
          lastResetDate: new Date().toISOString(),
          resetFrequency: config.resetFrequency || 'never',
          numberType: numberType
        };
        this.saveCounter(numberType, resetCounter);
        console.log(`Financial ${numberType} number counter reset due to frequency:`, config.resetFrequency);
      }
    } catch (error) {
      console.error(`Error resetting financial ${numberType} number counter:`, error);
    }
  }

  /**
   * Format date based on pattern
   */
  private static formatDate(date: Date, pattern: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (pattern) {
      case 'YYYY':
        return String(year);
      case 'YY':
        return String(year).slice(-2);
      case 'MM':
        return month;
      case 'DD':
        return day;
      case 'YYYYMM':
        return `${year}${month}`;
      case 'YYYYMMDD':
        return `${year}${month}${day}`;
      case 'YYMMDD':
        return `${String(year).slice(-2)}${month}${day}`;
      case 'MMYY':
        return `${month}${String(year).slice(-2)}`;
      default:
        return String(year);
    }
  }

  /**
   * Generate the next number for a specific number type
   */
  static generateNextNumber(numberType: keyof typeof this.CONFIG_KEYS): string {
    try {
      // Ensure service is initialized
      if (!this.getConfig(numberType)) {
        this.initialize(numberType);
      }

      // Reset counter if needed
      this.resetCounterIfNeeded(numberType);

      const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
      const counter = this.getCounter(numberType);
      
      let nextNumber: string;
      let attempts = 0;
      const maxAttempts = 1000;

      do {
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error(`Unable to generate unique financial ${numberType} number after maximum attempts`);
        }

        const sequenceNumber = counter.lastNumber + attempts;
        
        switch (config.format) {
          case 'sequential':
            nextNumber = `${config.prefix}${String(sequenceNumber).padStart(config.padLength, '0')}`;
            break;
            
          case 'date_based':
            const dateStr = this.formatDate(new Date(), config.dateFormat || 'YYYY');
            const paddedSequence = String(sequenceNumber).padStart(config.padLength, '0');
            nextNumber = `${config.prefix}${dateStr}${paddedSequence}`;
            break;
            
          case 'custom':
            if (!config.customPattern) {
              throw new Error('Custom pattern is required for custom format');
            }
            const dateForCustom = this.formatDate(new Date(), config.dateFormat || 'YYYY');
            const paddedSeqForCustom = String(sequenceNumber).padStart(config.padLength, '0');
            nextNumber = config.customPattern
              .replace('{prefix}', config.prefix)
              .replace('{date}', dateForCustom)
              .replace('{sequence}', paddedSeqForCustom);
            break;
            
          default:
            nextNumber = `${config.prefix}${String(sequenceNumber).padStart(config.padLength, '0')}`;
        }

      } while (this.isNumberUsed(numberType, nextNumber));

      // Update counter
      const newCounter: FinancialNumberCounter = {
        ...counter,
        lastNumber: counter.lastNumber + attempts
      };
      this.saveCounter(numberType, newCounter);

      // Mark number as used
      this.markNumberAsUsed(numberType, nextNumber);

      console.log(`Generated financial ${numberType} number:`, nextNumber);
      return nextNumber;

    } catch (error) {
      console.error(`Error generating financial ${numberType} number:`, error);
      throw new Error(`Failed to generate financial ${numberType} number: ${error.message}`);
    }
  }

  /**
   * Check if a number is already used for a specific number type
   */
  static isNumberUsed(numberType: keyof typeof this.CONFIG_KEYS, number: string): boolean {
    try {
      const usedNumbers = this.getUsedNumbers(numberType);
      return usedNumbers.has(number);
    } catch (error) {
      console.error(`Error checking if financial ${numberType} number is used:`, error);
      return false;
    }
  }

  /**
   * Validate number format for a specific number type
   */
  static validateNumberFormat(numberType: keyof typeof this.CONFIG_KEYS, number: string): boolean {
    try {
      const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
      
      // Basic validation - starts with prefix
      if (!number.startsWith(config.prefix)) {
        return false;
      }

      // Extract numeric part and validate
      const numericPart = number.substring(config.prefix.length);
      
      switch (config.format) {
        case 'sequential':
          return /^\d+$/.test(numericPart) && numericPart.length >= config.padLength;
          
        case 'date_based':
          const datePattern = config.dateFormat || 'YYYY';
          const expectedDateLength = this.formatDate(new Date(), datePattern).length;
          return numericPart.length >= expectedDateLength + config.padLength;
          
        case 'custom':
          // For custom format, we'll do basic validation
          return numericPart.length > 0;
          
        default:
          return /^\d+$/.test(numericPart);
      }
    } catch (error) {
      console.error(`Error validating financial ${numberType} number format:`, error);
      return false;
    }
  }

  /**
   * Reserve a specific number for a specific number type
   */
  static reserveNumber(numberType: keyof typeof this.CONFIG_KEYS, number: string): boolean {
    try {
      if (!this.validateNumberFormat(numberType, number)) {
        throw new Error(`Invalid financial ${numberType} number format`);
      }

      if (this.isNumberUsed(numberType, number)) {
        return false;
      }

      this.markNumberAsUsed(numberType, number);
      console.log(`Financial ${numberType} number reserved:`, number);
      return true;
    } catch (error) {
      console.error(`Error reserving financial ${numberType} number:`, error);
      throw new Error(`Failed to reserve financial ${numberType} number: ${error.message}`);
    }
  }

  /**
   * Release a reserved number for a specific number type
   */
  static releaseNumber(numberType: keyof typeof this.CONFIG_KEYS, number: string): void {
    try {
      this.markNumberAsUnused(numberType, number);
      console.log(`Financial ${numberType} number released:`, number);
    } catch (error) {
      console.error(`Error releasing financial ${numberType} number:`, error);
      throw new Error(`Failed to release financial ${numberType} number: ${error.message}`);
    }
  }

  /**
   * Get preview of next few numbers for a specific number type
   */
  static previewNextNumbers(numberType: keyof typeof this.CONFIG_KEYS, count: number = 5): string[] {
    try {
      const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
      const counter = this.getCounter(numberType);
      const previews: string[] = [];
      
      for (let i = 1; i <= count; i++) {
        const sequenceNumber = counter.lastNumber + i;
        let previewNumber: string;
        
        switch (config.format) {
          case 'sequential':
            previewNumber = `${config.prefix}${String(sequenceNumber).padStart(config.padLength, '0')}`;
            break;
            
          case 'date_based':
            const dateStr = this.formatDate(new Date(), config.dateFormat || 'YYYY');
            const paddedSequence = String(sequenceNumber).padStart(config.padLength, '0');
            previewNumber = `${config.prefix}${dateStr}${paddedSequence}`;
            break;
            
          case 'custom':
            if (!config.customPattern) {
              previewNumber = `${config.prefix}${String(sequenceNumber).padStart(config.padLength, '0')}`;
            } else {
              const dateForCustom = this.formatDate(new Date(), config.dateFormat || 'YYYY');
              const paddedSeqForCustom = String(sequenceNumber).padStart(config.padLength, '0');
              previewNumber = config.customPattern
                .replace('{prefix}', config.prefix)
                .replace('{date}', dateForCustom)
                .replace('{sequence}', paddedSeqForCustom);
            }
            break;
            
          default:
            previewNumber = `${config.prefix}${String(sequenceNumber).padStart(config.padLength, '0')}`;
        }
        
        previews.push(previewNumber);
      }
      
      return previews;
    } catch (error) {
      console.error(`Error generating financial ${numberType} number previews:`, error);
      return [];
    }
  }

  /**
   * Get service statistics for a specific number type
   */
  static getStatistics(numberType: keyof typeof this.CONFIG_KEYS): {
    totalGenerated: number;
    lastNumber: number;
    config: FinancialNumberConfig;
    usedNumbersCount: number;
    nextNumber: string;
  } {
    try {
      const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
      const counter = this.getCounter(numberType);
      const usedNumbers = this.getUsedNumbers(numberType);
      const previews = this.previewNextNumbers(numberType, 1);
      
      return {
        totalGenerated: counter.lastNumber,
        lastNumber: counter.lastNumber,
        config,
        usedNumbersCount: usedNumbers.size,
        nextNumber: previews[0] || 'N/A'
      };
    } catch (error) {
      console.error(`Error getting financial ${numberType} number service statistics:`, error);
      return {
        totalGenerated: 0,
        lastNumber: 0,
        config: this.defaultConfigs[numberType],
        usedNumbersCount: 0,
        nextNumber: 'N/A'
      };
    }
  }

  /**
   * Get statistics for all number types
   */
  static getAllStatistics(): Record<string, any> {
    try {
      const stats: Record<string, any> = {};
      Object.keys(this.CONFIG_KEYS).forEach(numberType => {
        stats[numberType] = this.getStatistics(numberType as keyof typeof this.CONFIG_KEYS);
      });
      return stats;
    } catch (error) {
      console.error('Error getting all financial number service statistics:', error);
      return {};
    }
  }

  /**
   * Reset the entire numbering system for a specific number type
   */
  static resetNumberingSystem(numberType: keyof typeof this.CONFIG_KEYS): void {
    try {
      const counterKey = this.COUNTER_KEYS[numberType];
      const usedNumbersKey = this.USED_NUMBERS_KEYS[numberType];
      
      localStorage.removeItem(counterKey);
      localStorage.removeItem(usedNumbersKey);
      this.initialize(numberType);
      console.log(`Financial ${numberType} numbering system reset successfully`);
    } catch (error) {
      console.error(`Error resetting financial ${numberType} numbering system:`, error);
      throw new Error(`Failed to reset financial ${numberType} numbering system`);
    }
  }

  /**
   * Reset all numbering systems
   */
  static resetAllNumberingSystems(): void {
    try {
      Object.keys(this.CONFIG_KEYS).forEach(numberType => {
        this.resetNumberingSystem(numberType as keyof typeof this.CONFIG_KEYS);
      });
      console.log('All financial numbering systems reset successfully');
    } catch (error) {
      console.error('Error resetting all financial numbering systems:', error);
      throw new Error('Failed to reset all financial numbering systems');
    }
  }

  /**
   * Import used numbers from external source for a specific number type
   */
  static importUsedNumbers(numberType: keyof typeof this.CONFIG_KEYS, numbers: string[]): void {
    try {
      const usedNumbers = this.getUsedNumbers(numberType);
      numbers.forEach(number => {
        if (this.validateNumberFormat(numberType, number)) {
          usedNumbers.add(number);
        }
      });
      this.saveUsedNumbers(numberType, usedNumbers);
      console.log(`Imported ${numbers.length} financial ${numberType} numbers`);
    } catch (error) {
      console.error(`Error importing financial ${numberType} numbers:`, error);
      throw new Error(`Failed to import financial ${numberType} numbers`);
    }
  }

  /**
   * Export all used numbers for a specific number type
   */
  static exportUsedNumbers(numberType: keyof typeof this.CONFIG_KEYS): string[] {
    try {
      const usedNumbers = this.getUsedNumbers(numberType);
      return [...usedNumbers].sort();
    } catch (error) {
      console.error(`Error exporting financial ${numberType} numbers:`, error);
      return [];
    }
  }

  /**
   * Export all used numbers for all number types
   */
  static exportAllUsedNumbers(): Record<string, string[]> {
    try {
      const allUsedNumbers: Record<string, string[]> = {};
      Object.keys(this.CONFIG_KEYS).forEach(numberType => {
        allUsedNumbers[numberType] = this.exportUsedNumbers(numberType as keyof typeof this.CONFIG_KEYS);
      });
      return allUsedNumbers;
    } catch (error) {
      console.error('Error exporting all financial numbers:', error);
      return {};
    }
  }

  // Convenience methods for specific number types
  static generateInvoiceNumber(): string {
    return this.generateNextNumber('invoice');
  }

  static generateBillNumber(): string {
    return this.generateNextNumber('bill');
  }

  static generateJournalNumber(): string {
    return this.generateNextNumber('journal');
  }

  static generatePaymentNumber(): string {
    return this.generateNextNumber('payment');
  }
}
