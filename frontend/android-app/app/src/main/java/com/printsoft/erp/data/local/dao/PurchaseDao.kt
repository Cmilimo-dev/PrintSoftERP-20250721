package com.printsoft.erp.data.local.dao

import androidx.room.*
import com.printsoft.erp.data.models.Vendor
import com.printsoft.erp.data.models.PurchaseOrder
import com.printsoft.erp.data.models.PurchaseOrderItem
import com.printsoft.erp.data.models.PurchaseReceipt
import com.printsoft.erp.data.models.PurchaseReceiptItem
import com.printsoft.erp.data.models.PurchaseInvoice
import kotlinx.coroutines.flow.Flow

// Combined DAO interface that delegates to specific DAOs
@Dao
interface PurchaseDao {
    // Vendor operations - delegated to VendorDao
    @Query("SELECT * FROM vendors ORDER BY name ASC")
    fun getAllVendors(): Flow<List<Vendor>>
    
    @Query("SELECT * FROM vendors WHERE id = :id")
    suspend fun getVendorById(id: String): Vendor?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVendor(vendor: Vendor)
    
    @Update
    suspend fun updateVendor(vendor: Vendor)
    
    @Delete
    suspend fun deleteVendor(vendor: Vendor)
    
    // Purchase Order operations - delegated to PurchaseOrderDao
    @Query("SELECT * FROM purchase_orders ORDER BY created_at DESC")
    fun getAllPurchaseOrders(): Flow<List<PurchaseOrder>>
    
    @Query("SELECT * FROM purchase_orders WHERE id = :id")
    suspend fun getPurchaseOrderById(id: String): PurchaseOrder?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseOrder(purchaseOrder: PurchaseOrder)
    
    @Update
    suspend fun updatePurchaseOrder(purchaseOrder: PurchaseOrder)
    
    @Delete
    suspend fun deletePurchaseOrder(purchaseOrder: PurchaseOrder)
}

@Dao
interface VendorDao {
    @Query("SELECT * FROM vendors ORDER BY name ASC")
    fun getAllVendors(): Flow<List<Vendor>>

    @Query("SELECT * FROM vendors WHERE id = :id")
    suspend fun getVendorById(id: String): Vendor?

    @Query("SELECT * FROM vendors WHERE status = :status ORDER BY name ASC")
    suspend fun getVendorsByStatus(status: String): List<Vendor>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVendor(vendor: Vendor)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVendors(vendors: List<Vendor>)

    @Update
    suspend fun updateVendor(vendor: Vendor)

    @Delete
    suspend fun deleteVendor(vendor: Vendor)

    @Query("DELETE FROM vendors WHERE id = :id")
    suspend fun deleteVendorById(id: String)

    @Query("SELECT * FROM vendors WHERE name LIKE '%' || :query || '%' OR email LIKE '%' || :query || '%' OR phone LIKE '%' || :query || '%'")
    suspend fun searchVendors(query: String): List<Vendor>
}

@Dao
interface PurchaseOrderDao {
    @Query("SELECT * FROM purchase_orders ORDER BY created_at DESC")
    fun getAllPurchaseOrders(): Flow<List<PurchaseOrder>>

    @Query("SELECT * FROM purchase_orders WHERE id = :id")
    suspend fun getPurchaseOrderById(id: String): PurchaseOrder?

    @Query("SELECT * FROM purchase_orders WHERE vendor_id = :vendorId ORDER BY created_at DESC")
    suspend fun getPurchaseOrdersByVendor(vendorId: String): List<PurchaseOrder>

    @Query("SELECT * FROM purchase_orders WHERE status = :status ORDER BY created_at DESC")
    suspend fun getPurchaseOrdersByStatus(status: String): List<PurchaseOrder>

    @Query("SELECT * FROM purchase_orders WHERE approval_status = :approvalStatus ORDER BY created_at DESC")
    suspend fun getPurchaseOrdersByApprovalStatus(approvalStatus: String): List<PurchaseOrder>

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

    @Query("SELECT * FROM purchase_orders WHERE po_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    suspend fun searchPurchaseOrders(query: String): List<PurchaseOrder>
}

@Dao
interface PurchaseOrderItemDao {
    @Query("SELECT * FROM purchase_order_items WHERE purchase_order_id = :purchaseOrderId")
    suspend fun getItemsByPurchaseOrderId(purchaseOrderId: String): List<PurchaseOrderItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseOrderItem(item: PurchaseOrderItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseOrderItems(items: List<PurchaseOrderItem>)

    @Update
    suspend fun updatePurchaseOrderItem(item: PurchaseOrderItem)

    @Delete
    suspend fun deletePurchaseOrderItem(item: PurchaseOrderItem)

    @Query("DELETE FROM purchase_order_items WHERE purchase_order_id = :purchaseOrderId")
    suspend fun deleteItemsByPurchaseOrderId(purchaseOrderId: String)

    @Query("UPDATE purchase_order_items SET received_quantity = :receivedQuantity WHERE id = :itemId")
    suspend fun updateReceivedQuantity(itemId: String, receivedQuantity: Int)
}

@Dao
interface PurchaseReceiptDao {
    @Query("SELECT * FROM purchase_receipts ORDER BY created_at DESC")
    fun getAllPurchaseReceipts(): Flow<List<PurchaseReceipt>>

    @Query("SELECT * FROM purchase_receipts WHERE id = :id")
    suspend fun getPurchaseReceiptById(id: String): PurchaseReceipt?

    @Query("SELECT * FROM purchase_receipts WHERE purchase_order_id = :purchaseOrderId")
    suspend fun getReceiptsByPurchaseOrderId(purchaseOrderId: String): List<PurchaseReceipt>

    @Query("SELECT * FROM purchase_receipts WHERE vendor_id = :vendorId ORDER BY created_at DESC")
    suspend fun getReceiptsByVendor(vendorId: String): List<PurchaseReceipt>

    @Query("SELECT * FROM purchase_receipts WHERE status = :status ORDER BY created_at DESC")
    suspend fun getReceiptsByStatus(status: String): List<PurchaseReceipt>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseReceipt(receipt: PurchaseReceipt)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseReceipts(receipts: List<PurchaseReceipt>)

    @Update
    suspend fun updatePurchaseReceipt(receipt: PurchaseReceipt)

    @Delete
    suspend fun deletePurchaseReceipt(receipt: PurchaseReceipt)

    @Query("DELETE FROM purchase_receipts WHERE id = :id")
    suspend fun deletePurchaseReceiptById(id: String)

    @Query("SELECT * FROM purchase_receipts WHERE receipt_number LIKE '%' || :query || '%' OR inspection_notes LIKE '%' || :query || '%'")
    suspend fun searchPurchaseReceipts(query: String): List<PurchaseReceipt>
}

@Dao
interface PurchaseReceiptItemDao {
    @Query("SELECT * FROM purchase_receipt_items WHERE purchase_receipt_id = :receiptId")
    suspend fun getItemsByReceiptId(receiptId: String): List<PurchaseReceiptItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseReceiptItem(item: PurchaseReceiptItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseReceiptItems(items: List<PurchaseReceiptItem>)

    @Update
    suspend fun updatePurchaseReceiptItem(item: PurchaseReceiptItem)

    @Delete
    suspend fun deletePurchaseReceiptItem(item: PurchaseReceiptItem)

    @Query("DELETE FROM purchase_receipt_items WHERE purchase_receipt_id = :receiptId")
    suspend fun deleteItemsByReceiptId(receiptId: String)
}

@Dao
interface PurchaseInvoiceDao {
    @Query("SELECT * FROM purchase_invoices ORDER BY created_at DESC")
    fun getAllPurchaseInvoices(): Flow<List<PurchaseInvoice>>

    @Query("SELECT * FROM purchase_invoices WHERE id = :id")
    suspend fun getPurchaseInvoiceById(id: String): PurchaseInvoice?

    @Query("SELECT * FROM purchase_invoices WHERE purchase_order_id = :purchaseOrderId")
    suspend fun getInvoicesByPurchaseOrderId(purchaseOrderId: String): List<PurchaseInvoice>

    @Query("SELECT * FROM purchase_invoices WHERE vendor_id = :vendorId ORDER BY created_at DESC")
    suspend fun getInvoicesByVendor(vendorId: String): List<PurchaseInvoice>

    @Query("SELECT * FROM purchase_invoices WHERE status = :status ORDER BY created_at DESC")
    suspend fun getInvoicesByStatus(status: String): List<PurchaseInvoice>

    @Query("SELECT * FROM purchase_invoices WHERE due_date < :currentDate AND status NOT IN ('paid', 'cancelled')")
    suspend fun getOverdueInvoices(currentDate: String): List<PurchaseInvoice>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseInvoice(invoice: PurchaseInvoice)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseInvoices(invoices: List<PurchaseInvoice>)

    @Update
    suspend fun updatePurchaseInvoice(invoice: PurchaseInvoice)

    @Delete
    suspend fun deletePurchaseInvoice(invoice: PurchaseInvoice)

    @Query("DELETE FROM purchase_invoices WHERE id = :id")
    suspend fun deletePurchaseInvoiceById(id: String)

    @Query("SELECT * FROM purchase_invoices WHERE invoice_number LIKE '%' || :query || '%' OR vendor_invoice_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    suspend fun searchPurchaseInvoices(query: String): List<PurchaseInvoice>

    @Query("UPDATE purchase_invoices SET paid_amount = :paidAmount, status = :status WHERE id = :invoiceId")
    suspend fun updatePayment(invoiceId: String, paidAmount: Double, status: String)
}
