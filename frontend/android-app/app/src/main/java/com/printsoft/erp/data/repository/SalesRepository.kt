package com.printsoft.erp.data.repository

import com.printsoft.erp.data.local.dao.SalesDao
import com.printsoft.erp.data.local.database.dao.*
import com.printsoft.erp.data.models.*
import com.printsoft.erp.data.api.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SalesRepository @Inject constructor(
    private val apiService: ApiService,
    private val salesOrderDao: SalesOrderDao,
    private val quotationDao: QuotationDao,
    private val invoiceDao: InvoiceDao
) {
    // Sales Orders
    fun getAllSalesOrders(): Flow<List<SalesOrder>> = salesOrderDao.getAllSalesOrders()

    suspend fun getSalesOrderById(id: String): SalesOrder? {
        return try {
            // Try API first
            val apiResponse = apiService.getSalesOrderById(id)
            apiResponse?.let { salesOrderDao.insertSalesOrder(it) }
            apiResponse
        } catch (e: Exception) {
            // Fallback to local database
            salesOrderDao.getSalesOrderById(id)
        }
    }

    suspend fun createSalesOrder(salesOrder: SalesOrder): Result<SalesOrder> {
        return try {
            // Try API first
            val createdOrder = apiService.createSalesOrder(salesOrder)
            salesOrderDao.insertSalesOrder(createdOrder)
            Result.success(createdOrder)
        } catch (e: Exception) {
            // Save locally and mark for sync
            salesOrderDao.insertSalesOrder(salesOrder)
            Result.success(salesOrder)
        }
    }

    suspend fun updateSalesOrder(salesOrder: SalesOrder): Result<SalesOrder> {
        return try {
            val updatedOrder = apiService.updateSalesOrder(salesOrder.id, salesOrder)
            salesOrderDao.updateSalesOrder(updatedOrder)
            Result.success(updatedOrder)
        } catch (e: Exception) {
            salesOrderDao.updateSalesOrder(salesOrder)
            Result.success(salesOrder)
        }
    }

    suspend fun deleteSalesOrder(id: String): Result<Unit> {
        return try {
            apiService.deleteSalesOrder(id)
            salesOrderDao.deleteSalesOrderById(id)
            Result.success(Unit)
        } catch (e: Exception) {
            salesOrderDao.deleteSalesOrderById(id)
            Result.success(Unit)
        }
    }

    // Quotations
    fun getAllQuotations(): Flow<List<Quotation>> = quotationDao.getAllQuotations()

    suspend fun getQuotationById(id: String): Quotation? {
        return try {
            val apiResponse = apiService.getQuotationById(id)
            apiResponse?.let { quotationDao.insertQuotation(it) }
            apiResponse
        } catch (e: Exception) {
            quotationDao.getQuotationById(id)
        }
    }

    suspend fun createQuotation(quotation: Quotation): Result<Quotation> {
        return try {
            val createdQuotation = apiService.createQuotation(quotation)
            quotationDao.insertQuotation(createdQuotation)
            Result.success(createdQuotation)
        } catch (e: Exception) {
            quotationDao.insertQuotation(quotation)
            Result.success(quotation)
        }
    }

    // Invoices
    fun getAllInvoices(): Flow<List<Invoice>> = flow {
        emit(invoiceDao.getAllInvoices())
    }

    suspend fun getInvoiceById(id: String): Invoice? {
        return try {
            val apiResponse = apiService.getInvoiceById(id)
            apiResponse?.let { invoiceDao.insertInvoice(it) }
            apiResponse
        } catch (e: Exception) {
            invoiceDao.getInvoiceById(id)
        }
    }

    suspend fun createInvoice(invoice: Invoice): Result<Invoice> {
        return try {
            val createdInvoice = apiService.createInvoice(invoice)
            invoiceDao.insertInvoice(createdInvoice)
            Result.success(createdInvoice)
        } catch (e: Exception) {
            invoiceDao.insertInvoice(invoice)
            Result.success(invoice)
        }
    }

    // Search and filtering methods
    suspend fun searchSalesOrders(query: String): List<SalesOrder> {
        return try {
            apiService.searchSalesOrders(query)
        } catch (e: Exception) {
            // Fallback to local search (simplified)
            salesOrderDao.getAllSalesOrders().first().filter { 
                it.orderNumber.contains(query, ignoreCase = true) ||
                it.customerId.contains(query, ignoreCase = true)
            }
        }
    }

    suspend fun getSalesOrdersByStatus(status: String): List<SalesOrder> {
        return try {
            apiService.getSalesOrdersByStatus(status)
        } catch (e: Exception) {
            salesOrderDao.getSalesOrdersByStatus(status).first()
        }
    }

    suspend fun searchQuotations(query: String): List<Quotation> {
        return try {
            apiService.searchQuotations(query)
        } catch (e: Exception) {
            quotationDao.getAllQuotations().first().filter { 
                it.quotationNumber.contains(query, ignoreCase = true) ||
                it.customerId.contains(query, ignoreCase = true)
            }
        }
    }

    suspend fun searchInvoices(query: String): List<Invoice> {
        return try {
            apiService.searchInvoices(query)
        } catch (e: Exception) {
            val invoices = invoiceDao.getAllInvoices()
            invoices.filter { 
                it.invoiceNumber.contains(query, ignoreCase = true) ||
                it.customerId.contains(query, ignoreCase = true)
            }
        }
    }

    suspend fun getInvoicesByStatus(status: String): List<Invoice> {
        return try {
            apiService.getInvoicesByStatus(status)
        } catch (e: Exception) {
            invoiceDao.getInvoicesByStatus(status).first()
        }
    }

    // Delivery Notes
    suspend fun createDeliveryNote(deliveryNote: DeliveryNote): Result<DeliveryNote> {
        return try {
            val createdNote = apiService.createDeliveryNote(deliveryNote)
            Result.success(createdNote)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDeliveryNote(deliveryNote: DeliveryNote): Result<DeliveryNote> {
        return try {
            val updatedNote = apiService.updateDeliveryNote(deliveryNote.id, deliveryNote)
            Result.success(updatedNote)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Document conversion methods
    suspend fun convertQuotationToSalesOrder(quotationId: String): Result<SalesOrder> {
        return try {
            val salesOrder = apiService.convertQuotationToSalesOrder(quotationId)
            salesOrderDao.insertSalesOrder(salesOrder)
            Result.success(salesOrder)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun convertSalesOrderToInvoice(salesOrderId: String): Result<Invoice> {
        return try {
            val invoice = apiService.convertSalesOrderToInvoice(salesOrderId)
            invoiceDao.insertInvoice(invoice)
            Result.success(invoice)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createDeliveryNoteFromSalesOrder(salesOrderId: String): Result<DeliveryNote> {
        return try {
            val deliveryNote = apiService.createDeliveryNoteFromSalesOrder(salesOrderId)
            Result.success(deliveryNote)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Simplified sync methods
    suspend fun syncSalesData(): Result<Unit> {
        return try {
            // Fetch all data from API and update local database
            val salesOrders = apiService.getAllSalesOrders()
            salesOrderDao.insertSalesOrders(salesOrders)

            val quotations = apiService.getAllQuotations()
            quotationDao.insertQuotations(quotations)

            val invoices = apiService.getAllInvoices()
            invoiceDao.insertInvoices(invoices)

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
