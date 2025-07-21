package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.StockAdjustmentItem
import kotlinx.coroutines.flow.Flow

@Dao
interface StockAdjustmentItemDao {

    @Query("SELECT * FROM stock_adjustment_items ORDER BY id")
    fun getAllStockAdjustmentItems(): Flow<List<StockAdjustmentItem>>

    @Query("SELECT * FROM stock_adjustment_items WHERE adjustment_id = :adjustmentId")
    fun getStockAdjustmentItemsByAdjustment(adjustmentId: String): Flow<List<StockAdjustmentItem>>

    @Query("SELECT * FROM stock_adjustment_items WHERE id = :id")
    suspend fun getStockAdjustmentItemById(id: String): StockAdjustmentItem?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockAdjustmentItem(stockAdjustmentItem: StockAdjustmentItem)

    @Update
    suspend fun updateStockAdjustmentItem(stockAdjustmentItem: StockAdjustmentItem)

    @Delete
    suspend fun deleteStockAdjustmentItem(stockAdjustmentItem: StockAdjustmentItem)
}
