package com.printsoft.erp.data.api

import com.printsoft.erp.data.models.*

/**
 * Simplified API service interface for repository compatibility.
 * This serves as an adapter that wraps the ComprehensiveERPApiService.
 */
interface ApiService {
    
    // Sales Orders
    suspend fun getAllSalesOrders(): List<SalesOrder>
    suspend fun getSalesOrderById(id: String): SalesOrder?
    suspend fun createSalesOrder(salesOrder: SalesOrder): SalesOrder
    suspend fun updateSalesOrder(id: String, salesOrder: SalesOrder): SalesOrder
    suspend fun deleteSalesOrder(id: String)
    suspend fun getSalesOrdersByCustomer(customerId: String): List<SalesOrder>
    suspend fun getSalesOrdersByStatus(status: String): List<SalesOrder>
    suspend fun searchSalesOrders(query: String): List<SalesOrder>
    suspend fun convertQuotationToSalesOrder(quotationId: String): SalesOrder
    suspend fun getSalesOrderItems(salesOrderId: String): List<SalesOrderItem>
    
    // Quotations
    suspend fun getAllQuotations(): List<Quotation>
    suspend fun getQuotationById(id: String): Quotation?
    suspend fun createQuotation(quotation: Quotation): Quotation
    suspend fun updateQuotation(id: String, quotation: Quotation): Quotation
    suspend fun deleteQuotation(id: String)
    suspend fun getQuotationsByCustomer(customerId: String): List<Quotation>
    suspend fun searchQuotations(query: String): List<Quotation>
    suspend fun getQuotationItems(quotationId: String): List<QuotationItem>
    
    // Invoices
    suspend fun getAllInvoices(): List<Invoice>
    suspend fun getInvoiceById(id: String): Invoice?
    suspend fun createInvoice(invoice: Invoice): Invoice
    suspend fun updateInvoice(id: String, invoice: Invoice): Invoice
    suspend fun deleteInvoice(id: String)
    suspend fun getInvoicesByCustomer(customerId: String): List<Invoice>
    suspend fun getInvoicesByStatus(status: String): List<Invoice>
    suspend fun searchInvoices(query: String): List<Invoice>
    suspend fun convertSalesOrderToInvoice(salesOrderId: String): Invoice
    suspend fun getInvoiceItems(invoiceId: String): List<InvoiceItem>
    
    // Delivery Notes
    suspend fun getAllDeliveryNotes(): List<DeliveryNote>
    suspend fun getDeliveryNoteById(id: String): DeliveryNote?
    suspend fun createDeliveryNote(deliveryNote: DeliveryNote): DeliveryNote
    suspend fun updateDeliveryNote(id: String, deliveryNote: DeliveryNote): DeliveryNote
    suspend fun deleteDeliveryNote(id: String)
    suspend fun getDeliveryNotesByCustomer(customerId: String): List<DeliveryNote>
    suspend fun getDeliveryNotesByStatus(status: String): List<DeliveryNote>
    suspend fun searchDeliveryNotes(query: String): List<DeliveryNote>
    suspend fun createDeliveryNoteFromSalesOrder(salesOrderId: String): DeliveryNote
    suspend fun getDeliveryNoteItems(deliveryNoteId: String): List<DeliveryNoteItem>
    
    // Vendors
    suspend fun getAllVendors(): List<Vendor>
    suspend fun getVendorById(id: String): Vendor?
    suspend fun createVendor(vendor: Vendor): Vendor
    suspend fun updateVendor(id: String, vendor: Vendor): Vendor
    suspend fun deleteVendor(id: String)
    suspend fun searchVendors(query: String): List<Vendor>
    suspend fun getVendorsByStatus(status: String): List<Vendor>
    
    // Purchase Orders
    suspend fun getAllPurchaseOrders(): List<PurchaseOrder>
    suspend fun getPurchaseOrderById(id: String): PurchaseOrder?
    suspend fun createPurchaseOrder(purchaseOrder: PurchaseOrder): PurchaseOrder
    suspend fun updatePurchaseOrder(id: String, purchaseOrder: PurchaseOrder): PurchaseOrder
    suspend fun deletePurchaseOrder(id: String)
    suspend fun getPurchaseOrdersByVendor(vendorId: String): List<PurchaseOrder>
    suspend fun getPurchaseOrdersByStatus(status: String): List<PurchaseOrder>
    suspend fun getPurchaseOrdersByApprovalStatus(approvalStatus: String): List<PurchaseOrder>
    suspend fun searchPurchaseOrders(query: String): List<PurchaseOrder>
    suspend fun approvePurchaseOrder(id: String, approvedBy: String): PurchaseOrder
    suspend fun getPurchaseOrderItems(purchaseOrderId: String): List<PurchaseOrderItem>
    
    // Purchase Receipts
    suspend fun getAllPurchaseReceipts(): List<PurchaseReceipt>
    suspend fun getPurchaseReceiptById(id: String): PurchaseReceipt?
    suspend fun createPurchaseReceipt(receipt: PurchaseReceipt): PurchaseReceipt
    suspend fun updatePurchaseReceipt(id: String, receipt: PurchaseReceipt): PurchaseReceipt
    suspend fun deletePurchaseReceipt(id: String)
    suspend fun getReceiptsByPurchaseOrderId(purchaseOrderId: String): List<PurchaseReceipt>
    suspend fun createReceiptFromPurchaseOrder(purchaseOrderId: String): PurchaseReceipt
    suspend fun getPurchaseReceiptItems(receiptId: String): List<PurchaseReceiptItem>
    
    // Purchase Invoices
    suspend fun getAllPurchaseInvoices(): List<PurchaseInvoice>
    suspend fun getPurchaseInvoiceById(id: String): PurchaseInvoice?
    suspend fun createPurchaseInvoice(invoice: PurchaseInvoice): PurchaseInvoice
    suspend fun updatePurchaseInvoice(id: String, invoice: PurchaseInvoice): PurchaseInvoice
    suspend fun deletePurchaseInvoice(id: String)
    suspend fun getInvoicesByPurchaseOrderId(purchaseOrderId: String): List<PurchaseInvoice>
    suspend fun getInvoicesByVendor(vendorId: String): List<PurchaseInvoice>
    suspend fun getOverduePurchaseInvoices(currentDate: String): List<PurchaseInvoice>
    suspend fun updatePurchaseInvoicePayment(invoiceId: String, paidAmount: Double, status: String)
    suspend fun createInvoiceFromPurchaseOrder(purchaseOrderId: String): PurchaseInvoice
}
