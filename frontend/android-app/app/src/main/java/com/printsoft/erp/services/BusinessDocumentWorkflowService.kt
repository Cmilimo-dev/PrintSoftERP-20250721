package com.printsoft.erp.services

import android.content.Context
import com.printsoft.erp.data.local.database.MobileERPDatabase
import com.printsoft.erp.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*

class BusinessDocumentWorkflowService(
    private val context: Context,
    private val database: MobileERPDatabase,
    private val exportService: MobileDocumentExportService
) {
    
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val dateTimeFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    
    // Document Status Definitions
    object DocumentStatus {
        // Quotation statuses
        const val QUOTATION_DRAFT = "draft"
        const val QUOTATION_SENT = "sent"
        const val QUOTATION_ACCEPTED = "accepted"
        const val QUOTATION_REJECTED = "rejected"
        const val QUOTATION_EXPIRED = "expired"
        const val QUOTATION_CANCELLED = "cancelled"
        
        // Sales Order statuses
        const val SALES_ORDER_DRAFT = "draft"
        const val SALES_ORDER_CONFIRMED = "confirmed"
        const val SALES_ORDER_PROCESSING = "processing"
        const val SALES_ORDER_SHIPPED = "shipped"
        const val SALES_ORDER_DELIVERED = "delivered"
        const val SALES_ORDER_CANCELLED = "cancelled"
        
        // Invoice statuses
        const val INVOICE_DRAFT = "draft"
        const val INVOICE_SENT = "sent"
        const val INVOICE_PENDING = "pending"
        const val INVOICE_COMPLETED = "completed"
        const val INVOICE_OVERDUE = "overdue"
        const val INVOICE_CANCELLED = "cancelled"
        
        // Payment Receipt statuses
        const val PAYMENT_PENDING = "pending"
        const val PAYMENT_CLEARED = "cleared"
        const val PAYMENT_BOUNCED = "bounced"
        const val PAYMENT_CANCELLED = "cancelled"
        
        // Delivery Note statuses
        const val DELIVERY_PENDING = "pending"
        const val DELIVERY_IN_TRANSIT = "in_transit"
        const val DELIVERY_DELIVERED = "delivered"
        const val DELIVERY_CANCELLED = "cancelled"
    }
    
    // Document Type Definitions
    object DocumentType {
        const val QUOTATION = "quotation"
        const val SALES_ORDER = "sales_order"
        const val INVOICE = "invoice"
        const val PROFORMA_INVOICE = "proforma_invoice"
        const val DELIVERY_NOTE = "delivery_note"
        const val PAYMENT_RECEIPT = "payment_receipt"
        const val CREDIT_NOTE = "credit_note"
        const val PURCHASE_ORDER = "purchase_order"
        const val PURCHASE_RECEIPT = "purchase_receipt"
    }
    
    /**
     * Create a new quotation
     */
    suspend fun createQuotation(quotation: Quotation): Result<String> = withContext(Dispatchers.IO) {
        try {
            // Generate quotation number if not provided
            val quotationWithNumber = if (quotation.quotationNumber.isEmpty()) {
                quotation.copy(quotationNumber = generateDocumentNumber(DocumentType.QUOTATION))
            } else {
                quotation
            }
            
            // Save quotation
            database.quotationDao().insertQuotation(quotationWithNumber)
            
            // Create workflow entry
            createDocumentWorkflow(quotationWithNumber.id, DocumentType.QUOTATION, DocumentStatus.QUOTATION_DRAFT)
            
            // Log status history
            logStatusChange(quotationWithNumber.id, DocumentType.QUOTATION, null, DocumentStatus.QUOTATION_DRAFT, "Created quotation")
            
            Result.success(quotationWithNumber.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Convert quotation to sales order
     */
    suspend fun convertQuotationToSalesOrder(quotationId: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val quotation = database.quotationDao().getQuotationById(quotationId)
                ?: return@withContext Result.failure(Exception("Quotation not found"))
            
            // Validate conversion
            if (quotation.status != DocumentStatus.QUOTATION_ACCEPTED) {
                return@withContext Result.failure(Exception("Quotation must be accepted before conversion"))
            }
            
            // Create sales order from quotation
            val salesOrder = SalesOrder(
                id = UUID.randomUUID().toString(),
                orderNumber = generateDocumentNumber(DocumentType.SALES_ORDER),
                customerId = quotation.customerId,
                orderDate = getCurrentDate(),
                expectedDeliveryDate = null,
                status = DocumentStatus.SALES_ORDER_DRAFT,
                subtotal = quotation.subtotal,
                taxAmount = quotation.taxAmount,
                totalAmount = quotation.totalAmount,
                notes = "Converted from Quotation ${quotation.quotationNumber}",
                createdBy = getCurrentUserId(),
                createdAt = getCurrentDateTime(),
                updatedAt = getCurrentDateTime()
            )
            
            // Save sales order
            database.salesOrderDao().insertSalesOrder(salesOrder)
            
            // Copy quotation items to sales order items
            copyQuotationItemsToSalesOrder(quotationId, salesOrder.id)
            
            // Create workflow entry
            createDocumentWorkflow(salesOrder.id, DocumentType.SALES_ORDER, DocumentStatus.SALES_ORDER_DRAFT)
            
            // Log conversion
            logDocumentConversion(quotationId, DocumentType.QUOTATION, salesOrder.id, DocumentType.SALES_ORDER, "quotation_to_sales_order")
            
            Result.success(salesOrder.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Convert sales order to invoice
     */
    suspend fun convertSalesOrderToInvoice(salesOrderId: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val salesOrder = database.salesOrderDao().getSalesOrderById(salesOrderId)
                ?: return@withContext Result.failure(Exception("Sales order not found"))
            
            // Validate conversion
            if (salesOrder.status != DocumentStatus.SALES_ORDER_CONFIRMED) {
                return@withContext Result.failure(Exception("Sales order must be confirmed before conversion"))
            }
            
            // Create invoice from sales order
            val invoice = Invoice(
                id = UUID.randomUUID().toString(),
                invoiceNumber = generateDocumentNumber(DocumentType.INVOICE),
                customerId = salesOrder.customerId,
                salesOrderId = salesOrderId,
                invoiceDate = getCurrentDate(),
                dueDate = calculateDueDate(30), // Default 30 days
                status = DocumentStatus.INVOICE_DRAFT,
                subtotal = salesOrder.subtotal,
                taxAmount = salesOrder.taxAmount,
                totalAmount = salesOrder.totalAmount,
                paidAmount = 0.0,
                notes = "Generated from Sales Order ${salesOrder.orderNumber}",
                createdBy = getCurrentUserId(),
                createdAt = getCurrentDateTime(),
                updatedAt = getCurrentDateTime()
            )
            
            // Save invoice
            database.invoiceDao().insertInvoice(invoice)
            
            // Copy sales order items to invoice items
            copySalesOrderItemsToInvoice(salesOrderId, invoice.id)
            
            // Create workflow entry
            createDocumentWorkflow(invoice.id, DocumentType.INVOICE, DocumentStatus.INVOICE_DRAFT)
            
            // Log conversion
            logDocumentConversion(salesOrderId, DocumentType.SALES_ORDER, invoice.id, DocumentType.INVOICE, "sales_order_to_invoice")
            
            Result.success(invoice.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create delivery note from sales order
     */
    suspend fun createDeliveryNoteFromSalesOrder(salesOrderId: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val salesOrder = database.salesOrderDao().getSalesOrderById(salesOrderId)
                ?: return@withContext Result.failure(Exception("Sales order not found"))
            
            val customer = database.customerDao().getCustomerById(salesOrder.customerId)
            
            val deliveryNote = DeliveryNote(
                id = UUID.randomUUID().toString(),
                deliveryNumber = generateDocumentNumber(DocumentType.DELIVERY_NOTE),
                salesOrderId = salesOrderId,
                customerId = salesOrder.customerId,
                deliveryDate = getCurrentDate(),
                deliveryAddress = customer?.address,
                status = DocumentStatus.DELIVERY_PENDING,
                deliveredBy = null,
                recipientName = null,
                recipientSignature = null,
                notes = "Delivery for Sales Order ${salesOrder.orderNumber}",
                createdBy = getCurrentUserId(),
                createdAt = getCurrentDateTime(),
                updatedAt = getCurrentDateTime()
            )
            
            // Save delivery note
            database.deliveryNoteDao().insertDeliveryNote(deliveryNote)
            
            // Copy sales order items to delivery note items
            copySalesOrderItemsToDeliveryNote(salesOrderId, deliveryNote.id)
            
            // Create workflow entry
            createDocumentWorkflow(deliveryNote.id, DocumentType.DELIVERY_NOTE, DocumentStatus.DELIVERY_PENDING)
            
            Result.success(deliveryNote.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Record payment receipt for invoice
     */
    suspend fun recordPaymentReceipt(
        invoiceId: String,
        amount: Double,
        paymentMethod: String,
        referenceNumber: String? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val invoice = database.invoiceDao().getInvoiceById(invoiceId)
                ?: return@withContext Result.failure(Exception("Invoice not found"))
            
            val paymentReceipt = PaymentReceipt(
                id = UUID.randomUUID().toString(),
                receiptNumber = generateDocumentNumber(DocumentType.PAYMENT_RECEIPT),
                customerId = invoice.customerId,
                invoiceId = invoiceId,
                paymentDate = getCurrentDate(),
                amountReceived = amount,
                paymentMethod = paymentMethod,
                referenceNumber = referenceNumber,
                bankName = null,
                chequeNumber = null,
                chequeDate = null,
                status = DocumentStatus.PAYMENT_PENDING,
                notes = "Payment for Invoice ${invoice.invoiceNumber}",
                receivedBy = getCurrentUserId(),
                createdBy = getCurrentUserId(),
                createdAt = getCurrentDateTime(),
                updatedAt = getCurrentDateTime()
            )
            
            // Save payment receipt
            database.paymentReceiptDao().insertPaymentReceipt(paymentReceipt)
            
            // Update invoice paid amount
            val updatedInvoice = invoice.copy(
                paidAmount = invoice.paidAmount + amount,
                updatedAt = getCurrentDateTime()
            )
            database.invoiceDao().updateInvoice(updatedInvoice)
            
            // Update invoice status if fully paid
            if (updatedInvoice.paidAmount >= updatedInvoice.totalAmount) {
                updateDocumentStatus(invoiceId, DocumentType.INVOICE, DocumentStatus.INVOICE_COMPLETED)
            }
            
            // Create workflow entry for payment
            createDocumentWorkflow(paymentReceipt.id, DocumentType.PAYMENT_RECEIPT, DocumentStatus.PAYMENT_PENDING)
            
            Result.success(paymentReceipt.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update document status with validation
     */
    suspend fun updateDocumentStatus(
        documentId: String,
        documentType: String,
        newStatus: String,
        reason: String? = null
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            // Get current status
            val currentStatus = when (documentType) {
                DocumentType.QUOTATION -> database.quotationDao().getQuotationById(documentId)?.status
                DocumentType.SALES_ORDER -> database.salesOrderDao().getSalesOrderById(documentId)?.status
                DocumentType.INVOICE -> database.invoiceDao().getInvoiceById(documentId)?.status
                else -> null
            } ?: return@withContext Result.failure(Exception("Document not found"))
            
            // Validate status transition
            if (!isValidStatusTransition(documentType, currentStatus, newStatus)) {
                return@withContext Result.failure(Exception("Invalid status transition from $currentStatus to $newStatus"))
            }
            
            // Update document status
            when (documentType) {
                DocumentType.QUOTATION -> {
                    val quotation = database.quotationDao().getQuotationById(documentId)!!
                    database.quotationDao().updateQuotation(quotation.copy(status = newStatus, updatedAt = getCurrentDateTime()))
                }
                DocumentType.SALES_ORDER -> {
                    val salesOrder = database.salesOrderDao().getSalesOrderById(documentId)!!
                    database.salesOrderDao().updateSalesOrder(salesOrder.copy(status = newStatus, updatedAt = getCurrentDateTime()))
                }
                DocumentType.INVOICE -> {
                    val invoice = database.invoiceDao().getInvoiceById(documentId)!!
                    database.invoiceDao().updateInvoice(invoice.copy(status = newStatus, updatedAt = getCurrentDateTime()))
                }
            }
            
            // Update workflow
            updateWorkflowStatus(documentId, documentType, newStatus)
            
            // Log status change
            logStatusChange(documentId, documentType, currentStatus, newStatus, reason ?: "Status updated")
            
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Generate and export document
     */
    suspend fun generateAndExportDocument(
        documentId: String,
        documentType: String,
        exportOptions: MobileExportOptions
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val document = when (documentType) {
                DocumentType.QUOTATION -> database.quotationDao().getQuotationById(documentId)
                DocumentType.SALES_ORDER -> database.salesOrderDao().getSalesOrderById(documentId)
                DocumentType.INVOICE -> database.invoiceDao().getInvoiceById(documentId)
                else -> null
            } ?: return@withContext Result.failure(Exception("Document not found"))
            
            exportService.exportDocument(document, documentType, exportOptions)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get document workflow status
     */
    suspend fun getDocumentWorkflow(documentId: String): DocumentWorkflow? {
        return database.documentWorkflowDao().getWorkflowByDocumentId(documentId)
    }
    
    /**
     * Get all possible next actions for a document
     */
    suspend fun getNextActions(documentId: String, documentType: String): List<String> {
        return when (documentType) {
            DocumentType.QUOTATION -> {
                val quotation = database.quotationDao().getQuotationById(documentId)
                when (quotation?.status) {
                    DocumentStatus.QUOTATION_DRAFT -> listOf("send", "cancel", "edit")
                    DocumentStatus.QUOTATION_SENT -> listOf("accept", "reject", "revise")
                    DocumentStatus.QUOTATION_ACCEPTED -> listOf("convert_to_order", "convert_to_proforma")
                    else -> emptyList()
                }
            }
            DocumentType.SALES_ORDER -> {
                val salesOrder = database.salesOrderDao().getSalesOrderById(documentId)
                when (salesOrder?.status) {
                    DocumentStatus.SALES_ORDER_DRAFT -> listOf("confirm", "cancel", "edit")
                    DocumentStatus.SALES_ORDER_CONFIRMED -> listOf("process", "create_invoice", "create_delivery_note")
                    DocumentStatus.SALES_ORDER_PROCESSING -> listOf("ship", "cancel")
                    DocumentStatus.SALES_ORDER_SHIPPED -> listOf("mark_delivered")
                    else -> emptyList()
                }
            }
            DocumentType.INVOICE -> {
                val invoice = database.invoiceDao().getInvoiceById(documentId)
                when (invoice?.status) {
                    DocumentStatus.INVOICE_DRAFT -> listOf("send", "cancel", "edit")
                    DocumentStatus.INVOICE_SENT -> listOf("record_payment", "mark_overdue")
                    DocumentStatus.INVOICE_PENDING -> listOf("record_payment", "send_reminder")
                    else -> emptyList()
                }
            }
            else -> emptyList()
        }
    }
    
    // Private helper methods
    private suspend fun createDocumentWorkflow(documentId: String, documentType: String, status: String) {
        val workflow = DocumentWorkflow(
            id = UUID.randomUUID().toString(),
            documentId = documentId,
            documentType = documentType,
            currentStatus = status,
            nextActions = "", // Will be populated based on status
            workflowStage = "draft",
            assignedTo = getCurrentUserId(),
            dueDate = null,
            priority = "medium",
            notes = null,
            createdBy = getCurrentUserId(),
            createdAt = getCurrentDateTime(),
            updatedAt = getCurrentDateTime()
        )
        database.documentWorkflowDao().insertWorkflow(workflow)
    }
    
    private suspend fun updateWorkflowStatus(documentId: String, documentType: String, newStatus: String) {
        val workflow = database.documentWorkflowDao().getWorkflowByDocumentId(documentId)
        workflow?.let {
            val updatedWorkflow = it.copy(
                currentStatus = newStatus,
                updatedAt = getCurrentDateTime()
            )
            database.documentWorkflowDao().updateWorkflow(updatedWorkflow)
        }
    }
    
    private suspend fun logStatusChange(
        documentId: String,
        documentType: String,
        previousStatus: String?,
        newStatus: String,
        reason: String
    ) {
        val statusHistory = DocumentStatusHistory(
            id = UUID.randomUUID().toString(),
            documentId = documentId,
            documentType = documentType,
            previousStatus = previousStatus,
            newStatus = newStatus,
            changeReason = reason,
            changeDate = getCurrentDate(),
            changedAt = getCurrentDateTime(),
            changedBy = getCurrentUserId(),
            reason = null,
            notes = null
        )
        database.documentStatusHistoryDao().insertStatusHistory(statusHistory)
    }
    
    private suspend fun logDocumentConversion(
        sourceId: String,
        sourceType: String,
        targetId: String,
        targetType: String,
        conversionType: String
    ) {
        val conversion = DocumentConversion(
            id = UUID.randomUUID().toString(),
            sourceDocumentId = sourceId,
            sourceDocumentType = sourceType,
            targetDocumentId = targetId,
            targetDocumentType = targetType,
            conversionType = conversionType,
            conversionDate = getCurrentDate(),
            convertedBy = getCurrentUserId(),
            notes = null,
            createdAt = getCurrentDateTime()
        )
        database.documentConversionDao().insertConversion(conversion)
    }
    
    private suspend fun copyQuotationItemsToSalesOrder(quotationId: String, salesOrderId: String) {
        // Implementation would copy quotation items to sales order items
        // This is a placeholder for the actual implementation
    }
    
    private suspend fun copySalesOrderItemsToInvoice(salesOrderId: String, invoiceId: String) {
        // Implementation would copy sales order items to invoice items
        // This is a placeholder for the actual implementation
    }
    
    private suspend fun copySalesOrderItemsToDeliveryNote(salesOrderId: String, deliveryNoteId: String) {
        // Implementation would copy sales order items to delivery note items
        // This is a placeholder for the actual implementation
    }
    
    private fun isValidStatusTransition(documentType: String, currentStatus: String, newStatus: String): Boolean {
        return when (documentType) {
            DocumentType.QUOTATION -> {
                when (currentStatus) {
                    DocumentStatus.QUOTATION_DRAFT -> newStatus in listOf(DocumentStatus.QUOTATION_SENT, DocumentStatus.QUOTATION_CANCELLED)
                    DocumentStatus.QUOTATION_SENT -> newStatus in listOf(DocumentStatus.QUOTATION_ACCEPTED, DocumentStatus.QUOTATION_REJECTED, DocumentStatus.QUOTATION_EXPIRED)
                    else -> false
                }
            }
            DocumentType.SALES_ORDER -> {
                when (currentStatus) {
                    DocumentStatus.SALES_ORDER_DRAFT -> newStatus in listOf(DocumentStatus.SALES_ORDER_CONFIRMED, DocumentStatus.SALES_ORDER_CANCELLED)
                    DocumentStatus.SALES_ORDER_CONFIRMED -> newStatus in listOf(DocumentStatus.SALES_ORDER_PROCESSING, DocumentStatus.SALES_ORDER_CANCELLED)
                    DocumentStatus.SALES_ORDER_PROCESSING -> newStatus in listOf(DocumentStatus.SALES_ORDER_SHIPPED, DocumentStatus.SALES_ORDER_CANCELLED)
                    DocumentStatus.SALES_ORDER_SHIPPED -> newStatus in listOf(DocumentStatus.SALES_ORDER_DELIVERED)
                    else -> false
                }
            }
            DocumentType.INVOICE -> {
                when (currentStatus) {
                    DocumentStatus.INVOICE_DRAFT -> newStatus in listOf(DocumentStatus.INVOICE_SENT, DocumentStatus.INVOICE_CANCELLED)
                    DocumentStatus.INVOICE_SENT -> newStatus in listOf(DocumentStatus.INVOICE_PENDING, DocumentStatus.INVOICE_COMPLETED, DocumentStatus.INVOICE_OVERDUE)
                    DocumentStatus.INVOICE_PENDING -> newStatus in listOf(DocumentStatus.INVOICE_COMPLETED, DocumentStatus.INVOICE_OVERDUE)
                    else -> false
                }
            }
            else -> true // Allow all transitions for other document types
        }
    }
    
    private fun generateDocumentNumber(documentType: String): String {
        val prefix = when (documentType) {
            DocumentType.QUOTATION -> "QT"
            DocumentType.SALES_ORDER -> "SO"
            DocumentType.INVOICE -> "INV"
            DocumentType.PROFORMA_INVOICE -> "PI"
            DocumentType.DELIVERY_NOTE -> "DN"
            DocumentType.PAYMENT_RECEIPT -> "PR"
            DocumentType.CREDIT_NOTE -> "CN"
            DocumentType.PURCHASE_ORDER -> "PO"
            DocumentType.PURCHASE_RECEIPT -> "GRN"
            else -> "DOC"
        }
        
        val year = Calendar.getInstance().get(Calendar.YEAR)
        val timestamp = System.currentTimeMillis().toString().takeLast(6)
        return "$prefix-$year-$timestamp"
    }
    
    private fun calculateDueDate(daysFromNow: Int): String {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_MONTH, daysFromNow)
        return dateFormat.format(calendar.time)
    }
    
    private fun getCurrentDate(): String {
        return dateFormat.format(Date())
    }
    
    private fun getCurrentDateTime(): String {
        return dateTimeFormat.format(Date())
    }
    
    private fun getCurrentUserId(): String {
        // This should return the actual current user ID
        return "current_user_id"
    }
}
