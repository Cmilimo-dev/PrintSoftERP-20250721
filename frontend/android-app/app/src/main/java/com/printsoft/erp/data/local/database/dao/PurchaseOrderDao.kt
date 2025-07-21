package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.PurchaseOrder
import kotlinx.coroutines.flow.Flow

@Dao
interface PurchaseOrderDao {
    
    @Query("SELECT * FROM purchase_orders ORDER BY order_date DESC")
    fun getAllPurchaseOrders(): Flow<List<PurchaseOrder>>
    
    @Query("SELECT * FROM purchase_orders WHERE id = :id")
    suspend fun getPurchaseOrderById(id: String): PurchaseOrder?
    
    @Query("SELECT * FROM purchase_orders WHERE vendor_id = :vendorId ORDER BY order_date DESC")
    fun getPurchaseOrdersByVendor(vendorId: String): Flow<List<PurchaseOrder>>
    
    @Query("SELECT * FROM purchase_orders WHERE status = :status ORDER BY order_date DESC")
    fun getPurchaseOrdersByStatus(status: String): Flow<List<PurchaseOrder>>
    
    @Query("SELECT * FROM purchase_orders WHERE po_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    fun searchPurchaseOrders(query: String): Flow<List<PurchaseOrder>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseOrder(purchaseOrder: PurchaseOrder)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseOrders(purchaseOrders: List<PurchaseOrder>)
    
    @Update
    suspend fun updatePurchaseOrder(purchaseOrder: PurchaseOrder)
    
    @Delete
    suspend fun deletePurchaseOrder(purchaseOrder: PurchaseOrder)
    
    @Query("DELETE FROM purchase_orders WHERE id = :id")
    suspend fun deletePurchaseOrderById(id: String)
    
    @Query("DELETE FROM purchase_orders")
    suspend fun deleteAllPurchaseOrders()
    
    @Query("SELECT COUNT(*) FROM purchase_orders")
    suspend fun getPurchaseOrderCount(): Int
    
    @Query("SELECT COUNT(*) FROM purchase_orders WHERE status = :status")
    suspend fun getPurchaseOrderCountByStatus(status: String): Int
}
