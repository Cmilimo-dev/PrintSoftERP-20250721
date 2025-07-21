package com.printsoft.erp.data.repository

import com.printsoft.erp.data.api.ERPApiService
import com.printsoft.erp.data.local.database.dao.CustomerDao
import com.printsoft.erp.data.models.Customer
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CustomerRepository @Inject constructor(
    private val apiService: ERPApiService,
    private val customerDao: CustomerDao
) {
    
    suspend fun getCustomers(): Result<List<Customer>> {
        return try {
            // Try API first
            val response = apiService.getCustomers()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database for offline access
                    customerDao.insertCustomers(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    // Fallback to local data
                    getLocalCustomers()
                }
            } else {
                getLocalCustomers()
            }
        } catch (e: Exception) {
            // Network error, use local data
            getLocalCustomers()
        }
    }
    
    private suspend fun getLocalCustomers(): Result<List<Customer>> {
        return try {
            val localCustomers = customerDao.getAllCustomers().first()
            Result.success(localCustomers)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCustomerById(id: String): Result<Customer> {
        return try {
            // Try API first
            val response = apiService.getCustomer(id)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database
                    customerDao.insertCustomer(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    getLocalCustomerById(id)
                }
            } else {
                getLocalCustomerById(id)
            }
        } catch (e: Exception) {
            getLocalCustomerById(id)
        }
    }
    
    private suspend fun getLocalCustomerById(id: String): Result<Customer> {
        return try {
            val customer = customerDao.getCustomerById(id)
            if (customer != null) {
                Result.success(customer)
            } else {
                Result.failure(Exception("Customer not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createCustomer(customer: Customer): Result<Customer> {
        return try {
            val response = apiService.createCustomer(customer)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database
                    customerDao.insertCustomer(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to create customer"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateCustomer(id: String, customer: Customer): Result<Customer> {
        return try {
            val response = apiService.updateCustomer(id, customer)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Update local database
                    customerDao.updateCustomer(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to update customer"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteCustomer(id: String): Result<Boolean> {
        return try {
            val response = apiService.deleteCustomer(id)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    // Delete from local database
                    customerDao.deleteCustomerById(id)
                    Result.success(true)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to delete customer"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun searchCustomers(query: String): Result<List<Customer>> {
        return try {
            // For now, search locally. In production, implement server-side search
            val localCustomers = customerDao.getAllCustomers().first()
            val filteredCustomers = localCustomers.filter { customer ->
                customer.name.contains(query, ignoreCase = true) ||
                customer.email?.contains(query, ignoreCase = true) == true ||
                customer.phone?.contains(query, ignoreCase = true) == true
            }
            Result.success(filteredCustomers)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Flow-based methods for real-time updates
    fun getCustomersFlow(): Flow<List<Customer>> {
        return customerDao.getAllCustomers()
    }
    
    fun searchCustomersFlow(query: String): Flow<List<Customer>> {
        return customerDao.searchCustomers(query)
    }
    
    fun getCustomersByTypeFlow(type: String): Flow<List<Customer>> {
        return customerDao.getCustomersByType(type)
    }
}
