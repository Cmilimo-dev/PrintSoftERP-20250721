package com.printsoft.erp.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
// Use specific imports to avoid ambiguity
import com.printsoft.erp.data.models.SalesOrder
import com.printsoft.erp.data.models.SalesOrderItem
import com.printsoft.erp.data.models.Quotation
import com.printsoft.erp.data.models.QuotationItem
import com.printsoft.erp.data.models.Invoice
import com.printsoft.erp.data.models.InvoiceItem
import com.printsoft.erp.data.models.DeliveryNote
import com.printsoft.erp.data.models.DeliveryNoteItem

// Combined DAO interface for simplified repository access
@Dao
interface SalesDao {
    // Sales Order operations
    @Query("SELECT * FROM sales_orders ORDER BY created_at DESC")
    fun getAllSalesOrders(): Flow<List<SalesOrder>>
    
    @Query("SELECT * FROM sales_orders WHERE id = :id")
    suspend fun getSalesOrderById(id: String): SalesOrder?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSalesOrder(salesOrder: SalesOrder)
    
    @Update
    suspend fun updateSalesOrder(salesOrder: SalesOrder)
    
    @Delete
    suspend fun deleteSalesOrder(salesOrder: SalesOrder)
    
    // Quotation operations  
    @Query("SELECT * FROM quotations ORDER BY created_at DESC")
    fun getAllQuotations(): Flow<List<Quotation>>
    
    @Query("SELECT * FROM quotations WHERE id = :id")
    suspend fun getQuotationById(id: String): Quotation?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotation(quotation: Quotation)
    
    @Update
    suspend fun updateQuotation(quotation: Quotation)
    
    @Delete
    suspend fun deleteQuotation(quotation: Quotation)
    
    // Invoice operations
    @Query("SELECT * FROM invoices ORDER BY created_at DESC")
    suspend fun getAllInvoices(): List<Invoice>
    
    @Query("SELECT * FROM invoices WHERE id = :id")
    suspend fun getInvoiceById(id: String): Invoice?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoice(invoice: Invoice)
    
    @Update
    suspend fun updateInvoice(invoice: Invoice)
    
    @Delete
    suspend fun deleteInvoice(invoice: Invoice)
}

@Dao
interface SalesOrderDao {
    @Query("SELECT * FROM sales_orders ORDER BY created_at DESC")
    fun getAllSalesOrders(): Flow<List<SalesOrder>>

    @Query("SELECT * FROM sales_orders WHERE id = :id")
    suspend fun getSalesOrderById(id: String): SalesOrder?

    @Query("SELECT * FROM sales_orders WHERE customer_id = :customerId ORDER BY created_at DESC")
    suspend fun getSalesOrdersByCustomer(customerId: String): List<SalesOrder>

    @Query("SELECT * FROM sales_orders WHERE status = :status ORDER BY created_at DESC")
    suspend fun getSalesOrdersByStatus(status: String): List<SalesOrder>

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

    @Query("SELECT * FROM sales_orders WHERE order_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    suspend fun searchSalesOrders(query: String): List<SalesOrder>
}

@Dao
interface SalesOrderItemDao {
    @Query("SELECT * FROM sales_order_items WHERE sales_order_id = :salesOrderId")
    suspend fun getItemsBySalesOrderId(salesOrderId: String): List<SalesOrderItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSalesOrderItem(item: SalesOrderItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSalesOrderItems(items: List<SalesOrderItem>)

    @Update
    suspend fun updateSalesOrderItem(item: SalesOrderItem)

    @Delete
    suspend fun deleteSalesOrderItem(item: SalesOrderItem)

    @Query("DELETE FROM sales_order_items WHERE sales_order_id = :salesOrderId")
    suspend fun deleteItemsBySalesOrderId(salesOrderId: String)
}

@Dao
interface QuotationDao {
    @Query("SELECT * FROM quotations ORDER BY created_at DESC")
    fun getAllQuotations(): Flow<List<Quotation>>

    @Query("SELECT * FROM quotations WHERE id = :id")
    suspend fun getQuotationById(id: String): Quotation?

    @Query("SELECT * FROM quotations WHERE customer_id = :customerId ORDER BY created_at DESC")
    suspend fun getQuotationsByCustomer(customerId: String): List<Quotation>

    @Query("SELECT * FROM quotations WHERE status = :status ORDER BY created_at DESC")
    suspend fun getQuotationsByStatus(status: String): List<Quotation>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotation(quotation: Quotation)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotations(quotations: List<Quotation>)

    @Update
    suspend fun updateQuotation(quotation: Quotation)

    @Delete
    suspend fun deleteQuotation(quotation: Quotation)

    @Query("DELETE FROM quotations WHERE id = :id")
    suspend fun deleteQuotationById(id: String)

    @Query("SELECT * FROM quotations WHERE quotation_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    suspend fun searchQuotations(query: String): List<Quotation>
}

@Dao
interface QuotationItemDao {
    @Query("SELECT * FROM quotation_items WHERE quotation_id = :quotationId")
    suspend fun getItemsByQuotationId(quotationId: String): List<QuotationItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotationItem(item: QuotationItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotationItems(items: List<QuotationItem>)

    @Update
    suspend fun updateQuotationItem(item: QuotationItem)

    @Delete
    suspend fun deleteQuotationItem(item: QuotationItem)

    @Query("DELETE FROM quotation_items WHERE quotation_id = :quotationId")
    suspend fun deleteItemsByQuotationId(quotationId: String)
}

@Dao
interface InvoiceDao {
    @Query("SELECT * FROM invoices ORDER BY created_at DESC")
    fun getAllInvoices(): Flow<List<Invoice>>

    @Query("SELECT * FROM invoices WHERE id = :id")
    suspend fun getInvoiceById(id: String): Invoice?

    @Query("SELECT * FROM invoices WHERE customer_id = :customerId ORDER BY created_at DESC")
    suspend fun getInvoicesByCustomer(customerId: String): List<Invoice>

    @Query("SELECT * FROM invoices WHERE sales_order_id = :salesOrderId")
    suspend fun getInvoicesBySalesOrder(salesOrderId: String): List<Invoice>

    @Query("SELECT * FROM invoices WHERE status = :status ORDER BY created_at DESC")
    suspend fun getInvoicesByStatus(status: String): List<Invoice>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoice(invoice: Invoice)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoices(invoices: List<Invoice>)

    @Update
    suspend fun updateInvoice(invoice: Invoice)

    @Delete
    suspend fun deleteInvoice(invoice: Invoice)

    @Query("DELETE FROM invoices WHERE id = :id")
    suspend fun deleteInvoiceById(id: String)

    @Query("SELECT * FROM invoices WHERE invoice_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    suspend fun searchInvoices(query: String): List<Invoice>
}

@Dao
interface InvoiceItemDao {
    @Query("SELECT * FROM invoice_items WHERE invoice_id = :invoiceId")
    suspend fun getItemsByInvoiceId(invoiceId: String): List<InvoiceItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoiceItem(item: InvoiceItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoiceItems(items: List<InvoiceItem>)

    @Update
    suspend fun updateInvoiceItem(item: InvoiceItem)

    @Delete
    suspend fun deleteInvoiceItem(item: InvoiceItem)

    @Query("DELETE FROM invoice_items WHERE invoice_id = :invoiceId")
    suspend fun deleteItemsByInvoiceId(invoiceId: String)
}

@Dao
interface DeliveryNoteDao {
    @Query("SELECT * FROM delivery_notes ORDER BY created_at DESC")
    fun getAllDeliveryNotes(): Flow<List<DeliveryNote>>

    @Query("SELECT * FROM delivery_notes WHERE id = :id")
    suspend fun getDeliveryNoteById(id: String): DeliveryNote?

    @Query("SELECT * FROM delivery_notes WHERE customer_id = :customerId ORDER BY created_at DESC")
    suspend fun getDeliveryNotesByCustomer(customerId: String): List<DeliveryNote>

    @Query("SELECT * FROM delivery_notes WHERE sales_order_id = :salesOrderId")
    suspend fun getDeliveryNotesBySalesOrder(salesOrderId: String): List<DeliveryNote>

    @Query("SELECT * FROM delivery_notes WHERE status = :status ORDER BY created_at DESC")
    suspend fun getDeliveryNotesByStatus(status: String): List<DeliveryNote>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDeliveryNote(deliveryNote: DeliveryNote)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDeliveryNotes(deliveryNotes: List<DeliveryNote>)

    @Update
    suspend fun updateDeliveryNote(deliveryNote: DeliveryNote)

    @Delete
    suspend fun deleteDeliveryNote(deliveryNote: DeliveryNote)

    @Query("DELETE FROM delivery_notes WHERE id = :id")
    suspend fun deleteDeliveryNoteById(id: String)

    @Query("SELECT * FROM delivery_notes WHERE delivery_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    suspend fun searchDeliveryNotes(query: String): List<DeliveryNote>
}

@Dao
interface DeliveryNoteItemDao {
    @Query("SELECT * FROM delivery_note_items WHERE delivery_note_id = :deliveryNoteId")
    suspend fun getItemsByDeliveryNoteId(deliveryNoteId: String): List<DeliveryNoteItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDeliveryNoteItem(item: DeliveryNoteItem)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDeliveryNoteItems(items: List<DeliveryNoteItem>)

    @Update
    suspend fun updateDeliveryNoteItem(item: DeliveryNoteItem)

    @Delete
    suspend fun deleteDeliveryNoteItem(item: DeliveryNoteItem)

    @Query("DELETE FROM delivery_note_items WHERE delivery_note_id = :deliveryNoteId")
    suspend fun deleteItemsByDeliveryNoteId(deliveryNoteId: String)
}
