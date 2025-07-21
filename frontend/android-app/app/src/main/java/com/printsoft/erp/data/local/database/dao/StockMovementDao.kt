package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.StockMovement
import kotlinx.coroutines.flow.Flow

@Dao
interface StockMovementDao {
    
    @Query("SELECT * FROM stock_movements ORDER BY date DESC")
    fun getAllStockMovements(): Flow<List<StockMovement>>
    
    @Query("SELECT * FROM stock_movements WHERE id = :id")
    suspend fun getStockMovementById(id: String): StockMovement?
    
    @Query("SELECT * FROM stock_movements WHERE item_code = :itemCode ORDER BY date DESC")
    fun getStockMovementsByProduct(itemCode: String): Flow<List<StockMovement>>
    
    @Query("SELECT * FROM stock_movements WHERE movement_type = :movementType ORDER BY date DESC")
    fun getStockMovementsByType(movementType: String): Flow<List<StockMovement>>
    
    @Query("SELECT * FROM stock_movements WHERE reference_document LIKE '%' || :query || '%' OR reason LIKE '%' || :query || '%'")
    fun searchStockMovements(query: String): Flow<List<StockMovement>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockMovement(stockMovement: StockMovement)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStockMovements(stockMovements: List<StockMovement>)
    
    @Update
    suspend fun updateStockMovement(stockMovement: StockMovement)
    
    @Delete
    suspend fun deleteStockMovement(stockMovement: StockMovement)
    
    @Query("DELETE FROM stock_movements WHERE id = :id")
    suspend fun deleteStockMovementById(id: String)
    
    @Query("DELETE FROM stock_movements")
    suspend fun deleteAllStockMovements()
    
    @Query("SELECT COUNT(*) FROM stock_movements")
    suspend fun getStockMovementCount(): Int
}
