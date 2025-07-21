// Inventory Module Independent Number Generation Service

export interface InventoryNumberConfig {
  prefix: string;
  startingNumber: number;
  padLength: number;
  format: 'sequential' | 'date_based' | 'custom';
  dateFormat?: string; // e.g., 'YYYYMM', 'YYYY', 'MMYY'
  customPattern?: string; // e.g., '{prefix}-{date}-{sequence}'
  resetFrequency?: 'never' | 'yearly' | 'monthly' | 'daily';
  numberType: 'product' | 'sku' | 'barcode' | 'movement' | 'transfer' | 'adjustment' | 'count' | 'serial' | 'batch';
}

export interface InventoryNumberCounter {
  lastNumber: number;
  lastResetDate?: string;
  resetFrequency: string;
  numberType: string;
}

export class InventoryNumberService {
  // Storage Keys by Number Type
  private static readonly CONFIG_KEYS = {
    product: 'inventory_product_number_config',
    sku: 'inventory_sku_number_config',
    barcode: 'inventory_barcode_number_config',
    movement: 'inventory_movement_number_config',
    transfer: 'inventory_transfer_number_config',
    adjustment: 'inventory_adjustment_number_config',
    count: 'inventory_count_number_config',
    serial: 'inventory_serial_number_config',
    batch: 'inventory_batch_number_config'
  };

  private static readonly COUNTER_KEYS = {
    product: 'inventory_product_number_counter',
    sku: 'inventory_sku_number_counter',
    barcode: 'inventory_barcode_number_counter',
    movement: 'inventory_movement_number_counter',
    transfer: 'inventory_transfer_number_counter',
    adjustment: 'inventory_adjustment_number_counter',
    count: 'inventory_count_number_counter',
    serial: 'inventory_serial_number_counter',
    batch: 'inventory_batch_number_counter'
  };

  private static readonly USED_NUMBERS_KEYS = {
    product: 'inventory_product_used_numbers',
    sku: 'inventory_sku_used_numbers',
    barcode: 'inventory_barcode_used_numbers',
    movement: 'inventory_movement_used_numbers',
    transfer: 'inventory_transfer_used_numbers',
    adjustment: 'inventory_adjustment_used_numbers',
    count: 'inventory_count_used_numbers',
    serial: 'inventory_serial_used_numbers',
    batch: 'inventory_batch_used_numbers'
  };

  private static defaultConfigs: Record<string, InventoryNumberConfig> = {
    product: {
      prefix: 'PROD',
      startingNumber: 1,
      padLength: 6,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'product'
    },
    sku: {
      prefix: 'SKU',
      startingNumber: 1,
      padLength: 8,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'sku'
    },
    barcode: {
      prefix: '200',
      startingNumber: 1,
      padLength: 10,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'barcode'
    },
    movement: {
      prefix: 'MOV',
      startingNumber: 1,
      padLength: 8,
      format: 'date_based',
      dateFormat: 'YYYYMM',
      resetFrequency: 'monthly',
      numberType: 'movement'
    },
    transfer: {
      prefix: 'TRF',
      startingNumber: 1,
      padLength: 6,
      format: 'date_based',
      dateFormat: 'YYYYMM',
      resetFrequency: 'monthly',
      numberType: 'transfer'
    },
    adjustment: {
      prefix: 'ADJ',
      startingNumber: 1,
      padLength: 6,
      format: 'date_based',
      dateFormat: 'YYYYMM',
      resetFrequency: 'monthly',
      numberType: 'adjustment'
    },
    count: {
      prefix: 'CNT',
      startingNumber: 1,
      padLength: 6,
      format: 'date_based',
      dateFormat: 'YYYYMM',
      resetFrequency: 'monthly',
      numberType: 'count'
    },
    serial: {
      prefix: 'SN',
      startingNumber: 1,
      padLength: 10,
      format: 'sequential',
      resetFrequency: 'never',
      numberType: 'serial'
    },
    batch: {
      prefix: 'BTH',
      startingNumber: 1,
      padLength: 8,
      format: 'date_based',
      dateFormat: 'YYYYMMDD',
      resetFrequency: 'daily',
      numberType: 'batch'
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
      console.log('All inventory number services initialized');
    } catch (error) {
      console.error('Error initializing inventory number services:', error);
      throw new Error('Failed to initialize inventory number services');
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
        console.log(`Inventory ${numberType} number service initialized`);
      }
    } catch (error) {
      console.error(`Error initializing inventory ${numberType} number service:`, error);
      throw new Error(`Failed to initialize inventory ${numberType} number service`);
    }
  }

  /**
   * Get current configuration for a number type
   */
  static getConfig(numberType: keyof typeof this.CONFIG_KEYS): InventoryNumberConfig | null {
    try {
      const configKey = this.CONFIG_KEYS[numberType];
      const config = localStorage.getItem(configKey);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error(`Error retrieving inventory ${numberType} number config:`, error);
      return null;
    }
  }

  /**
   * Save configuration for a number type
   */
  static saveConfig(numberType: keyof typeof this.CONFIG_KEYS, config: InventoryNumberConfig): void {
    try {
      const configKey = this.CONFIG_KEYS[numberType];
      localStorage.setItem(configKey, JSON.stringify(config));
      console.log(`Inventory ${numberType} number configuration saved:`, config);
    } catch (error) {
      console.error(`Error saving inventory ${numberType} number config:`, error);
      throw new Error(`Failed to save inventory ${numberType} number configuration`);
    }
  }

  /**
   * Update configuration for a number type
   */
  static updateConfig(numberType: keyof typeof this.CONFIG_KEYS, updates: Partial<InventoryNumberConfig>): void {
    try {
      const currentConfig = this.getConfig(numberType) || this.defaultConfigs[numberType];
      const newConfig = { ...currentConfig, ...updates };
      this.saveConfig(numberType, newConfig);
    } catch (error) {
      console.error(`Error updating inventory ${numberType} number config:`, error);
      throw new Error(`Failed to update inventory ${numberType} number configuration`);
    }
  }

  /**
   * Get current counter state for a number type
   */
  static getCounter(numberType: keyof typeof this.CONFIG_KEYS): InventoryNumberCounter {
    try {
      const counterKey = this.COUNTER_KEYS[numberType];
      const counter = localStorage.getItem(counterKey);
      if (counter) {
        return JSON.parse(counter);
      }
      
      // Initialize with default counter
      const defaultCounter: InventoryNumberCounter = {
        lastNumber: 0,
        resetFrequency: 'never',
        numberType: numberType
      };
      this.saveCounter(numberType, defaultCounter);
      return defaultCounter;
    } catch (error) {
      console.error(`Error retrieving inventory ${numberType} number counter:`, error);
      return { lastNumber: 0, resetFrequency: 'never', numberType: numberType };
    }
  }

  /**
   * Save counter state for a number type
   */
  static saveCounter(numberType: keyof typeof this.CONFIG_KEYS, counter: InventoryNumberCounter): void {
    try {
      const counterKey = this.COUNTER_KEYS[numberType];
      localStorage.setItem(counterKey, JSON.stringify(counter));
    } catch (error) {
      console.error(`Error saving inventory ${numberType} number counter:`, error);
      throw new Error(`Failed to save inventory ${numberType} number counter`);
    }
  }

  /**
   * Initialize counter with starting number for a number type
   */
  private static initializeCounter(numberType: keyof typeof this.CONFIG_KEYS): void {
    const config = this.getConfig(numberType) || this.defaultConfigs[numberType];
    const counter: InventoryNumberCounter = {
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
      console.error(`Error retrieving used inventory ${numberType} numbers:`, error);
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
      console.error(`Error saving used inventory ${numberType} numbers:`, error);
      throw new Error(`Failed to save used inventory ${numberType} numbers`);
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
      console.error(`Error marking inventory ${numberType} number as used:`, error);
      throw new Error(`Failed to mark inventory ${numberType} number as used`);
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
      console.error(`Error marking inventory ${numberType} number as unused:`, error);
      throw new Error(`Failed to mark inventory ${numberType} number as unused`);
    }
  }

  /**
   * Check if number reset is needed based on frequency
   */
  private static shouldResetCounter(counter: InventoryNumberCounter, config: InventoryNumberConfig): boolean {
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
        const resetCounter: InventoryNumberCounter = {
          lastNumber: config.startingNumber - 1,
          lastResetDate: new Date().toISOString(),
          resetFrequency: config.resetFrequency || 'never',
          numberType: numberType
        };
        this.saveCounter(numberType, resetCounter);
        console.log(`Inventory ${numberType} number counter reset due to frequency:`, config.resetFrequency);
      }
    } catch (error) {
      console.error(`Error resetting inventory ${numberType} number counter:`, error);
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
          throw new Error(`Unable to generate unique inventory ${numberType} number after maximum attempts`);
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
      const newCounter: InventoryNumberCounter = {
        ...counter,
        lastNumber: counter.lastNumber + attempts
      };
      this.saveCounter(numberType, newCounter);

      // Mark number as used
      this.markNumberAsUsed(numberType, nextNumber);

      console.log(`Generated inventory ${numberType} number:`, nextNumber);
      return nextNumber;

    } catch (error) {
      console.error(`Error generating inventory ${numberType} number:`, error);
      throw new Error(`Failed to generate inventory ${numberType} number: ${error.message}`);
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
      console.error(`Error checking if inventory ${numberType} number is used:`, error);
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
      console.error(`Error validating inventory ${numberType} number format:`, error);
      return false;
    }
  }

  /**
   * Reserve a specific number for a specific number type
   */
  static reserveNumber(numberType: keyof typeof this.CONFIG_KEYS, number: string): boolean {
    try {
      if (!this.validateNumberFormat(numberType, number)) {
        throw new Error(`Invalid inventory ${numberType} number format`);
      }

      if (this.isNumberUsed(numberType, number)) {
        return false;
      }

      this.markNumberAsUsed(numberType, number);
      console.log(`Inventory ${numberType} number reserved:`, number);
      return true;
    } catch (error) {
      console.error(`Error reserving inventory ${numberType} number:`, error);
      throw new Error(`Failed to reserve inventory ${numberType} number: ${error.message}`);
    }
  }

  /**
   * Release a reserved number for a specific number type
   */
  static releaseNumber(numberType: keyof typeof this.CONFIG_KEYS, number: string): void {
    try {
      this.markNumberAsUnused(numberType, number);
      console.log(`Inventory ${numberType} number released:`, number);
    } catch (error) {
      console.error(`Error releasing inventory ${numberType} number:`, error);
      throw new Error(`Failed to release inventory ${numberType} number: ${error.message}`);
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
      console.error(`Error generating inventory ${numberType} number previews:`, error);
      return [];
    }
  }

  /**
   * Get service statistics for a specific number type
   */
  static getStatistics(numberType: keyof typeof this.CONFIG_KEYS): {
    totalGenerated: number;
    lastNumber: number;
    config: InventoryNumberConfig;
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
      console.error(`Error getting inventory ${numberType} number service statistics:`, error);
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
      console.error('Error getting all inventory number service statistics:', error);
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
      console.log(`Inventory ${numberType} numbering system reset successfully`);
    } catch (error) {
      console.error(`Error resetting inventory ${numberType} numbering system:`, error);
      throw new Error(`Failed to reset inventory ${numberType} numbering system`);
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
      console.log('All inventory numbering systems reset successfully');
    } catch (error) {
      console.error('Error resetting all inventory numbering systems:', error);
      throw new Error('Failed to reset all inventory numbering systems');
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
      console.log(`Imported ${numbers.length} inventory ${numberType} numbers`);
    } catch (error) {
      console.error(`Error importing inventory ${numberType} numbers:`, error);
      throw new Error(`Failed to import inventory ${numberType} numbers`);
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
      console.error(`Error exporting inventory ${numberType} numbers:`, error);
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
      console.error('Error exporting all inventory numbers:', error);
      return {};
    }
  }

  // Convenience methods for specific number types
  static generateProductNumber(): string {
    return this.generateNextNumber('product');
  }

  static generateSkuNumber(): string {
    return this.generateNextNumber('sku');
  }

  static generateBarcodeNumber(): string {
    return this.generateNextNumber('barcode');
  }

  static generateMovementNumber(): string {
    return this.generateNextNumber('movement');
  }

  static generateTransferNumber(): string {
    return this.generateNextNumber('transfer');
  }

  static generateAdjustmentNumber(): string {
    return this.generateNextNumber('adjustment');
  }

  static generateCountNumber(): string {
    return this.generateNextNumber('count');
  }

  static generateSerialNumber(): string {
    return this.generateNextNumber('serial');
  }

  static generateBatchNumber(): string {
    return this.generateNextNumber('batch');
  }
}
