package com.printsoft.erp.data.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sales_orders")
data class SalesOrder(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "order_number")
    val orderNumber: String,
    
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    
    @ColumnInfo(name = "order_date")
    val orderDate: String,
    
    @ColumnInfo(name = "expected_delivery_date")
    val expectedDeliveryDate: String? = null,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, confirmed, processing, shipped, delivered, cancelled
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "sales_order_items")
data class SalesOrderItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "sales_order_id")
    val salesOrderId: String,
    
    @ColumnInfo(name = "product_id")
    val productId: String,
    
    @ColumnInfo(name = "quantity")
    val quantity: Int,
    
    @ColumnInfo(name = "unit_price")
    val unitPrice: Double,
    
    @ColumnInfo(name = "total_price")
    val totalPrice: Double,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)

@Entity(tableName = "quotations")
data class Quotation(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "quotation_number")
    val quotationNumber: String,
    
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    
    @ColumnInfo(name = "quotation_date")
    val quotationDate: String,
    
    @ColumnInfo(name = "valid_until")
    val validUntil: String? = null,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, sent, accepted, rejected, expired
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
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

@Entity(tableName = "quotation_items")
data class QuotationItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "quotation_id")
    val quotationId: String,
    
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

@Entity(tableName = "invoices")
data class Invoice(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "invoice_number")
    val invoiceNumber: String,
    
    @ColumnInfo(name = "customer_id")
    val customerId: String,
    
    @ColumnInfo(name = "sales_order_id")
    val salesOrderId: String? = null,
    
    @ColumnInfo(name = "invoice_date")
    val invoiceDate: String,
    
    @ColumnInfo(name = "due_date")
    val dueDate: String,
    
    @ColumnInfo(name = "status")
    val status: String, // draft, sent, pending, completed, overdue, cancelled
    
    @ColumnInfo(name = "subtotal")
    val subtotal: Double,
    
    @ColumnInfo(name = "tax_amount")
    val taxAmount: Double,
    
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    
    @ColumnInfo(name = "paid_amount")
    val paidAmount: Double,
    
    @ColumnInfo(name = "notes")
    val notes: String? = null,
    
    @ColumnInfo(name = "created_by")
    val createdBy: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String
)

@Entity(tableName = "invoice_items")
data class InvoiceItem(
    @PrimaryKey 
    val id: String,
    
    @ColumnInfo(name = "invoice_id")
    val invoiceId: String,
    
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

// DeliveryNote and DeliveryNoteItem moved to data.models.ERPModels
