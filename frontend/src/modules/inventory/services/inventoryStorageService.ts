// Inventory Module Independent Storage Service
import { 
  BaseProduct, 
  ProductCategory, 
  Brand, 
  Supplier, 
  Manufacturer, 
  Warehouse, 
  StockRecord, 
  StockMovement, 
  StockTransfer, 
  StockAdjustment, 
  PhysicalCount, 
  LowStockAlert, 
  InventoryValuation, 
  InventoryAnalytics,
  ProductSearchCriteria,
  StockSearchCriteria,
  InventorySettings,
  ProductImportData,
  StockImportData,
  InventoryReport,
  ProductTag,
  WarehouseZone,
  BatchRecord,
  SerialRecord,
  Currency,
  UnitOfMeasure,
  ProductType,
  ProductStatus,
  StockMovementType,
  StockMovementReason,
  WarehouseType
} from '../types/inventoryTypes';

export class InventoryStorageService {
  // Storage Keys
  private static readonly PRODUCTS_KEY = 'inventory_products';
  private static readonly CATEGORIES_KEY = 'inventory_categories';
  private static readonly BRANDS_KEY = 'inventory_brands';
  private static readonly SUPPLIERS_KEY = 'inventory_suppliers';
  private static readonly MANUFACTURERS_KEY = 'inventory_manufacturers';
  private static readonly WAREHOUSES_KEY = 'inventory_warehouses';
  private static readonly STOCK_RECORDS_KEY = 'inventory_stock_records';
  private static readonly STOCK_MOVEMENTS_KEY = 'inventory_stock_movements';
  private static readonly STOCK_TRANSFERS_KEY = 'inventory_stock_transfers';
  private static readonly STOCK_ADJUSTMENTS_KEY = 'inventory_stock_adjustments';
  private static readonly PHYSICAL_COUNTS_KEY = 'inventory_physical_counts';
  private static readonly LOW_STOCK_ALERTS_KEY = 'inventory_low_stock_alerts';
  private static readonly VALUATIONS_KEY = 'inventory_valuations';
  private static readonly SETTINGS_KEY = 'inventory_settings';
  private static readonly REPORTS_KEY = 'inventory_reports';
  private static readonly TAGS_KEY = 'inventory_tags';
  private static readonly ACTIVITY_LOG_KEY = 'inventory_activity_log';

  // Activity Log
  private static logActivity(action: string, entityType: string, entityId: string, details?: any): void {
    try {
      const activities = this.getActivityLog();
      const activity = {
        id: this.generateId(),
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date().toISOString(),
        user: 'current_user' // Replace with actual user context
      };
      activities.push(activity);
      
      // Keep only last 1000 activities
      if (activities.length > 1000) {
        activities.splice(0, activities.length - 1000);
      }
      
      localStorage.setItem(this.ACTIVITY_LOG_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error logging inventory activity:', error);
    }
  }

  private static getActivityLog(): any[] {
    try {
      const log = localStorage.getItem(this.ACTIVITY_LOG_KEY);
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('Error retrieving inventory activity log:', error);
      return [];
    }
  }

  // Utility Functions
  private static generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      throw new Error(`Failed to save ${key} data`);
    }
  }

  private static getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving ${key} from storage:`, error);
      return [];
    }
  }

  // =================
  // PRODUCT MANAGEMENT
  // =================

  static getAllProducts(): BaseProduct[] {
    return this.getFromStorage<BaseProduct>(this.PRODUCTS_KEY);
  }

  static getProductById(id: string): BaseProduct | null {
    const products = this.getAllProducts();
    return products.find(product => product.id === id) || null;
  }

  static getProductBySku(sku: string): BaseProduct | null {
    const products = this.getAllProducts();
    return products.find(product => product.sku === sku) || null;
  }

  static getProductByBarcode(barcode: string): BaseProduct | null {
    const products = this.getAllProducts();
    return products.find(product => product.barcode === barcode) || null;
  }

  static saveProduct(product: BaseProduct): BaseProduct {
    try {
      const products = this.getAllProducts();
      const now = new Date().toISOString();
      
      const existingIndex = products.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = { ...product, updatedAt: now };
        this.logActivity('UPDATE', 'product', product.id, { name: product.name, sku: product.sku });
      } else {
        const newProduct = { 
          ...product, 
          id: product.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        products.push(newProduct);
        this.logActivity('CREATE', 'product', newProduct.id, { name: newProduct.name, sku: newProduct.sku });
        product = newProduct;
      }
      
      this.saveToStorage(this.PRODUCTS_KEY, products);
      return product;
    } catch (error) {
      console.error('Error saving product:', error);
      throw new Error('Failed to save product');
    }
  }

  static deleteProduct(id: string): boolean {
    try {
      const products = this.getAllProducts();
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex >= 0) {
        const product = products[productIndex];
        products.splice(productIndex, 1);
        this.saveToStorage(this.PRODUCTS_KEY, products);
        this.logActivity('DELETE', 'product', id, { name: product.name, sku: product.sku });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  static searchProducts(criteria: ProductSearchCriteria): BaseProduct[] {
    try {
      let products = this.getAllProducts();

      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        products = products.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.barcode?.toLowerCase().includes(query)
        );
      }

      if (criteria.sku) {
        products = products.filter(product => 
          product.sku.toLowerCase().includes(criteria.sku!.toLowerCase())
        );
      }

      if (criteria.barcode) {
        products = products.filter(product => 
          product.barcode?.toLowerCase().includes(criteria.barcode!.toLowerCase())
        );
      }

      if (criteria.categoryId) {
        products = products.filter(product => product.categoryId === criteria.categoryId);
      }

      if (criteria.brandId) {
        products = products.filter(product => product.brandId === criteria.brandId);
      }

      if (criteria.supplierId) {
        products = products.filter(product => product.supplierId === criteria.supplierId);
      }

      if (criteria.productType) {
        products = products.filter(product => product.productType === criteria.productType);
      }

      if (criteria.status) {
        products = products.filter(product => product.status === criteria.status);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        products = products.filter(product =>
          criteria.tags!.some(tag => 
            product.tags.some(productTag => productTag.name.toLowerCase() === tag.toLowerCase())
          )
        );
      }

      if (criteria.priceMin !== undefined) {
        products = products.filter(product => product.sellingPrice >= criteria.priceMin!);
      }

      if (criteria.priceMax !== undefined) {
        products = products.filter(product => product.sellingPrice <= criteria.priceMax!);
      }

      if (criteria.trackInventory !== undefined) {
        products = products.filter(product => product.trackInventory === criteria.trackInventory);
      }

      if (criteria.createdAfter) {
        products = products.filter(product => product.createdAt >= criteria.createdAfter!);
      }

      if (criteria.createdBefore) {
        products = products.filter(product => product.createdAt <= criteria.createdBefore!);
      }

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // =================
  // CATEGORY MANAGEMENT
  // =================

  static getAllCategories(): ProductCategory[] {
    return this.getFromStorage<ProductCategory>(this.CATEGORIES_KEY);
  }

  static getCategoryById(id: string): ProductCategory | null {
    const categories = this.getAllCategories();
    return categories.find(category => category.id === id) || null;
  }

  static saveCategory(category: ProductCategory): ProductCategory {
    try {
      const categories = this.getAllCategories();
      const now = new Date().toISOString();
      
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = { ...category, updatedAt: now };
        this.logActivity('UPDATE', 'category', category.id, { name: category.name });
      } else {
        const newCategory = { 
          ...category, 
          id: category.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        categories.push(newCategory);
        this.logActivity('CREATE', 'category', newCategory.id, { name: newCategory.name });
        category = newCategory;
      }
      
      this.saveToStorage(this.CATEGORIES_KEY, categories);
      return category;
    } catch (error) {
      console.error('Error saving category:', error);
      throw new Error('Failed to save category');
    }
  }

  static deleteCategory(id: string): boolean {
    try {
      const categories = this.getAllCategories();
      const categoryIndex = categories.findIndex(c => c.id === id);
      
      if (categoryIndex >= 0) {
        const category = categories[categoryIndex];
        categories.splice(categoryIndex, 1);
        this.saveToStorage(this.CATEGORIES_KEY, categories);
        this.logActivity('DELETE', 'category', id, { name: category.name });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // =================
  // BRAND MANAGEMENT
  // =================

  static getAllBrands(): Brand[] {
    return this.getFromStorage<Brand>(this.BRANDS_KEY);
  }

  static getBrandById(id: string): Brand | null {
    const brands = this.getAllBrands();
    return brands.find(brand => brand.id === id) || null;
  }

  static saveBrand(brand: Brand): Brand {
    try {
      const brands = this.getAllBrands();
      const now = new Date().toISOString();
      
      const existingIndex = brands.findIndex(b => b.id === brand.id);
      
      if (existingIndex >= 0) {
        brands[existingIndex] = { ...brand, updatedAt: now };
        this.logActivity('UPDATE', 'brand', brand.id, { name: brand.name });
      } else {
        const newBrand = { 
          ...brand, 
          id: brand.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        brands.push(newBrand);
        this.logActivity('CREATE', 'brand', newBrand.id, { name: newBrand.name });
        brand = newBrand;
      }
      
      this.saveToStorage(this.BRANDS_KEY, brands);
      return brand;
    } catch (error) {
      console.error('Error saving brand:', error);
      throw new Error('Failed to save brand');
    }
  }

  static deleteBrand(id: string): boolean {
    try {
      const brands = this.getAllBrands();
      const brandIndex = brands.findIndex(b => b.id === id);
      
      if (brandIndex >= 0) {
        const brand = brands[brandIndex];
        brands.splice(brandIndex, 1);
        this.saveToStorage(this.BRANDS_KEY, brands);
        this.logActivity('DELETE', 'brand', id, { name: brand.name });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw new Error('Failed to delete brand');
    }
  }

  // =================
  // SUPPLIER MANAGEMENT
  // =================

  static getAllSuppliers(): Supplier[] {
    return this.getFromStorage<Supplier>(this.SUPPLIERS_KEY);
  }

  static getSupplierById(id: string): Supplier | null {
    const suppliers = this.getAllSuppliers();
    return suppliers.find(supplier => supplier.id === id) || null;
  }

  static saveSupplier(supplier: Supplier): Supplier {
    try {
      const suppliers = this.getAllSuppliers();
      const now = new Date().toISOString();
      
      const existingIndex = suppliers.findIndex(s => s.id === supplier.id);
      
      if (existingIndex >= 0) {
        suppliers[existingIndex] = { ...supplier, updatedAt: now };
        this.logActivity('UPDATE', 'supplier', supplier.id, { name: supplier.name });
      } else {
        const newSupplier = { 
          ...supplier, 
          id: supplier.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        suppliers.push(newSupplier);
        this.logActivity('CREATE', 'supplier', newSupplier.id, { name: newSupplier.name });
        supplier = newSupplier;
      }
      
      this.saveToStorage(this.SUPPLIERS_KEY, suppliers);
      return supplier;
    } catch (error) {
      console.error('Error saving supplier:', error);
      throw new Error('Failed to save supplier');
    }
  }

  static deleteSupplier(id: string): boolean {
    try {
      const suppliers = this.getAllSuppliers();
      const supplierIndex = suppliers.findIndex(s => s.id === id);
      
      if (supplierIndex >= 0) {
        const supplier = suppliers[supplierIndex];
        suppliers.splice(supplierIndex, 1);
        this.saveToStorage(this.SUPPLIERS_KEY, suppliers);
        this.logActivity('DELETE', 'supplier', id, { name: supplier.name });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error('Failed to delete supplier');
    }
  }

  // =================
  // WAREHOUSE MANAGEMENT
  // =================

  static getAllWarehouses(): Warehouse[] {
    return this.getFromStorage<Warehouse>(this.WAREHOUSES_KEY);
  }

  static getWarehouseById(id: string): Warehouse | null {
    const warehouses = this.getAllWarehouses();
    return warehouses.find(warehouse => warehouse.id === id) || null;
  }

  static saveWarehouse(warehouse: Warehouse): Warehouse {
    try {
      const warehouses = this.getAllWarehouses();
      const now = new Date().toISOString();
      
      const existingIndex = warehouses.findIndex(w => w.id === warehouse.id);
      
      if (existingIndex >= 0) {
        warehouses[existingIndex] = { ...warehouse, updatedAt: now };
        this.logActivity('UPDATE', 'warehouse', warehouse.id, { name: warehouse.name });
      } else {
        const newWarehouse = { 
          ...warehouse, 
          id: warehouse.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        warehouses.push(newWarehouse);
        this.logActivity('CREATE', 'warehouse', newWarehouse.id, { name: newWarehouse.name });
        warehouse = newWarehouse;
      }
      
      this.saveToStorage(this.WAREHOUSES_KEY, warehouses);
      return warehouse;
    } catch (error) {
      console.error('Error saving warehouse:', error);
      throw new Error('Failed to save warehouse');
    }
  }

  static deleteWarehouse(id: string): boolean {
    try {
      const warehouses = this.getAllWarehouses();
      const warehouseIndex = warehouses.findIndex(w => w.id === id);
      
      if (warehouseIndex >= 0) {
        const warehouse = warehouses[warehouseIndex];
        warehouses.splice(warehouseIndex, 1);
        this.saveToStorage(this.WAREHOUSES_KEY, warehouses);
        this.logActivity('DELETE', 'warehouse', id, { name: warehouse.name });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw new Error('Failed to delete warehouse');
    }
  }

  // =================
  // STOCK MANAGEMENT
  // =================

  static getAllStockRecords(): StockRecord[] {
    return this.getFromStorage<StockRecord>(this.STOCK_RECORDS_KEY);
  }

  static getStockRecordById(id: string): StockRecord | null {
    const records = this.getAllStockRecords();
    return records.find(record => record.id === id) || null;
  }

  static getStockByProductAndWarehouse(productId: string, warehouseId: string): StockRecord | null {
    const records = this.getAllStockRecords();
    return records.find(record => 
      record.productId === productId && record.warehouseId === warehouseId
    ) || null;
  }

  static saveStockRecord(stockRecord: StockRecord): StockRecord {
    try {
      const records = this.getAllStockRecords();
      const now = new Date().toISOString();
      
      const existingIndex = records.findIndex(r => r.id === stockRecord.id);
      
      if (existingIndex >= 0) {
        records[existingIndex] = { ...stockRecord, updatedAt: now };
        this.logActivity('UPDATE', 'stock_record', stockRecord.id, { 
          productId: stockRecord.productId,
          warehouseId: stockRecord.warehouseId,
          quantity: stockRecord.quantityOnHand
        });
      } else {
        const newRecord = { 
          ...stockRecord, 
          id: stockRecord.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        records.push(newRecord);
        this.logActivity('CREATE', 'stock_record', newRecord.id, { 
          productId: newRecord.productId,
          warehouseId: newRecord.warehouseId,
          quantity: newRecord.quantityOnHand
        });
        stockRecord = newRecord;
      }
      
      this.saveToStorage(this.STOCK_RECORDS_KEY, records);
      return stockRecord;
    } catch (error) {
      console.error('Error saving stock record:', error);
      throw new Error('Failed to save stock record');
    }
  }

  static searchStock(criteria: StockSearchCriteria): StockRecord[] {
    try {
      let records = this.getAllStockRecords();

      if (criteria.warehouseId) {
        records = records.filter(record => record.warehouseId === criteria.warehouseId);
      }

      if (criteria.productId) {
        records = records.filter(record => record.productId === criteria.productId);
      }

      if (criteria.lowStock) {
        records = records.filter(record => 
          record.quantityOnHand <= record.reorderPoint
        );
      }

      if (criteria.outOfStock) {
        records = records.filter(record => record.quantityOnHand <= 0);
      }

      if (criteria.quantityMin !== undefined) {
        records = records.filter(record => record.quantityOnHand >= criteria.quantityMin!);
      }

      if (criteria.quantityMax !== undefined) {
        records = records.filter(record => record.quantityOnHand <= criteria.quantityMax!);
      }

      return records;
    } catch (error) {
      console.error('Error searching stock:', error);
      return [];
    }
  }

  // =================
  // STOCK MOVEMENTS
  // =================

  static getAllStockMovements(): StockMovement[] {
    return this.getFromStorage<StockMovement>(this.STOCK_MOVEMENTS_KEY);
  }

  static saveStockMovement(movement: StockMovement): StockMovement {
    try {
      const movements = this.getAllStockMovements();
      const now = new Date().toISOString();
      
      const newMovement = { 
        ...movement, 
        id: movement.id || this.generateId(),
        createdAt: now,
        updatedAt: now 
      };
      
      movements.push(newMovement);
      this.saveToStorage(this.STOCK_MOVEMENTS_KEY, movements);
      
      this.logActivity('CREATE', 'stock_movement', newMovement.id, { 
        productId: newMovement.productId,
        type: newMovement.movementType,
        quantity: newMovement.quantity
      });
      
      return newMovement;
    } catch (error) {
      console.error('Error saving stock movement:', error);
      throw new Error('Failed to save stock movement');
    }
  }

  // =================
  // ANALYTICS
  // =================

  static calculateInventoryAnalytics(): InventoryAnalytics {
    try {
      const products = this.getAllProducts();
      const stockRecords = this.getAllStockRecords();
      const categories = this.getAllCategories();
      const warehouses = this.getAllWarehouses();
      const movements = this.getAllStockMovements();

      const totalProducts = products.length;
      let totalValue = 0;
      let totalQuantity = 0;

      // Calculate totals
      stockRecords.forEach(record => {
        totalValue += record.totalValue;
        totalQuantity += record.quantityOnHand;
      });

      // Analytics by category
      const byCategory = categories.map(category => {
        const categoryProducts = products.filter(p => p.categoryId === category.id);
        const categoryStocks = stockRecords.filter(record => 
          categoryProducts.some(p => p.id === record.productId)
        );
        const categoryValue = categoryStocks.reduce((sum, record) => sum + record.totalValue, 0);
        
        return {
          categoryId: category.id,
          categoryName: category.name,
          productCount: categoryProducts.length,
          totalValue: categoryValue,
          percentage: totalValue > 0 ? (categoryValue / totalValue) * 100 : 0
        };
      });

      // Analytics by warehouse
      const byWarehouse = warehouses.map(warehouse => {
        const warehouseStocks = stockRecords.filter(record => record.warehouseId === warehouse.id);
        const warehouseValue = warehouseStocks.reduce((sum, record) => sum + record.totalValue, 0);
        
        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          productCount: warehouseStocks.length,
          totalValue: warehouseValue,
          percentage: totalValue > 0 ? (warehouseValue / totalValue) * 100 : 0
        };
      });

      // Top products by value
      const topProducts = stockRecords
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10)
        .map(record => {
          const product = products.find(p => p.id === record.productId);
          return {
            productId: record.productId,
            productName: product?.name || 'Unknown Product',
            totalValue: record.totalValue,
            quantity: record.quantityOnHand
          };
        });

      // Stock level analysis
      const lowStockItems = stockRecords.filter(record => 
        record.quantityOnHand <= record.reorderPoint && record.quantityOnHand > 0
      ).length;

      const outOfStockItems = stockRecords.filter(record => 
        record.quantityOnHand <= 0
      ).length;

      const overStockItems = stockRecords.filter(record => 
        record.maximumStock && record.quantityOnHand > record.maximumStock
      ).length;

      // Movement analysis (simplified)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentMovements = movements.filter(m => 
        new Date(m.performedAt) >= thirtyDaysAgo
      );

      const productMovements = new Map<string, number>();
      recentMovements.forEach(movement => {
        const count = productMovements.get(movement.productId) || 0;
        productMovements.set(movement.productId, count + 1);
      });

      const fastMovingItems = Array.from(productMovements.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([productId, movementCount]) => {
          const product = products.find(p => p.id === productId);
          return {
            productId,
            productName: product?.name || 'Unknown Product',
            movementCount,
            averageDailyMovement: movementCount / 30
          };
        });

      const slowMovingItems = stockRecords
        .filter(record => {
          const lastMovement = movements
            .filter(m => m.productId === record.productId)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
          
          if (!lastMovement) return true;
          
          const daysSince = Math.floor(
            (new Date().getTime() - new Date(lastMovement.performedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince > 60;
        })
        .slice(0, 10)
        .map(record => {
          const product = products.find(p => p.id === record.productId);
          const lastMovement = movements
            .filter(m => m.productId === record.productId)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
          
          const daysSince = lastMovement ? 
            Math.floor((new Date().getTime() - new Date(lastMovement.performedAt).getTime()) / (1000 * 60 * 60 * 24)) : 
            365;

          return {
            productId: record.productId,
            productName: product?.name || 'Unknown Product',
            daysSinceLastMovement: daysSince,
            currentQuantity: record.quantityOnHand
          };
        });

      const deadStockItems = stockRecords
        .filter(record => {
          const lastMovement = movements
            .filter(m => m.productId === record.productId)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
          
          if (!lastMovement) return record.quantityOnHand > 0;
          
          const daysSince = Math.floor(
            (new Date().getTime() - new Date(lastMovement.performedAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSince > 180 && record.quantityOnHand > 0;
        })
        .slice(0, 10)
        .map(record => {
          const product = products.find(p => p.id === record.productId);
          const lastMovement = movements
            .filter(m => m.productId === record.productId)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
          
          const daysSince = lastMovement ? 
            Math.floor((new Date().getTime() - new Date(lastMovement.performedAt).getTime()) / (1000 * 60 * 60 * 24)) : 
            365;

          return {
            productId: record.productId,
            productName: product?.name || 'Unknown Product',
            daysSinceLastMovement: daysSince,
            currentQuantity: record.quantityOnHand,
            totalValue: record.totalValue
          };
        });

      return {
        totalProducts,
        totalValue,
        totalQuantity,
        byCategory,
        byWarehouse,
        topProducts,
        lowStockItems,
        outOfStockItems,
        overStockItems,
        fastMovingItems,
        slowMovingItems,
        deadStockItems,
        turnoverRatio: totalValue > 0 ? (recentMovements.length / totalValue) * 365 : 0,
        averageStockAge: 45, // Simplified calculation
        totalStockMovements: movements.length
      };
    } catch (error) {
      console.error('Error calculating inventory analytics:', error);
      return {
        totalProducts: 0,
        totalValue: 0,
        totalQuantity: 0,
        byCategory: [],
        byWarehouse: [],
        topProducts: [],
        lowStockItems: 0,
        outOfStockItems: 0,
        overStockItems: 0,
        fastMovingItems: [],
        slowMovingItems: [],
        deadStockItems: [],
        turnoverRatio: 0,
        averageStockAge: 0,
        totalStockMovements: 0
      };
    }
  }

  // =================
  // SETTINGS
  // =================

  static getSettings(): InventorySettings | null {
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error retrieving inventory settings:', error);
      return null;
    }
  }

  static saveSettings(settings: InventorySettings): void {
    try {
      const now = new Date().toISOString();
      const settingsWithTimestamp = {
        ...settings,
        updatedAt: now,
        createdAt: settings.createdAt || now
      };
      
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settingsWithTimestamp));
      this.logActivity('UPDATE', 'settings', 'inventory_settings', settings);
    } catch (error) {
      console.error('Error saving inventory settings:', error);
      throw new Error('Failed to save inventory settings');
    }
  }

  // =================
  // IMPORT/EXPORT
  // =================

  static importProducts(data: ProductImportData[]): { success: number; errors: string[] } {
    const results = { success: 0, errors: [] as string[] };
    
    try {
      data.forEach((item, index) => {
        try {
          // Validate required fields
          if (!item.sku || !item.name) {
            results.errors.push(`Row ${index + 1}: SKU and name are required`);
            return;
          }

          // Check for duplicate SKU
          if (this.getProductBySku(item.sku)) {
            results.errors.push(`Row ${index + 1}: Product with SKU ${item.sku} already exists`);
            return;
          }

          // Create product
          const product: BaseProduct = {
            id: this.generateId(),
            sku: item.sku,
            barcode: item.barcode,
            name: item.name,
            description: item.description,
            productType: item.productType,
            status: 'active' as ProductStatus,
            categoryId: undefined, // Would need to resolve from categoryName
            brandId: undefined, // Would need to resolve from brandName
            supplierId: undefined, // Would need to resolve from supplierName
            tags: item.tags ? item.tags.split(',').map(tag => ({
              id: this.generateId(),
              name: tag.trim(),
              color: '#007bff'
            })) : [],
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            currency: item.currency,
            taxable: true,
            weight: item.weight,
            weightUnit: item.weightUnit,
            unitOfMeasure: item.unitOfMeasure,
            trackInventory: item.trackInventory,
            allowBackorders: false,
            requiresSerialNumber: false,
            requiresBatchNumber: false,
            reorderPoint: item.reorderPoint,
            reorderQuantity: item.reorderQuantity,
            reorderStrategy: 'manual',
            leadTimeDays: item.leadTimeDays,
            images: [],
            attachments: [],
            isVariant: false,
            notes: item.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          this.saveProduct(product);
          results.success++;
        } catch (error) {
          results.errors.push(`Row ${index + 1}: ${error.message}`);
        }
      });
    } catch (error) {
      results.errors.push(`Import failed: ${error.message}`);
    }

    return results;
  }

  static exportProducts(): BaseProduct[] {
    return this.getAllProducts();
  }

  static exportStockRecords(): StockRecord[] {
    return this.getAllStockRecords();
  }

  static exportStockMovements(startDate?: string, endDate?: string): StockMovement[] {
    let movements = this.getAllStockMovements();
    
    if (startDate) {
      movements = movements.filter(m => m.performedAt >= startDate);
    }
    
    if (endDate) {
      movements = movements.filter(m => m.performedAt <= endDate);
    }
    
    return movements;
  }

  // =================
  // UTILITY FUNCTIONS
  // =================

  static clearAllData(): void {
    try {
      const keys = [
        this.PRODUCTS_KEY,
        this.CATEGORIES_KEY,
        this.BRANDS_KEY,
        this.SUPPLIERS_KEY,
        this.MANUFACTURERS_KEY,
        this.WAREHOUSES_KEY,
        this.STOCK_RECORDS_KEY,
        this.STOCK_MOVEMENTS_KEY,
        this.STOCK_TRANSFERS_KEY,
        this.STOCK_ADJUSTMENTS_KEY,
        this.PHYSICAL_COUNTS_KEY,
        this.LOW_STOCK_ALERTS_KEY,
        this.VALUATIONS_KEY,
        this.REPORTS_KEY,
        this.TAGS_KEY,
        this.ACTIVITY_LOG_KEY
      ];

      keys.forEach(key => localStorage.removeItem(key));
      this.logActivity('CLEAR_ALL', 'system', 'inventory', {});
      console.log('All inventory data cleared successfully');
    } catch (error) {
      console.error('Error clearing inventory data:', error);
      throw new Error('Failed to clear inventory data');
    }
  }

  static getStorageStats(): {
    products: number;
    categories: number;
    brands: number;
    suppliers: number;
    warehouses: number;
    stockRecords: number;
    movements: number;
    totalActivities: number;
  } {
    try {
      return {
        products: this.getAllProducts().length,
        categories: this.getAllCategories().length,
        brands: this.getAllBrands().length,
        suppliers: this.getAllSuppliers().length,
        warehouses: this.getAllWarehouses().length,
        stockRecords: this.getAllStockRecords().length,
        movements: this.getAllStockMovements().length,
        totalActivities: this.getActivityLog().length
      };
    } catch (error) {
      console.error('Error getting inventory storage stats:', error);
      return {
        products: 0,
        categories: 0,
        brands: 0,
        suppliers: 0,
        warehouses: 0,
        stockRecords: 0,
        movements: 0,
        totalActivities: 0
      };
    }
  }
}
