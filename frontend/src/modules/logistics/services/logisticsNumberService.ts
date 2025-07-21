/**
 * Independent number generation service for logistics documents
 * Generates unique numbers for shipments, delivery notes, tracking, etc.
 */

export interface LogisticsNumberConfig {
  prefix: string;
  format: 'sequential' | 'date-based' | 'custom';
  paddingLength: number;
  resetFrequency: 'never' | 'daily' | 'monthly' | 'yearly';
  customPattern?: string; // e.g., '{prefix}-{year}-{month}-{number:0000}'
  includeCheckDigit?: boolean;
}

export interface LogisticsNumberCounter {
  lastNumber: number;
  lastResetDate: string;
  usedNumbers: Set<string>;
}

export interface LogisticsNumberStats {
  totalGenerated: number;
  lastGenerated: string;
  nextNumber: string;
  config: LogisticsNumberConfig;
  counter: LogisticsNumberCounter;
}

export class LogisticsNumberService {
  private static readonly STORAGE_KEY_PREFIX = 'logistics_numbering';
  
  // Document type configurations
  private static readonly DEFAULT_CONFIGS: { [key: string]: LogisticsNumberConfig } = {
    shipment: {
      prefix: 'SHP',
      format: 'sequential',
      paddingLength: 6,
      resetFrequency: 'yearly',
      customPattern: '{prefix}-{year}-{number:000000}',
      includeCheckDigit: false
    },
    deliveryNote: {
      prefix: 'DN',
      format: 'sequential',
      paddingLength: 5,
      resetFrequency: 'yearly',
      customPattern: '{prefix}-{year}-{number:00000}',
      includeCheckDigit: false
    },
    tracking: {
      prefix: 'TRK',
      format: 'date-based',
      paddingLength: 8,
      resetFrequency: 'daily',
      customPattern: '{prefix}-{year}{month}{day}-{number:0000}',
      includeCheckDigit: true
    },
    route: {
      prefix: 'RT',
      format: 'date-based',
      paddingLength: 4,
      resetFrequency: 'daily',
      customPattern: '{prefix}-{year}{month}{day}-{number:0000}',
      includeCheckDigit: false
    },
    vehicle: {
      prefix: 'VEH',
      format: 'sequential',
      paddingLength: 4,
      resetFrequency: 'never',
      customPattern: '{prefix}-{number:0000}',
      includeCheckDigit: false
    },
    warehouse: {
      prefix: 'WH',
      format: 'sequential',
      paddingLength: 3,
      resetFrequency: 'never',
      customPattern: '{prefix}-{number:000}',
      includeCheckDigit: false
    }
  };

  /**
   * Initialize numbering system for a document type
   */
  static initializeNumbering(documentType: string, config?: Partial<LogisticsNumberConfig>): void {
    try {
      const existingConfig = this.getConfig(documentType);
      if (existingConfig) {
        console.log(`📋 Numbering already initialized for ${documentType}`);
        return;
      }

      const defaultConfig = this.DEFAULT_CONFIGS[documentType] || this.DEFAULT_CONFIGS.shipment;
      const finalConfig: LogisticsNumberConfig = {
        ...defaultConfig,
        ...config
      };

      this.saveConfig(documentType, finalConfig);
      this.initializeCounter(documentType);

      console.log(`✅ Numbering initialized for ${documentType}:`, finalConfig);
    } catch (error) {
      console.error(`❌ Error initializing numbering for ${documentType}:`, error);
    }
  }

  /**
   * Get configuration for a document type
   */
  static getConfig(documentType: string): LogisticsNumberConfig | null {
    try {
      const configKey = `${this.STORAGE_KEY_PREFIX}_config_${documentType}`;
      const configData = localStorage.getItem(configKey);
      return configData ? JSON.parse(configData) : null;
    } catch (error) {
      console.error(`❌ Error getting config for ${documentType}:`, error);
      return null;
    }
  }

  /**
   * Update configuration for a document type
   */
  static updateConfig(documentType: string, config: Partial<LogisticsNumberConfig>): boolean {
    try {
      const existingConfig = this.getConfig(documentType);
      if (!existingConfig) {
        console.error(`❌ No configuration found for ${documentType}`);
        return false;
      }

      const updatedConfig = { ...existingConfig, ...config };
      this.saveConfig(documentType, updatedConfig);

      console.log(`✅ Configuration updated for ${documentType}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating config for ${documentType}:`, error);
      return false;
    }
  }

  /**
   * Generate the next number for a document type
   */
  static generateNumber(documentType: string): string {
    try {
      // Initialize if not exists
      if (!this.getConfig(documentType)) {
        this.initializeNumbering(documentType);
      }

      const config = this.getConfig(documentType)!;
      const counter = this.getCounter(documentType);

      // Check if reset is needed
      if (this.shouldReset(config, counter)) {
        this.resetCounter(documentType);
        counter.lastNumber = 0;
        counter.usedNumbers.clear();
      }

      // Generate next number
      let attempts = 0;
      let generatedNumber: string;
      
      do {
        counter.lastNumber++;
        generatedNumber = this.formatNumber(config, counter.lastNumber);
        attempts++;
        
        if (attempts > 1000) {
          throw new Error(`Unable to generate unique number for ${documentType} after 1000 attempts`);
        }
      } while (counter.usedNumbers.has(generatedNumber));

      // Mark as used and save counter
      counter.usedNumbers.add(generatedNumber);
      this.saveCounter(documentType, counter);

      console.log(`📝 Generated number for ${documentType}: ${generatedNumber}`);
      return generatedNumber;
    } catch (error) {
      console.error(`❌ Error generating number for ${documentType}:`, error);
      // Fallback to simple timestamp-based number
      return `${documentType.toUpperCase()}-${Date.now()}`;
    }
  }

  /**
   * Reserve a specific number
   */
  static reserveNumber(documentType: string, number: string): boolean {
    try {
      const counter = this.getCounter(documentType);
      
      if (counter.usedNumbers.has(number)) {
        return false; // Already used
      }

      counter.usedNumbers.add(number);
      this.saveCounter(documentType, counter);

      console.log(`🔒 Reserved number ${number} for ${documentType}`);
      return true;
    } catch (error) {
      console.error(`❌ Error reserving number ${number} for ${documentType}:`, error);
      return false;
    }
  }

  /**
   * Release a reserved number
   */
  static releaseNumber(documentType: string, number: string): boolean {
    try {
      const counter = this.getCounter(documentType);
      
      if (!counter.usedNumbers.has(number)) {
        return false; // Not reserved
      }

      counter.usedNumbers.delete(number);
      this.saveCounter(documentType, counter);

      console.log(`🔓 Released number ${number} for ${documentType}`);
      return true;
    } catch (error) {
      console.error(`❌ Error releasing number ${number} for ${documentType}:`, error);
      return false;
    }
  }

  /**
   * Check if a number is valid for the document type
   */
  static validateNumber(documentType: string, number: string): boolean {
    try {
      const config = this.getConfig(documentType);
      if (!config) return false;

      // Check prefix
      if (!number.startsWith(config.prefix)) {
        return false;
      }

      // Check format based on custom pattern
      if (config.customPattern) {
        return this.validateAgainstPattern(number, config.customPattern, config);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error validating number ${number} for ${documentType}:`, error);
      return false;
    }
  }

  /**
   * Get the next number that would be generated (preview)
   */
  static previewNextNumber(documentType: string): string {
    try {
      if (!this.getConfig(documentType)) {
        this.initializeNumbering(documentType);
      }

      const config = this.getConfig(documentType)!;
      const counter = this.getCounter(documentType);

      // Check if reset is needed
      if (this.shouldReset(config, counter)) {
        return this.formatNumber(config, 1);
      }

      return this.formatNumber(config, counter.lastNumber + 1);
    } catch (error) {
      console.error(`❌ Error previewing next number for ${documentType}:`, error);
      return `${documentType.toUpperCase()}-PREVIEW`;
    }
  }

  /**
   * Get numbering statistics for a document type
   */
  static getStats(documentType: string): LogisticsNumberStats | null {
    try {
      const config = this.getConfig(documentType);
      const counter = this.getCounter(documentType);
      
      if (!config) return null;

      return {
        totalGenerated: counter.usedNumbers.size,
        lastGenerated: counter.lastNumber > 0 ? this.formatNumber(config, counter.lastNumber) : 'None',
        nextNumber: this.previewNextNumber(documentType),
        config,
        counter
      };
    } catch (error) {
      console.error(`❌ Error getting stats for ${documentType}:`, error);
      return null;
    }
  }

  /**
   * Reset numbering for a document type
   */
  static resetNumbering(documentType: string, preserveConfig: boolean = true): boolean {
    try {
      if (preserveConfig) {
        this.resetCounter(documentType);
      } else {
        this.deleteConfig(documentType);
        this.deleteCounter(documentType);
      }

      console.log(`🔄 Reset numbering for ${documentType} (preserve config: ${preserveConfig})`);
      return true;
    } catch (error) {
      console.error(`❌ Error resetting numbering for ${documentType}:`, error);
      return false;
    }
  }

  /**
   * Export used numbers for backup
   */
  static exportUsedNumbers(documentType: string): string[] {
    try {
      const counter = this.getCounter(documentType);
      return Array.from(counter.usedNumbers);
    } catch (error) {
      console.error(`❌ Error exporting used numbers for ${documentType}:`, error);
      return [];
    }
  }

  /**
   * Import used numbers from backup
   */
  static importUsedNumbers(documentType: string, usedNumbers: string[]): boolean {
    try {
      const counter = this.getCounter(documentType);
      
      usedNumbers.forEach(number => {
        counter.usedNumbers.add(number);
      });

      this.saveCounter(documentType, counter);
      
      console.log(`📥 Imported ${usedNumbers.length} used numbers for ${documentType}`);
      return true;
    } catch (error) {
      console.error(`❌ Error importing used numbers for ${documentType}:`, error);
      return false;
    }
  }

  /**
   * Generate shipment number (convenience method)
   */
  static generateShipmentNumber(): string {
    return this.generateNumber('shipment');
  }

  /**
   * Generate delivery note number (convenience method)
   */
  static generateDeliveryNoteNumber(): string {
    return this.generateNumber('deliveryNote');
  }

  /**
   * Generate tracking number (convenience method)
   */
  static generateTrackingNumber(): string {
    return this.generateNumber('tracking');
  }

  /**
   * Generate route number (convenience method)
   */
  static generateRouteNumber(): string {
    return this.generateNumber('route');
  }

  /**
   * Generate vehicle number (convenience method)
   */
  static generateVehicleNumber(): string {
    return this.generateNumber('vehicle');
  }

  /**
   * Generate warehouse code (convenience method)
   */
  static generateWarehouseCode(): string {
    return this.generateNumber('warehouse');
  }

  // ============= PRIVATE HELPER METHODS =============

  private static saveConfig(documentType: string, config: LogisticsNumberConfig): void {
    const configKey = `${this.STORAGE_KEY_PREFIX}_config_${documentType}`;
    localStorage.setItem(configKey, JSON.stringify(config));
  }

  private static deleteConfig(documentType: string): void {
    const configKey = `${this.STORAGE_KEY_PREFIX}_config_${documentType}`;
    localStorage.removeItem(configKey);
  }

  private static getCounter(documentType: string): LogisticsNumberCounter {
    try {
      const counterKey = `${this.STORAGE_KEY_PREFIX}_counter_${documentType}`;
      const counterData = localStorage.getItem(counterKey);
      
      if (counterData) {
        const parsed = JSON.parse(counterData);
        return {
          lastNumber: parsed.lastNumber || 0,
          lastResetDate: parsed.lastResetDate || new Date().toISOString(),
          usedNumbers: new Set(parsed.usedNumbers || [])
        };
      }

      return this.createDefaultCounter();
    } catch (error) {
      console.error(`❌ Error getting counter for ${documentType}:`, error);
      return this.createDefaultCounter();
    }
  }

  private static saveCounter(documentType: string, counter: LogisticsNumberCounter): void {
    const counterKey = `${this.STORAGE_KEY_PREFIX}_counter_${documentType}`;
    const serializable = {
      lastNumber: counter.lastNumber,
      lastResetDate: counter.lastResetDate,
      usedNumbers: Array.from(counter.usedNumbers)
    };
    localStorage.setItem(counterKey, JSON.stringify(serializable));
  }

  private static deleteCounter(documentType: string): void {
    const counterKey = `${this.STORAGE_KEY_PREFIX}_counter_${documentType}`;
    localStorage.removeItem(counterKey);
  }

  private static initializeCounter(documentType: string): void {
    const counter = this.createDefaultCounter();
    this.saveCounter(documentType, counter);
  }

  private static resetCounter(documentType: string): void {
    const counter = this.createDefaultCounter();
    this.saveCounter(documentType, counter);
  }

  private static createDefaultCounter(): LogisticsNumberCounter {
    return {
      lastNumber: 0,
      lastResetDate: new Date().toISOString(),
      usedNumbers: new Set()
    };
  }

  private static shouldReset(config: LogisticsNumberConfig, counter: LogisticsNumberCounter): boolean {
    if (config.resetFrequency === 'never') {
      return false;
    }

    const lastReset = new Date(counter.lastResetDate);
    const now = new Date();

    switch (config.resetFrequency) {
      case 'daily':
        return lastReset.toDateString() !== now.toDateString();
      case 'monthly':
        return lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
      case 'yearly':
        return lastReset.getFullYear() !== now.getFullYear();
      default:
        return false;
    }
  }

  private static formatNumber(config: LogisticsNumberConfig, number: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    let formatted: string;

    if (config.customPattern) {
      formatted = config.customPattern
        .replace('{prefix}', config.prefix)
        .replace('{year}', year.toString())
        .replace('{month}', month)
        .replace('{day}', day)
        .replace(/\{number:0+\}/g, (match) => {
          const padding = match.match(/0+/)?.[0].length || config.paddingLength;
          return number.toString().padStart(padding, '0');
        })
        .replace('{number}', number.toString().padStart(config.paddingLength, '0'));
    } else {
      const paddedNumber = number.toString().padStart(config.paddingLength, '0');
      
      switch (config.format) {
        case 'date-based':
          formatted = `${config.prefix}-${year}${month}${day}-${paddedNumber}`;
          break;
        case 'sequential':
        default:
          formatted = `${config.prefix}-${paddedNumber}`;
          break;
      }
    }

    // Add check digit if required
    if (config.includeCheckDigit) {
      const checkDigit = this.calculateCheckDigit(formatted);
      formatted += checkDigit;
    }

    return formatted;
  }

  private static calculateCheckDigit(input: string): string {
    // Simple Luhn algorithm for check digit calculation
    const digits = input.replace(/\D/g, '').split('').map(Number);
    let sum = 0;
    let alternate = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = digit % 10 + 1;
        }
      }
      sum += digit;
      alternate = !alternate;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  private static validateAgainstPattern(number: string, pattern: string, config: LogisticsNumberConfig): boolean {
    // Convert pattern to regex
    let regexPattern = pattern
      .replace(/\{prefix\}/g, config.prefix)
      .replace(/\{year\}/g, '\\d{4}')
      .replace(/\{month\}/g, '\\d{2}')
      .replace(/\{day\}/g, '\\d{2}')
      .replace(/\{number:0+\}/g, '\\d+')
      .replace(/\{number\}/g, '\\d+')
      .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape special regex characters

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(number);
  }

  /**
   * Get all document types with numbering configured
   */
  static getConfiguredDocumentTypes(): string[] {
    try {
      const keys = Object.keys(localStorage);
      const configKeys = keys.filter(key => key.startsWith(`${this.STORAGE_KEY_PREFIX}_config_`));
      return configKeys.map(key => key.replace(`${this.STORAGE_KEY_PREFIX}_config_`, ''));
    } catch (error) {
      console.error('❌ Error getting configured document types:', error);
      return [];
    }
  }

  /**
   * Get all available document types (including defaults)
   */
  static getAvailableDocumentTypes(): string[] {
    return Object.keys(this.DEFAULT_CONFIGS);
  }
}
