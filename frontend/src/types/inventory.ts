
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price: number;
  unit_of_measure: string;
  category_id?: string;
  minimum_stock: number;
  reorder_point: number;
  current_stock: number;
  maximum_stock?: number;
  lead_time_days: number;
  is_serialized: boolean;
  is_active: boolean;
  tax_rate: number;
  created_at: string;
  updated_at: string;
  status?: string;
  barcode?: string;
  warranty_period?: number;
  weight?: number;
  dimensions?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point: number;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id?: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}
