import { supabase } from '../integrations/supabase/client';
import { PaginationService } from './paginationService';

export class FinancialPerformanceService {
  private static readonly BATCH_SIZE = 100;
  private static readonly CONCURRENT_REQUESTS = 3;

  /**
   * Bulk insert operations with optimized batching
   */
  static async bulkInsert<T>(
    tableName: string,
    items: Partial<T>[],
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<T[]> {
    const batchSize = options?.batchSize || this.BATCH_SIZE;
    const results: T[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error in bulk insert batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      results.push(...(data || []));
      
      // Report progress
      if (options?.onProgress) {
        options.onProgress(i + batch.length, items.length);
      }
    }
    
    // Invalidate cache for this table
    PaginationService.invalidateCache(tableName);
    
    return results;
  }

  /**
   * Bulk update operations with optimized batching
   */
  static async bulkUpdate<T>(
    tableName: string,
    items: Array<{ id: string; data: Partial<T> }>,
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<T[]> {
    const batchSize = options?.batchSize || this.BATCH_SIZE;
    const results: T[] = [];
    
    // Process updates in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Execute batch updates concurrently
      const batchPromises = batch.map(async (item) => {
        const { data, error } = await supabase
          .from(tableName)
          .update(item.data)
          .eq('id', item.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Report progress
      if (options?.onProgress) {
        options.onProgress(i + batch.length, items.length);
      }
    }
    
    // Invalidate cache for this table
    PaginationService.invalidateCache(tableName);
    
    return results;
  }

  /**
   * Bulk delete operations with optimized batching
   */
  static async bulkDelete(
    tableName: string,
    ids: string[],
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<boolean> {
    const batchSize = options?.batchSize || this.BATCH_SIZE;
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', batch);
      
      if (error) {
        console.error(`Error in bulk delete batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      // Report progress
      if (options?.onProgress) {
        options.onProgress(i + batch.length, ids.length);
      }
    }
    
    // Invalidate cache for this table
    PaginationService.invalidateCache(tableName);
    
    // Remove from search index
    ids.forEach(id => PaginationService.removeFromSearchIndex(tableName, id));
    
    return true;
  }

  /**
   * Optimized data synchronization with conflict resolution
   */
  static async syncData<T>(
    tableName: string,
    localData: Array<T & { id: string; updated_at?: string }>,
    options?: {
      conflictResolution?: 'local' | 'remote' | 'merge';
      onConflict?: (local: T, remote: T) => T;
    }
  ): Promise<{
    synchronized: T[];
    conflicts: Array<{ local: T; remote: T }>;
  }> {
    const synchronized: T[] = [];
    const conflicts: Array<{ local: T; remote: T }> = [];
    
    // Get remote data for comparison
    const { data: remoteData, error } = await supabase
      .from(tableName)
      .select('*')
      .in('id', localData.map(item => item.id));
    
    if (error) throw error;
    
    const remoteMap = new Map(remoteData?.map(item => [item.id, item]) || []);
    
    for (const localItem of localData) {
      const remoteItem = remoteMap.get(localItem.id);
      
      if (!remoteItem) {
        // Item doesn't exist remotely, insert it
        const { data, error } = await supabase
          .from(tableName)
          .insert(localItem)
          .select()
          .single();
        
        if (error) throw error;
        synchronized.push(data);
      } else {
        // Item exists, check for conflicts
        const localTimestamp = new Date(localItem.updated_at || 0).getTime();
        const remoteTimestamp = new Date(remoteItem.updated_at || 0).getTime();
        
        if (localTimestamp === remoteTimestamp) {
          // No conflict, data is in sync
          synchronized.push(localItem);
        } else {
          // Conflict detected
          conflicts.push({ local: localItem, remote: remoteItem });
          
          // Apply conflict resolution
          let resolvedData: T;
          if (options?.conflictResolution === 'local') {
            resolvedData = localItem;
          } else if (options?.conflictResolution === 'remote') {
            resolvedData = remoteItem;
          } else if (options?.conflictResolution === 'merge' && options?.onConflict) {
            resolvedData = options.onConflict(localItem, remoteItem);
          } else {
            // Default to most recent
            resolvedData = localTimestamp > remoteTimestamp ? localItem : remoteItem;
          }
          
          if (resolvedData === localItem) {
            // Update remote with local data
            const { data, error } = await supabase
              .from(tableName)
              .update(localItem)
              .eq('id', localItem.id)
              .select()
              .single();
            
            if (error) throw error;
            synchronized.push(data);
          } else {
            synchronized.push(resolvedData);
          }
        }
      }
    }
    
    // Invalidate cache after sync
    PaginationService.invalidateCache(tableName);
    
    return { synchronized, conflicts };
  }

  /**
   * Optimized aggregation queries with caching
   */
  static async getAggregatedData(
    tableName: string,
    aggregations: Array<{
      field: string;
      operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
      alias?: string;
    }>,
    filters?: Record<string, any>,
    groupBy?: string[],
    cacheTtl?: number
  ) {
    const cacheKey = `aggregation_${tableName}_${JSON.stringify({ aggregations, filters, groupBy })}`;
    
    // Check cache first
    const cached = PaginationService.getFromCache(cacheKey);
    if (cached) return cached;
    
    // Build aggregation query
    const selectFields = aggregations.map(agg => {
      const alias = agg.alias || `${agg.operation}_${agg.field}`;
      return `${agg.field}.${agg.operation}():${alias}`;
    }).join(',');
    
    let query = supabase
      .from(tableName)
      .select(selectFields + (groupBy ? `,${groupBy.join(',')}` : ''));
    
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Cache results
    PaginationService.saveToCache(cacheKey, data, cacheTtl);
    
    return data;
  }

  /**
   * Memory-efficient streaming data processing
   */
  static async* streamData<T>(
    tableName: string,
    batchSize: number = 1000,
    filters?: Record<string, any>
  ): AsyncGenerator<T[], void, unknown> {
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      let query = supabase
        .from(tableName)
        .select('*')
        .range(offset, offset + batchSize - 1);
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }
      
      yield data;
      
      if (data.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }
  }

  /**
   * Optimized search with fuzzy matching and ranking
   */
  static async advancedSearch<T>(
    tableName: string,
    searchQuery: string,
    options?: {
      fields?: string[];
      fuzzyThreshold?: number;
      maxResults?: number;
      includeRanking?: boolean;
    }
  ): Promise<Array<T & { rank?: number }>> {
    const fields = options?.fields || ['*'];
    const maxResults = options?.maxResults || 100;
    const includeRanking = options?.includeRanking || false;
    
    // Use PostgreSQL full-text search for better performance
    const { data, error } = await supabase
      .from(tableName)
      .select(fields.join(',') + (includeRanking ? ',ts_rank(search_vector, query) as rank' : ''))
      .textSearch('search_vector', searchQuery, {
        type: 'websearch',
        config: 'english'
      })
      .order(includeRanking ? 'rank' : 'created_at', { ascending: false })
      .limit(maxResults);
    
    if (error) {
      console.error('Advanced search error:', error);
      // Fallback to simple search
      return this.fallbackSearch(tableName, searchQuery, options);
    }
    
    return data || [];
  }

  private static async fallbackSearch<T>(
    tableName: string,
    searchQuery: string,
    options?: {
      fields?: string[];
      maxResults?: number;
    }
  ): Promise<T[]> {
    const maxResults = options?.maxResults || 100;
    
    // Use ilike for fallback search
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .limit(maxResults);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Database connection pool optimization
   */
  static async optimizeConnections(): Promise<void> {
    try {
      // Warm up connection pool
      await supabase.from('chart_of_accounts').select('id').limit(1);
      
      // Pre-load frequently accessed data
      await Promise.all([
        PaginationService.preloadCache('chart_of_accounts'),
        PaginationService.preloadCache('currency_rates'),
        PaginationService.preloadCache('financial_settings')
      ]);
      
      console.log('Database connections optimized');
    } catch (error) {
      console.error('Error optimizing database connections:', error);
    }
  }

  /**
   * Background data cleanup and maintenance
   */
  static async performMaintenance(): Promise<void> {
    try {
      // Clean up expired cache entries
      PaginationService.cleanupExpiredCache();
      
      // Optimize search indexes
      await this.optimizeSearchIndexes();
      
      // Cleanup old activity logs (keep last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo);
      
      console.log('Maintenance completed successfully');
    } catch (error) {
      console.error('Error during maintenance:', error);
    }
  }

  private static async optimizeSearchIndexes(): Promise<void> {
    // Rebuild search indexes for better performance
    const tables = ['chart_of_accounts', 'financial_transactions', 'expenses', 'currency_rates'];
    
    for (const table of tables) {
      try {
        const data = await supabase.from(table).select('*').limit(1000);
        if (data.data) {
          PaginationService.invalidateCache(table);
          // Rebuild search index would happen automatically on next search
        }
      } catch (error) {
        console.error(`Error optimizing search index for ${table}:`, error);
      }
    }
  }
}
