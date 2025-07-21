// Pagination Service for Financial Data
// Provides efficient pagination and search functionality while preserving original data access patterns

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  performance: {
    queryTime: number;
    fromCache: boolean;
  };
}

export interface SearchIndex {
  id: string;
  searchableText: string;
  originalData: any;
  lastUpdated: number;
}

export class PaginationService {
  private static searchIndexes: Map<string, SearchIndex[]> = new Map();
  private static cacheStore: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private static readonly DEFAULT_PAGE_SIZE = 20;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly SEARCH_DEBOUNCE_TIME = 300; // 300ms

  // =================
  // PAGINATION CORE
  // =================

  static paginate<T>(
    data: T[],
    params: Partial<PaginationParams> = {}
  ): PaginationResult<T> {
    const startTime = Date.now();
    
    const {
      page = 1,
      pageSize = this.DEFAULT_PAGE_SIZE,
      sortBy,
      sortOrder = 'asc',
      search,
      filters = {}
    } = params;

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.min(Math.max(1, pageSize), 100); // Cap at 100 items per page

    let processedData = [...data];

    // Apply search filter
    if (search && search.trim()) {
      processedData = this.applySearch(processedData, search.trim().toLowerCase());
    }

    // Apply additional filters
    processedData = this.applyFilters(processedData, filters);

    // Apply sorting
    if (sortBy) {
      processedData = this.applySorting(processedData, sortBy, sortOrder);
    }

    // Calculate pagination
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / validatedPageSize);
    const startIndex = (validatedPage - 1) * validatedPageSize;
    const endIndex = Math.min(startIndex + validatedPageSize, totalItems);
    
    // Extract page data
    const pageData = processedData.slice(startIndex, endIndex);

    const queryTime = Date.now() - startTime;

    return {
      data: pageData,
      pagination: {
        currentPage: validatedPage,
        pageSize: validatedPageSize,
        totalItems,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
        startIndex: startIndex + 1, // 1-based index for display
        endIndex: endIndex
      },
      performance: {
        queryTime,
        fromCache: false
      }
    };
  }

  // =================
  // SEARCH FUNCTIONALITY
  // =================

  static buildSearchIndex<T>(data: T[], indexKey: string, getSearchableText: (item: T) => string): void {
    const searchIndex: SearchIndex[] = data.map(item => ({
      id: (item as any).id || Math.random().toString(36),
      searchableText: getSearchableText(item).toLowerCase(),
      originalData: item,
      lastUpdated: Date.now()
    }));

    this.searchIndexes.set(indexKey, searchIndex);
  }

  static updateSearchIndex<T>(indexKey: string, item: T, getSearchableText: (item: T) => string): void {
    const index = this.searchIndexes.get(indexKey);
    if (!index) return;

    const itemId = (item as any).id;
    const existingIndex = index.findIndex(entry => entry.id === itemId);
    
    const searchEntry: SearchIndex = {
      id: itemId,
      searchableText: getSearchableText(item).toLowerCase(),
      originalData: item,
      lastUpdated: Date.now()
    };

    if (existingIndex >= 0) {
      index[existingIndex] = searchEntry;
    } else {
      index.push(searchEntry);
    }
  }

  static removeFromSearchIndex(indexKey: string, itemId: string): void {
    const index = this.searchIndexes.get(indexKey);
    if (!index) return;

    const itemIndex = index.findIndex(entry => entry.id === itemId);
    if (itemIndex >= 0) {
      index.splice(itemIndex, 1);
    }
  }

  private static applySearch<T>(data: T[], searchTerm: string): T[] {
    if (!searchTerm) return data;

    return data.filter(item => {
      // Generic search across common fields
      const searchableFields = [
        'accountNumber', 'accountName', 'description', 'name', 'title',
        'paymentNumber', 'entryNumber', 'invoiceNumber', 'billNumber',
        'reference', 'notes', 'memo', 'customerName', 'vendorName'
      ];

      return searchableFields.some(field => {
        const value = (item as any)[field];
        return value && value.toString().toLowerCase().includes(searchTerm);
      });
    });
  }

  // =================
  // FILTERING
  // =================

  private static applyFilters<T>(data: T[], filters: Record<string, any>): T[] {
    if (!filters || Object.keys(filters).length === 0) return data;

    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;

        const itemValue = (item as any)[key];
        
        // Handle different filter types
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          const numValue = parseFloat(itemValue);
          return numValue >= value.min && numValue <= value.max;
        }
        
        if (typeof value === 'string' && value.includes('*')) {
          const regex = new RegExp(value.replace(/\*/g, '.*'), 'i');
          return regex.test(itemValue?.toString() || '');
        }

        return itemValue === value;
      });
    });
  }

  // =================
  // SORTING
  // =================

  private static applySorting<T>(data: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] {
    return data.sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);

      let comparison = 0;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        // String comparison
        const aStr = (aValue || '').toString().toLowerCase();
        const bStr = (bValue || '').toString().toLowerCase();
        comparison = aStr.localeCompare(bStr);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // =================
  // CACHING
  // =================

  static setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cacheStore.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static getCache(key: string): any | null {
    const cached = this.cacheStore.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cacheStore.delete(key);
      return null;
    }

    return cached.data;
  }

  static invalidateCache(keyPattern?: string): void {
    if (!keyPattern) {
      this.cacheStore.clear();
      return;
    }

    const keysToDelete = Array.from(this.cacheStore.keys()).filter(key => 
      key.includes(keyPattern)
    );
    
    keysToDelete.forEach(key => this.cacheStore.delete(key));
  }

  // =================
  // PAGINATION HELPERS
  // =================

  static getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  static calculateOffset(page: number, pageSize: number): number {
    return (Math.max(1, page) - 1) * pageSize;
  }

  static calculatePageFromOffset(offset: number, pageSize: number): number {
    return Math.floor(offset / pageSize) + 1;
  }

  // =================
  // PERFORMANCE MONITORING
  // =================

  static getPerformanceMetrics(): {
    cacheSize: number;
    searchIndexSize: number;
    cacheHitRate: number;
    averageQueryTime: number;
  } {
    return {
      cacheSize: this.cacheStore.size,
      searchIndexSize: Array.from(this.searchIndexes.values()).reduce((sum, index) => sum + index.length, 0),
      cacheHitRate: 0, // Would need to track hits/misses
      averageQueryTime: 0 // Would need to track query times
    };
  }

  // =================
  // NEW PERFORMANCE METHODS
  // =================

  private static cacheHits = 0;
  private static cacheMisses = 0;
  private static queryTimes: number[] = [];

  static getFromCache(key: string): any | null {
    const result = this.getCache(key);
    if (result) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    return result;
  }

  static saveToCache(key: string, data: any, ttl?: number): void {
    this.setCache(key, data, ttl);
  }

  static getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;
    const avgQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length 
      : 0;
    
    return {
      hitRate,
      avgQueryTime,
      totalSize: this.cacheStore.size,
      totalRequests,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses
    };
  }

  static addQueryTime(time: number): void {
    this.queryTimes.push(time);
    // Keep only last 100 query times for rolling average
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }
  }


  static async preloadCache(tableName: string): Promise<void> {
    // This would be implemented to preload frequently accessed data
    console.log(`Preloading cache for ${tableName}`);
  }

  static cleanupExpiredCache(): void {
    this.cleanup();
  }

  // =================
  // CLEANUP
  // =================

  static cleanup(): void {
    // Clean expired cache entries
    const now = Date.now();
    Array.from(this.cacheStore.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > value.ttl) {
        this.cacheStore.delete(key);
      }
    });

    // Clean old search index entries
    this.searchIndexes.forEach((index, key) => {
      const oneHourAgo = now - (60 * 60 * 1000);
      const filteredIndex = index.filter(entry => entry.lastUpdated > oneHourAgo);
      if (filteredIndex.length !== index.length) {
        this.searchIndexes.set(key, filteredIndex);
      }
    });
  }
}

// Auto-cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => PaginationService.cleanup(), 10 * 60 * 1000);
}
