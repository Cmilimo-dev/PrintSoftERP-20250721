package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.StockAlert
import kotlinx.coroutines.flow.Flow

@Dao
interface StockLevelDao {

    @Query("SELECT * FROM stock_alerts ORDER BY alert_date DESC")
    fun getAllStockAlerts(): Flow<List<StockAlert>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockAlert(stockAlert: StockAlert)

    @Update
    suspend fun updateStockAlert(stockAlert: StockAlert)

    @Delete
    suspend fun deleteStockAlert(stockAlert: StockAlert)
}
