// Enhanced TypeScript types for Phase 2 database schema improvements
// These types correspond to the new tables and enhanced fields in the database

export interface ProductCategory {
  id: string;
  name: string;
  parent_category_id?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Virtual/computed fields
  parent_category?: ProductCategory;
  subcategories?: ProductCategory[];
  product_count?: number;
}

export interface WarehouseZone {
  id: string;
  location_id: string;
  zone_code: string;
  zone_name: string;
  zone_type?: 'receiving' | 'picking' | 'storage' | 'shipping' | 'quality_control';
  temperature_controlled: boolean;
  capacity_limit?: number;
  created_at: string;
  updated_at: string;
  
  // Virtual/computed fields
  location?: Location;
  current_utilization?: number;
  available_capacity?: number;
}

export interface EnhancedLocation {
  id: string;
  name: string;
  code: string;
  type: string;
  address?: string;
  capacity?: number;
  description?: string;
  status: string;
  
  // Phase 2 enhancements
  warehouse_manager_id?: string;
  is_warehouse: boolean;
  allows_negative_stock: boolean;
  default_location: boolean;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Virtual/computed fields
  zones?: WarehouseZone[];
  warehouse_manager?: Employee;
  total_stock_value?: number;
  active_parts_count?: number;
}

export interface FinancialTransaction {
  id: string;
  transaction_number: string;
  transaction_date: string;
  transaction_type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'payment' | 'receipt';
  reference_type?: 'invoice' | 'purchase_order' | 'payment' | 'adjustment' | 'sales_order';
  reference_id?: string;
  description?: string;
  
  // Party information
  customer_id?: string;
  vendor_id?: string;
  
  // Financial amounts
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  
  // Currency and status
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'reversed';
  
  // Inventory impact
  affects_inventory: boolean;
  
  // Accounting integration
  journal_entry_id?: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Virtual/computed fields
  customer?: Customer;
  vendor?: Vendor;
  journal_entry?: JournalEntry;
  reference_document?: any;
}

export interface StockMovement {
  id: string;
  movement_number: string;
  movement_date: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return' | 'damage';
  
  // Part and location information
  part_id: string;
  from_location_id?: string;
  to_location_id?: string;
  from_zone_id?: string;
  to_zone_id?: string;
  
  // Quantities and costs
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  
  // Batch/Serial tracking
  batch_number?: string;
  serial_numbers?: string[];
  expiry_date?: string;
  
  // Reference information
  reference_type?: 'purchase_order' | 'sales_order' | 'adjustment' | 'transfer' | 'production';
  reference_id?: string;
  reference_line_id?: string;
  
  // Reason and notes
  reason_code?: string;
  notes?: string;
  
  // Approval workflow
  requires_approval: boolean;
  approved_at?: string;
  approved_by?: string;
  
  // Audit fields
  created_at: string;
  created_by?: string;
  
  // Virtual/computed fields
  part?: EnhancedPart;
  from_location?: EnhancedLocation;
  to_location?: EnhancedLocation;
  from_zone?: WarehouseZone;
  to_zone?: WarehouseZone;
  approver?: Employee;
  reference_document?: any;
}

export interface EnhancedPart {
  id: string;
  name: string;
  part_number: string;
  description?: string;
  
  // Use correct database field names
  category_id?: string;
  vendor_id?: string;
  barcode?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  is_active?: boolean;
  
  // Stock management with correct field names
  minimum_stock?: number;
  reorder_point?: number;
  
  // Pricing with correct field names
  unit_cost?: number;
  selling_price?: number;
  
  // Status and classification
  unit_of_measure?: string;
  
  // Audit fields
  created_at?: string;
  updated_at?: string;
  
  // Virtual/computed fields (these can keep old names for compatibility)
  product_category?: ProductCategory;
  current_stock?: StockLocation[];
  stock_status?: 'ok' | 'low_stock' | 'reorder' | 'out_of_stock';
  recent_movements?: StockMovement[];
  
  // Legacy compatibility fields (computed)
  stock_quantity?: number;
  min_stock_level?: number;
  unit_price?: number;
  cost_price?: number;
}

export interface InventorySnapshot {
  id: string;
  snapshot_date: string;
  part_id: string;
  location_id: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  valuation_method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD';
  created_at: string;
  created_by?: string;
  
  // Virtual/computed fields
  part?: EnhancedPart;
  location?: EnhancedLocation;
  variance_from_previous?: number;
  variance_percentage?: number;
}

export interface DocumentStatus {
  id: string;
  document_type: 'purchase_order' | 'sales_order' | 'invoice' | 'quotation' | 'delivery_note';
  status_code: string;
  status_name: string;
  status_order: number;
  is_initial: boolean;
  is_final: boolean;
  allows_editing: boolean;
  requires_approval: boolean;
  color_code?: string;
  created_at: string;
}

export interface DocumentStatusTracking {
  document_type: string;
  document_id: string;
  document_number: string;
  current_status: string;
  status_display: string;
  color_code?: string;
  allows_editing: boolean;
  requires_approval: boolean;
  created_at: string;
  total_amount?: number;
  party_name?: string;
}

export interface CurrentInventoryView {
  part_id: string;
  part_name: string;
  part_number: string;
  category_id?: string;
  category_name?: string;
  location_id: string;
  location_name: string;
  quantity?: number;
  available_quantity?: number;
  reserved_quantity?: number;
  unit_price?: number;
  cost_price?: number;
  total_value: number;
  min_stock_level?: number;
  reorder_point?: number;
  stock_status: 'LOW_STOCK' | 'REORDER' | 'OK' | 'OUT_OF_STOCK';
}

// Enhanced Purchase Order types with Phase 2 improvements
export interface EnhancedPurchaseOrder {
  id: string;
  po_number: string;
  order_date: string;
  expected_date?: string;
  vendor_id?: string;
  status?: string;
  
  // Phase 2 enhancements
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  discount_percent?: number;
  payment_terms_days?: number;
  
  // Financial amounts
  subtotal?: number;
  tax_amount?: number;
  shipping_cost?: number;
  total_amount?: number;
  currency?: string;
  
  // Additional details
  notes?: string;
  terms_conditions?: string;
  delivery_schedule?: string;
  amendment_history?: any;
  
  // Audit fields
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  
  // Virtual/computed fields
  vendor?: Vendor;
  items?: EnhancedPurchaseOrderItem[];
  status_info?: DocumentStatus;
  approval_workflow?: ApprovalWorkflow[];
  receiving_status?: 'not_received' | 'partially_received' | 'fully_received';
  financial_impact?: FinancialTransaction;
}

export interface EnhancedPurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  part_id?: string;
  description: string;
  quantity: number;
  unit_price?: number;
  line_total?: number;
  expected_delivery_date?: string;
  created_at: string;
  
  // Virtual/computed fields
  part?: EnhancedPart;
  received_quantity?: number;
  remaining_quantity?: number;
  receiving_status?: 'pending' | 'partial' | 'complete';
}

// Enhanced Sales Order types with Phase 2 improvements
export interface EnhancedSalesOrder {
  id: string;
  order_number: string;
  order_date: string;
  customer_id?: string;
  status?: string;
  
  // Phase 2 enhancements
  discount_percent?: number;
  payment_terms_days?: number;
  expected_delivery_date?: string;
  delivery_date?: string;
  
  // Addresses
  billing_address?: string;
  shipping_address?: string;
  
  // Financial amounts
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  
  // Shipping and delivery
  shipping_method?: string;
  tracking_number?: string;
  special_instructions?: string;
  
  // Payment
  payment_terms?: string;
  
  // Additional details
  notes?: string;
  
  // Audit fields
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  
  // Virtual/computed fields
  customer?: Customer;
  items?: EnhancedSalesOrderItem[];
  status_info?: DocumentStatus;
  shipments?: Shipment[];
  invoices?: Invoice[];
  delivery_status?: 'pending' | 'partial' | 'complete';
  financial_impact?: FinancialTransaction;
}

export interface EnhancedSalesOrderItem {
  id: string;
  sales_order_id: string;
  part_id?: string;
  description: string;
  quantity: number;
  unit_price?: number;
  discount_percent?: number;
  line_total?: number;
  created_at: string;
  
  // Virtual/computed fields
  part?: EnhancedPart;
  shipped_quantity?: number;
  remaining_quantity?: number;
  shipping_status?: 'pending' | 'partial' | 'complete';
  inventory_allocation?: InventoryAllocation[];
}

// Workflow and approval types
export interface ApprovalWorkflow {
  id: string;
  document_type: string;
  document_id: string;
  step_order: number;
  approver_role: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approved_at?: string;
  comments?: string;
  created_at: string;
}

export interface InventoryAllocation {
  id: string;
  part_id: string;
  location_id: string;
  quantity: number;
  allocated_for_type: string;
  allocated_for_id: string;
  allocated_at: string;
  expires_at?: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
}

// Inventory management utilities
export interface InventoryLevel {
  part_id: string;
  location_id: string;
  current_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  incoming_quantity: number;
  outgoing_quantity: number;
}

export interface StockAlert {
  id: string;
  part_id: string;
  location_id?: string;
  alert_type: 'low_stock' | 'reorder' | 'overstock' | 'expiry' | 'quality_issue';
  current_quantity: number;
  threshold_quantity?: number;
  message?: string;
  status: 'active' | 'resolved' | 'dismissed';
  triggered_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Financial integration types
export interface AccountingEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  created_at: string;
}

export interface TaxCalculation {
  id: string;
  document_type: string;
  document_id: string;
  tax_rate_id: string;
  taxable_amount: number;
  tax_amount: number;
  created_at: string;
}

// Utility types for enhanced functionality
export type DocumentType = 'purchase_order' | 'sales_order' | 'invoice' | 'quotation' | 'delivery_note';
export type MovementType = 'in' | 'out' | 'transfer' | 'adjustment' | 'return' | 'damage';
export type TransactionType = 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'payment' | 'receipt';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type StockStatus = 'ok' | 'low_stock' | 'reorder' | 'out_of_stock';
export type ValuationMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD';

// API response types for enhanced endpoints
export interface InventoryDashboardData {
  total_parts: number;
  total_locations: number;
  total_stock_value: number;
  low_stock_items: number;
  recent_movements: StockMovement[];
  top_categories: Array<{
    category: string;
    value: number;
    count: number;
  }>;
  stock_alerts: StockAlert[];
}

export interface FinancialSummary {
  total_sales: number;
  total_purchases: number;
  pending_invoices: number;
  overdue_invoices: number;
  recent_transactions: FinancialTransaction[];
  monthly_trends: Array<{
    month: string;
    sales: number;
    purchases: number;
    profit: number;
  }>;
}

// Form types for enhanced UI components
export interface PartFormData {
  name: string;
  part_number: string;
  description?: string;
  category_id?: string;
  vendor_id?: string;
  barcode?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  is_active?: boolean;
  
  // Use correct database field names
  unit_cost?: number;
  selling_price?: number;
  minimum_stock?: number;
  reorder_point?: number;
  unit_of_measure?: string;
}

export interface StockMovementFormData {
  movement_type: MovementType;
  part_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  unit_cost?: number;
  batch_number?: string;
  expiry_date?: string;
  reason_code?: string;
  notes?: string;
  reference_type?: string;
  reference_id?: string;
}

export interface InventoryAdjustmentFormData {
  part_id: string;
  location_id: string;
  adjustment_type: 'quantity' | 'value' | 'both';
  quantity_adjustment?: number;
  new_quantity?: number;
  value_adjustment?: number;
  new_unit_cost?: number;
  reason_code: string;
  notes?: string;
  requires_approval?: boolean;
}

// Export all types for easy importing
export type {
  Employee,
  Customer,
  Vendor,
  Location,
  JournalEntry,
  Invoice,
  Shipment,
  StockLocation
} from './inventory';
