package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.StockAdjustment
import kotlinx.coroutines.flow.Flow

@Dao
interface StockAdjustmentDao {

    @Query("SELECT * FROM stock_adjustments ORDER BY adjustment_date DESC")
    fun getAllStockAdjustments(): Flow<List<StockAdjustment>>

    @Query("SELECT * FROM stock_adjustments WHERE id = :id")
    suspend fun getStockAdjustmentById(id: String): StockAdjustment?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockAdjustment(stockAdjustment: StockAdjustment)

    @Update
    suspend fun updateStockAdjustment(stockAdjustment: StockAdjustment)

    @Delete
    suspend fun deleteStockAdjustment(stockAdjustment: StockAdjustment)
}

