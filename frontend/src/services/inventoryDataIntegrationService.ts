import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  manufacturer?: string;
  supplier?: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
  specifications?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    material?: string;
    color?: string;
  };
  pricing: {
    unitCost: number;
    sellingPrice: number;
    msrp?: number;
    currency: string;
    lastUpdated: string;
  };
  stock: {
    currentStock: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    reorderQuantity: number;
    unit: string;
  };
  locations: InventoryLocation[];
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
  lastMovement?: string;
}

export interface InventoryLocation {
  id: string;
  warehouseId: string;
  warehouseName: string;
  section?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockMovement {
  id: string;
  movementNumber: string;
  partId: string;
  part?: InventoryItem;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  unitCost?: number;
  totalValue?: number;
  fromLocation?: InventoryLocation;
  toLocation?: InventoryLocation;
  reason: string;
  referenceDocument?: {
    type: 'purchase_order' | 'sales_order' | 'transfer_order' | 'adjustment';
    id: string;
    number: string;
  };
  performedBy: string;
  approvedBy?: string;
  movementDate: string;
  notes?: string;
  attachments?: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  type: 'main' | 'branch' | 'distribution' | 'transit';
  isActive: boolean;
  capacity?: {
    totalSpace: number;
    usedSpace: number;
    unit: string;
  };
  sections: WarehouseSection[];
}

export interface WarehouseSection {
  id: string;
  name: string;
  code: string;
  type: 'storage' | 'picking' | 'receiving' | 'shipping';
  aisles: number;
  shelves: number;
  bins: number;
}

export interface InventoryValuation {
  period: string;
  totalValue: number;
  costMethod: 'FIFO' | 'LIFO' | 'WAC'; // Weighted Average Cost
  breakdown: {
    category: string;
    value: number;
    quantity: number;
    percentage: number;
  }[];
}

export interface StockAlert {
  id: string;
  partId: string;
  part: InventoryItem;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'slow_moving';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  currentValue: number;
  suggestedAction: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface InventoryDashboardMetrics {
  totalItems: number;
  totalValue: number;
  totalWarehouses: number;
  lowStockItems: number;
  outOfStockItems: number;
  fastMovingItems: number;
  slowMovingItems: number;
  averageTurnoverRate: number;
  categoryBreakdown: {
    category: string;
    itemCount: number;
    value: number;
    percentage: number;
  }[];
  recentMovements: StockMovement[];
  stockAlerts: StockAlert[];
}

/**
 * Inventory Data Integration Service
 * Connects inventory management with live inventory systems and data sources
 */
export class InventoryDataIntegrationService {
  
  /**
   * Get all inventory items with filtering and pagination
   */
  static async getInventoryItems(
    filters: {
      category?: string;
      status?: string;
      warehouse?: string;
      lowStock?: boolean;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ items: InventoryItem[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          suppliers(id, name, contact_person, email, phone),
          inventory_locations(
            id,
            warehouse_id,
            warehouses(name),
            section,
            aisle,
            shelf,
            bin,
            quantity,
            reserved_quantity
          )
        `, { count: 'exact' });
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,part_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.lowStock) {
        query = query.lt('current_stock', 'min_stock_level');
      }
      
      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('name', { ascending: true })
        .range(offset, offset + pageSize - 1);
      
      const { data: items, error, count } = await query;
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        return { items: [], total: 0, hasMore: false };
      }
      
      const transformedItems: InventoryItem[] = (items || []).map(this.transformInventoryItemData);
      
      return {
        items: transformedItems,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };
      
    } catch (error) {
      console.error('Error in getInventoryItems:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }
  
  /**
   * Get inventory item by ID
   */
  static async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    try {
      const { data: item, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          suppliers(id, name, contact_person, email, phone),
          inventory_locations(
            id,
            warehouse_id,
            warehouses(name),
            section,
            aisle,
            shelf,
            bin,
            quantity,
            reserved_quantity
          )
        `)
        .eq('id', id)
        .single();
      
      if (error || !item) {
        console.error('Error fetching inventory item by ID:', error);
        return null;
      }
      
      return this.transformInventoryItemData(item);
      
    } catch (error) {
      console.error('Error in getInventoryItemById:', error);
      return null;
    }
  }
  
  /**
   * Create new inventory item
   */
  static async createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem | null> {
    try {
      const inventoryItemData = {
        part_number: itemData.partNumber,
        name: itemData.name,
        description: itemData.description,
        category: itemData.category,
        subcategory: itemData.subcategory,
        manufacturer: itemData.manufacturer,
        supplier_id: itemData.supplier?.id,
        specifications: itemData.specifications,
        unit_cost: itemData.pricing.unitCost,
        selling_price: itemData.pricing.sellingPrice,
        msrp: itemData.pricing.msrp,
        currency: itemData.pricing.currency,
        current_stock: itemData.stock.currentStock,
        min_stock_level: itemData.stock.minStockLevel,
        max_stock_level: itemData.stock.maxStockLevel,
        reorder_point: itemData.stock.reorderPoint,
        reorder_quantity: itemData.stock.reorderQuantity,
        unit: itemData.stock.unit,
        status: itemData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: newItem, error } = await supabase
        .from('inventory_items')
        .insert(inventoryItemData)
        .select(`
          *,
          suppliers(id, name, contact_person, email, phone),
          inventory_locations(
            id,
            warehouse_id,
            warehouses(name),
            section,
            aisle,
            shelf,
            bin,
            quantity,
            reserved_quantity
          )
        `)
        .single();
      
      if (error) {
        console.error('Error creating inventory item:', error);
        throw new Error('Failed to create inventory item');
      }
      
      return this.transformInventoryItemData(newItem);
      
    } catch (error) {
      console.error('Error in createInventoryItem:', error);
      return null;
    }
  }
  
  /**
   * Update inventory item
   */
  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    try {
      const updateData = {
        ...updates.partNumber && { part_number: updates.partNumber },
        ...updates.name && { name: updates.name },
        ...updates.description && { description: updates.description },
        ...updates.category && { category: updates.category },
        ...updates.subcategory && { subcategory: updates.subcategory },
        ...updates.manufacturer && { manufacturer: updates.manufacturer },
        ...updates.supplier?.id && { supplier_id: updates.supplier.id },
        ...updates.specifications && { specifications: updates.specifications },
        ...updates.pricing && {
          unit_cost: updates.pricing.unitCost,
          selling_price: updates.pricing.sellingPrice,
          msrp: updates.pricing.msrp,
          currency: updates.pricing.currency
        },
        ...updates.stock && {
          current_stock: updates.stock.currentStock,
          min_stock_level: updates.stock.minStockLevel,
          max_stock_level: updates.stock.maxStockLevel,
          reorder_point: updates.stock.reorderPoint,
          reorder_quantity: updates.stock.reorderQuantity,
          unit: updates.stock.unit
        },
        ...updates.status && { status: updates.status },
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedItem, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          suppliers(id, name, contact_person, email, phone),
          inventory_locations(
            id,
            warehouse_id,
            warehouses(name),
            section,
            aisle,
            shelf,
            bin,
            quantity,
            reserved_quantity
          )
        `)
        .single();
      
      if (error) {
        console.error('Error updating inventory item:', error);
        throw new Error('Failed to update inventory item');
      }
      
      return this.transformInventoryItemData(updatedItem);
      
    } catch (error) {
      console.error('Error in updateInventoryItem:', error);
      return null;
    }
  }
  
  /**
   * Create stock movement
   */
  static async createStockMovement(movementData: Omit<StockMovement, 'id' | 'movementNumber'>): Promise<StockMovement | null> {
    try {
      // Generate movement number
      const movementNumber = await this.generateMovementNumber();
      
      const stockMovementData = {
        movement_number: movementNumber,
        part_id: movementData.partId,
        movement_type: movementData.movementType,
        quantity: movementData.quantity,
        unit_cost: movementData.unitCost,
        total_value: movementData.totalValue,
        from_location_id: movementData.fromLocation?.id,
        to_location_id: movementData.toLocation?.id,
        reason: movementData.reason,
        reference_document_type: movementData.referenceDocument?.type,
        reference_document_id: movementData.referenceDocument?.id,
        reference_document_number: movementData.referenceDocument?.number,
        performed_by: movementData.performedBy,
        approved_by: movementData.approvedBy,
        movement_date: movementData.movementDate,
        notes: movementData.notes,
        attachments: movementData.attachments,
        created_at: new Date().toISOString()
      };
      
      const { data: newMovement, error } = await supabase
        .from('stock_movements')
        .insert(stockMovementData)
        .select(`
          *,
          inventory_items(*),
          from_locations:inventory_locations!from_location_id(*),
          to_locations:inventory_locations!to_location_id(*)
        `)
        .single();
      
      if (error) {
        console.error('Error creating stock movement:', error);
        throw new Error('Failed to create stock movement');
      }
      
      // Update inventory quantities
      await this.updateInventoryQuantities(movementData);
      
      return this.transformStockMovementData(newMovement);
      
    } catch (error) {
      console.error('Error in createStockMovement:', error);
      return null;
    }
  }
  
  /**
   * Get stock movements with filtering
   */
  static async getStockMovements(
    filters: {
      partId?: string;
      movementType?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_items(*),
          from_locations:inventory_locations!from_location_id(*),
          to_locations:inventory_locations!to_location_id(*)
        `, { count: 'exact' });
      
      // Apply filters
      if (filters.partId) {
        query = query.eq('part_id', filters.partId);
      }
      if (filters.movementType) {
        query = query.eq('movement_type', filters.movementType);
      }
      if (filters.dateFrom) {
        query = query.gte('movement_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('movement_date', filters.dateTo);
      }
      
      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('movement_date', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      const { data: movements, error, count } = await query;
      
      if (error) {
        console.error('Error fetching stock movements:', error);
        return { movements: [], total: 0, hasMore: false };
      }
      
      const transformedMovements: StockMovement[] = (movements || []).map(this.transformStockMovementData);
      
      return {
        movements: transformedMovements,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };
      
    } catch (error) {
      console.error('Error in getStockMovements:', error);
      return { movements: [], total: 0, hasMore: false };
    }
  }
  
  /**
   * Get inventory dashboard metrics
   */
  static async getInventoryDashboardMetrics(): Promise<InventoryDashboardMetrics> {
    try {
      // Get basic counts
      const { count: totalItems } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      const { count: totalWarehouses } = await supabase
        .from('warehouses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // Get low stock items
      const { count: lowStockItems } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .lt('current_stock', 'min_stock_level');
      
      // Get out of stock items
      const { count: outOfStockItems } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('current_stock', 0);
      
      // Get total inventory value
      const { data: inventoryData } = await supabase
        .from('inventory_items')
        .select('current_stock, unit_cost')
        .eq('status', 'active');
      
      const totalValue = inventoryData?.reduce((sum, item) => 
        sum + ((item.current_stock || 0) * (item.unit_cost || 0)), 0) || 0;
      
      // Get category breakdown
      const { data: categoryData } = await supabase
        .from('inventory_items')
        .select('category, current_stock, unit_cost')
        .eq('status', 'active');
      
      const categoryMap = new Map<string, { itemCount: number; value: number }>();
      categoryData?.forEach(item => {
        const category = item.category || 'Uncategorized';
        const current = categoryMap.get(category) || { itemCount: 0, value: 0 };
        categoryMap.set(category, {
          itemCount: current.itemCount + 1,
          value: current.value + ((item.current_stock || 0) * (item.unit_cost || 0))
        });
      });
      
      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        itemCount: data.itemCount,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }));
      
      // Get recent movements
      const { data: recentMovementsData } = await supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_items(*)
        `)
        .order('movement_date', { ascending: false })
        .limit(10);
      
      const recentMovements = (recentMovementsData || []).map(this.transformStockMovementData);
      
      // Get stock alerts
      const stockAlerts = await this.generateStockAlerts();
      
      return {
        totalItems: totalItems || 0,
        totalValue,
        totalWarehouses: totalWarehouses || 0,
        lowStockItems: lowStockItems || 0,
        outOfStockItems: outOfStockItems || 0,
        fastMovingItems: 0, // Would require more complex calculation
        slowMovingItems: 0, // Would require more complex calculation
        averageTurnoverRate: 0, // Would require historical data analysis
        categoryBreakdown,
        recentMovements,
        stockAlerts
      };
      
    } catch (error) {
      console.error('Error getting inventory dashboard metrics:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        totalWarehouses: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        fastMovingItems: 0,
        slowMovingItems: 0,
        averageTurnoverRate: 0,
        categoryBreakdown: [],
        recentMovements: [],
        stockAlerts: []
      };
    }
  }
  
  /**
   * Get warehouses
   */
  static async getWarehouses(): Promise<Warehouse[]> {
    try {
      const { data: warehouses, error } = await supabase
        .from('warehouses')
        .select(`
          *,
          managers:employees(id, first_name, last_name, email, phone),
          warehouse_sections(*)
        `)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching warehouses:', error);
        return [];
      }
      
      return (warehouses || []).map(this.transformWarehouseData);
      
    } catch (error) {
      console.error('Error in getWarehouses:', error);
      return [];
    }
  }
  
  /**
   * Generate stock alerts based on current inventory levels
   */
  private static async generateStockAlerts(): Promise<StockAlert[]> {
    try {
      const { data: lowStockItems } = await supabase
        .from('inventory_items')
        .select('*')
        .lt('current_stock', 'min_stock_level')
        .eq('status', 'active');
      
      const alerts: StockAlert[] = [];
      
      lowStockItems?.forEach(item => {
        const severity = item.current_stock === 0 ? 'critical' : 
                        item.current_stock < (item.min_stock_level * 0.5) ? 'high' : 'medium';
        
        alerts.push({
          id: `alert-${item.id}`,
          partId: item.id,
          part: this.transformInventoryItemData(item),
          alertType: item.current_stock === 0 ? 'out_of_stock' : 'low_stock',
          severity,
          message: item.current_stock === 0 ? 
            `${item.name} is out of stock` : 
            `${item.name} is below minimum stock level (${item.current_stock}/${item.min_stock_level})`,
          threshold: item.min_stock_level,
          currentValue: item.current_stock,
          suggestedAction: `Reorder ${item.reorder_quantity} units`,
          createdAt: new Date().toISOString(),
          acknowledged: false
        });
      });
      
      return alerts;
      
    } catch (error) {
      console.error('Error generating stock alerts:', error);
      return [];
    }
  }
  
  /**
   * Update inventory quantities after stock movement
   */
  private static async updateInventoryQuantities(movementData: Omit<StockMovement, 'id' | 'movementNumber'>): Promise<void> {
    try {
      // Get current item
      const { data: item } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', movementData.partId)
        .single();
      
      if (!item) return;
      
      let newStock = item.current_stock;
      
      // Adjust stock based on movement type
      switch (movementData.movementType) {
        case 'in':
          newStock += movementData.quantity;
          break;
        case 'out':
          newStock -= movementData.quantity;
          break;
        case 'adjustment':
          newStock = movementData.quantity; // Direct adjustment
          break;
      }
      
      // Update inventory item stock
      await supabase
        .from('inventory_items')
        .update({ 
          current_stock: Math.max(0, newStock),
          updated_at: new Date().toISOString()
        })
        .eq('id', movementData.partId);
      
    } catch (error) {
      console.error('Error updating inventory quantities:', error);
    }
  }
  
  /**
   * Generate movement number
   */
  private static async generateMovementNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact', head: true });
      
      const sequence = (count || 0) + 1;
      return `MOV-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;
      
    } catch (error) {
      console.error('Error generating movement number:', error);
      return `MOV-${Date.now()}`;
    }
  }
  
  // Data transformation methods
  
  private static transformInventoryItemData(data: any): InventoryItem {
    return {
      id: data.id,
      partNumber: data.part_number,
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      supplier: data.suppliers ? {
        id: data.suppliers.id,
        name: data.suppliers.name,
        contactPerson: data.suppliers.contact_person,
        email: data.suppliers.email,
        phone: data.suppliers.phone
      } : undefined,
      specifications: data.specifications,
      pricing: {
        unitCost: data.unit_cost || 0,
        sellingPrice: data.selling_price || 0,
        msrp: data.msrp,
        currency: data.currency || 'KES',
        lastUpdated: data.updated_at
      },
      stock: {
        currentStock: data.current_stock || 0,
        minStockLevel: data.min_stock_level || 0,
        maxStockLevel: data.max_stock_level || 0,
        reorderPoint: data.reorder_point || 0,
        reorderQuantity: data.reorder_quantity || 0,
        unit: data.unit || 'pcs'
      },
      locations: (data.inventory_locations || []).map((loc: any) => ({
        id: loc.id,
        warehouseId: loc.warehouse_id,
        warehouseName: loc.warehouses?.name || '',
        section: loc.section,
        aisle: loc.aisle,
        shelf: loc.shelf,
        bin: loc.bin,
        quantity: loc.quantity || 0,
        reservedQuantity: loc.reserved_quantity || 0,
        availableQuantity: (loc.quantity || 0) - (loc.reserved_quantity || 0)
      })),
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastMovement: data.last_movement
    };
  }
  
  private static transformStockMovementData(data: any): StockMovement {
    return {
      id: data.id,
      movementNumber: data.movement_number,
      partId: data.part_id,
      part: data.inventory_items ? this.transformInventoryItemData(data.inventory_items) : undefined,
      movementType: data.movement_type,
      quantity: data.quantity,
      unitCost: data.unit_cost,
      totalValue: data.total_value,
      fromLocation: data.from_locations ? {
        id: data.from_locations.id,
        warehouseId: data.from_locations.warehouse_id,
        warehouseName: data.from_locations.warehouses?.name || '',
        section: data.from_locations.section,
        aisle: data.from_locations.aisle,
        shelf: data.from_locations.shelf,
        bin: data.from_locations.bin,
        quantity: data.from_locations.quantity || 0,
        reservedQuantity: data.from_locations.reserved_quantity || 0,
        availableQuantity: (data.from_locations.quantity || 0) - (data.from_locations.reserved_quantity || 0)
      } : undefined,
      toLocation: data.to_locations ? {
        id: data.to_locations.id,
        warehouseId: data.to_locations.warehouse_id,
        warehouseName: data.to_locations.warehouses?.name || '',
        section: data.to_locations.section,
        aisle: data.to_locations.aisle,
        shelf: data.to_locations.shelf,
        bin: data.to_locations.bin,
        quantity: data.to_locations.quantity || 0,
        reservedQuantity: data.to_locations.reserved_quantity || 0,
        availableQuantity: (data.to_locations.quantity || 0) - (data.to_locations.reserved_quantity || 0)
      } : undefined,
      reason: data.reason,
      referenceDocument: data.reference_document_type ? {
        type: data.reference_document_type,
        id: data.reference_document_id,
        number: data.reference_document_number
      } : undefined,
      performedBy: data.performed_by,
      approvedBy: data.approved_by,
      movementDate: data.movement_date,
      notes: data.notes,
      attachments: data.attachments || []
    };
  }
  
  private static transformWarehouseData(data: any): Warehouse {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: {
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zip: data.address?.zip || '',
        country: data.address?.country || ''
      },
      manager: data.managers ? {
        id: data.managers.id,
        name: `${data.managers.first_name} ${data.managers.last_name}`,
        email: data.managers.email,
        phone: data.managers.phone
      } : undefined,
      type: data.type,
      isActive: data.is_active,
      capacity: data.capacity,
      sections: (data.warehouse_sections || []).map((section: any) => ({
        id: section.id,
        name: section.name,
        code: section.code,
        type: section.type,
        aisles: section.aisles || 0,
        shelves: section.shelves || 0,
        bins: section.bins || 0
      }))
    };
  }
}
