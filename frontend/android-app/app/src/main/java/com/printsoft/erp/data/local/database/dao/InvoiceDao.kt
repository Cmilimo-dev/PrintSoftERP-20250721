package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.Invoice
import kotlinx.coroutines.flow.Flow

@Dao
interface InvoiceDao {
    
    @Query("SELECT * FROM invoices ORDER BY invoice_date DESC")
    suspend fun getAllInvoices(): List<Invoice>
    
    @Query("SELECT * FROM invoices ORDER BY invoice_date DESC")
    fun getAllInvoicesFlow(): Flow<List<Invoice>>
    
    @Query("SELECT * FROM invoices WHERE id = :id")
    suspend fun getInvoiceById(id: String): Invoice?
    
    @Query("SELECT * FROM invoices WHERE invoice_number = :invoiceNumber")
    suspend fun getInvoiceByNumber(invoiceNumber: String): Invoice?
    
    @Query("SELECT * FROM invoices WHERE customer_id = :customerId ORDER BY invoice_date DESC")
    fun getInvoicesByCustomer(customerId: String): Flow<List<Invoice>>
    
    @Query("SELECT * FROM invoices WHERE status = :status ORDER BY invoice_date DESC")
    fun getInvoicesByStatus(status: String): Flow<List<Invoice>>
    
    @Query("SELECT * FROM invoices WHERE invoice_date BETWEEN :startDate AND :endDate ORDER BY invoice_date DESC")
    fun getInvoicesByDateRange(startDate: String, endDate: String): Flow<List<Invoice>>
    
    @Query("SELECT * FROM invoices WHERE status = 'overdue' ORDER BY due_date ASC")
    fun getOverdueInvoices(): Flow<List<Invoice>>
    
    @Query("SELECT * FROM invoices WHERE invoice_number LIKE '%' || :query || '%' OR customer_id LIKE '%' || :query || '%'")
    fun searchInvoices(query: String): Flow<List<Invoice>>
    
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
    
    @Query("DELETE FROM invoices")
    suspend fun deleteAllInvoices()
    
    @Query("SELECT COUNT(*) FROM invoices")
    suspend fun getInvoiceCount(): Int
    
    @Query("SELECT COUNT(*) FROM invoices WHERE status = :status")
    suspend fun getInvoiceCountByStatus(status: String): Int
    
    @Query("SELECT SUM(total_amount) FROM invoices WHERE status = 'completed'")
    suspend fun getTotalPaidAmount(): Double?
    
    @Query("SELECT SUM(total_amount - paid_amount) FROM invoices WHERE status != 'completed' AND status != 'cancelled'")
    suspend fun getTotalOutstandingAmount(): Double?
    
    @Query("SELECT DISTINCT status FROM invoices")
    suspend fun getAllStatuses(): List<String>
}
