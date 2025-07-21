import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';

export interface SKUGenerationConfig {
  enabled: boolean;
  prefix: string;
  categoryPrefix?: string;
  includeYear: boolean;
  includeMonth: boolean;
  numberLength: number;
  separator: string;
  format: string; // e.g., "{prefix}{separator}{category}{separator}{year}{separator}{number}"
}

export class SKUGenerationService {
  private static readonly STORAGE_KEY = 'sku_generation_config';
  private static readonly COUNTER_KEY = 'sku_counters';

  /**
   * Get SKU generation configuration
   */
  static getConfig(): SKUGenerationConfig {
    try {
      const config = localStorage.getItem(this.STORAGE_KEY);
      if (config) {
        return JSON.parse(config);
      }
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Error getting SKU config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Update SKU generation configuration
   */
  static updateConfig(config: Partial<SKUGenerationConfig>): boolean {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedConfig));
      return true;
    } catch (error) {
      console.error('Error updating SKU config:', error);
      return false;
    }
  }

  /**
   * Generate next SKU for a product
   */
  static generateSKU(categoryCode?: string): string {
    const config = this.getConfig();
    
    if (!config.enabled) {
      // If auto-generation is disabled, return a simple random SKU
      return `ITEM-${Date.now().toString(36).toUpperCase()}`;
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Create a unique key for this SKU pattern
    const patternKey = this.createPatternKey(config, categoryCode, year, month);
    
    // Get next number for this pattern
    const nextNumber = this.getNextNumber(patternKey);
    
    // Build SKU according to format
    return this.buildSKU(config, categoryCode, year, month, nextNumber);
  }

  /**
   * Generate SKU preview without incrementing counter
   */
  static previewSKU(categoryCode?: string): string {
    const config = this.getConfig();
    
    if (!config.enabled) {
      return 'ITEM-XXXXXX';
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Use a preview number (next available)
    const patternKey = this.createPatternKey(config, categoryCode, year, month);
    const currentCounter = this.getCurrentCounter(patternKey);
    const previewNumber = currentCounter + 1;
    
    return this.buildSKU(config, categoryCode, year, month, previewNumber);
  }

  /**
   * Check if SKU already exists (validation)
   */
  static async validateSKU(sku: string): Promise<boolean> {
    // This would typically check against the database
    // For now, we'll check localStorage for existing products
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      return !products.some((product: any) => product.sku === sku);
    } catch (error) {
      console.error('Error validating SKU:', error);
      return true; // Assume valid if we can't check
    }
  }

  /**
   * Reset counters for a specific period (yearly/monthly)
   */
  static resetCounters(resetType: 'yearly' | 'monthly' = 'yearly'): boolean {
    try {
      const counters = this.getCounters();
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

      // Filter out counters that should be reset
      const filteredCounters: { [key: string]: number } = {};
      
      Object.keys(counters).forEach(key => {
        const shouldReset = resetType === 'yearly' 
          ? !key.includes(currentYear)
          : !key.includes(`${currentYear}-${currentMonth}`);
          
        if (!shouldReset) {
          filteredCounters[key] = counters[key];
        }
      });

      localStorage.setItem(this.COUNTER_KEY, JSON.stringify(filteredCounters));
      return true;
    } catch (error) {
      console.error('Error resetting SKU counters:', error);
      return false;
    }
  }

  /**
   * Get default configuration
   */
  private static getDefaultConfig(): SKUGenerationConfig {
    return {
      enabled: true,
      prefix: 'ITEM',
      categoryPrefix: '',
      includeYear: true,
      includeMonth: false,
      numberLength: 4,
      separator: '-',
      format: '{prefix}{separator}{year}{separator}{number}'
    };
  }

  /**
   * Create a unique pattern key for counter tracking
   */
  private static createPatternKey(
    config: SKUGenerationConfig,
    categoryCode?: string,
    year?: string,
    month?: string
  ): string {
    const parts = [config.prefix];
    
    if (categoryCode && config.categoryPrefix) {
      parts.push(categoryCode);
    }
    
    if (config.includeYear && year) {
      parts.push(year);
    }
    
    if (config.includeMonth && month) {
      parts.push(month);
    }
    
    return parts.join('|');
  }

  /**
   * Build SKU string according to format
   */
  private static buildSKU(
    config: SKUGenerationConfig,
    categoryCode?: string,
    year?: string,
    month?: string,
    number?: number
  ): string {
    let format = config.format;
    
    // Debug logging
    console.log('SKU Generation - Config:', config);
    console.log('SKU Generation - Initial format:', format);
    
    // Replace placeholders with global regex
    format = format.replace(/{prefix}/g, config.prefix);
    format = format.replace(/{separator}/g, config.separator);
    
    console.log('SKU Generation - After separator replacement:', format);
    
    if (categoryCode && config.categoryPrefix) {
      format = format.replace(/{category}/g, categoryCode);
    } else {
      format = format.replace(/{category}/g, '');
      // Clean up double separators
      format = format.replace(new RegExp(`\\${config.separator}\\${config.separator}`, 'g'), config.separator);
    }
    
    if (config.includeYear && year) {
      format = format.replace(/{year}/g, year);
    } else {
      format = format.replace(/{year}/g, '');
    }
    
    if (config.includeMonth && month) {
      format = format.replace(/{month}/g, month);
    } else {
      format = format.replace(/{month}/g, '');
    }
    
    if (number !== undefined) {
      const paddedNumber = number.toString().padStart(config.numberLength, '0');
      format = format.replace(/{number}/g, paddedNumber);
    }
    
    // Clean up any trailing/leading separators
    format = format.replace(new RegExp(`^\\${config.separator}|\\${config.separator}$`, 'g'), '');
    format = format.replace(new RegExp(`\\${config.separator}\\${config.separator}`, 'g'), config.separator);
    
    console.log('SKU Generation - Final result:', format);
    
    return format;
  }

  /**
   * Get counters from storage
   */
  private static getCounters(): { [key: string]: number } {
    try {
      const counters = localStorage.getItem(this.COUNTER_KEY);
      return counters ? JSON.parse(counters) : {};
    } catch (error) {
      console.error('Error getting SKU counters:', error);
      return {};
    }
  }

  /**
   * Get current counter for a pattern
   */
  private static getCurrentCounter(patternKey: string): number {
    const counters = this.getCounters();
    return counters[patternKey] || 0;
  }

  /**
   * Get next number and increment counter
   */
  private static getNextNumber(patternKey: string): number {
    const counters = this.getCounters();
    const currentNumber = counters[patternKey] || 0;
    const nextNumber = currentNumber + 1;
    
    // Update counter
    counters[patternKey] = nextNumber;
    localStorage.setItem(this.COUNTER_KEY, JSON.stringify(counters));
    
    return nextNumber;
  }

  /**
   * Get statistics about SKU generation
   */
  static getStats(): {
    totalGenerated: number;
    currentYear: number;
    currentMonth: number;
    patterns: string[];
  } {
    const counters = this.getCounters();
    const patterns = Object.keys(counters);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const currentYearKey = currentYear.toString();
    const currentMonthKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    const yearTotal = Object.entries(counters)
      .filter(([key]) => key.includes(currentYearKey))
      .reduce((sum, [, count]) => sum + count, 0);
      
    const monthTotal = Object.entries(counters)
      .filter(([key]) => key.includes(currentMonthKey))
      .reduce((sum, [, count]) => sum + count, 0);
    
    const totalGenerated = Object.values(counters).reduce((sum, count) => sum + count, 0);
    
    return {
      totalGenerated,
      currentYear: yearTotal,
      currentMonth: monthTotal,
      patterns
    };
  }
}
