import { BaseDocument, DocumentType } from '@/types/businessDocuments';

interface StorageKey {
  [key: string]: string;
}

const STORAGE_KEYS: StorageKey = {
  'purchase-order': 'business_documents_purchase_orders',
  'invoice': 'business_documents_invoices',
  'quote': 'business_documents_quotes',
  'sales-order': 'business_documents_sales_orders',
  'payment-receipt': 'business_documents_payment_receipts',
  'delivery-note': 'business_documents_delivery_notes',
  'financial-report': 'business_documents_financial_reports',
  'goods-receiving-voucher': 'business_documents_grv',
  'customer-return': 'business_documents_customer_returns',
  'goods-return': 'business_documents_goods_returns',
  'vendor': 'business_documents_vendors'
};

export class DocumentStorageService {
  
  /**
   * Save a document to localStorage
   */
  static saveDocument(documentType: DocumentType, document: BaseDocument): boolean {
    try {
      const key = STORAGE_KEYS[documentType];
      if (!key) {
        throw new Error(`Unknown document type: ${documentType}`);
      }

      const existingDocuments = this.getDocuments(documentType);
      
      // Check if document exists (update) or is new (create)
      const existingIndex = existingDocuments.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        // Update existing document
        existingDocuments[existingIndex] = { ...document, updated_at: new Date().toISOString() };
      } else {
        // Create new document
        const newDocument = { 
          ...document, 
          id: document.id || this.generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        existingDocuments.push(newDocument);
      }

      localStorage.setItem(key, JSON.stringify(existingDocuments));
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    }
  }

  /**
   * Get all documents of a specific type
   */
  static getDocuments(documentType: DocumentType): BaseDocument[] {
    try {
      const key = STORAGE_KEYS[documentType];
      if (!key) {
        return [];
      }

      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving documents:', error);
      return [];
    }
  }

  /**
   * Get a specific document by ID
   */
  static getDocument(documentType: DocumentType, id: string): BaseDocument | null {
    try {
      const documents = this.getDocuments(documentType);
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Error retrieving document:', error);
      return null;
    }
  }

  /**
   * Delete a document
   */
  static deleteDocument(documentType: DocumentType, id: string): boolean {
    try {
      const key = STORAGE_KEYS[documentType];
      if (!key) {
        throw new Error(`Unknown document type: ${documentType}`);
      }

      const existingDocuments = this.getDocuments(documentType);
      const filteredDocuments = existingDocuments.filter(doc => doc.id !== id);
      
      if (filteredDocuments.length === existingDocuments.length) {
        return false; // Document not found
      }

      localStorage.setItem(key, JSON.stringify(filteredDocuments));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Update document status
   */
  static updateDocumentStatus(documentType: DocumentType, id: string, status: string): boolean {
    try {
      const documents = this.getDocuments(documentType);
      const documentIndex = documents.findIndex(doc => doc.id === id);
      
      if (documentIndex === -1) {
        return false;
      }

      documents[documentIndex] = {
        ...documents[documentIndex],
        status: status as any,
        updated_at: new Date().toISOString()
      };

      const key = STORAGE_KEYS[documentType];
      localStorage.setItem(key, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error('Error updating document status:', error);
      return false;
    }
  }

  /**
   * Get documents by status
   */
  static getDocumentsByStatus(documentType: DocumentType, status: string): BaseDocument[] {
    try {
      const documents = this.getDocuments(documentType);
      return documents.filter(doc => (doc as any).status === status);
    } catch (error) {
      console.error('Error filtering documents by status:', error);
      return [];
    }
  }

  /**
   * Search documents
   */
  static searchDocuments(documentType: DocumentType, searchTerm: string): BaseDocument[] {
    try {
      const documents = this.getDocuments(documentType);
      const term = searchTerm.toLowerCase();
      
      return documents.filter(doc => 
        doc.documentNumber.toLowerCase().includes(term) ||
        doc.notes?.toLowerCase().includes(term) ||
        (doc as any).vendor?.name?.toLowerCase().includes(term) ||
        (doc as any).customer?.name?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export all documents (for backup)
   */
  static exportAllDocuments(): object {
    const allData: { [key: string]: BaseDocument[] } = {};
    
    Object.entries(STORAGE_KEYS).forEach(([docType, storageKey]) => {
      allData[docType] = this.getDocuments(docType as DocumentType);
    });

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: allData
    };
  }

  /**
   * Import documents (for restore)
   */
  static importDocuments(importData: any): boolean {
    try {
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }

      Object.entries(importData.data).forEach(([docType, documents]) => {
        const key = STORAGE_KEYS[docType as DocumentType];
        if (key && Array.isArray(documents)) {
          localStorage.setItem(key, JSON.stringify(documents));
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing documents:', error);
      return false;
    }
  }

  /**
   * Clear all documents (use with caution)
   */
  static clearAllDocuments(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get storage statistics
   */
  static getStorageStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    Object.entries(STORAGE_KEYS).forEach(([docType, storageKey]) => {
      stats[docType] = this.getDocuments(docType as DocumentType).length;
    });

    return stats;
  }
}
