// Fallback numbering service using localStorage when database is unavailable
export class FallbackNumberingService {
  private static getStorageKey(entityType: string): string {
    return `fallback_number_${entityType}`;
  }

  private static getNextNumber(entityType: string, prefix: string): string {
    const storageKey = this.getStorageKey(entityType);
    const currentNumber = parseInt(localStorage.getItem(storageKey) || '10000', 10);
    const nextNumber = currentNumber + 1;
    
    localStorage.setItem(storageKey, nextNumber.toString());
    
    return `${prefix}-${nextNumber.toString().padStart(5, '0')}`;
  }

  static generateCustomerNumber(): string {
    return this.getNextNumber('customer', 'CUST');
  }

  static generateVendorNumber(): string {
    return this.getNextNumber('vendor', 'VEN');
  }

  static generateSupplierNumber(): string {
    return this.getNextNumber('supplier', 'SUP');
  }

  static generateProductCode(): string {
    return this.getNextNumber('product', 'PROD');
  }

  static generateLeadNumber(): string {
    return this.getNextNumber('lead', 'LEAD');
  }
}
