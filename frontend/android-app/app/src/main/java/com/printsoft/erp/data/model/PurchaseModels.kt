package com.printsoft.erp.data.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "vendors")
data class Vendor(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "name")
    val name: String,
    
    @ColumnInfo(name = "email")
    val email: String? = null,
    
    @ColumnInfo(name = "phone")
    val phone: String? = null,
    
    @ColumnInfo(name = "address")
    val address: String? = null,
    
    @ColumnInfo(name = "city")
    val city: String? = null,
    
    @ColumnInfo(name = "state")
    val state: String? = null,
    
    @ColumnInfo(name = "postal_code")
    val postalCode: String? = null,
    
    @ColumnInfo(name = "country")
    val country: String? = null,
    
    @ColumnInfo(name = "tax_id")
    val taxId: String? = null,
    
    @ColumnInfo(name = "payment_terms")
    val paymentTerms: String? = null,
    
    @ColumnInfo(name = "preferred_currency")
    val preferredCurrency: String? = null,
    
    @ColumnInfo(name = "lead_time_days")
    val leadTimeDays: Int? = null,
    
    @ColumnInfo(name = "capabilities")
    val capabilities: String? = null, // JSON string of capabilities array
    
    @ColumnInfo(name = "status")
    val status: String, // active, inactive, blacklisted
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "purchase_orders")
data class PurchaseOrder(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "po_number")
    val poNumber: String,
    
    @ColumnInfo(name = "vendor_id")
    val vendorId: String,
    
    @ColumnInfo(name = "order_date")
    val orderDate: String,
    
    @ColumnInfo(name = "expected_delivery_date")
    val expectedDeliveryDate: String? = null,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, pending, approved, authorized, completed, cancelled
    
    @ColumnInfo(name = "approval_status")
    val approvalStatus: String, // pending, approved, rejected
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
    @ColumnInfo(name = "currency")
    val currency: String,
    
    @ColumnInfo(name = "tax_type")
    val taxType: String, // inclusive, exclusive, per_item, overall
    
    @ColumnInfo(name = "default_tax_rate")
    val defaultTaxRate: Double,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "terms")
    val terms: String? = null,
    
    @ColumnInfo(name = "qr_code_data")
    val qrCodeData: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "approved_by")
    val approvedBy: String? = null,
    
    @ColumnInfo(name = "approved_at")
    val approvedAt: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "purchase_order_items")
data class PurchaseOrderItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "purchase_order_id")
    val purchaseOrderId: String,
    
    @ColumnInfo(name = "product_id")
    val productId: String? = null,
    
    @ColumnInfo(name = "item_code")
    val itemCode: String,
    
    @ColumnInfo(name = "description")
    val description: String,
    
    @ColumnInfo(name = "quantity")
    val quantity: Int,
    
    @ColumnInfo(name = "unit_price")
    val unitPrice: Double,
    
    @ColumnInfo(name = "total_price")
    val totalPrice: Double,
    
    @ColumnInfo(name = "tax_rate")
    val taxRate: Double? = null,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double? = null,
    
    @ColumnInfo(name = "received_quantity")
    val receivedQuantity: Int = 0,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

@Entity(tableName = "purchase_receipts")
data class PurchaseReceipt(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "receipt_number")
    val receiptNumber: String,
    
    @ColumnInfo(name = "purchase_order_id")
    val purchaseOrderId: String,
    
    @ColumnInfo(name = "vendor_id")
    val vendorId: String,
    
    @ColumnInfo(name = "receipt_date")
    val receiptDate: String,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, completed, cancelled
    
    @ColumnInfo(name = "received_by")
    val receivedBy: String? = null,
    
    @ColumnInfo(name = "inspection_notes")
    val inspectionNotes: String? = null,
    
    @ColumnInfo(name = "quality_check_status")
    val qualityCheckStatus: String? = null, // passed, failed, pending
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "purchase_receipt_items")
data class PurchaseReceiptItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "purchase_receipt_id")
    val purchaseReceiptId: String,
    
    @ColumnInfo(name = "purchase_order_item_id")
    val purchaseOrderItemId: String,
    
    @ColumnInfo(name = "quantity_received")
    val quantityReceived: Int,
    
    @ColumnInfo(name = "quantity_rejected")
    val quantityRejected: Int = 0,
    
    @ColumnInfo(name = "rejection_reason")
    val rejectionReason: String? = null,
    
    @ColumnInfo(name = "inspection_status")
    val inspectionStatus: String, // passed, failed, pending
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

@Entity(tableName = "purchase_invoices")
data class PurchaseInvoice(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "invoice_number")
    val invoiceNumber: String,
    
    @ColumnInfo(name = "vendor_invoice_number")
    val vendorInvoiceNumber: String? = null,
    
    @ColumnInfo(name = "purchase_order_id")
    val purchaseOrderId: String,
    
    @ColumnInfo(name = "vendor_id")
    val vendorId: String,
    
    @ColumnInfo(name = "invoice_date")
    val invoiceDate: String,
    
    @ColumnInfo(name = "due_date")
    val dueDate: String,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, pending, approved, paid, overdue, cancelled
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
    @ColumnInfo(name = "paid_amount")
    val paidAmount: Double,
    
    @ColumnInfo(name = "currency")
    val currency: String,
    
    @ColumnInfo(name = "payment_terms")
    val paymentTerms: String? = null,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "approved_by")
    val approvedBy: String? = null,
    
    @ColumnInfo(name = "approved_at")
    val approvedAt: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)
