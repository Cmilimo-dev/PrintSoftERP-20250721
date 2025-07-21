package com.printsoft.erp.data.api

import com.printsoft.erp.data.models.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of ApiService that wraps ComprehensiveERPApiService
 * and handles the Response<ApiResponse<T>> to T conversion.
 */
@Singleton
class ApiServiceImpl @Inject constructor(
    private val comprehensiveApi: ComprehensiveERPApiService
) : ApiService {
    
    // Sales Orders
    override suspend fun getAllSalesOrders(): List<SalesOrder> {
        val response = comprehensiveApi.getSalesOrders()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getSalesOrderById(id: String): SalesOrder? {
        val response = comprehensiveApi.getSalesOrder(id)
        return response.body()?.data
    }
    
    override suspend fun createSalesOrder(salesOrder: SalesOrder): SalesOrder {
        val response = comprehensiveApi.createSalesOrder(salesOrder)
        return response.body()?.data ?: throw RuntimeException("Failed to create sales order")
    }
    
    override suspend fun updateSalesOrder(id: String, salesOrder: SalesOrder): SalesOrder {
        val response = comprehensiveApi.updateSalesOrder(id, salesOrder)
        return response.body()?.data ?: throw RuntimeException("Failed to update sales order")
    }
    
    override suspend fun deleteSalesOrder(id: String) {
        comprehensiveApi.deleteSalesOrder(id)
    }
    
    override suspend fun getSalesOrdersByCustomer(customerId: String): List<SalesOrder> {
        val response = comprehensiveApi.getSalesOrders(customerId = customerId)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getSalesOrdersByStatus(status: String): List<SalesOrder> {
        val response = comprehensiveApi.getSalesOrders(status = status)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun searchSalesOrders(query: String): List<SalesOrder> {
        // Note: ComprehensiveERPApiService doesn't have search, so we'll filter client-side for now
        val response = comprehensiveApi.getSalesOrders()
        return response.body()?.data?.filter { 
            it.orderNumber.contains(query, ignoreCase = true) ||
            it.customerId.contains(query, ignoreCase = true)
        } ?: emptyList()
    }
    
    override suspend fun convertQuotationToSalesOrder(quotationId: String): SalesOrder {
        val response = comprehensiveApi.convertQuotationToSalesOrder(quotationId)
        return response.body()?.data ?: throw RuntimeException("Failed to convert quotation")
    }
    
    override suspend fun getSalesOrderItems(salesOrderId: String): List<SalesOrderItem> {
        val response = comprehensiveApi.getSalesOrderItems(salesOrderId)
        return response.body()?.data ?: emptyList()
    }
    
    // Quotations
    override suspend fun getAllQuotations(): List<Quotation> {
        val response = comprehensiveApi.getQuotations()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getQuotationById(id: String): Quotation? {
        val response = comprehensiveApi.getQuotation(id)
        return response.body()?.data
    }
    
    override suspend fun createQuotation(quotation: Quotation): Quotation {
        val response = comprehensiveApi.createQuotation(quotation)
        return response.body()?.data ?: throw RuntimeException("Failed to create quotation")
    }
    
    override suspend fun updateQuotation(id: String, quotation: Quotation): Quotation {
        val response = comprehensiveApi.updateQuotation(id, quotation)
        return response.body()?.data ?: throw RuntimeException("Failed to update quotation")
    }
    
    override suspend fun deleteQuotation(id: String) {
        comprehensiveApi.deleteQuotation(id)
    }
    
    override suspend fun getQuotationsByCustomer(customerId: String): List<Quotation> {
        val response = comprehensiveApi.getQuotations(customerId = customerId)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun searchQuotations(query: String): List<Quotation> {
        val response = comprehensiveApi.getQuotations()
        return response.body()?.data?.filter { 
            it.quotationNumber.contains(query, ignoreCase = true) ||
            it.customerId.contains(query, ignoreCase = true)
        } ?: emptyList()
    }
    
    override suspend fun getQuotationItems(quotationId: String): List<QuotationItem> {
        // Note: May need to add this endpoint to ComprehensiveERPApiService
        return emptyList()
    }
    
    // Invoices
    override suspend fun getAllInvoices(): List<Invoice> {
        val response = comprehensiveApi.getInvoices()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getInvoiceById(id: String): Invoice? {
        val response = comprehensiveApi.getInvoice(id)
        return response.body()?.data
    }
    
    override suspend fun createInvoice(invoice: Invoice): Invoice {
        val response = comprehensiveApi.createInvoice(invoice)
        return response.body()?.data ?: throw RuntimeException("Failed to create invoice")
    }
    
    override suspend fun updateInvoice(id: String, invoice: Invoice): Invoice {
        val response = comprehensiveApi.updateInvoice(id, invoice)
        return response.body()?.data ?: throw RuntimeException("Failed to update invoice")
    }
    
    override suspend fun deleteInvoice(id: String) {
        comprehensiveApi.deleteInvoice(id)
    }
    
    override suspend fun getInvoicesByCustomer(customerId: String): List<Invoice> {
        val response = comprehensiveApi.getInvoices(customerId = customerId)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getInvoicesByStatus(status: String): List<Invoice> {
        val response = comprehensiveApi.getInvoices(status = status)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun searchInvoices(query: String): List<Invoice> {
        val response = comprehensiveApi.getInvoices()
        return response.body()?.data?.filter { 
            it.invoiceNumber.contains(query, ignoreCase = true) ||
            it.customerId.contains(query, ignoreCase = true)
        } ?: emptyList()
    }
    
    override suspend fun convertSalesOrderToInvoice(salesOrderId: String): Invoice {
        val response = comprehensiveApi.convertSalesOrderToInvoice(salesOrderId)
        return response.body()?.data ?: throw RuntimeException("Failed to convert sales order")
    }
    
    override suspend fun getInvoiceItems(invoiceId: String): List<InvoiceItem> {
        val response = comprehensiveApi.getInvoiceItems(invoiceId)
        return response.body()?.data ?: emptyList()
    }
    
    // Delivery Notes
    override suspend fun getAllDeliveryNotes(): List<DeliveryNote> {
        val response = comprehensiveApi.getDeliveryNotes()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getDeliveryNoteById(id: String): DeliveryNote? {
        val response = comprehensiveApi.getDeliveryNote(id)
        return response.body()?.data
    }
    
    override suspend fun createDeliveryNote(deliveryNote: DeliveryNote): DeliveryNote {
        val response = comprehensiveApi.createDeliveryNote(deliveryNote)
        return response.body()?.data ?: throw RuntimeException("Failed to create delivery note")
    }
    
    override suspend fun updateDeliveryNote(id: String, deliveryNote: DeliveryNote): DeliveryNote {
        val response = comprehensiveApi.updateDeliveryNote(id, deliveryNote)
        return response.body()?.data ?: throw RuntimeException("Failed to update delivery note")
    }
    
    override suspend fun deleteDeliveryNote(id: String) {
        // Note: May need to add this endpoint to ComprehensiveERPApiService
    }
    
    override suspend fun getDeliveryNotesByCustomer(customerId: String): List<DeliveryNote> {
        val response = comprehensiveApi.getDeliveryNotes()
        return response.body()?.data?.filter { it.customerId == customerId } ?: emptyList()
    }
    
    override suspend fun getDeliveryNotesByStatus(status: String): List<DeliveryNote> {
        val response = comprehensiveApi.getDeliveryNotes(status = status)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun searchDeliveryNotes(query: String): List<DeliveryNote> {
        val response = comprehensiveApi.getDeliveryNotes()
        return response.body()?.data?.filter { 
            it.deliveryNumber.contains(query, ignoreCase = true) ||
            it.customerId.contains(query, ignoreCase = true)
        } ?: emptyList()
    }
    
    override suspend fun createDeliveryNoteFromSalesOrder(salesOrderId: String): DeliveryNote {
        val response = comprehensiveApi.createDeliveryNoteFromSalesOrder(salesOrderId)
        return response.body()?.data ?: throw RuntimeException("Failed to create delivery note from sales order")
    }
    
    override suspend fun getDeliveryNoteItems(deliveryNoteId: String): List<DeliveryNoteItem> {
        // Note: May need to add this endpoint to ComprehensiveERPApiService
        return emptyList()
    }
    
    // Vendors - using vendors endpoints
    override suspend fun getAllVendors(): List<Vendor> {
        val response = comprehensiveApi.getVendors()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getVendorById(id: String): Vendor? {
        val response = comprehensiveApi.getVendor(id)
        return response.body()?.data
    }
    
    override suspend fun createVendor(vendor: Vendor): Vendor {
        val response = comprehensiveApi.createVendor(vendor)
        return response.body()?.data ?: throw RuntimeException("Failed to create vendor")
    }
    
    override suspend fun updateVendor(id: String, vendor: Vendor): Vendor {
        val response = comprehensiveApi.updateVendor(id, vendor)
        return response.body()?.data ?: throw RuntimeException("Failed to update vendor")
    }
    
    override suspend fun deleteVendor(id: String) {
        comprehensiveApi.deleteVendor(id)
    }
    
    override suspend fun searchVendors(query: String): List<Vendor> {
        val response = comprehensiveApi.getVendors(search = query)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getVendorsByStatus(status: String): List<Vendor> {
        val response = comprehensiveApi.getVendors()
        // Note: Vendor model doesn't have status field, filtering on API level would be better
        return response.body()?.data ?: emptyList()
    }
    
    // Purchase Orders
    override suspend fun getAllPurchaseOrders(): List<PurchaseOrder> {
        val response = comprehensiveApi.getPurchaseOrders()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getPurchaseOrderById(id: String): PurchaseOrder? {
        val response = comprehensiveApi.getPurchaseOrder(id)
        return response.body()?.data
    }
    
    override suspend fun createPurchaseOrder(purchaseOrder: PurchaseOrder): PurchaseOrder {
        val response = comprehensiveApi.createPurchaseOrder(purchaseOrder)
        return response.body()?.data ?: throw RuntimeException("Failed to create purchase order")
    }
    
    override suspend fun updatePurchaseOrder(id: String, purchaseOrder: PurchaseOrder): PurchaseOrder {
        val response = comprehensiveApi.updatePurchaseOrder(id, purchaseOrder)
        return response.body()?.data ?: throw RuntimeException("Failed to update purchase order")
    }
    
    override suspend fun deletePurchaseOrder(id: String) {
        comprehensiveApi.deletePurchaseOrder(id)
    }
    
    override suspend fun getPurchaseOrdersByVendor(vendorId: String): List<PurchaseOrder> {
        val response = comprehensiveApi.getPurchaseOrders(vendorId = vendorId)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getPurchaseOrdersByStatus(status: String): List<PurchaseOrder> {
        val response = comprehensiveApi.getPurchaseOrders(status = status)
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getPurchaseOrdersByApprovalStatus(approvalStatus: String): List<PurchaseOrder> {
        val response = comprehensiveApi.getPurchaseOrders()
        return response.body()?.data?.filter { it.approvalStatus == approvalStatus } ?: emptyList()
    }
    
    override suspend fun searchPurchaseOrders(query: String): List<PurchaseOrder> {
        val response = comprehensiveApi.getPurchaseOrders()
        return response.body()?.data?.filter { 
            it.poNumber.contains(query, ignoreCase = true) ||
            it.vendorId.contains(query, ignoreCase = true)
        } ?: emptyList()
    }
    
    override suspend fun approvePurchaseOrder(id: String, approvedBy: String): PurchaseOrder {
        val response = comprehensiveApi.updatePurchaseOrderStatus(id, mapOf("status" to "approved", "approvedBy" to approvedBy))
        return response.body()?.data ?: throw RuntimeException("Failed to approve purchase order")
    }
    
    override suspend fun getPurchaseOrderItems(purchaseOrderId: String): List<PurchaseOrderItem> {
        // Note: May need to add this endpoint to ComprehensiveERPApiService
        return emptyList()
    }
    
    // Purchase Receipts
    override suspend fun getAllPurchaseReceipts(): List<PurchaseReceipt> {
        val response = comprehensiveApi.getPurchaseReceipts()
        return response.body()?.data ?: emptyList()
    }
    
    override suspend fun getPurchaseReceiptById(id: String): PurchaseReceipt? {
        // Note: Need to add getPurchaseReceipt(id) to ComprehensiveERPApiService
        return null
    }
    
    override suspend fun createPurchaseReceipt(receipt: PurchaseReceipt): PurchaseReceipt {
        // Note: Need to add createPurchaseReceipt to ComprehensiveERPApiService
        throw NotImplementedError("createPurchaseReceipt not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun updatePurchaseReceipt(id: String, receipt: PurchaseReceipt): PurchaseReceipt {
        throw NotImplementedError("updatePurchaseReceipt not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun deletePurchaseReceipt(id: String) {
        throw NotImplementedError("deletePurchaseReceipt not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun getReceiptsByPurchaseOrderId(purchaseOrderId: String): List<PurchaseReceipt> {
        val response = comprehensiveApi.getPurchaseReceipts()
        return response.body()?.data?.filter { it.purchaseOrderId == purchaseOrderId } ?: emptyList()
    }
    
    override suspend fun createReceiptFromPurchaseOrder(purchaseOrderId: String): PurchaseReceipt {
        throw NotImplementedError("createReceiptFromPurchaseOrder not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun getPurchaseReceiptItems(receiptId: String): List<PurchaseReceiptItem> {
        return emptyList()
    }
    
    // Purchase Invoices - Note: These are not in ComprehensiveERPApiService yet
    override suspend fun getAllPurchaseInvoices(): List<PurchaseInvoice> {
        return emptyList()
    }
    
    override suspend fun getPurchaseInvoiceById(id: String): PurchaseInvoice? {
        return null
    }
    
    override suspend fun createPurchaseInvoice(invoice: PurchaseInvoice): PurchaseInvoice {
        throw NotImplementedError("Purchase invoices not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun updatePurchaseInvoice(id: String, invoice: PurchaseInvoice): PurchaseInvoice {
        throw NotImplementedError("Purchase invoices not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun deletePurchaseInvoice(id: String) {
        throw NotImplementedError("Purchase invoices not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun getInvoicesByPurchaseOrderId(purchaseOrderId: String): List<PurchaseInvoice> {
        return emptyList()
    }
    
    override suspend fun getInvoicesByVendor(vendorId: String): List<PurchaseInvoice> {
        return emptyList()
    }
    
    override suspend fun getOverduePurchaseInvoices(currentDate: String): List<PurchaseInvoice> {
        return emptyList()
    }
    
    override suspend fun updatePurchaseInvoicePayment(invoiceId: String, paidAmount: Double, status: String) {
        throw NotImplementedError("Purchase invoices not implemented in ComprehensiveERPApiService")
    }
    
    override suspend fun createInvoiceFromPurchaseOrder(purchaseOrderId: String): PurchaseInvoice {
        throw NotImplementedError("Purchase invoices not implemented in ComprehensiveERPApiService")
    }
}
