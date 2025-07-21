package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.Customer
import kotlinx.coroutines.flow.Flow

@Dao
interface CustomerDao {
    
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomers(): Flow<List<Customer>>
    
    @Query("SELECT * FROM customers WHERE id = :id")
    suspend fun getCustomerById(id: String): Customer?
    
    @Query("SELECT * FROM customers WHERE name LIKE '%' || :query || '%' OR email LIKE '%' || :query || '%' OR phone LIKE '%' || :query || '%'")
    fun searchCustomers(query: String): Flow<List<Customer>>
    
    @Query("SELECT * FROM customers WHERE customer_type = :type")
    fun getCustomersByType(type: String): Flow<List<Customer>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: Customer)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomers(customers: List<Customer>)
    
    @Update
    suspend fun updateCustomer(customer: Customer)
    
    @Delete
    suspend fun deleteCustomer(customer: Customer)
    
    @Query("DELETE FROM customers WHERE id = :id")
    suspend fun deleteCustomerById(id: String)
    
    @Query("DELETE FROM customers")
    suspend fun deleteAllCustomers()
    
    @Query("SELECT COUNT(*) FROM customers")
    suspend fun getCustomerCount(): Int
    
    @Query("SELECT COUNT(*) FROM customers WHERE status = 'active'")
    suspend fun getActiveCustomerCount(): Int
}
