import { PurchasingDocumentType } from '../types/purchasingTypes';

// Counter management
interface DocumentCounters {
  [key: string]: {
    current: number;
    format: string;
    resetPeriod: 'never' | 'yearly' | 'monthly';
    lastReset?: string;
  };
}

const PURCHASING_COUNTERS_KEY = 'purchasing_module_counters';

export class PurchasingNumberService {
  // Utility methods
  private static getCounters(): DocumentCounters {
    try {
      const data = localStorage.getItem(PURCHASING_COUNTERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveCounters(counters: DocumentCounters): void {
    localStorage.setItem(PURCHASING_COUNTERS_KEY, JSON.stringify(counters));
  }

  static generateDocumentNumber(type: PurchasingDocumentType): string {
    const counters = this.getCounters();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const formats: Record<PurchasingDocumentType, string> = {
      'purchase-order': 'PO-{YYYY}-{####}',
      'goods-receiving-voucher': 'GRV-{YYYY}-{####}'
    };

    if (!counters[type]) {
      counters[type] = {
        current: 0,
        format: formats[type],
        resetPeriod: 'yearly'
      };
    }

    const counter = counters[type];
    const shouldReset = this.shouldResetCounter(counter, now);
    
    if (shouldReset) {
      counter.current = 0;
      counter.lastReset = now.toISOString();
    }

    counter.current++;
    this.saveCounters(counters);

    return this.formatDocumentNumber(counter.format, counter.current, year, month);
  }

  private static shouldResetCounter(counter: any, now: Date): boolean {
    if (!counter.lastReset) return false;
    
    const lastReset = new Date(counter.lastReset);
    
    if (counter.resetPeriod === 'yearly') {
      return now.getFullYear() > lastReset.getFullYear();
    } else if (counter.resetPeriod === 'monthly') {
      return now.getFullYear() > lastReset.getFullYear() || 
             (now.getFullYear() === lastReset.getFullYear() && now.getMonth() > lastReset.getMonth());
    }
    
    return false;
  }

  private static formatDocumentNumber(format: string, number: number, year: number, month: number): string {
    return format
      .replace('{YYYY}', year.toString())
      .replace('{YY}', year.toString().slice(-2))
      .replace('{MM}', month.toString().padStart(2, '0'))
      .replace('{####}', number.toString().padStart(4, '0'))
      .replace('{###}', number.toString().padStart(3, '0'))
      .replace('{##}', number.toString().padStart(2, '0'));
  }

  // Vendor number generation
  static generateVendorNumber(): string {
    const counters = this.getCounters();
    const vendorKey = 'vendor';
    
    if (!counters[vendorKey]) {
      counters[vendorKey] = {
        current: 0,
        format: 'VEND-{####}',
        resetPeriod: 'never'
      };
    }

    counters[vendorKey].current++;
    this.saveCounters(counters);

    return `VEND-${counters[vendorKey].current.toString().padStart(4, '0')}`;
  }

  // Custom format configuration
  static updateDocumentFormat(type: PurchasingDocumentType, format: string, resetPeriod: 'never' | 'yearly' | 'monthly' = 'yearly'): boolean {
    try {
      const counters = this.getCounters();
      
      if (!counters[type]) {
        counters[type] = {
          current: 0,
          format: format,
          resetPeriod: resetPeriod
        };
      } else {
        counters[type].format = format;
        counters[type].resetPeriod = resetPeriod;
      }
      
      this.saveCounters(counters);
      return true;
    } catch (error) {
      console.error('Error updating document format:', error);
      return false;
    }
  }

  // Get current counter value
  static getCurrentCounter(type: PurchasingDocumentType | 'vendor'): number {
    const counters = this.getCounters();
    return counters[type]?.current || 0;
  }

  // Reset counter
  static resetCounter(type: PurchasingDocumentType | 'vendor'): boolean {
    try {
      const counters = this.getCounters();
      if (counters[type]) {
        counters[type].current = 0;
        counters[type].lastReset = new Date().toISOString();
        this.saveCounters(counters);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resetting counter:', error);
      return false;
    }
  }

  // Set counter value
  static setCounter(type: PurchasingDocumentType | 'vendor', value: number): boolean {
    try {
      const counters = this.getCounters();
      if (!counters[type]) {
        counters[type] = {
          current: value,
          format: type === 'vendor' ? 'VEND-{####}' : `${type.toUpperCase()}-{YYYY}-{####}`,
          resetPeriod: type === 'vendor' ? 'never' : 'yearly'
        };
      } else {
        counters[type].current = value;
      }
      this.saveCounters(counters);
      return true;
    } catch (error) {
      console.error('Error setting counter:', error);
      return false;
    }
  }

  // Get all counters info
  static getAllCounters(): DocumentCounters {
    return this.getCounters();
  }

  // Clear all counters (use with caution)
  static clearAllCounters(): boolean {
    try {
      localStorage.removeItem(PURCHASING_COUNTERS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing purchasing counters:', error);
      return false;
    }
  }
}
