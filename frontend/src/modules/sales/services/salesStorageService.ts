import { Quote, SalesOrder, Invoice, DeliveryNote, CreditNote, Payment, SalesDocumentType, BaseSalesDocument, SalesLead, SalesOpportunity } from '../types/salesTypes';

interface StorageKey {
  [key: string]: string;
}

const STORAGE_KEYS: StorageKey = {
  'quote': 'sales_module_quotes',
  'sales-order': 'sales_module_sales_orders',
  'invoice': 'sales_module_invoices',
  'delivery-note': 'sales_module_delivery_notes',
  'credit-note': 'sales_module_credit_notes',
  'payment': 'sales_module_payments',
  'sales-leads': 'sales_module_leads',
  'sales-opportunities': 'sales_module_opportunities'
};

export class SalesStorageService {
  
  /**
   * Save a sales document to localStorage
   */
  static saveDocument(documentType: SalesDocumentType, document: BaseSalesDocument): boolean {
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
      console.error('Error saving sales document:', error);
      return false;
    }
  }

  /**
   * Get all documents of a specific type
   */
  static getDocuments(documentType: SalesDocumentType): BaseSalesDocument[] {
    try {
      const key = STORAGE_KEYS[documentType];
      if (!key) {
        return [];
      }

      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving sales documents:', error);
      return [];
    }
  }

  /**
   * Get a specific document by ID
   */
  static getDocument(documentType: SalesDocumentType, id: string): BaseSalesDocument | null {
    try {
      const documents = this.getDocuments(documentType);
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Error retrieving sales document:', error);
      return null;
    }
  }

  /**
   * Delete a document
   */
  static deleteDocument(documentType: SalesDocumentType, id: string): boolean {
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
      console.error('Error deleting sales document:', error);
      return false;
    }
  }

  /**
   * Update document status
   */
  static updateDocumentStatus(documentType: SalesDocumentType, id: string, status: string): boolean {
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
      console.error('Error updating sales document status:', error);
      return false;
    }
  }

  /**
   * Get documents by status
   */
  static getDocumentsByStatus(documentType: SalesDocumentType, status: string): BaseSalesDocument[] {
    try {
      const documents = this.getDocuments(documentType);
      return documents.filter(doc => (doc as any).status === status);
    } catch (error) {
      console.error('Error filtering sales documents by status:', error);
      return [];
    }
  }

  /**
   * Search documents
   */
  static searchDocuments(documentType: SalesDocumentType, searchTerm: string): BaseSalesDocument[] {
    try {
      const documents = this.getDocuments(documentType);
      const term = searchTerm.toLowerCase();
      
      return documents.filter(doc => 
        doc.documentNumber.toLowerCase().includes(term) ||
        doc.notes?.toLowerCase().includes(term) ||
        doc.customer?.name?.toLowerCase().includes(term) ||
        doc.customer?.email?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching sales documents:', error);
      return [];
    }
  }

  /**
   * Sales Lead Management
   */
  static saveLeads(leads: SalesLead[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS['sales-leads'], JSON.stringify(leads));
      return true;
    } catch (error) {
      console.error('Error saving sales leads:', error);
      return false;
    }
  }

  static getLeads(): SalesLead[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS['sales-leads']);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving sales leads:', error);
      return [];
    }
  }

  static saveLead(lead: SalesLead): boolean {
    try {
      const leads = this.getLeads();
      const existingIndex = leads.findIndex(l => l.id === lead.id);
      
      if (existingIndex >= 0) {
        leads[existingIndex] = { ...lead, updatedAt: new Date().toISOString() };
      } else {
        leads.push({ ...lead, id: lead.id || this.generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      return this.saveLeads(leads);
    } catch (error) {
      console.error('Error saving sales lead:', error);
      return false;
    }
  }

  static deleteLead(id: string): boolean {
    try {
      const leads = this.getLeads().filter(lead => lead.id !== id);
      return this.saveLeads(leads);
    } catch (error) {
      console.error('Error deleting sales lead:', error);
      return false;
    }
  }

  /**
   * Sales Opportunity Management
   */
  static saveOpportunities(opportunities: SalesOpportunity[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS['sales-opportunities'], JSON.stringify(opportunities));
      return true;
    } catch (error) {
      console.error('Error saving sales opportunities:', error);
      return false;
    }
  }

  static getOpportunities(): SalesOpportunity[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS['sales-opportunities']);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving sales opportunities:', error);
      return [];
    }
  }

  static saveOpportunity(opportunity: SalesOpportunity): boolean {
    try {
      const opportunities = this.getOpportunities();
      const existingIndex = opportunities.findIndex(o => o.id === opportunity.id);
      
      if (existingIndex >= 0) {
        opportunities[existingIndex] = { ...opportunity, updatedAt: new Date().toISOString() };
      } else {
        opportunities.push({ ...opportunity, id: opportunity.id || this.generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      return this.saveOpportunities(opportunities);
    } catch (error) {
      console.error('Error saving sales opportunity:', error);
      return false;
    }
  }

  static deleteOpportunity(id: string): boolean {
    try {
      const opportunities = this.getOpportunities().filter(opp => opp.id !== id);
      return this.saveOpportunities(opportunities);
    } catch (error) {
      console.error('Error deleting sales opportunity:', error);
      return false;
    }
  }

  /**
   * Get documents by customer
   */
  static getDocumentsByCustomer(customerId: string): { [key: string]: BaseSalesDocument[] } {
    const result: { [key: string]: BaseSalesDocument[] } = {};
    
    Object.keys(STORAGE_KEYS).forEach(docType => {
      if (!docType.startsWith('sales-')) {
        const documents = this.getDocuments(docType as SalesDocumentType);
        result[docType] = documents.filter(doc => doc.customer?.id === customerId);
      }
    });
    
    return result;
  }

  /**
   * Get sales analytics data
   */
  static getSalesAnalytics(startDate?: string, endDate?: string): {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    documentCounts: { [key: string]: number };
  } {
    try {
      let totalRevenue = 0;
      let totalOrders = 0;
      const documentCounts: { [key: string]: number } = {};

      Object.entries(STORAGE_KEYS).forEach(([docType, storageKey]) => {
        if (!docType.startsWith('sales-')) {
          const documents = this.getDocuments(docType as SalesDocumentType);
          let filteredDocs = documents;

          // Filter by date range if provided
          if (startDate && endDate) {
            filteredDocs = documents.filter(doc => {
              const docDate = new Date(doc.date);
              return docDate >= new Date(startDate) && docDate <= new Date(endDate);
            });
          }

          documentCounts[docType] = filteredDocs.length;

          // Add to revenue calculation (exclude quotes and delivery notes)
          if (['invoice', 'sales-order'].includes(docType)) {
            totalRevenue += filteredDocs.reduce((sum, doc) => sum + doc.total, 0);
            totalOrders += filteredDocs.length;
          }
        }
      });

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        documentCounts
      };
    } catch (error) {
      console.error('Error calculating sales analytics:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        documentCounts: {}
      };
    }
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export all sales documents (for backup)
   */
  static exportAllDocuments(): object {
    const allData: { [key: string]: any[] } = {};
    
    Object.entries(STORAGE_KEYS).forEach(([docType, storageKey]) => {
      if (docType.startsWith('sales-')) {
        // Handle leads and opportunities separately
        const stored = localStorage.getItem(storageKey);
        allData[docType] = stored ? JSON.parse(stored) : [];
      } else {
        allData[docType] = this.getDocuments(docType as SalesDocumentType);
      }
    });

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      module: 'sales',
      data: allData
    };
  }

  /**
   * Import sales documents (for restore)
   */
  static importDocuments(importData: any): boolean {
    try {
      if (!importData.data || importData.module !== 'sales') {
        throw new Error('Invalid import data for sales module');
      }

      Object.entries(importData.data).forEach(([docType, documents]) => {
        const key = STORAGE_KEYS[docType];
        if (key && Array.isArray(documents)) {
          localStorage.setItem(key, JSON.stringify(documents));
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing sales documents:', error);
      return false;
    }
  }

  /**
   * Clear all sales data (use with caution)
   */
  static clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing sales data:', error);
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
        let count = 0;
        if (docType.startsWith('sales-')) {
          const stored = localStorage.getItem(storageKey);
          const data = stored ? JSON.parse(stored) : [];
          count = data.length;
        } else {
          const documents = this.getDocuments(docType as SalesDocumentType);
          count = documents.length;
        }
        
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
      console.error('Error getting sales storage stats:', error);
      return {
        totalDocuments: 0,
        documentsByType: {},
        storageSize: 0
      };
    }
  }
}
