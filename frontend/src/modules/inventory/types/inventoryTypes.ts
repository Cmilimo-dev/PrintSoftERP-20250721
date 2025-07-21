// Inventory Module Independent Types
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export type ProductType = 'physical' | 'digital' | 'service' | 'bundle' | 'subscription';

export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'out_of_stock' | 'back_order';

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'transfer' | 'return' | 'damaged' | 'expired';

export type StockMovementReason = 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer' | 'damaged' | 'expired' | 'initial_stock' | 'audit' | 'production' | 'consumption';

export type UnitOfMeasure = 'piece' | 'kg' | 'liter' | 'meter' | 'box' | 'pack' | 'dozen' | 'gram' | 'milliliter' | 'centimeter' | 'square_meter' | 'cubic_meter' | 'hour' | 'day' | 'month' | 'year';

export type WarehouseType = 'main' | 'secondary' | 'retail' | 'distribution' | 'quarantine' | 'virtual';

export type StockValuationMethod = 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';

export type ReorderStrategy = 'manual' | 'automatic' | 'just_in_time' | 'economic_order_quantity';

// Base Product Interface
export interface BaseProduct {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  productType: ProductType;
  status: ProductStatus;
  
  // Categorization
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  supplierId?: string;
  manufacturerId?: string;
  tags: ProductTag[];
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  msrp?: number; // Manufacturer's Suggested Retail Price
  wholesalePrice?: number;
  currency: Currency;
  
  // Tax Information
  taxable: boolean;
  taxRateId?: string;
  taxRate?: number;
  
  // Measurements and Packaging
  weight?: number;
  weightUnit?: UnitOfMeasure;
  dimensions?: ProductDimensions;
  unitOfMeasure: UnitOfMeasure;
  packageQuantity?: number; // Items per package
  minimumOrderQuantity?: number;
  
  // Inventory Settings
  trackInventory: boolean;
  allowBackorders: boolean;
  requiresSerialNumber: boolean;
  requiresBatchNumber: boolean;
  shelfLife?: number; // in days
  
  // Reorder Settings
  reorderPoint?: number;
  reorderQuantity?: number;
  reorderStrategy: ReorderStrategy;
  leadTimeDays?: number;
  
  // Images and Media
  images: ProductImage[];
  attachments: ProductAttachment[];
  
  // SEO and Marketing
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Variant Information
  isVariant: boolean;
  parentProductId?: string;
  variantOptions?: ProductVariantOption[];
  
  // Custom Fields
  customFields?: { [key: string]: any };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Additional Properties
  notes?: string;
  internalNotes?: string;
  supplier?: Supplier;
  manufacturer?: Manufacturer;
}

// Product Dimensions
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: UnitOfMeasure;
}

// Product Images
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  size?: number;
  filename?: string;
}

// Product Attachments
export interface ProductAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Product Variant Options
export interface ProductVariantOption {
  id: string;
  name: string; // e.g., "Color", "Size"
  value: string; // e.g., "Red", "Large"
  priceAdjustment?: number;
  skuSuffix?: string;
}

// Product Tags
export interface ProductTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

// Product Category
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

// Brand
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Supplier
export interface Supplier {
  id: string;
  supplierNumber: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  paymentTerms?: string;
  currency: Currency;
  taxNumber?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Manufacturer
export interface Manufacturer {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Address
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Warehouse
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: WarehouseType;
  address?: Address;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isDefault: boolean;
  capacity?: number;
  zones?: WarehouseZone[];
  createdAt: string;
  updatedAt: string;
}

// Warehouse Zone
export interface WarehouseZone {
  id: string;
  code: string;
  name: string;
  description?: string;
  capacity?: number;
  isActive: boolean;
}

// Stock Record
export interface StockRecord {
  id: string;
  productId: string;
  warehouseId: string;
  zoneId?: string;
  
  // Quantities
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number; // quantityOnHand - quantityReserved
  quantityOnOrder: number;
  quantityAllocated: number;
  
  // Valuation
  averageCost: number;
  totalValue: number;
  valuationMethod: StockValuationMethod;
  
  // Location Details
  binLocation?: string;
  shelf?: string;
  row?: string;
  
  // Stock Alerts
  reorderPoint: number;
  reorderQuantity: number;
  maximumStock?: number;
  minimumStock?: number;
  
  // Batch/Serial Tracking
  batchNumbers?: BatchRecord[];
  serialNumbers?: SerialRecord[];
  
  // Last Activity
  lastMovementDate?: string;
  lastCountDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Batch Record
export interface BatchRecord {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate?: string;
  manufactureDate?: string;
  supplierLotNumber?: string;
  receivedDate: string;
  cost: number;
  notes?: string;
}

// Serial Record
export interface SerialRecord {
  id: string;
  serialNumber: string;
  status: 'available' | 'sold' | 'reserved' | 'damaged' | 'returned';
  purchaseDate?: string;
  saleDate?: string;
  warrantyExpiryDate?: string;
  notes?: string;
}

// Stock Movement
export interface StockMovement {
  id: string;
  movementNumber: string;
  productId: string;
  warehouseId: string;
  zoneId?: string;
  
  // Movement Details
  movementType: StockMovementType;
  reason: StockMovementReason;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  
  // Before/After Quantities
  quantityBefore: number;
  quantityAfter: number;
  
  // References
  referenceNumber?: string;
  referenceType?: string; // 'purchase_order', 'sales_order', 'transfer', etc.
  referenceId?: string;
  
  // Batch/Serial
  batchNumber?: string;
  serialNumbers?: string[];
  
  // User and Date
  performedBy: string;
  performedAt: string;
  notes?: string;
  
  // Approval
  requiresApproval?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Stock Transfer
export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  
  status: 'draft' | 'pending' | 'in_transit' | 'completed' | 'cancelled';
  
  items: StockTransferItem[];
  
  // Dates
  requestedDate: string;
  scheduledDate?: string;
  shippedDate?: string;
  receivedDate?: string;
  
  // Personnel
  requestedBy: string;
  approvedBy?: string;
  shippedBy?: string;
  receivedBy?: string;
  
  // Tracking
  trackingNumber?: string;
  carrier?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Stock Transfer Item
export interface StockTransferItem {
  id: string;
  productId: string;
  requestedQuantity: number;
  shippedQuantity?: number;
  receivedQuantity?: number;
  unitCost: number;
  batchNumber?: string;
  serialNumbers?: string[];
  notes?: string;
}

// Stock Adjustment
export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  warehouseId: string;
  
  type: 'increase' | 'decrease' | 'set_quantity';
  reason: 'physical_count' | 'damaged' | 'expired' | 'theft' | 'error_correction' | 'other';
  
  items: StockAdjustmentItem[];
  
  // Approval
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  
  // Audit
  performedBy: string;
  performedAt: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Stock Adjustment Item
export interface StockAdjustmentItem {
  id: string;
  productId: string;
  currentQuantity: number;
  adjustedQuantity: number;
  variance: number;
  unitCost: number;
  totalCostImpact: number;
  reason?: string;
  batchNumber?: string;
  serialNumbers?: string[];
  notes?: string;
}

// Physical Count
export interface PhysicalCount {
  id: string;
  countNumber: string;
  warehouseId: string;
  
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  type: 'full' | 'partial' | 'cycle';
  
  // Scope
  includeAllProducts: boolean;
  productIds?: string[];
  categoryIds?: string[];
  zoneIds?: string[];
  
  // Schedule
  scheduledDate: string;
  startedDate?: string;
  completedDate?: string;
  
  // Personnel
  assignedTo: string[];
  supervisedBy?: string;
  
  // Results
  items: PhysicalCountItem[];
  totalVarianceValue?: number;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Physical Count Item
export interface PhysicalCountItem {
  id: string;
  productId: string;
  expectedQuantity: number;
  countedQuantity?: number;
  variance?: number;
  varianceValue?: number;
  unitCost: number;
  batchNumber?: string;
  serialNumbers?: string[];
  countedBy?: string;
  countedAt?: string;
  notes?: string;
  isRecounted: boolean;
}

// Low Stock Alert
export interface LowStockAlert {
  id: string;
  productId: string;
  warehouseId: string;
  currentQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  daysOfStock?: number;
  alertLevel: 'low' | 'critical' | 'out_of_stock';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
}

// Inventory Valuation
export interface InventoryValuation {
  id: string;
  valuationDate: string;
  warehouseId?: string; // null means all warehouses
  
  method: StockValuationMethod;
  currency: Currency;
  
  items: InventoryValuationItem[];
  
  totalQuantity: number;
  totalValue: number;
  
  createdBy: string;
  createdAt: string;
}

// Inventory Valuation Item
export interface InventoryValuationItem {
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  valuationMethod: StockValuationMethod;
}

// Inventory Analytics
export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  totalQuantity: number;
  
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    totalValue: number;
    percentage: number;
  }>;
  
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    productCount: number;
    totalValue: number;
    percentage: number;
  }>;
  
  topProducts: Array<{
    productId: string;
    productName: string;
    totalValue: number;
    quantity: number;
  }>;
  
  lowStockItems: number;
  outOfStockItems: number;
  overStockItems: number;
  
  fastMovingItems: Array<{
    productId: string;
    productName: string;
    movementCount: number;
    averageDailyMovement: number;
  }>;
  
  slowMovingItems: Array<{
    productId: string;
    productName: string;
    daysSinceLastMovement: number;
    currentQuantity: number;
  }>;
  
  deadStockItems: Array<{
    productId: string;
    productName: string;
    daysSinceLastMovement: number;
    currentQuantity: number;
    totalValue: number;
  }>;
  
  turnoverRatio: number;
  averageStockAge: number;
  totalStockMovements: number;
}

// Product Search Criteria
export interface ProductSearchCriteria {
  query?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  productType?: ProductType;
  status?: ProductStatus;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  lowStock?: boolean;
  trackInventory?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
}

// Stock Search Criteria
export interface StockSearchCriteria {
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  overStock?: boolean;
  quantityMin?: number;
  quantityMax?: number;
  valueMin?: number;
  valueMax?: number;
  lastMovementAfter?: string;
  lastMovementBefore?: string;
}

// Inventory Settings
export interface InventorySettings {
  defaultCurrency: Currency;
  defaultWarehouseId: string;
  defaultValuationMethod: StockValuationMethod;
  defaultReorderStrategy: ReorderStrategy;
  
  // Numbering
  autoGenerateProductNumbers: boolean;
  productNumberFormat: string;
  autoGenerateMovementNumbers: boolean;
  movementNumberFormat: string;
  
  // Stock Management
  allowNegativeStock: boolean;
  autoReorderEnabled: boolean;
  lowStockThresholdDays: number;
  deadStockThresholdDays: number;
  
  // Tracking
  requireApprovalForAdjustments: boolean;
  trackSerialNumbers: boolean;
  trackBatchNumbers: boolean;
  trackExpiryDates: boolean;
  
  // Alerts
  enableLowStockAlerts: boolean;
  enableExpiryAlerts: boolean;
  expiryAlertDays: number;
  
  // Integrations
  barcodePrefix?: string;
  weightUnit: UnitOfMeasure;
  dimensionUnit: UnitOfMeasure;
  
  // Audit
  enableStockMovementAudit: boolean;
  retainMovementHistoryDays: number;
  
  createdAt: string;
  updatedAt: string;
}

// Import/Export Types
export interface ProductImportData {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  productType: ProductType;
  categoryName?: string;
  brandName?: string;
  supplierName?: string;
  costPrice: number;
  sellingPrice: number;
  currency: Currency;
  weight?: number;
  weightUnit?: UnitOfMeasure;
  unitOfMeasure: UnitOfMeasure;
  trackInventory: boolean;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  tags?: string;
  notes?: string;
}

export interface StockImportData {
  productSku: string;
  warehouseCode: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  binLocation?: string;
}

// Report Types
export interface InventoryReport {
  id: string;
  name: string;
  type: 'stock_levels' | 'stock_movements' | 'valuation' | 'low_stock' | 'expiry' | 'analytics' | 'custom';
  parameters: {
    dateRange?: {
      start: string;
      end: string;
    };
    warehouseIds?: string[];
    categoryIds?: string[];
    productIds?: string[];
    includeZeroStock?: boolean;
    groupBy?: 'product' | 'category' | 'warehouse' | 'supplier';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
  };
  createdAt: string;
  createdBy: string;
  lastRunAt?: string;
  nextRunAt?: string;
}
