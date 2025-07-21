package com.printsoft.erp.data.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

// Payment Receipt Model
@Entity(tableName = "payment_receipts")
data class PaymentReceipt(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "receipt_number")
    val receiptNumber: String,
    
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    
    @ColumnInfo(name = "invoice_id")
    val invoiceId: String? = null,
    
    @ColumnInfo(name = "payment_date")
    val paymentDate: String,
    
    @ColumnInfo(name = "amount_received")
    val amountReceived: Double,
    
    @ColumnInfo(name = "payment_method")
    val paymentMethod: String, // cash, cheque, card, bank_transfer, mobile_money
    
    @ColumnInfo(name = "reference_number")
    val referenceNumber: String? = null,
    
    @ColumnInfo(name = "bank_name")
    val bankName: String? = null,
    
    @ColumnInfo(name = "cheque_number")
    val chequeNumber: String? = null,
    
    @ColumnInfo(name = "cheque_date")
    val chequeDate: String? = null,
    
    @ColumnInfo(name = "status")
    val status: String, // pending, cleared, bounced, cancelled
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "received_by")
    val receivedBy: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

// Credit Note Model
@Entity(tableName = "credit_notes")
data class CreditNote(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "credit_note_number")
    val creditNoteNumber: String,
    
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    
    @ColumnInfo(name = "invoice_id")
    val invoiceId: String? = null,
    
    @ColumnInfo(name = "credit_date")
    val creditDate: String,
    
    @ColumnInfo(name = "reason")
    val reason: String, // return, discount, error_correction, goodwill
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, issued, applied, cancelled
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "credit_note_items")
data class CreditNoteItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "credit_note_id")
    val creditNoteId: String,
    
    @ColumnInfo(name = "product_id")
    val productId: String,
    
    @ColumnInfo(name = "quantity")
    val quantity: Int,
    
    @ColumnInfo(name = "unit_price")
    val unitPrice: Double,
    
    @ColumnInfo(name = "total_price")
    val totalPrice: Double,
    
    @ColumnInfo(name = "description")
    val description: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// Note: PurchaseReceipt and PurchaseReceiptItem are defined in PurchaseModels.kt

// Proforma Invoice Model
@Entity(tableName = "proforma_invoices")
data class ProformaInvoice(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "proforma_number")
    val proformaNumber: String,
    
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    
    @ColumnInfo(name = "quotation_id")
    val quotationId: String? = null,
    
    @ColumnInfo(name = "proforma_date")
    val proformaDate: String,
    
    @ColumnInfo(name = "valid_until")
    val validUntil: String? = null,
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, sent, accepted, expired, converted
    
    @ColumnInfo(name = "terms_and_conditions")
    val termsAndConditions: String? = null,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "proforma_invoice_items")
data class ProformaInvoiceItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "proforma_invoice_id")
    val proformaInvoiceId: String,
    
    @ColumnInfo(name = "product_id")
    val productId: String,
    
    @ColumnInfo(name = "quantity")
    val quantity: Int,
    
    @ColumnInfo(name = "unit_price")
    val unitPrice: Double,
    
    @ColumnInfo(name = "total_price")
    val totalPrice: Double,
    
    @ColumnInfo(name = "description")
    val description: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// Document Workflow State
@Entity(tableName = "document_workflows")
data class DocumentWorkflow(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "document_id")
    val documentId: String,
    
    @ColumnInfo(name = "document_type")
    val documentType: String, // quotation, sales_order, invoice, delivery_note, etc.
    
    @ColumnInfo(name = "current_status")
    val currentStatus: String,
    
    @ColumnInfo(name = "next_actions")
    val nextActions: String, // JSON array of possible next actions
    
    @ColumnInfo(name = "workflow_stage")
    val workflowStage: String, // draft, pending_approval, approved, executed, completed
    
    @ColumnInfo(name = "assigned_to")
    val assignedTo: String? = null,
    
    @ColumnInfo(name = "due_date")
    val dueDate: String? = null,
    
    @ColumnInfo(name = "priority")
    val priority: String, // low, medium, high, urgent
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

// Document Conversion History
@Entity(tableName = "document_conversions")
data class DocumentConversion(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "source_document_id")
    val sourceDocumentId: String,
    
    @ColumnInfo(name = "source_document_type")
    val sourceDocumentType: String,
    
    @ColumnInfo(name = "target_document_id")
    val targetDocumentId: String,
    
    @ColumnInfo(name = "target_document_type")
    val targetDocumentType: String,
    
    @ColumnInfo(name = "conversion_type")
    val conversionType: String, // quotation_to_order, order_to_invoice, etc.
    
    @ColumnInfo(name = "conversion_date")
    val conversionDate: String,
    
    @ColumnInfo(name = "converted_by")
    val convertedBy: String,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// Document Templates
@Entity(tableName = "document_templates")
data class DocumentTemplate(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "template_name")
    val templateName: String,
    
    @ColumnInfo(name = "document_type")
    val documentType: String,
    
    @ColumnInfo(name = "template_content")
    val templateContent: String, // JSON or HTML template
    
    @ColumnInfo(name = "is_default")
    val isDefault: Boolean = false,
    
    @ColumnInfo(name = "is_active")
    val isActive: Boolean = true,
    
    @ColumnInfo(name = "company_id")
    val companyId: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

// Document Attachments
@Entity(tableName = "document_attachments")
data class DocumentAttachment(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "document_id")
    val documentId: String,
    
    @ColumnInfo(name = "document_type")
    val documentType: String,
    
    @ColumnInfo(name = "filename")
    val filename: String,
    
    @ColumnInfo(name = "file_path")
    val filePath: String,
    
    @ColumnInfo(name = "file_size")
    val fileSize: Long,
    
    @ColumnInfo(name = "mime_type")
    val mimeType: String,
    
    @ColumnInfo(name = "description")
    val description: String? = null,
    
    @ColumnInfo(name = "uploaded_by")
    val uploadedBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

// Document Status History
@Entity(tableName = "document_status_history")
data class DocumentStatusHistory(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "document_id")
    val documentId: String,
    
    @ColumnInfo(name = "document_type")
    val documentType: String,
    
    @ColumnInfo(name = "previous_status")
    val previousStatus: String? = null,
    
    @ColumnInfo(name = "new_status")
    val newStatus: String,
    
    @ColumnInfo(name = "change_reason")
    val changeReason: String? = null,
    
    @ColumnInfo(name = "changed_by")
    val changedBy: String,
    
    @ColumnInfo(name = "changed_at")
    val changedAt: String,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null
)
