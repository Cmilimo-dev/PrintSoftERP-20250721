import { PurchaseOrder, GoodsReceivingVoucher, PurchasingDocumentType, BasePurchasingDocument } from '../types/purchasingTypes';

interface StorageKey {
  [key: string]: string;
}

const STORAGE_KEYS: StorageKey = {
  'purchase-order': 'purchasing_module_purchase_orders',
  'goods-receiving-voucher': 'purchasing_module_grv'
};

export class PurchasingStorageService {
  
  /**
   * Save a purchasing document to localStorage
   */
  static saveDocument(documentType: PurchasingDocumentType, document: BasePurchasingDocument): boolean {
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
      console.error('Error saving purchasing document:', error);
      return false;
    }
  }

  /**
   * Get all documents of a specific type
   */
  static getDocuments(documentType: PurchasingDocumentType): BasePurchasingDocument[] {
    try {
      const key = STORAGE_KEYS[documentType];
      if (!key) {
        return [];
      }

      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving purchasing documents:', error);
      return [];
    }
  }

  /**
   * Get a specific document by ID
   */
  static getDocument(documentType: PurchasingDocumentType, id: string): BasePurchasingDocument | null {
    try {
      const documents = this.getDocuments(documentType);
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Error retrieving purchasing document:', error);
      return null;
    }
  }

  /**
   * Delete a document
   */
  static deleteDocument(documentType: PurchasingDocumentType, id: string): boolean {
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
      console.error('Error deleting purchasing document:', error);
      return false;
    }
  }

  /**
   * Update document status
   */
  static updateDocumentStatus(documentType: PurchasingDocumentType, id: string, status: string): boolean {
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
      console.error('Error updating purchasing document status:', error);
      return false;
    }
  }

  /**
   * Get documents by status
   */
  static getDocumentsByStatus(documentType: PurchasingDocumentType, status: string): BasePurchasingDocument[] {
    try {
      const documents = this.getDocuments(documentType);
      return documents.filter(doc => (doc as any).status === status);
    } catch (error) {
      console.error('Error filtering purchasing documents by status:', error);
      return [];
    }
  }

  /**
   * Search documents
   */
  static searchDocuments(documentType: PurchasingDocumentType, searchTerm: string): BasePurchasingDocument[] {
    try {
      const documents = this.getDocuments(documentType);
      const term = searchTerm.toLowerCase();
      
      return documents.filter(doc => 
        doc.documentNumber.toLowerCase().includes(term) ||
        doc.notes?.toLowerCase().includes(term) ||
        (doc as any).vendor?.name?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching purchasing documents:', error);
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
   * Export all purchasing documents (for backup)
   */
  static exportAllDocuments(): object {
    const allData: { [key: string]: BasePurchasingDocument[] } = {};
    
    Object.entries(STORAGE_KEYS).forEach(([docType, storageKey]) => {
      allData[docType] = this.getDocuments(docType as PurchasingDocumentType);
    });

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      module: 'purchasing',
      data: allData
    };
  }

  /**
   * Import purchasing documents (for restore)
   */
  static importDocuments(importData: any): boolean {
    try {
      if (!importData.data || importData.module !== 'purchasing') {
        throw new Error('Invalid import data for purchasing module');
      }

      Object.entries(importData.data).forEach(([docType, documents]) => {
        const key = STORAGE_KEYS[docType];
        if (key && Array.isArray(documents)) {
          localStorage.setItem(key, JSON.stringify(documents));
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing purchasing documents:', error);
      return false;
    }
  }

  /**
   * Clear all purchasing data (use with caution)
   */
  static clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing purchasing data:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    totalDocuments: number;
    documentsByType: { [key: string]: number };
    storageSize: number;
  } {
    try {
      let totalDocuments = 0;
      const documentsByType: { [key: string]: number } = {};
      let storageSize = 0;

      Object.entries(STORAGE_KEYS).forEach(([docType, storageKey]) => {
        const documents = this.getDocuments(docType as PurchasingDocumentType);
        const count = documents.length;
        
        totalDocuments += count;
        documentsByType[docType] = count;
        
        const storageData = localStorage.getItem(storageKey);
        if (storageData) {
          storageSize += storageData.length;
        }
      });

      return {
        totalDocuments,
        documentsByType,
        storageSize
      };
    } catch (error) {
      console.error('Error getting purchasing storage stats:', error);
      return {
        totalDocuments: 0,
        documentsByType: {},
        storageSize: 0
      };
    }
  }
}
