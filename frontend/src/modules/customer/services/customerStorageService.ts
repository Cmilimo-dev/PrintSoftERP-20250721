import { Customer, CustomerCategory, CustomerTag, CustomerCommunication, CustomerDocument, CustomerActivity, CustomerSearchCriteria, CustomerAnalytics, CustomerRelationship, CustomerSegment } from '../types/customerTypes';

interface StorageKey {
  [key: string]: string;
}

const STORAGE_KEYS: StorageKey = {
  'customers': 'customer_module_customers',
  'categories': 'customer_module_categories',
  'tags': 'customer_module_tags',
  'communications': 'customer_module_communications',
  'documents': 'customer_module_documents',
  'activities': 'customer_module_activities',
  'relationships': 'customer_module_relationships',
  'segments': 'customer_module_segments'
};

export class CustomerStorageService {
  
  /**
   * Customer Management
   */
  static saveCustomer(customer: Customer): boolean {
    try {
      const customers = this.getCustomers();
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        // Update existing customer
        customers[existingIndex] = { ...customer, updatedAt: new Date().toISOString() };
      } else {
        // Create new customer
        const newCustomer = { 
          ...customer, 
          id: customer.id || this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        customers.push(newCustomer);
      }

      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
      
      // Log activity
      this.logActivity({
        id: this.generateId(),
        customerId: customer.id,
        type: existingIndex >= 0 ? 'updated' : 'created',
        description: existingIndex >= 0 ? 'Customer information updated' : 'Customer created',
        performedBy: 'system',
        performedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving customer:', error);
      return false;
    }
  }

  static getCustomers(): Customer[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.customers);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving customers:', error);
      return [];
    }
  }

  static getCustomer(id: string): Customer | null {
    try {
      const customers = this.getCustomers();
      return customers.find(customer => customer.id === id) || null;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  }

  static deleteCustomer(id: string): boolean {
    try {
      const customers = this.getCustomers();
      const filteredCustomers = customers.filter(customer => customer.id !== id);
      
      if (filteredCustomers.length === customers.length) {
        return false; // Customer not found
      }

      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(filteredCustomers));
      
      // Log activity
      this.logActivity({
        id: this.generateId(),
        customerId: id,
        type: 'updated',
        description: 'Customer deleted',
        performedBy: 'system',
        performedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }

  static updateCustomerStatus(id: string, status: string): boolean {
    try {
      const customers = this.getCustomers();
      const customerIndex = customers.findIndex(customer => customer.id === id);
      
      if (customerIndex === -1) {
        return false;
      }

      const oldStatus = customers[customerIndex].status;
      customers[customerIndex] = {
        ...customers[customerIndex],
        status: status as any,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
      
      // Log activity
      this.logActivity({
        id: this.generateId(),
        customerId: id,
        type: 'status_changed',
        description: `Customer status changed from ${oldStatus} to ${status}`,
        performedBy: 'system',
        performedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating customer status:', error);
      return false;
    }
  }

  /**
   * Search and Filter
   */
  static searchCustomers(criteria: CustomerSearchCriteria): Customer[] {
    try {
      let customers = this.getCustomers();

      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        customers = customers.filter(customer => 
          customer.displayName.toLowerCase().includes(query) ||
          customer.primaryEmail?.toLowerCase().includes(query) ||
          customer.primaryPhone?.includes(query) ||
          customer.customerNumber.toLowerCase().includes(query) ||
          customer.companyName?.toLowerCase().includes(query) ||
          customer.firstName?.toLowerCase().includes(query) ||
          customer.lastName?.toLowerCase().includes(query)
        );
      }

      if (criteria.customerType) {
        customers = customers.filter(customer => customer.customerType === criteria.customerType);
      }

      if (criteria.status) {
        customers = customers.filter(customer => customer.status === criteria.status);
      }

      if (criteria.categoryId) {
        customers = customers.filter(customer => customer.categoryId === criteria.categoryId);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        customers = customers.filter(customer => 
          criteria.tags!.some(tagId => customer.tags.some(tag => tag.id === tagId))
        );
      }

      if (criteria.city) {
        customers = customers.filter(customer => 
          customer.addresses.some(addr => addr.city.toLowerCase().includes(criteria.city!.toLowerCase()))
        );
      }

      if (criteria.state) {
        customers = customers.filter(customer => 
          customer.addresses.some(addr => addr.state.toLowerCase().includes(criteria.state!.toLowerCase()))
        );
      }

      if (criteria.country) {
        customers = customers.filter(customer => 
          customer.addresses.some(addr => addr.country.toLowerCase().includes(criteria.country!.toLowerCase()))
        );
      }

      if (criteria.creditRating) {
        customers = customers.filter(customer => customer.creditInfo.creditRating === criteria.creditRating);
      }

      if (criteria.createdAfter) {
        customers = customers.filter(customer => 
          new Date(customer.createdAt) >= new Date(criteria.createdAfter!)
        );
      }

      if (criteria.createdBefore) {
        customers = customers.filter(customer => 
          new Date(customer.createdAt) <= new Date(criteria.createdBefore!)
        );
      }

      if (criteria.minLifetimeValue !== undefined) {
        customers = customers.filter(customer => customer.stats.lifetimeValue >= criteria.minLifetimeValue!);
      }

      if (criteria.maxLifetimeValue !== undefined) {
        customers = customers.filter(customer => customer.stats.lifetimeValue <= criteria.maxLifetimeValue!);
      }

      return customers;
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  }

  /**
   * Customer Categories Management
   */
  static saveCategory(category: CustomerCategory): boolean {
    try {
      const categories = this.getCategories();
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push({ ...category, id: category.id || this.generateId() });
      }

      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error saving category:', error);
      return false;
    }
  }

  static getCategories(): CustomerCategory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.categories);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving categories:', error);
      return [];
    }
  }

  static deleteCategory(id: string): boolean {
    try {
      const categories = this.getCategories().filter(category => category.id !== id);
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  /**
   * Customer Tags Management
   */
  static saveTag(tag: CustomerTag): boolean {
    try {
      const tags = this.getTags();
      const existingIndex = tags.findIndex(t => t.id === tag.id);
      
      if (existingIndex >= 0) {
        tags[existingIndex] = tag;
      } else {
        tags.push({ ...tag, id: tag.id || this.generateId() });
      }

      localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
      return true;
    } catch (error) {
      console.error('Error saving tag:', error);
      return false;
    }
  }

  static getTags(): CustomerTag[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.tags);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving tags:', error);
      return [];
    }
  }

  static deleteTag(id: string): boolean {
    try {
      const tags = this.getTags().filter(tag => tag.id !== id);
      localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify(tags));
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  }

  /**
   * Communications Management
   */
  static saveCommunication(communication: CustomerCommunication): boolean {
    try {
      const communications = this.getCommunications();
      const existingIndex = communications.findIndex(c => c.id === communication.id);
      
      if (existingIndex >= 0) {
        communications[existingIndex] = communication;
      } else {
        communications.push({ ...communication, id: communication.id || this.generateId() });
      }

      localStorage.setItem(STORAGE_KEYS.communications, JSON.stringify(communications));
      
      // Log activity
      this.logActivity({
        id: this.generateId(),
        customerId: communication.customerId,
        type: 'communication',
        description: `${communication.type} communication: ${communication.subject}`,
        performedBy: communication.createdBy,
        performedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving communication:', error);
      return false;
    }
  }

  static getCommunications(customerId?: string): CustomerCommunication[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.communications);
      const communications = stored ? JSON.parse(stored) : [];
      
      if (customerId) {
        return communications.filter((comm: CustomerCommunication) => comm.customerId === customerId);
      }
      
      return communications;
    } catch (error) {
      console.error('Error retrieving communications:', error);
      return [];
    }
  }

  /**
   * Document Management
   */
  static saveDocument(document: CustomerDocument): boolean {
    try {
      const documents = this.getDocuments();
      const existingIndex = documents.findIndex(d => d.id === document.id);
      
      if (existingIndex >= 0) {
        documents[existingIndex] = document;
      } else {
        documents.push({ ...document, id: document.id || this.generateId() });
      }

      localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents));
      
      // Log activity
      this.logActivity({
        id: this.generateId(),
        customerId: document.customerId,
        type: 'document_uploaded',
        description: `Document uploaded: ${document.name}`,
        performedBy: document.uploadedBy,
        performedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    }
  }

  static getDocuments(customerId?: string): CustomerDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.documents);
      const documents = stored ? JSON.parse(stored) : [];
      
      if (customerId) {
        return documents.filter((doc: CustomerDocument) => doc.customerId === customerId);
      }
      
      return documents;
    } catch (error) {
      console.error('Error retrieving documents:', error);
      return [];
    }
  }

  /**
   * Activity Log Management
   */
  static logActivity(activity: CustomerActivity): boolean {
    try {
      const activities = this.getActivities();
      activities.push({ ...activity, id: activity.id || this.generateId() });
      
      // Keep only last 1000 activities per customer to prevent storage bloat
      const customerActivities = activities.filter(a => a.customerId === activity.customerId);
      if (customerActivities.length > 1000) {
        const toRemove = customerActivities
          .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime())
          .slice(0, customerActivities.length - 1000);
        
        const filteredActivities = activities.filter(a => 
          !toRemove.some(r => r.id === a.id)
        );
        
        localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(filteredActivities));
      } else {
        localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
      }
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  static getActivities(customerId?: string): CustomerActivity[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.activities);
      const activities = stored ? JSON.parse(stored) : [];
      
      if (customerId) {
        return activities
          .filter((activity: CustomerActivity) => activity.customerId === customerId)
          .sort((a: CustomerActivity, b: CustomerActivity) => 
            new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
          );
      }
      
      return activities.sort((a: CustomerActivity, b: CustomerActivity) => 
        new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
      );
    } catch (error) {
      console.error('Error retrieving activities:', error);
      return [];
    }
  }

  /**
   * Analytics
   */
  static getCustomerAnalytics(): CustomerAnalytics {
    try {
      const customers = this.getCustomers();
      const categories = this.getCategories();
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.status === 'active').length;
      const newCustomersThisMonth = customers.filter(c => 
        new Date(c.createdAt) >= thisMonth
      ).length;

      // Top customers by value
      const topCustomersByValue = customers
        .sort((a, b) => b.stats.lifetimeValue - a.stats.lifetimeValue)
        .slice(0, 10)
        .map(customer => ({
          customer,
          totalValue: customer.stats.lifetimeValue,
          orderCount: customer.stats.totalOrders
        }));

      // Customers by region
      const regionCounts: { [key: string]: number } = {};
      customers.forEach(customer => {
        customer.addresses.forEach(address => {
          const region = `${address.city}, ${address.state}`;
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        });
      });

      const customersByRegion = Object.entries(regionCounts)
        .map(([region, count]) => ({
          region,
          count,
          percentage: (count / totalCustomers) * 100
        }))
        .sort((a, b) => b.count - a.count);

      // Customers by category
      const categoryCounts: { [key: string]: number } = {};
      customers.forEach(customer => {
        const categoryId = customer.categoryId || 'uncategorized';
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });

      const customersByCategory = Object.entries(categoryCounts)
        .map(([categoryId, count]) => {
          const category = categories.find(c => c.id === categoryId) || 
            { id: 'uncategorized', name: 'Uncategorized', description: 'No category assigned' };
          return {
            category,
            count,
            percentage: (count / totalCustomers) * 100
          };
        })
        .sort((a, b) => b.count - a.count);

      const averageCustomerLifetimeValue = totalCustomers > 0 
        ? customers.reduce((sum, c) => sum + c.stats.lifetimeValue, 0) / totalCustomers 
        : 0;

      // Simple retention rate calculation (customers who have made a purchase in the last year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const customersWithRecentOrders = customers.filter(c => 
        c.stats.lastOrderDate && new Date(c.stats.lastOrderDate) >= oneYearAgo
      ).length;
      
      const customerRetentionRate = totalCustomers > 0 
        ? (customersWithRecentOrders / totalCustomers) * 100 
        : 0;

      return {
        totalCustomers,
        activeCustomers,
        newCustomersThisMonth,
        topCustomersByValue,
        customersByRegion,
        customersByCategory,
        averageCustomerLifetimeValue: Math.round(averageCustomerLifetimeValue * 100) / 100,
        customerRetentionRate: Math.round(customerRetentionRate * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating customer analytics:', error);
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomersThisMonth: 0,
        topCustomersByValue: [],
        customersByRegion: [],
        customersByCategory: [],
        averageCustomerLifetimeValue: 0,
        customerRetentionRate: 0
      };
    }
  }

  /**
   * Utility Functions
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export/Import Functions
   */
  static exportAllData(): object {
    const allData: { [key: string]: any[] } = {};
    
    Object.entries(STORAGE_KEYS).forEach(([dataType, storageKey]) => {
      const stored = localStorage.getItem(storageKey);
      allData[dataType] = stored ? JSON.parse(stored) : [];
    });

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      module: 'customer',
      data: allData
    };
  }

  static importData(importData: any): boolean {
    try {
      if (!importData.data || importData.module !== 'customer') {
        throw new Error('Invalid import data for customer module');
      }

      Object.entries(importData.data).forEach(([dataType, data]) => {
        const key = STORAGE_KEYS[dataType];
        if (key && Array.isArray(data)) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing customer data:', error);
      return false;
    }
  }

  static clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing customer data:', error);
      return false;
    }
  }

  static getStorageStats(): {
    totalCustomers: number;
    totalCategories: number;
    totalTags: number;
    totalCommunications: number;
    totalDocuments: number;
    totalActivities: number;
    storageSize: number;
  } {
    try {
      const stats = {
        totalCustomers: this.getCustomers().length,
        totalCategories: this.getCategories().length,
        totalTags: this.getTags().length,
        totalCommunications: this.getCommunications().length,
        totalDocuments: this.getDocuments().length,
        totalActivities: this.getActivities().length,
        storageSize: 0
      };

      Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          stats.storageSize += data.length;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting customer storage stats:', error);
      return {
        totalCustomers: 0,
        totalCategories: 0,
        totalTags: 0,
        totalCommunications: 0,
        totalDocuments: 0,
        totalActivities: 0,
        storageSize: 0
      };
    }
  }
}
