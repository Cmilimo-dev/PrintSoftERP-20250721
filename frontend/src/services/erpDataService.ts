// Clean ERP data service without business document dependencies
import { 
  ERPCustomer, 
  ERPVendor, 
  ERPDocument, 
  ERPInventoryItem, 
  ERPStockMovement, 
  ERPAccount, 
  ERPTransaction,
  ERPDocumentType 
} from '../types/erpTypes';

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: 'erp_customers',
  VENDORS: 'erp_vendors',
  SALES_ORDERS: 'erp_sales_orders',
  QUOTATIONS: 'erp_quotations',
  INVOICES: 'erp_invoices',
  DELIVERY_NOTES: 'erp_delivery_notes',
  PURCHASE_ORDERS: 'erp_purchase_orders',
  INVENTORY: 'erp_inventory',
  STOCK_MOVEMENTS: 'erp_stock_movements',
  ACCOUNTS: 'erp_accounts',
  TRANSACTIONS: 'erp_transactions',
  COUNTERS: 'erp_counters'
};

// Counter management
interface DocumentCounters {
  [key: string]: {
    current: number;
    format: string;
    resetPeriod: 'never' | 'yearly' | 'monthly';
    lastReset?: string;
  };
}

export class ERPDataService {
  // Utility methods
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Number generation
  private getCounters(): DocumentCounters {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUNTERS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveCounters(counters: DocumentCounters): void {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  }

  generateDocumentNumber(type: ERPDocumentType): string {
    const counters = this.getCounters();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const formats: Record<ERPDocumentType, string> = {
      'sales-order': 'SO-{YYYY}-{####}',
      'quotation': 'QT-{YYYY}-{####}',
      'invoice': 'INV-{YYYY}-{####}',
      'delivery-note': 'DN-{YYYY}-{####}',
      'purchase-order': 'PO-{YYYY}-{####}',
      'payment-receipt': 'PR-{YYYY}-{####}'
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

  private shouldResetCounter(counter: any, now: Date): boolean {
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

  private formatDocumentNumber(format: string, number: number, year: number, month: number): string {
    return format
      .replace('{YYYY}', year.toString())
      .replace('{YY}', year.toString().slice(-2))
      .replace('{MM}', month.toString().padStart(2, '0'))
      .replace('{####}', number.toString().padStart(4, '0'))
      .replace('{###}', number.toString().padStart(3, '0'))
      .replace('{##}', number.toString().padStart(2, '0'));
  }

  // Customer methods
  getCustomers(): ERPCustomer[] {
    return this.getFromStorage<ERPCustomer>(STORAGE_KEYS.CUSTOMERS);
  }

  saveCustomer(customer: ERPCustomer): ERPCustomer {
    const customers = this.getCustomers();
    
    if (!customer.id) {
      customer.id = this.generateId();
      customer.customerNumber = this.generateCustomerNumber();
      customers.push(customer);
    } else {
      const index = customers.findIndex(c => c.id === customer.id);
      if (index >= 0) {
        customers[index] = customer;
      }
    }
    
    this.saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return customer;
  }

  deleteCustomer(id: string): void {
    const customers = this.getCustomers().filter(c => c.id !== id);
    this.saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  private generateCustomerNumber(): string {
    const customers = this.getCustomers();
    const maxNumber = customers.reduce((max, customer) => {
      if (customer.customerNumber?.startsWith('CUST-')) {
        const num = parseInt(customer.customerNumber.split('-')[1]);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    return `CUST-${(maxNumber + 1).toString().padStart(4, '0')}`;
  }

  // Vendor methods
  getVendors(): ERPVendor[] {
    return this.getFromStorage<ERPVendor>(STORAGE_KEYS.VENDORS);
  }

  saveVendor(vendor: ERPVendor): ERPVendor {
    const vendors = this.getVendors();
    
    if (!vendor.id) {
      vendor.id = this.generateId();
      vendor.vendorNumber = this.generateVendorNumber();
      vendors.push(vendor);
    } else {
      const index = vendors.findIndex(v => v.id === vendor.id);
      if (index >= 0) {
        vendors[index] = vendor;
      }
    }
    
    this.saveToStorage(STORAGE_KEYS.VENDORS, vendors);
    return vendor;
  }

  deleteVendor(id: string): void {
    const vendors = this.getVendors().filter(v => v.id !== id);
    this.saveToStorage(STORAGE_KEYS.VENDORS, vendors);
  }

  private generateVendorNumber(): string {
    const vendors = this.getVendors();
    const maxNumber = vendors.reduce((max, vendor) => {
      if (vendor.vendorNumber?.startsWith('VEND-')) {
        const num = parseInt(vendor.vendorNumber.split('-')[1]);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    return `VEND-${(maxNumber + 1).toString().padStart(4, '0')}`;
  }

  // Document methods
  getDocuments(type: ERPDocumentType): ERPDocument[] {
    const storageKey = this.getStorageKeyForDocumentType(type);
    return this.getFromStorage<ERPDocument>(storageKey);
  }

  saveDocument(type: ERPDocumentType, document: ERPDocument): ERPDocument {
    const documents = this.getDocuments(type);
    const storageKey = this.getStorageKeyForDocumentType(type);
    
    if (!document.id) {
      document.id = this.generateId();
      document.documentNumber = this.generateDocumentNumber(type);
      document.createdAt = new Date().toISOString();
      documents.push(document);
    } else {
      const index = documents.findIndex(d => d.id === document.id);
      if (index >= 0) {
        document.updatedAt = new Date().toISOString();
        documents[index] = document;
      }
    }
    
    this.saveToStorage(storageKey, documents);
    return document;
  }

  deleteDocument(type: ERPDocumentType, id: string): void {
    const documents = this.getDocuments(type).filter(d => d.id !== id);
    const storageKey = this.getStorageKeyForDocumentType(type);
    this.saveToStorage(storageKey, documents);
  }

  private getStorageKeyForDocumentType(type: ERPDocumentType): string {
    const keyMap: Record<ERPDocumentType, string> = {
      'sales-order': STORAGE_KEYS.SALES_ORDERS,
      'quotation': STORAGE_KEYS.QUOTATIONS,
      'invoice': STORAGE_KEYS.INVOICES,
      'delivery-note': STORAGE_KEYS.DELIVERY_NOTES,
      'purchase-order': STORAGE_KEYS.PURCHASE_ORDERS,
      'payment-receipt': STORAGE_KEYS.PURCHASE_ORDERS // Reuse for receipts
    };
    return keyMap[type];
  }

  // Inventory methods
  getInventoryItems(): ERPInventoryItem[] {
    return this.getFromStorage<ERPInventoryItem>(STORAGE_KEYS.INVENTORY);
  }

  saveInventoryItem(item: ERPInventoryItem): ERPInventoryItem {
    const items = this.getInventoryItems();
    
    if (!item.id) {
      item.id = this.generateId();
      if (!item.itemCode) {
        item.itemCode = this.generateProductCode();
      }
      items.push(item);
    } else {
      const index = items.findIndex(i => i.id === item.id);
      if (index >= 0) {
        items[index] = item;
      }
    }
    
    this.saveToStorage(STORAGE_KEYS.INVENTORY, items);
    return item;
  }

  deleteInventoryItem(id: string): void {
    const items = this.getInventoryItems().filter(i => i.id !== id);
    this.saveToStorage(STORAGE_KEYS.INVENTORY, items);
  }

  private generateProductCode(): string {
    const items = this.getInventoryItems();
    const maxNumber = items.reduce((max, item) => {
      if (item.itemCode?.startsWith('PROD-')) {
        const num = parseInt(item.itemCode.split('-')[1]);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    return `PROD-${(maxNumber + 1).toString().padStart(4, '0')}`;
  }

  // Stock movement methods
  getStockMovements(): ERPStockMovement[] {
    return this.getFromStorage<ERPStockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS);
  }

  addStockMovement(movement: ERPStockMovement): ERPStockMovement {
    const movements = this.getStockMovements();
    
    if (!movement.id) {
      movement.id = this.generateId();
    }
    
    movements.push(movement);
    this.saveToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
    
    // Update inventory quantities
    this.updateInventoryQuantity(movement);
    
    return movement;
  }

  private updateInventoryQuantity(movement: ERPStockMovement): void {
    const items = this.getInventoryItems();
    const item = items.find(i => i.itemCode === movement.itemCode);
    
    if (item) {
      switch (movement.movementType) {
        case 'in':
          item.currentStock += movement.quantity;
          break;
        case 'out':
          item.currentStock -= movement.quantity;
          break;
        case 'adjustment':
          item.currentStock = movement.quantity;
          break;
      }
      
      this.saveToStorage(STORAGE_KEYS.INVENTORY, items);
    }
  }

  // Account methods
  getAccounts(): ERPAccount[] {
    return this.getFromStorage<ERPAccount>(STORAGE_KEYS.ACCOUNTS);
  }

  saveAccount(account: ERPAccount): ERPAccount {
    const accounts = this.getAccounts();
    
    if (!account.id) {
      account.id = this.generateId();
      accounts.push(account);
    } else {
      const index = accounts.findIndex(a => a.id === account.id);
      if (index >= 0) {
        accounts[index] = account;
      }
    }
    
    this.saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
    return account;
  }

  deleteAccount(id: string): void {
    const accounts = this.getAccounts().filter(a => a.id !== id);
    this.saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  // Transaction methods
  getTransactions(): ERPTransaction[] {
    return this.getFromStorage<ERPTransaction>(STORAGE_KEYS.TRANSACTIONS);
  }

  saveTransaction(transaction: ERPTransaction): ERPTransaction {
    const transactions = this.getTransactions();
    
    if (!transaction.id) {
      transaction.id = this.generateId();
      transactions.push(transaction);
    } else {
      const index = transactions.findIndex(t => t.id === transaction.id);
      if (index >= 0) {
        transactions[index] = transaction;
      }
    }
    
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return transaction;
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // Search and filter methods
  searchCustomers(query: string): ERPCustomer[] {
    const customers = this.getCustomers();
    const searchTerm = query.toLowerCase();
    
    return customers.filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.phone?.includes(query) ||
      customer.customerNumber?.toLowerCase().includes(searchTerm)
    );
  }

  searchVendors(query: string): ERPVendor[] {
    const vendors = this.getVendors();
    const searchTerm = query.toLowerCase();
    
    return vendors.filter(vendor =>
      vendor.name?.toLowerCase().includes(searchTerm) ||
      vendor.email?.toLowerCase().includes(searchTerm) ||
      vendor.phone?.includes(query) ||
      vendor.vendorNumber?.toLowerCase().includes(searchTerm)
    );
  }

  searchInventory(query: string): ERPInventoryItem[] {
    const items = this.getInventoryItems();
    const searchTerm = query.toLowerCase();
    
    return items.filter(item =>
      item.name?.toLowerCase().includes(searchTerm) ||
      item.itemCode?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm)
    );
  }

  // Analytics methods
  getDocumentStats(type: ERPDocumentType) {
    const documents = this.getDocuments(type);
    const total = documents.reduce((sum, doc) => sum + (doc.total || 0), 0);
    
    return {
      count: documents.length,
      total: total,
      average: documents.length > 0 ? total / documents.length : 0
    };
  }

  getInventoryStats() {
    const items = this.getInventoryItems();
    
    return {
      totalItems: items.length,
      lowStock: items.filter(item => item.currentStock <= item.minStock).length,
      outOfStock: items.filter(item => item.currentStock === 0).length,
      totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
    };
  }
}

// Singleton instance
export const erpDataService = new ERPDataService();
