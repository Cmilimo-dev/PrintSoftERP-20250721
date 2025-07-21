package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.PaymentReceipt
import kotlinx.coroutines.flow.Flow

@Dao
interface PaymentReceiptDao {
    
    @Query("SELECT * FROM payment_receipts ORDER BY payment_date DESC")
    fun getAllPaymentReceipts(): Flow<List<PaymentReceipt>>
    
    @Query("SELECT * FROM payment_receipts WHERE id = :id")
    suspend fun getPaymentReceiptById(id: String): PaymentReceipt?
    
    @Query("SELECT * FROM payment_receipts WHERE customer_id = :customerId ORDER BY payment_date DESC")
    fun getPaymentReceiptsByCustomer(customerId: String): Flow<List<PaymentReceipt>>
    
    @Query("SELECT * FROM payment_receipts WHERE invoice_id = :invoiceId ORDER BY payment_date DESC")
    fun getPaymentReceiptsByInvoice(invoiceId: String): Flow<List<PaymentReceipt>>
    
    @Query("SELECT * FROM payment_receipts WHERE status = :status ORDER BY payment_date DESC")
    fun getPaymentReceiptsByStatus(status: String): Flow<List<PaymentReceipt>>
    
    @Query("SELECT * FROM payment_receipts WHERE payment_method = :method ORDER BY payment_date DESC")
    fun getPaymentReceiptsByMethod(method: String): Flow<List<PaymentReceipt>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPaymentReceipt(paymentReceipt: PaymentReceipt)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPaymentReceipts(paymentReceipts: List<PaymentReceipt>)
    
    @Update
    suspend fun updatePaymentReceipt(paymentReceipt: PaymentReceipt)
    
    @Delete
    suspend fun deletePaymentReceipt(paymentReceipt: PaymentReceipt)
    
    @Query("DELETE FROM payment_receipts WHERE id = :id")
    suspend fun deletePaymentReceiptById(id: String)
    
    @Query("DELETE FROM payment_receipts")
    suspend fun deleteAllPaymentReceipts()
    
    @Query("SELECT COUNT(*) FROM payment_receipts")
    suspend fun getPaymentReceiptCount(): Int
    
    @Query("SELECT COUNT(*) FROM payment_receipts WHERE status = :status")
    suspend fun getPaymentReceiptCountByStatus(status: String): Int
    
    @Query("SELECT SUM(amount_received) FROM payment_receipts WHERE status = 'cleared'")
    suspend fun getTotalReceived(): Double?
}
