// Customer Module Independent Number Generation Service

export interface CustomerNumberConfig {
  prefix: string;
  startingNumber: number;
  padLength: number;
  format: 'sequential' | 'date_based' | 'custom';
  dateFormat?: string; // e.g., 'YYYYMM', 'YYYY', 'MMYY'
  customPattern?: string; // e.g., '{prefix}-{date}-{sequence}'
  resetFrequency?: 'never' | 'yearly' | 'monthly' | 'daily';
}

export interface CustomerNumberCounter {
  lastNumber: number;
  lastResetDate?: string;
  resetFrequency: string;
}

export class CustomerNumberService {
  private static readonly STORAGE_KEY = 'customer_number_config';
  private static readonly COUNTER_KEY = 'customer_number_counter';
  private static readonly USED_NUMBERS_KEY = 'customer_used_numbers';

  private static defaultConfig: CustomerNumberConfig = {
    prefix: 'CUST',
    startingNumber: 1,
    padLength: 6,
    format: 'sequential',
    resetFrequency: 'never'
  };

  /**
   * Initialize number service with default configuration
   */
  static initialize(): void {
    try {
      const existingConfig = this.getConfig();
      if (!existingConfig) {
        this.saveConfig(this.defaultConfig);
        this.initializeCounter();
        console.log('Customer number service initialized with default configuration');
      }
    } catch (error) {
      console.error('Error initializing customer number service:', error);
      throw new Error('Failed to initialize customer number service');
    }
  }

  /**
   * Get current configuration
   */
  static getConfig(): CustomerNumberConfig | null {
    try {
      const config = localStorage.getItem(this.STORAGE_KEY);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error retrieving customer number config:', error);
      return null;
    }
  }

  /**
   * Save configuration
   */
  static saveConfig(config: CustomerNumberConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      console.log('Customer number configuration saved:', config);
    } catch (error) {
      console.error('Error saving customer number config:', error);
      throw new Error('Failed to save customer number configuration');
    }
  }

  /**
   * Update configuration
   */
  static updateConfig(updates: Partial<CustomerNumberConfig>): void {
    try {
      const currentConfig = this.getConfig() || this.defaultConfig;
      const newConfig = { ...currentConfig, ...updates };
      this.saveConfig(newConfig);
    } catch (error) {
      console.error('Error updating customer number config:', error);
      throw new Error('Failed to update customer number configuration');
    }
  }

  /**
   * Get current counter state
   */
  static getCounter(): CustomerNumberCounter {
    try {
      const counter = localStorage.getItem(this.COUNTER_KEY);
      if (counter) {
        return JSON.parse(counter);
      }
      
      // Initialize with default counter
      const defaultCounter: CustomerNumberCounter = {
        lastNumber: 0,
        resetFrequency: 'never'
      };
      this.saveCounter(defaultCounter);
      return defaultCounter;
    } catch (error) {
      console.error('Error retrieving customer number counter:', error);
      return { lastNumber: 0, resetFrequency: 'never' };
    }
  }

  /**
   * Save counter state
   */
  static saveCounter(counter: CustomerNumberCounter): void {
    try {
      localStorage.setItem(this.COUNTER_KEY, JSON.stringify(counter));
    } catch (error) {
      console.error('Error saving customer number counter:', error);
      throw new Error('Failed to save customer number counter');
    }
  }

  /**
   * Initialize counter with starting number
   */
  private static initializeCounter(): void {
    const config = this.getConfig() || this.defaultConfig;
    const counter: CustomerNumberCounter = {
      lastNumber: config.startingNumber - 1,
      resetFrequency: config.resetFrequency || 'never'
    };
    this.saveCounter(counter);
  }

  /**
   * Get all used customer numbers
   */
  static getUsedNumbers(): Set<string> {
    try {
      const usedNumbers = localStorage.getItem(this.USED_NUMBERS_KEY);
      return usedNumbers ? new Set(JSON.parse(usedNumbers)) : new Set();
    } catch (error) {
      console.error('Error retrieving used customer numbers:', error);
      return new Set();
    }
  }

  /**
   * Save used customer numbers
   */
  static saveUsedNumbers(usedNumbers: Set<string>): void {
    try {
      localStorage.setItem(this.USED_NUMBERS_KEY, JSON.stringify([...usedNumbers]));
    } catch (error) {
      console.error('Error saving used customer numbers:', error);
      throw new Error('Failed to save used customer numbers');
    }
  }

  /**
   * Add number to used numbers set
   */
  static markNumberAsUsed(customerNumber: string): void {
    try {
      const usedNumbers = this.getUsedNumbers();
      usedNumbers.add(customerNumber);
      this.saveUsedNumbers(usedNumbers);
    } catch (error) {
      console.error('Error marking customer number as used:', error);
      throw new Error('Failed to mark customer number as used');
    }
  }

  /**
   * Remove number from used numbers set
   */
  static markNumberAsUnused(customerNumber: string): void {
    try {
      const usedNumbers = this.getUsedNumbers();
      usedNumbers.delete(customerNumber);
      this.saveUsedNumbers(usedNumbers);
    } catch (error) {
      console.error('Error marking customer number as unused:', error);
      throw new Error('Failed to mark customer number as unused');
    }
  }

  /**
   * Check if number reset is needed based on frequency
   */
  private static shouldResetCounter(counter: CustomerNumberCounter, config: CustomerNumberConfig): boolean {
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
   * Reset counter based on frequency
   */
  private static resetCounterIfNeeded(): void {
    try {
      const config = this.getConfig() || this.defaultConfig;
      const counter = this.getCounter();

      if (this.shouldResetCounter(counter, config)) {
        const resetCounter: CustomerNumberCounter = {
          lastNumber: config.startingNumber - 1,
          lastResetDate: new Date().toISOString(),
          resetFrequency: config.resetFrequency || 'never'
        };
        this.saveCounter(resetCounter);
        console.log('Customer number counter reset due to frequency:', config.resetFrequency);
      }
    } catch (error) {
      console.error('Error resetting customer number counter:', error);
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
      case 'YYMMDD':
        return `${String(year).slice(-2)}${month}${day}`;
      case 'MMYY':
        return `${month}${String(year).slice(-2)}`;
      default:
        return String(year);
    }
  }

  /**
   * Generate the next customer number
   */
  static generateNextNumber(): string {
    try {
      // Ensure service is initialized
      if (!this.getConfig()) {
        this.initialize();
      }

      // Reset counter if needed
      this.resetCounterIfNeeded();

      const config = this.getConfig() || this.defaultConfig;
      const counter = this.getCounter();
      
      let nextNumber: string;
      let attempts = 0;
      const maxAttempts = 1000;

      do {
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error('Unable to generate unique customer number after maximum attempts');
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

      } while (this.isNumberUsed(nextNumber));

      // Update counter
      const newCounter: CustomerNumberCounter = {
        ...counter,
        lastNumber: counter.lastNumber + attempts
      };
      this.saveCounter(newCounter);

      // Mark number as used
      this.markNumberAsUsed(nextNumber);

      console.log('Generated customer number:', nextNumber);
      return nextNumber;

    } catch (error) {
      console.error('Error generating customer number:', error);
      throw new Error(`Failed to generate customer number: ${error.message}`);
    }
  }

  /**
   * Check if a customer number is already used
   */
  static isNumberUsed(customerNumber: string): boolean {
    try {
      const usedNumbers = this.getUsedNumbers();
      return usedNumbers.has(customerNumber);
    } catch (error) {
      console.error('Error checking if customer number is used:', error);
      return false;
    }
  }

  /**
   * Validate customer number format
   */
  static validateNumberFormat(customerNumber: string): boolean {
    try {
      const config = this.getConfig() || this.defaultConfig;
      
      // Basic validation - starts with prefix
      if (!customerNumber.startsWith(config.prefix)) {
        return false;
      }

      // Extract numeric part and validate
      const numericPart = customerNumber.substring(config.prefix.length);
      
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
      console.error('Error validating customer number format:', error);
      return false;
    }
  }

  /**
   * Reserve a specific customer number
   */
  static reserveNumber(customerNumber: string): boolean {
    try {
      if (!this.validateNumberFormat(customerNumber)) {
        throw new Error('Invalid customer number format');
      }

      if (this.isNumberUsed(customerNumber)) {
        return false;
      }

      this.markNumberAsUsed(customerNumber);
      console.log('Customer number reserved:', customerNumber);
      return true;
    } catch (error) {
      console.error('Error reserving customer number:', error);
      throw new Error(`Failed to reserve customer number: ${error.message}`);
    }
  }

  /**
   * Release a reserved customer number
   */
  static releaseNumber(customerNumber: string): void {
    try {
      this.markNumberAsUnused(customerNumber);
      console.log('Customer number released:', customerNumber);
    } catch (error) {
      console.error('Error releasing customer number:', error);
      throw new Error(`Failed to release customer number: ${error.message}`);
    }
  }

  /**
   * Get preview of next few numbers
   */
  static previewNextNumbers(count: number = 5): string[] {
    try {
      const config = this.getConfig() || this.defaultConfig;
      const counter = this.getCounter();
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
      console.error('Error generating customer number previews:', error);
      return [];
    }
  }

  /**
   * Get service statistics
   */
  static getStatistics(): {
    totalGenerated: number;
    lastNumber: number;
    config: CustomerNumberConfig;
    usedNumbersCount: number;
    nextNumber: string;
  } {
    try {
      const config = this.getConfig() || this.defaultConfig;
      const counter = this.getCounter();
      const usedNumbers = this.getUsedNumbers();
      const previews = this.previewNextNumbers(1);
      
      return {
        totalGenerated: counter.lastNumber,
        lastNumber: counter.lastNumber,
        config,
        usedNumbersCount: usedNumbers.size,
        nextNumber: previews[0] || 'N/A'
      };
    } catch (error) {
      console.error('Error getting customer number service statistics:', error);
      return {
        totalGenerated: 0,
        lastNumber: 0,
        config: this.defaultConfig,
        usedNumbersCount: 0,
        nextNumber: 'N/A'
      };
    }
  }

  /**
   * Reset the entire numbering system
   */
  static resetNumberingSystem(): void {
    try {
      localStorage.removeItem(this.COUNTER_KEY);
      localStorage.removeItem(this.USED_NUMBERS_KEY);
      this.initialize();
      console.log('Customer numbering system reset successfully');
    } catch (error) {
      console.error('Error resetting customer numbering system:', error);
      throw new Error('Failed to reset customer numbering system');
    }
  }

  /**
   * Import used numbers from external source
   */
  static importUsedNumbers(numbers: string[]): void {
    try {
      const usedNumbers = this.getUsedNumbers();
      numbers.forEach(number => {
        if (this.validateNumberFormat(number)) {
          usedNumbers.add(number);
        }
      });
      this.saveUsedNumbers(usedNumbers);
      console.log(`Imported ${numbers.length} customer numbers`);
    } catch (error) {
      console.error('Error importing customer numbers:', error);
      throw new Error('Failed to import customer numbers');
    }
  }

  /**
   * Export all used numbers
   */
  static exportUsedNumbers(): string[] {
    try {
      const usedNumbers = this.getUsedNumbers();
      return [...usedNumbers].sort();
    } catch (error) {
      console.error('Error exporting customer numbers:', error);
      return [];
    }
  }
}
