package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.Quotation
import kotlinx.coroutines.flow.Flow

@Dao
interface QuotationDao {
    
    @Query("SELECT * FROM quotations ORDER BY quotation_date DESC")
    fun getAllQuotations(): Flow<List<Quotation>>
    
    @Query("SELECT * FROM quotations WHERE id = :id")
    suspend fun getQuotationById(id: String): Quotation?
    
    @Query("SELECT * FROM quotations WHERE customer_id = :customerId ORDER BY quotation_date DESC")
    fun getQuotationsByCustomer(customerId: String): Flow<List<Quotation>>
    
    @Query("SELECT * FROM quotations WHERE status = :status ORDER BY quotation_date DESC")
    fun getQuotationsByStatus(status: String): Flow<List<Quotation>>
    
    @Query("SELECT * FROM quotations WHERE quotation_number LIKE '%' || :query || '%' OR notes LIKE '%' || :query || '%'")
    fun searchQuotations(query: String): Flow<List<Quotation>>
    
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
    
    @Query("DELETE FROM quotations")
    suspend fun deleteAllQuotations()
    
    @Query("SELECT COUNT(*) FROM quotations")
    suspend fun getQuotationCount(): Int
    
    @Query("SELECT COUNT(*) FROM quotations WHERE status = :status")
    suspend fun getQuotationCountByStatus(status: String): Int
}
