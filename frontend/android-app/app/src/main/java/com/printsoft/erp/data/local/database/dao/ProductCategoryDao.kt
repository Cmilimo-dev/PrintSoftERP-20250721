package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.ProductCategory
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductCategoryDao {

    @Query("SELECT * FROM product_categories ORDER BY name ASC")
    fun getAllProductCategories(): Flow<List<ProductCategory>>

    @Query("SELECT * FROM product_categories WHERE id = :id")
    suspend fun getProductCategoryById(id: String): ProductCategory?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProductCategory(productCategory: ProductCategory)

    @Update
    suspend fun updateProductCategory(productCategory: ProductCategory)

    @Delete
    suspend fun deleteProductCategory(productCategory: ProductCategory)
}
