package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.SalesOrder
import kotlinx.coroutines.flow.Flow

@Dao
interface SalesOrderDao {
    
    @Query("SELECT * FROM sales_orders ORDER BY order_date DESC")
    fun getAllSalesOrders(): Flow<List<SalesOrder>>
    
    @Query("SELECT * FROM sales_orders WHERE id = :id")
    suspend fun getSalesOrderById(id: String): SalesOrder?
    
    @Query("SELECT * FROM sales_orders WHERE customer_id = :customerId ORDER BY order_date DESC")
    fun getSalesOrdersByCustomer(customerId: String): Flow<List<SalesOrder>>
    
    @Query("SELECT * FROM sales_orders WHERE status = :status ORDER BY order_date DESC")
    fun getSalesOrdersByStatus(status: String): Flow<List<SalesOrder>>
    
    @Query("SELECT * FROM sales_orders WHERE order_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    fun searchSalesOrders(query: String): Flow<List<SalesOrder>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSalesOrder(salesOrder: SalesOrder)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSalesOrders(salesOrders: List<SalesOrder>)
    
    @Update
    suspend fun updateSalesOrder(salesOrder: SalesOrder)
    
    @Delete
    suspend fun deleteSalesOrder(salesOrder: SalesOrder)
    
    @Query("DELETE FROM sales_orders WHERE id = :id")
    suspend fun deleteSalesOrderById(id: String)
    
    @Query("DELETE FROM sales_orders")
    suspend fun deleteAllSalesOrders()
    
    @Query("SELECT COUNT(*) FROM sales_orders")
    suspend fun getSalesOrderCount(): Int
    
    @Query("SELECT COUNT(*) FROM sales_orders WHERE status = :status")
    suspend fun getSalesOrderCountByStatus(status: String): Int
    
    @Query("SELECT SUM(total_amount) FROM sales_orders WHERE status = 'confirmed'")
    suspend fun getTotalRevenue(): Double?
}
