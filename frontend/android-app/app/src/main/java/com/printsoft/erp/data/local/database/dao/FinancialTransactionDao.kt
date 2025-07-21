package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.FinancialTransaction
import kotlinx.coroutines.flow.Flow

@Dao
interface FinancialTransactionDao {
    
    @Query("SELECT * FROM financial_transactions ORDER BY transaction_date DESC")
    suspend fun getAllTransactions(): List<FinancialTransaction>
    
    @Query("SELECT * FROM financial_transactions ORDER BY transaction_date DESC")
    fun getAllTransactionsFlow(): Flow<List<FinancialTransaction>>
    
    @Query("SELECT * FROM financial_transactions WHERE id = :id")
    suspend fun getTransactionById(id: String): FinancialTransaction?
    
    @Query("SELECT * FROM financial_transactions WHERE reference_number = :referenceNumber")
    suspend fun getTransactionByReference(referenceNumber: String): FinancialTransaction?
    
    @Query("SELECT * FROM financial_transactions WHERE status = :status ORDER BY transaction_date DESC")
    fun getTransactionsByStatus(status: String): Flow<List<FinancialTransaction>>
    
    @Query("SELECT * FROM financial_transactions WHERE transaction_date BETWEEN :startDate AND :endDate ORDER BY transaction_date DESC")
    fun getTransactionsByDateRange(startDate: String, endDate: String): Flow<List<FinancialTransaction>>
    
    @Query("SELECT * FROM financial_transactions WHERE description LIKE '%' || :query || '%' OR reference_number LIKE '%' || :query || '%'")
    fun searchTransactions(query: String): Flow<List<FinancialTransaction>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: FinancialTransaction)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransactions(transactions: List<FinancialTransaction>)
    
    @Update
    suspend fun updateTransaction(transaction: FinancialTransaction)
    
    @Delete
    suspend fun deleteTransaction(transaction: FinancialTransaction)
    
    @Query("DELETE FROM financial_transactions WHERE id = :id")
    suspend fun deleteTransactionById(id: String)
    
    @Query("DELETE FROM financial_transactions")
    suspend fun deleteAllTransactions()
    
    @Query("SELECT COUNT(*) FROM financial_transactions")
    suspend fun getTransactionCount(): Int
    
    @Query("SELECT COUNT(*) FROM financial_transactions WHERE status = :status")
    suspend fun getTransactionCountByStatus(status: String): Int
    
    @Query("SELECT SUM(total_amount) FROM financial_transactions WHERE status = 'completed'")
    suspend fun getTotalCompletedAmount(): Double?
    
    @Query("SELECT SUM(total_amount) FROM financial_transactions WHERE status = 'pending'")
    suspend fun getTotalPendingAmount(): Double?
}
