package com.printsoft.erp.data.repository

import com.printsoft.erp.data.api.ERPApiService
import com.printsoft.erp.data.local.database.dao.ChartOfAccountDao
import com.printsoft.erp.data.local.database.dao.FinancialTransactionDao
import com.printsoft.erp.data.local.database.dao.InvoiceDao
import com.printsoft.erp.data.models.ChartOfAccount
import com.printsoft.erp.data.models.FinancialTransaction
import com.printsoft.erp.data.models.Invoice
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FinancialRepository @Inject constructor(
    private val apiService: ERPApiService,
    private val chartOfAccountDao: ChartOfAccountDao,
    private val invoiceDao: InvoiceDao,
    private val transactionDao: FinancialTransactionDao
) {
    
    // Chart of Accounts operations
    suspend fun getChartOfAccounts(): Result<List<ChartOfAccount>> {
        return try {
            // Try to get from API first
            val response = apiService.getChartOfAccounts()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database for offline access
                    chartOfAccountDao.insertAccounts(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    // Fallback to local data
                    getLocalChartOfAccounts()
                }
            } else {
                // Fallback to local data
                getLocalChartOfAccounts()
            }
        } catch (e: Exception) {
            // Network error, use local data
            getLocalChartOfAccounts()
        }
    }
    
    private suspend fun getLocalChartOfAccounts(): Result<List<ChartOfAccount>> {
        return try {
            val localAccounts = chartOfAccountDao.getAllAccounts()
            Result.success(localAccounts)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createChartOfAccount(account: ChartOfAccount): Result<ChartOfAccount> {
        return try {
            val response = apiService.createChartOfAccount(account)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database
                    chartOfAccountDao.insertAccount(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to create account"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Invoice operations
    suspend fun getInvoices(): Result<List<Invoice>> {
        return try {
            val response = apiService.getInvoices()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database
                    invoiceDao.insertInvoices(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    // Fallback to local data
                    getLocalInvoices()
                }
            } else {
                getLocalInvoices()
            }
        } catch (e: Exception) {
            getLocalInvoices()
        }
    }
    
    private suspend fun getLocalInvoices(): Result<List<Invoice>> {
        return try {
            val localInvoices = invoiceDao.getAllInvoices()
            Result.success(localInvoices)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createInvoice(invoice: Invoice): Result<Invoice> {
        return try {
            val response = apiService.createInvoice(invoice)
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database
                    invoiceDao.insertInvoice(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to create invoice"))
                }
            } else {
                Result.failure(Exception("API call failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Financial Transaction operations
    suspend fun getFinancialTransactions(): Result<List<FinancialTransaction>> {
        return try {
            val response = apiService.getFinancialTransactions()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Save to local database
                    transactionDao.insertTransactions(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    getLocalTransactions()
                }
            } else {
                getLocalTransactions()
            }
        } catch (e: Exception) {
            getLocalTransactions()
        }
    }
    
    private suspend fun getLocalTransactions(): Result<List<FinancialTransaction>> {
        return try {
            val localTransactions = transactionDao.getAllTransactions()
            Result.success(localTransactions)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Flow-based methods for real-time updates
    fun getChartOfAccountsFlow(): Flow<List<ChartOfAccount>> {
        return chartOfAccountDao.getAllAccountsFlow()
    }
    
    fun getInvoicesFlow(): Flow<List<Invoice>> {
        return invoiceDao.getAllInvoicesFlow()
    }
    
    fun getTransactionsFlow(): Flow<List<FinancialTransaction>> {
        return transactionDao.getAllTransactionsFlow()
    }
}
