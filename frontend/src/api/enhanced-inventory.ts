import { supabase } from '@/integrations/supabase/client';
import {
  EnhancedPart,
  ProductCategory,
  StockMovement,
  WarehouseZone,
  EnhancedLocation,
  InventorySnapshot,
  DocumentStatus,
  CurrentInventoryView,
  InventoryDashboardData,
  StockAlert,
  PartFormData,
  StockMovementFormData,
  InventoryAdjustmentFormData
} from '@/types/enhanced-database';

export const enhancedInventoryApi = {
  // ============================================================================
  // Product Categories
  // ============================================================================
  
  async getProductCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          parent_category:parent_category_id(*),
          subcategories:product_categories!parent_category_id(*)
        `)
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) {
        console.log('Product categories table not found, returning mock data:', error.message);
        return [
          {
            id: '1',
            name: 'General',
            description: 'General products',
            parent_category_id: null,
            sort_order: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }
      return data || [];
    } catch (error) {
      console.log('Error fetching product categories, returning mock data:', error);
      return [
        {
          id: '1',
          name: 'General',
          description: 'General products',
          parent_category_id: null,
          sort_order: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  },

  async createProductCategory(category: Partial<ProductCategory>): Promise<ProductCategory> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.log('Cannot create category - table not found:', error.message);
        throw new Error('Product categories table is not available');
      }
      return data;
    } catch (error) {
      console.log('Error creating product category:', error);
      throw error;
    }
  },

  async updateProductCategory(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProductCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ============================================================================
  // Enhanced Parts Management
  // ============================================================================

  async getEnhancedParts(options?: {
    categoryId?: string;
    searchTerm?: string;
    status?: string;
    stockStatus?: string;
    limit?: number;
  }): Promise<EnhancedPart[]> {
    let query = supabase
      .from('parts')
      .select(`
        *,
        product_category:category_id(*),
        current_stock:stock_locations(
          *,
          location:locations(*)
        )
      `);

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.searchTerm) {
      query = query.or(`name.ilike.%${options.searchTerm}%,part_number.ilike.%${options.searchTerm}%,barcode.ilike.%${options.searchTerm}%`);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('name');

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createEnhancedPart(partData: PartFormData): Promise<EnhancedPart> {
    const { data, error } = await supabase
      .from('parts')
      .insert({
        ...partData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        product_category:category_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEnhancedPart(id: string, updates: Partial<PartFormData>): Promise<EnhancedPart> {
    const { data, error } = await supabase
      .from('parts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        product_category:category_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================================================
  // Stock Movements
  // ============================================================================

  async getStockMovements(options?: {
    partId?: string;
    locationId?: string;
    movementType?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<StockMovement[]> {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        part:parts(*),
        from_location:locations!from_location_id(*),
        to_location:locations!to_location_id(*)
      `);

    if (options?.partId) {
      query = query.eq('part_id', options.partId);
    }

    if (options?.locationId) {
      query = query.or(`from_location_id.eq.${options.locationId},to_location_id.eq.${options.locationId}`);
    }

    if (options?.movementType) {
      query = query.eq('movement_type', options.movementType);
    }

    if (options?.dateFrom) {
      query = query.gte('movement_date', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('movement_date', options.dateTo);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('movement_date', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createStockMovement(movementData: StockMovementFormData): Promise<StockMovement> {
    // Generate movement number
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const movement_number = `MOV-${timestamp}-${random}`;

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        ...movementData,
        movement_number,
        movement_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        part:parts(*),
        from_location:locations!from_location_id(*),
        to_location:locations!to_location_id(*)
      `)
      .single();
    
    if (error) throw error;

    // Update stock levels
    await this.updateStockLevels(movementData);

    return data;
  },

  async approveStockMovement(id: string, approverId: string): Promise<StockMovement> {
    const { data, error } = await supabase
      .from('stock_movements')
      .update({
        approved_at: new Date().toISOString(),
        approved_by: approverId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================================================
  // Warehouse Zones
  // ============================================================================

  async getWarehouseZones(locationId?: string): Promise<WarehouseZone[]> {
    let query = supabase
      .from('warehouse_zones')
      .select(`
        *,
        location:locations(*)
      `);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    query = query.order('zone_code');

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createWarehouseZone(zoneData: Partial<WarehouseZone>): Promise<WarehouseZone> {
    const { data, error } = await supabase
      .from('warehouse_zones')
      .insert({
        ...zoneData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        location:locations(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================================================
  // Enhanced Locations
  // ============================================================================

  async getEnhancedLocations(): Promise<EnhancedLocation[]> {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        zones:warehouse_zones(*)
      `)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async updateLocation(id: string, updates: Partial<EnhancedLocation>): Promise<EnhancedLocation> {
    const { data, error } = await supabase
      .from('locations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============================================================================
  // Current Inventory View
  // ============================================================================

  async getCurrentInventory(options?: {
    locationId?: string;
    categoryId?: string;
    stockStatus?: string;
  }): Promise<CurrentInventoryView[]> {
    let query = supabase
      .from('current_inventory')
      .select('*');

    if (options?.locationId) {
      query = query.eq('location_id', options.locationId);
    }

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.stockStatus) {
      query = query.eq('stock_status', options.stockStatus);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // ============================================================================
  // Dashboard Data
  // ============================================================================

  async getInventoryDashboardData(): Promise<InventoryDashboardData> {
    // Get total parts count
    const { count: totalParts } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true });

    // Get total locations count
    const { count: totalLocations } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('is_warehouse', true);

    // Get total stock value
    const { data: stockValue } = await supabase
      .from('current_inventory')
      .select('total_value');

    const totalStockValue = stockValue?.reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;

    // Get low stock items count
    const { count: lowStockItems } = await supabase
      .from('current_inventory')
      .select('*', { count: 'exact', head: true })
      .in('stock_status', ['LOW_STOCK', 'REORDER']);

    // Get recent movements
    const recentMovements = await this.getStockMovements({ limit: 10 });

    // Get top categories
    const { data: categoryData } = await supabase
      .from('current_inventory')
      .select('category_name, total_value')
      .not('category_name', 'is', null);

    const categoryMap = new Map();
    categoryData?.forEach(item => {
      const category = item.category_name || 'Uncategorized';
      const current = categoryMap.get(category) || { count: 0, value: 0 };
      categoryMap.set(category, {
        count: current.count + 1,
        value: current.value + (item.total_value || 0)
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        value: data.value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Get stock alerts
    const stockAlerts = await this.getStockAlerts({ limit: 10 });

    return {
      total_parts: totalParts || 0,
      total_locations: totalLocations || 0,
      total_stock_value: totalStockValue,
      low_stock_items: lowStockItems || 0,
      recent_movements: recentMovements,
      top_categories: topCategories,
      stock_alerts: stockAlerts
    };
  },

  // ============================================================================
  // Stock Alerts
  // ============================================================================

  async getStockAlerts(options?: {
    alertType?: string;
    status?: string;
    limit?: number;
  }): Promise<StockAlert[]> {
    let query = supabase
      .from('stock_alerts')
      .select(`
        *,
        part:parts(*),
        location:locations(*)
      `);

    if (options?.alertType) {
      query = query.eq('alert_type', options.alertType);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('triggered_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async resolveStockAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('stock_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  // ============================================================================
  // Inventory Adjustments
  // ============================================================================

  async createInventoryAdjustment(adjustmentData: InventoryAdjustmentFormData): Promise<void> {
    const { part_id, location_id, quantity_adjustment, new_quantity, reason_code, notes } = adjustmentData;

    // Create adjustment movement
    const movementData: StockMovementFormData = {
      movement_type: 'adjustment',
      part_id,
      to_location_id: location_id,
      quantity: quantity_adjustment || 0,
      reason_code,
      notes
    };

    // If new_quantity is provided, calculate the adjustment
    if (new_quantity !== undefined) {
      const { data: currentStock } = await supabase
        .from('stock_locations')
        .select('quantity')
        .eq('part_id', part_id)
        .eq('location_id', location_id)
        .single();

      const currentQuantity = currentStock?.quantity || 0;
      movementData.quantity = new_quantity - currentQuantity;
    }

    await this.createStockMovement(movementData);
  },

  // ============================================================================
  // Helper Methods
  // ============================================================================

  async updateStockLevels(movementData: StockMovementFormData): Promise<void> {
    const { part_id, from_location_id, to_location_id, quantity, movement_type } = movementData;

    // Handle different movement types
    switch (movement_type) {
      case 'in':
        if (to_location_id) {
          await this.adjustStockLocation(part_id, to_location_id, quantity);
        }
        break;
      
      case 'out':
        if (from_location_id) {
          await this.adjustStockLocation(part_id, from_location_id, -quantity);
        }
        break;
      
      case 'transfer':
        if (from_location_id && to_location_id) {
          await this.adjustStockLocation(part_id, from_location_id, -quantity);
          await this.adjustStockLocation(part_id, to_location_id, quantity);
        }
        break;
      
      case 'adjustment':
        if (to_location_id) {
          await this.adjustStockLocation(part_id, to_location_id, quantity);
        }
        break;
    }
  },

  async adjustStockLocation(partId: string, locationId: string, quantityChange: number): Promise<void> {
    // Use Supabase's upsert functionality
    const { error } = await supabase
      .from('stock_locations')
      .upsert({
        part_id: partId,
        location_id: locationId,
        quantity: quantityChange,
        available_quantity: quantityChange,
        last_movement_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'part_id,location_id',
        ignoreDuplicates: false
      });

    if (error) {
      // If upsert fails, try to update existing record
      const { error: updateError } = await supabase.rpc('adjust_stock_quantity', {
        p_part_id: partId,
        p_location_id: locationId,
        p_quantity_change: quantityChange
      });

      if (updateError) throw updateError;
    }
  }
};

export default enhancedInventoryApi;
