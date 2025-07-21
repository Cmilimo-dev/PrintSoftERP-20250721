package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.Product
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<Product>>
    
    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProductById(id: String): Product?
    
    @Query("SELECT * FROM products WHERE item_code = :itemCode")
    suspend fun getProductByItemCode(itemCode: String): Product?
    
    @Query("SELECT * FROM products WHERE name LIKE '%' || :query || '%' OR item_code LIKE '%' || :query || '%' OR description LIKE '%' || :query || '%'")
    fun searchProducts(query: String): Flow<List<Product>>
    
    @Query("SELECT * FROM products WHERE category = :category")
    fun getProductsByCategory(category: String): Flow<List<Product>>
    
    @Query("SELECT * FROM products WHERE current_stock <= min_stock")
    fun getLowStockProducts(): Flow<List<Product>>
    
    @Query("SELECT * FROM products WHERE current_stock = 0")
    fun getOutOfStockProducts(): Flow<List<Product>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<Product>)
    
    @Update
    suspend fun updateProduct(product: Product)
    
    @Delete
    suspend fun deleteProduct(product: Product)
    
    @Query("DELETE FROM products WHERE id = :id")
    suspend fun deleteProductById(id: String)
    
    @Query("DELETE FROM products")
    suspend fun deleteAllProducts()
    
    @Query("SELECT COUNT(*) FROM products")
    suspend fun getProductCount(): Int
    
    @Query("SELECT COUNT(*) FROM products WHERE current_stock <= min_stock")
    suspend fun getLowStockCount(): Int
    
    @Query("SELECT COUNT(*) FROM products WHERE current_stock = 0")
    suspend fun getOutOfStockCount(): Int
    
    @Query("SELECT SUM(current_stock * unit_cost) FROM products")
    suspend fun getTotalInventoryValue(): Double?
    
    @Query("SELECT DISTINCT category FROM products ORDER BY category")
    suspend fun getAllCategories(): List<String>
}
