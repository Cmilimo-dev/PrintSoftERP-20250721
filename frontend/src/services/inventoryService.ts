import { Inventory, StockMovement } from '@/types/inventory';

interface UpdateInventoryParams {
  productId: string;
  quantity: number;
  movementType: 'in' | 'out';
  referenceType: string;
  referenceId: string;
}

export class InventoryService {
  
  static async updateInventory(params: UpdateInventoryParams): Promise<Inventory> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, return mock data
    // In a real app, this would make an HTTP request to your backend
    console.log('Updating inventory:', params);
    
    return {
      id: 'mock-id',
      product_id: params.productId,
      warehouse_id: 'default-warehouse',
      quantity: params.quantity,
      reserved_quantity: 0,
      available_quantity: params.quantity,
      minimum_stock: 10,
      maximum_stock: 100,
      reorder_point: 20,
      last_counted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  static async recordStockMovement(params: UpdateInventoryParams): Promise<StockMovement> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Recording stock movement:', params);
    
    return {
      id: `sm-${Date.now()}`,
      product_id: params.productId,
      movement_type: params.movementType,
      quantity: params.quantity,
      reference_type: params.referenceType,
      reference_id: params.referenceId,
      notes: 'Automated inventory update',
      created_at: new Date().toISOString(),
      created_by: 'system',
    };
  }
  
  static async getInventoryAlerts(): Promise<{
    lowStock: string[];
    outOfStock: string[];
    reorderPoint: string[];
  }> {
    // Mock inventory alerts
    return {
      lowStock: ['PROD001', 'PROD003'],
      outOfStock: ['PROD002'],
      reorderPoint: ['PROD004', 'PROD005'],
    };
  }
  
  static async getInventoryValue(): Promise<number> {
    // Mock total inventory value
    return 450000;
  }
}

export default InventoryService;
