// Local number generation service with localStorage fallback
// This service provides document numbering without requiring Supabase setup

interface LocalNumberSequence {
  sequenceType: 'document' | 'customer' | 'supplier' | 'product' | 'vendor';
  documentType?: string;
  prefix: string;
  currentNumber: number;
  format: string;
  resetAnnually: boolean;
  resetMonthly: boolean;
  fiscalYearStart: string;
  lastUpdate: string;
}

class LocalNumberGenerationService {
  private static readonly STORAGE_KEY = 'printsoft_number_sequences';
  
  // Default sequences configuration
  private static readonly DEFAULT_SEQUENCES: LocalNumberSequence[] = [
    // Document sequences
    {
      sequenceType: 'document',
      documentType: 'purchase-order',
      prefix: 'PO',
      currentNumber: 1000,
      format: 'PO-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'document',
      documentType: 'invoice',
      prefix: 'INV',
      currentNumber: 1000,
      format: 'INV-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'document',
      documentType: 'quote',
      prefix: 'QT',
      currentNumber: 1000,
      format: 'QT-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'document',
      documentType: 'sales-order',
      prefix: 'SO',
      currentNumber: 1000,
      format: 'SO-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'document',
      documentType: 'delivery-note',
      prefix: 'DN',
      currentNumber: 1000,
      format: 'DN-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'document',
      documentType: 'goods-receiving-voucher',
      prefix: 'GRV',
      currentNumber: 1000,
      format: 'GRV-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'document',
      documentType: 'goods-return',
      prefix: 'GR',
      currentNumber: 1000,
      format: 'GR-{YYYY}-{####}',
      resetAnnually: true,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    // Entity sequences
    {
      sequenceType: 'customer',
      prefix: 'CUST',
      currentNumber: 10000,
      format: 'CUST-{#####}',
      resetAnnually: false,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'supplier',
      prefix: 'SUP',
      currentNumber: 10000,
      format: 'SUP-{#####}',
      resetAnnually: false,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'vendor',
      prefix: 'VEN',
      currentNumber: 10000,
      format: 'VEN-{#####}',
      resetAnnually: false,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    },
    {
      sequenceType: 'product',
      prefix: 'PROD',
      currentNumber: 100000,
      format: 'PROD-{######}',
      resetAnnually: false,
      resetMonthly: false,
      fiscalYearStart: '01-01',
      lastUpdate: new Date().toISOString()
    }
  ];

  // Get all sequences from localStorage
  private static getSequences(): LocalNumberSequence[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error reading number sequences from localStorage:', error);
    }
    
    // Initialize with default sequences
    this.saveSequences(this.DEFAULT_SEQUENCES);
    return this.DEFAULT_SEQUENCES;
  }

  // Save sequences to localStorage
  private static saveSequences(sequences: LocalNumberSequence[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sequences));
    } catch (error) {
      console.warn('Error saving number sequences to localStorage:', error);
    }
  }

  // Find sequence by type and document type
  private static findSequence(
    sequenceType: 'document' | 'customer' | 'supplier' | 'product' | 'vendor',
    documentType?: string
  ): LocalNumberSequence | undefined {
    const sequences = this.getSequences();
    return sequences.find(seq => 
      seq.sequenceType === sequenceType && 
      seq.documentType === documentType
    );
  }

  // Check if sequence should reset
  private static shouldResetSequence(sequence: LocalNumberSequence, currentDate: Date): boolean {
    const lastUpdate = new Date(sequence.lastUpdate);
    
    if (sequence.resetAnnually) {
      const fiscalYearStart = sequence.fiscalYearStart || '01-01';
      const [month, day] = fiscalYearStart.split('-').map(Number);
      
      let fiscalYearStartDate = new Date(currentDate.getFullYear(), month - 1, day);
      if (currentDate < fiscalYearStartDate) {
        fiscalYearStartDate = new Date(currentDate.getFullYear() - 1, month - 1, day);
      }
      
      return lastUpdate < fiscalYearStartDate;
    }
    
    if (sequence.resetMonthly) {
      return lastUpdate.getMonth() !== currentDate.getMonth() || 
             lastUpdate.getFullYear() !== currentDate.getFullYear();
    }
    
    return false;
  }

  // Get starting number for reset
  private static getStartingNumber(sequence: LocalNumberSequence): number {
    const format = sequence.format;
    const hashCount = (format.match(/#/g) || []).length;
    return Math.pow(10, hashCount - 1); // e.g., #### = 1000, ##### = 10000
  }

  // Format number according to sequence format
  private static formatNumber(sequence: LocalNumberSequence, number: number, date: Date): string {
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

  // Get next number for a sequence
  static getNextNumber(
    sequenceType: 'document' | 'customer' | 'supplier' | 'product' | 'vendor',
    documentType?: string
  ): string {
    try {
      const sequences = this.getSequences();
      let sequence = this.findSequence(sequenceType, documentType);
      
      if (!sequence) {
        // Create default sequence if not found
        const defaultSeq = this.DEFAULT_SEQUENCES.find(seq => 
          seq.sequenceType === sequenceType && seq.documentType === documentType
        );
        
        if (defaultSeq) {
          sequence = { ...defaultSeq };
          sequences.push(sequence);
        } else {
          // Fallback sequence
          const prefix = documentType ? documentType.toUpperCase().slice(0, 3) : sequenceType.toUpperCase().slice(0, 4);
          return `${prefix}-${Date.now()}`;
        }
      }

      const now = new Date();
      const shouldReset = this.shouldResetSequence(sequence, now);
      
      let nextNumber = sequence.currentNumber + 1;
      if (shouldReset) {
        nextNumber = this.getStartingNumber(sequence);
      }

      // Update the sequence
      sequence.currentNumber = nextNumber;
      sequence.lastUpdate = now.toISOString();

      // Save back to localStorage
      this.saveSequences(sequences);

      // Format and return the number
      return this.formatNumber(sequence, nextNumber, now);
    } catch (error) {
      console.error('Error generating next number:', error);
      // Ultimate fallback
      const prefix = documentType ? documentType.toUpperCase().slice(0, 3) : sequenceType.toUpperCase().slice(0, 4);
      return `${prefix}-${Date.now()}`;
    }
  }

  // Public methods for specific entity types
  static generateCustomerNumber(): string {
    return this.getNextNumber('customer');
  }

  static generateSupplierNumber(): string {
    return this.getNextNumber('supplier');
  }

  static generateVendorNumber(): string {
    return this.getNextNumber('vendor');
  }

  static generateProductCode(): string {
    return this.getNextNumber('product');
  }

  static generateDocumentNumber(documentType: string): string {
    return this.getNextNumber('document', documentType);
  }

  // Get all sequences for admin interface
  static getAllSequences(): LocalNumberSequence[] {
    return this.getSequences();
  }

  // Update sequence configuration
  static updateSequence(
    sequenceType: 'document' | 'customer' | 'supplier' | 'product' | 'vendor',
    documentType: string | undefined,
    updates: Partial<LocalNumberSequence>
  ): void {
    const sequences = this.getSequences();
    const index = sequences.findIndex(seq => 
      seq.sequenceType === sequenceType && seq.documentType === documentType
    );
    
    if (index !== -1) {
      sequences[index] = { ...sequences[index], ...updates };
      this.saveSequences(sequences);
    }
  }

  // Reset all sequences (useful for testing or new setup)
  static resetAllSequences(): void {
    this.saveSequences(this.DEFAULT_SEQUENCES);
  }

  // Export sequences for backup
  static exportSequences(): string {
    return JSON.stringify(this.getSequences(), null, 2);
  }

  // Import sequences from backup
  static importSequences(data: string): void {
    try {
      const sequences = JSON.parse(data) as LocalNumberSequence[];
      this.saveSequences(sequences);
    } catch (error) {
      throw new Error('Invalid sequence data format');
    }
  }
}

export default LocalNumberGenerationService;
