import { apiClient } from '@/lib/api-client';

export interface NumberSequence {
  id: string;
  sequence_type: 'document' | 'customer' | 'supplier' | 'product' | 'vendor';
  document_type?: string; // For documents: purchase-order, invoice, quote, etc.
  prefix: string;
  current_number: number;
  format: string; // e.g., "PO-{YYYY}-{####}", "CUST-{####}", "PROD-{#####}"
  reset_annually: boolean;
  reset_monthly: boolean;
  fiscal_year_start?: string; // MM-DD format
  created_at: string;
  updated_at: string;
}

class NumberGenerationService {
  private static cache: Map<string, NumberSequence> = new Map();

  // Initialize default sequences - handled by backend
  static async initializeDefaultSequences() {
    console.log('Number sequences are now managed by the backend SQLite database');
  }

  // Get next number for a sequence - Uses local SQLite backend
  static async getNextNumber(
    sequenceType: 'document' | 'customer' | 'supplier' | 'product' | 'vendor' | 'lead',
    documentType?: string
  ): Promise<string> {
    try {
      // Map frontend document types to backend document types
      const backendDocumentType = documentType ? this.mapDocumentType(documentType) : (
        sequenceType === 'document' ? 'sales_order' : // Default to sales_order for documents
        sequenceType === 'customer' ? 'sales_order' : // Customers don't have their own numbering in backend
        sequenceType === 'supplier' ? 'vendor' :
        sequenceType === 'product' ? 'sales_order' : // Products don't have their own numbering in backend
        sequenceType === 'vendor' ? 'vendor' :
        sequenceType === 'lead' ? 'quotation' : 'sales_order' // Default fallback
      );
      
      // Call the backend number generation API
      const generatedNumber = await apiClient.generateNumber(backendDocumentType);
      return generatedNumber;
    } catch (error) {
      console.error('Error generating number from backend:', error);
      // Fallback to local generation
      return this.getFallbackNumber(sequenceType, documentType);
    }
  }

  // Map frontend document types to backend document types
  // Backend available types: customer_return, purchase_order, vendor, goods_receiving, sales_order, 
  // quotation, invoice, receipt, payment_receipt, delivery_note, credit_note, debit_note, 
  // purchase_return, stock_adjustment, stock_transfer, work_order, service_order, expense_claim, 
  // petty_cash, journal_entry
  private static mapDocumentType(frontendType: string): string {
    const mapping: Record<string, string> = {
      'purchase-order': 'purchase_order',
      'sales-order': 'sales_order',
      'invoice': 'invoice',
      'quote': 'quotation',
      'quotation': 'quotation',
      'delivery-note': 'delivery_note',
      'goods-receiving-voucher': 'goods_receiving',
      'goods-return': 'purchase_return',
      'customer-return': 'customer_return',
      'payment-receipt': 'payment_receipt',
      'receipt': 'receipt',
      'financial-report': 'invoice', // fallback
      'credit-note': 'credit_note',
      'debit-note': 'debit_note',
      'payment': 'payment_receipt',
      'stock-adjustment': 'stock_adjustment',
      'stock-transfer': 'stock_transfer',
      'work-order': 'work_order',
      'service-order': 'service_order',
      'expense-claim': 'expense_claim',
      'petty-cash': 'petty_cash',
      'journal-entry': 'journal_entry',
      // For entity types, use appropriate document types
      'customer': 'sales_order', // Use sales_order for customer numbering
      'vendor': 'vendor',
      'product': 'sales_order', // Use sales_order for product numbering
      'lead': 'quotation' // Use quotation for lead numbering
    };
    
    return mapping[frontendType] || 'sales_order'; // Default fallback
  }

  // Check if sequence should reset
  private static shouldResetSequence(sequence: NumberSequence, currentDate: Date): boolean {
    const lastUpdate = new Date(sequence.updated_at);
    
    if (sequence.reset_annually) {
      const fiscalYearStart = sequence.fiscal_year_start || '01-01';
      const [month, day] = fiscalYearStart.split('-').map(Number);
      
      let fiscalYearStartDate = new Date(currentDate.getFullYear(), month - 1, day);
      if (currentDate < fiscalYearStartDate) {
        fiscalYearStartDate = new Date(currentDate.getFullYear() - 1, month - 1, day);
      }
      
      return lastUpdate < fiscalYearStartDate;
    }
    
    if (sequence.reset_monthly) {
      return lastUpdate.getMonth() !== currentDate.getMonth() || 
             lastUpdate.getFullYear() !== currentDate.getFullYear();
    }
    
    return false;
  }

  // Get starting number for reset
  private static getStartingNumber(sequence: NumberSequence): number {
    const format = sequence.format;
    const hashCount = (format.match(/#/g) || []).length;
    return Math.pow(10, hashCount - 1); // e.g., #### = 1000, ##### = 10000
  }

  // Format number according to sequence format
  private static formatNumber(sequence: NumberSequence, number: number, date: Date): string {
    let formatted = sequence.format;
    
    // Replace date placeholders
    formatted = formatted.replace(/\{YYYY\}/g, date.getFullYear().toString());
    formatted = formatted.replace(/\{YY\}/g, date.getFullYear().toString().slice(-2));
    formatted = formatted.replace(/\{MM\}/g, (date.getMonth() + 1).toString().padStart(2, '0'));
    formatted = formatted.replace(/\{DD\}/g, date.getDate().toString().padStart(2, '0'));
    
    // Replace number placeholders
    const hashMatch = formatted.match(/\{(#+)\}/);
    if (hashMatch) {
      const hashCount = hashMatch[1].length;
      const paddedNumber = number.toString().padStart(hashCount, '0');
      formatted = formatted.replace(/\{#+\}/, paddedNumber);
    }
    
    return formatted;
  }

  // Fallback number generation with professional formatting
  private static getFallbackNumber(
    sequenceType: 'document' | 'customer' | 'supplier' | 'product' | 'vendor' | 'lead',
    documentType?: string
  ): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    // Generate a 4-digit sequence based on time
    const timeSequence = (hour + minute).padStart(4, '0');
    
    if (documentType) {
      // Document-specific prefixes
      const prefixMap: Record<string, string> = {
        'purchase-order': 'PO',
        'sales-order': 'SO',
        'invoice': 'INV',
        'quote': 'QT',
        'delivery-note': 'DN',
        'goods-receiving-voucher': 'GRV',
        'goods-return': 'GR'
      };
      
      const prefix = prefixMap[documentType] || documentType.toUpperCase().slice(0, 3);
      return `${prefix}-${year}-${timeSequence}`;
    } else {
      // Entity-specific prefixes
      const prefixMap: Record<string, string> = {
        'customer': 'CUST',
        'supplier': 'SUP',
        'vendor': 'VEN',
        'product': 'PROD',
        'lead': 'LEAD'
      };
      
      const prefix = prefixMap[sequenceType] || sequenceType.toUpperCase().slice(0, 4);
      return `${prefix}-${timeSequence}`;
    }
  }

  // Update sequence configuration - handled by backend
  static async updateSequence(
    sequenceId: string,
    updates: Partial<Omit<NumberSequence, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    console.log('Sequence updates are now managed by the backend');
  }

  // Get all sequences - handled by backend
  static async getAllSequences(): Promise<NumberSequence[]> {
    console.log('Sequences are now managed by the backend');
    return [];
  }

  // Generate customer number
  static async generateCustomerNumber(): Promise<string> {
    return this.getNextNumber('customer');
  }

  // Generate supplier number
  static async generateSupplierNumber(): Promise<string> {
    return this.getNextNumber('supplier');
  }

  // Generate vendor number
  static async generateVendorNumber(): Promise<string> {
    return this.getNextNumber('vendor');
  }

  // Generate product code
  static async generateProductCode(): Promise<string> {
    return this.getNextNumber('product');
  }

  // Generate lead number
  static async generateLeadNumber(): Promise<string> {
    return this.getNextNumber('lead');
  }

  // Generate document number
  static async generateDocumentNumber(documentType: string): Promise<string> {
    return this.getNextNumber('document', documentType);
  }
}

export default NumberGenerationService;
