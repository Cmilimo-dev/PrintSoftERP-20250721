package com.printsoft.erp.data.repository

import com.printsoft.erp.data.api.ComprehensiveERPApiService
import com.printsoft.erp.data.local.database.MobileERPDatabase
// Use specific imports to avoid ambiguity
import com.printsoft.erp.data.models.Customer
import com.printsoft.erp.data.models.Product
import com.printsoft.erp.data.models.SalesOrder
import com.printsoft.erp.data.models.Invoice
import com.printsoft.erp.data.models.Quotation
import com.printsoft.erp.data.models.DashboardStats
import com.printsoft.erp.data.models.OrderStats
import com.printsoft.erp.data.models.InventoryStats
import com.printsoft.erp.data.models.FinancialStats
import com.printsoft.erp.data.models.CustomerStats
import com.printsoft.erp.data.models.PaymentReceipt
import com.printsoft.erp.data.models.DocumentWorkflow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ComprehensiveERPRepository @Inject constructor(
    private val apiService: ComprehensiveERPApiService,
    private val database: MobileERPDatabase
) {

    // ==================== CUSTOMERS ====================
    fun getCustomers(): Flow<List<Customer>> = database.customerDao().getAllCustomers()

    suspend fun syncCustomers(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getCustomers()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.let { customers ->
                    database.customerDao().insertCustomers(customers)
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to sync customers"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createCustomer(customer: Customer): Result<Customer> = withContext(Dispatchers.IO) {
        try {
            // Try API first
            val response = apiService.createCustomer(customer)
            if (response.isSuccessful && response.body()?.success == true) {
                val createdCustomer = response.body()?.data!!
                database.customerDao().insertCustomer(createdCustomer)
                Result.success(createdCustomer)
            } else {
                // Fallback to local storage
                database.customerDao().insertCustomer(customer)
                Result.success(customer)
            }
        } catch (e: Exception) {
            // Fallback to local storage
            database.customerDao().insertCustomer(customer)
            Result.success(customer)
        }
    }

    suspend fun updateCustomer(customer: Customer): Result<Customer> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.updateCustomer(customer.id, customer)
            if (response.isSuccessful && response.body()?.success == true) {
                val updatedCustomer = response.body()?.data!!
                database.customerDao().updateCustomer(updatedCustomer)
                Result.success(updatedCustomer)
            } else {
                database.customerDao().updateCustomer(customer)
                Result.success(customer)
            }
        } catch (e: Exception) {
            database.customerDao().updateCustomer(customer)
            Result.success(customer)
        }
    }

    // ==================== PRODUCTS ====================
    fun getProducts(): Flow<List<Product>> = database.productDao().getAllProducts()
    
    fun getLowStockProducts(): Flow<List<Product>> = database.productDao().getLowStockProducts()

    suspend fun syncProducts(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getProducts()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.let { products ->
                    database.productDao().insertProducts(products)
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to sync products"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createProduct(product: Product): Result<Product> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.createProduct(product)
            if (response.isSuccessful && response.body()?.success == true) {
                val createdProduct = response.body()?.data!!
                database.productDao().insertProduct(createdProduct)
                Result.success(createdProduct)
            } else {
                database.productDao().insertProduct(product)
                Result.success(product)
            }
        } catch (e: Exception) {
            database.productDao().insertProduct(product)
            Result.success(product)
        }
    }

    // ==================== SALES ORDERS ====================
    fun getSalesOrders(): Flow<List<SalesOrder>> = database.salesOrderDao().getAllSalesOrders()

    suspend fun createSalesOrder(salesOrder: SalesOrder): Result<SalesOrder> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.createSalesOrder(salesOrder)
            if (response.isSuccessful && response.body()?.success == true) {
                val createdOrder = response.body()?.data!!
                database.salesOrderDao().insertSalesOrder(createdOrder)
                Result.success(createdOrder)
            } else {
                database.salesOrderDao().insertSalesOrder(salesOrder)
                Result.success(salesOrder)
            }
        } catch (e: Exception) {
            database.salesOrderDao().insertSalesOrder(salesOrder)
            Result.success(salesOrder)
        }
    }

    suspend fun updateSalesOrderStatus(orderId: String, status: String): Result<SalesOrder> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.updateSalesOrderStatus(orderId, mapOf("status" to status))
            if (response.isSuccessful && response.body()?.success == true) {
                val updatedOrder = response.body()?.data!!
                database.salesOrderDao().updateSalesOrder(updatedOrder)
                Result.success(updatedOrder)
            } else {
                val order = database.salesOrderDao().getSalesOrderById(orderId)
                if (order != null) {
                    val updatedOrder = order.copy(status = status)
                    database.salesOrderDao().updateSalesOrder(updatedOrder)
                    Result.success(updatedOrder)
                } else {
                    Result.failure(Exception("Order not found"))
                }
            }
        } catch (e: Exception) {
            val order = database.salesOrderDao().getSalesOrderById(orderId)
            if (order != null) {
                val updatedOrder = order.copy(status = status)
                database.salesOrderDao().updateSalesOrder(updatedOrder)
                Result.success(updatedOrder)
            } else {
                Result.failure(e)
            }
        }
    }

    // ==================== INVOICES ====================
    fun getInvoices(): Flow<List<Invoice>> = flow {
        emit(database.invoiceDao().getAllInvoices())
    }

    suspend fun createInvoice(invoice: Invoice): Result<Invoice> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.createInvoice(invoice)
            if (response.isSuccessful && response.body()?.success == true) {
                val createdInvoice = response.body()?.data!!
                database.invoiceDao().insertInvoice(createdInvoice)
                Result.success(createdInvoice)
            } else {
                database.invoiceDao().insertInvoice(invoice)
                Result.success(invoice)
            }
        } catch (e: Exception) {
            database.invoiceDao().insertInvoice(invoice)
            Result.success(invoice)
        }
    }

    // ==================== QUOTATIONS ====================
    fun getQuotations(): Flow<List<Quotation>> = database.quotationDao().getAllQuotations()

    suspend fun createQuotation(quotation: Quotation): Result<Quotation> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.createQuotation(quotation)
            if (response.isSuccessful && response.body()?.success == true) {
                val createdQuotation = response.body()?.data!!
                database.quotationDao().insertQuotation(createdQuotation)
                Result.success(createdQuotation)
            } else {
                database.quotationDao().insertQuotation(quotation)
                Result.success(quotation)
            }
        } catch (e: Exception) {
            database.quotationDao().insertQuotation(quotation)
            Result.success(quotation)
        }
    }

    suspend fun convertQuotationToSalesOrder(quotationId: String): Result<SalesOrder> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.convertQuotationToSalesOrder(quotationId)
            if (response.isSuccessful && response.body()?.success == true) {
                val salesOrder = response.body()?.data!!
                database.salesOrderDao().insertSalesOrder(salesOrder)
                Result.success(salesOrder)
            } else {
                Result.failure(Exception("Failed to convert quotation"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==================== PAYMENT RECEIPTS ====================
    fun getPaymentReceipts(): Flow<List<PaymentReceipt>> = database.paymentReceiptDao().getAllPaymentReceipts()

    suspend fun recordPayment(
        invoiceId: String,
        amount: Double,
        paymentMethod: String,
        referenceNumber: String? = null
    ): Result<PaymentReceipt> = withContext(Dispatchers.IO) {
        try {
            val paymentData = mapOf(
                "amount" to amount,
                "payment_method" to paymentMethod,
                "reference_number" to (referenceNumber ?: "")
            )
            val response = apiService.recordInvoicePayment(invoiceId, paymentData)
            if (response.isSuccessful && response.body()?.success == true) {
                val paymentReceipt = response.body()?.data!!
                database.paymentReceiptDao().insertPaymentReceipt(paymentReceipt)
                Result.success(paymentReceipt)
            } else {
                Result.failure(Exception("Failed to record payment"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==================== DASHBOARD STATS ====================
    suspend fun getDashboardStats(): Result<DashboardStats> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getDashboardStats()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data!!)
            } else {
                // Generate local stats as fallback
                val localStats = generateLocalDashboardStats()
                Result.success(localStats)
            }
        } catch (e: Exception) {
            val localStats = generateLocalDashboardStats()
            Result.success(localStats)
        }
    }

    private suspend fun generateLocalDashboardStats(): DashboardStats {
        val totalOrders = database.salesOrderDao().getSalesOrderCount()
        val totalRevenue = database.salesOrderDao().getTotalRevenue() ?: 0.0
        val totalProducts = database.productDao().getProductCount()
        val lowStockCount = database.productDao().getLowStockCount()
        val totalCustomers = database.customerDao().getCustomerCount()
        val activeCustomers = database.customerDao().getActiveCustomerCount()

        return DashboardStats(
            orders = OrderStats(
                totalOrders = totalOrders,
                totalRevenue = totalRevenue,
                ordersDueSoon = 0, // Would need more complex query
                pendingOrders = database.salesOrderDao().getSalesOrderCountByStatus("pending")
            ),
            inventory = com.printsoft.erp.data.models.InventoryStats(
                totalProducts = totalProducts,
                totalCategories = 0, // Would need category count
                totalWarehouses = 0, // Would need warehouse count
                lowStockItems = lowStockCount,
                outOfStockItems = database.productDao().getOutOfStockCount(),
                totalInventoryValue = database.productDao().getTotalInventoryValue() ?: 0.0
            ),
            financial = FinancialStats(
                totalReceivables = 0.0, // Would need complex calculation
                totalPayables = 0.0,    // Would need complex calculation
                monthlyRevenue = totalRevenue,
                monthlyExpenses = 0.0
            ),
            customers = CustomerStats(
                totalCustomers = totalCustomers,
                activeCustomers = activeCustomers,
                newCustomersThisMonth = 0 // Would need date-based query
            )
        )
    }

    // ==================== SYNC OPERATIONS ====================
    suspend fun syncAllData(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            syncCustomers()
            syncProducts()
            // Add other sync operations as needed
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==================== SEARCH ====================
    suspend fun globalSearch(query: String): Result<List<Map<String, Any>>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.globalSearch(query)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data ?: emptyList())
            } else {
                Result.failure(Exception("Search failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==================== WORKFLOW OPERATIONS ====================
    suspend fun getDocumentWorkflow(documentId: String): Result<DocumentWorkflow?> = withContext(Dispatchers.IO) {
        try {
            val localWorkflow = database.documentWorkflowDao().getWorkflowByDocumentId(documentId)
            Result.success(localWorkflow)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun transitionDocumentStatus(
        documentId: String,
        newStatus: String,
        reason: String? = null
    ): Result<DocumentWorkflow> = withContext(Dispatchers.IO) {
        try {
            val transitionData = mapOf(
                "status" to newStatus,
                "reason" to (reason ?: "")
            )
            val response = apiService.transitionDocumentStatus(documentId, transitionData)
            if (response.isSuccessful && response.body()?.success == true) {
                val workflow = response.body()?.data!!
                database.documentWorkflowDao().updateWorkflow(workflow)
                Result.success(workflow)
            } else {
                Result.failure(Exception("Failed to transition document status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
