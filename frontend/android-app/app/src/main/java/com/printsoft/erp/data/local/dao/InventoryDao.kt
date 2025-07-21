package com.printsoft.erp.data.local.dao

import androidx.room.*
import com.printsoft.erp.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products WHERE is_active = 1 ORDER BY name ASC")
    fun getAllProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProductById(id: String): Product?

    @Query("SELECT * FROM products WHERE item_code = :itemCode")
    suspend fun getProductByItemCode(itemCode: String): Product?

    @Query("SELECT * FROM products WHERE barcode = :barcode")
    suspend fun getProductByBarcode(barcode: String): Product?

    @Query("SELECT * FROM products WHERE category = :category AND is_active = 1")
    fun getProductsByCategory(category: String): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE current_stock <= min_stock AND is_active = 1")
    fun getLowStockProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE current_stock = 0 AND is_active = 1")
    fun getOutOfStockProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE name LIKE '%' || :query || '%' OR item_code LIKE '%' || :query || '%' AND is_active = 1")
    fun searchProducts(query: String): Flow<List<Product>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<Product>)

    @Update
    suspend fun updateProduct(product: Product)

    @Delete
    suspend fun deleteProduct(product: Product)

    @Query("UPDATE products SET current_stock = :newStock WHERE id = :productId")
    suspend fun updateStock(productId: String, newStock: Int)

    @Query("SELECT COUNT(*) FROM products WHERE is_active = 1")
    suspend fun getTotalProductCount(): Int

    @Query("SELECT SUM(current_stock * unit_cost) FROM products WHERE is_active = 1")
    suspend fun getTotalInventoryValue(): Double
}

@Dao
interface StockMovementDao {
    @Query("SELECT * FROM stock_movements ORDER BY movement_date DESC")
    fun getAllStockMovements(): Flow<List<StockMovement>>

    @Query("SELECT * FROM stock_movements WHERE product_id = :productId ORDER BY movement_date DESC")
    fun getMovementsByProduct(productId: String): Flow<List<StockMovement>>

    @Query("SELECT * FROM stock_movements WHERE movement_type = :type ORDER BY movement_date DESC")
    fun getMovementsByType(type: String): Flow<List<StockMovement>>

    @Query("SELECT * FROM stock_movements WHERE movement_date BETWEEN :startDate AND :endDate ORDER BY movement_date DESC")
    fun getMovementsByDateRange(startDate: String, endDate: String): Flow<List<StockMovement>>

    @Query("SELECT * FROM stock_movements WHERE reference_type = :referenceType AND reference_id = :referenceId")
    suspend fun getMovementsByReference(referenceType: String, referenceId: String): List<StockMovement>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockMovement(movement: StockMovement)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockMovements(movements: List<StockMovement>)

    @Delete
    suspend fun deleteStockMovement(movement: StockMovement)
}

@Dao
interface StockAdjustmentDao {
    @Query("SELECT * FROM stock_adjustments ORDER BY adjustment_date DESC")
    fun getAllAdjustments(): Flow<List<StockAdjustment>>

    @Query("SELECT * FROM stock_adjustments WHERE id = :id")
    suspend fun getAdjustmentById(id: String): StockAdjustment?

    @Query("SELECT * FROM stock_adjustments WHERE status = :status")
    fun getAdjustmentsByStatus(status: String): Flow<List<StockAdjustment>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAdjustment(adjustment: StockAdjustment)

    @Update
    suspend fun updateAdjustment(adjustment: StockAdjustment)

    @Delete
    suspend fun deleteAdjustment(adjustment: StockAdjustment)
}

@Dao
interface StockAdjustmentItemDao {
    @Query("SELECT * FROM stock_adjustment_items WHERE adjustment_id = :adjustmentId")
    fun getAdjustmentItems(adjustmentId: String): Flow<List<StockAdjustmentItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAdjustmentItem(item: StockAdjustmentItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAdjustmentItems(items: List<StockAdjustmentItem>)

    @Delete
    suspend fun deleteAdjustmentItem(item: StockAdjustmentItem)

    @Query("DELETE FROM stock_adjustment_items WHERE adjustment_id = :adjustmentId")
    suspend fun deleteAdjustmentItems(adjustmentId: String)
}

@Dao
interface WarehouseDao {
    @Query("SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name ASC")
    fun getAllWarehouses(): Flow<List<Warehouse>>

    @Query("SELECT * FROM warehouses WHERE id = :id")
    suspend fun getWarehouseById(id: String): Warehouse?

    @Query("SELECT * FROM warehouses WHERE is_default = 1 LIMIT 1")
    suspend fun getDefaultWarehouse(): Warehouse?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWarehouse(warehouse: Warehouse)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWarehouses(warehouses: List<Warehouse>)

    @Update
    suspend fun updateWarehouse(warehouse: Warehouse)

    @Delete
    suspend fun deleteWarehouse(warehouse: Warehouse)
}

@Dao
interface ProductCategoryDao {
    @Query("SELECT * FROM product_categories WHERE is_active = 1 ORDER BY name ASC")
    fun getAllCategories(): Flow<List<ProductCategory>>

    @Query("SELECT * FROM product_categories WHERE id = :id")
    suspend fun getCategoryById(id: String): ProductCategory?

    @Query("SELECT * FROM product_categories WHERE parent_category_id = :parentId")
    fun getSubCategories(parentId: String): Flow<List<ProductCategory>>

    @Query("SELECT * FROM product_categories WHERE parent_category_id IS NULL")
    fun getRootCategories(): Flow<List<ProductCategory>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategory(category: ProductCategory)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<ProductCategory>)

    @Update
    suspend fun updateCategory(category: ProductCategory)

    @Delete
    suspend fun deleteCategory(category: ProductCategory)
}

@Dao
interface StockLevelDao {
    @Query("SELECT * FROM stock_levels ORDER BY total_quantity DESC")
    fun getAllStockLevels(): Flow<List<StockLevel>>

    @Query("SELECT * FROM stock_levels WHERE product_id = :productId")
    fun getStockLevelsByProduct(productId: String): Flow<List<StockLevel>>

    @Query("SELECT * FROM stock_levels WHERE warehouse_id = :warehouseId")
    fun getStockLevelsByWarehouse(warehouseId: String): Flow<List<StockLevel>>

    @Query("SELECT * FROM stock_levels WHERE product_id = :productId AND warehouse_id = :warehouseId")
    suspend fun getStockLevel(productId: String, warehouseId: String): StockLevel?

    @Query("SELECT * FROM stock_levels WHERE total_quantity <= min_stock")
    fun getLowStockLevels(): Flow<List<StockLevel>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockLevel(stockLevel: StockLevel)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockLevels(stockLevels: List<StockLevel>)

    @Update
    suspend fun updateStockLevel(stockLevel: StockLevel)

    @Delete
    suspend fun deleteStockLevel(stockLevel: StockLevel)

    @Query("UPDATE stock_levels SET available_quantity = :quantity, total_quantity = :quantity WHERE product_id = :productId AND warehouse_id = :warehouseId")
    suspend fun updateQuantity(productId: String, warehouseId: String, quantity: Int)
}
