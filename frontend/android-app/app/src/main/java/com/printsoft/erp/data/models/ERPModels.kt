package com.printsoft.erp.data.models

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.google.gson.annotations.SerializedName

// Core ERP Data Models based on the React TypeScript interfaces

@Entity(tableName = "customers")
data class Customer(
    @PrimaryKey val id: String,
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zip: String? = null,
    @ColumnInfo(name = "postal_code") @SerializedName("postal_code") val postalCode: String? = null,
    val country: String? = null,
    @ColumnInfo(name = "customer_number") @SerializedName("customer_number") val customerNumber: String? = null,
    @ColumnInfo(name = "credit_limit") @SerializedName("credit_limit") val creditLimit: Double? = null,
    @ColumnInfo(name = "payment_terms") @SerializedName("payment_terms") val paymentTerms: String? = null,
    @ColumnInfo(name = "preferred_currency") @SerializedName("preferred_currency") val preferredCurrency: String? = null,
    @ColumnInfo(name = "customer_type") @SerializedName("customer_type") val customerType: String? = null, // 'individual' | 'company'
    @ColumnInfo(name = "company_name") @SerializedName("company_name") val companyName: String? = null,
    @ColumnInfo(name = "first_name") @SerializedName("first_name") val firstName: String? = null,
    @ColumnInfo(name = "last_name") @SerializedName("last_name") val lastName: String? = null,
    @ColumnInfo(name = "tax_number") @SerializedName("tax_number") val taxNumber: String? = null,
    val status: String? = null,
    val notes: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String? = null,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String? = null
)

@Entity(tableName = "vendors")
data class Vendor(
    @PrimaryKey val id: String,
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zip: String? = null,
    val country: String? = null,
    @ColumnInfo(name = "vendor_number") @SerializedName("vendor_number") val vendorNumber: String? = null,
    @ColumnInfo(name = "payment_terms") @SerializedName("payment_terms") val paymentTerms: String? = null
)

@Entity(tableName = "products")
data class Product(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val name: String,
    val description: String? = null,
    val category: String,
    val unit: String,
    @ColumnInfo(name = "current_stock") @SerializedName("current_stock") val currentStock: Int,
    @ColumnInfo(name = "min_stock") @SerializedName("min_stock") val minStock: Int,
    @ColumnInfo(name = "max_stock") @SerializedName("max_stock") val maxStock: Int? = null,
    @ColumnInfo(name = "unit_cost") @SerializedName("unit_cost") val unitCost: Double,
    @ColumnInfo(name = "sell_price") @SerializedName("sell_price") val sellPrice: Double,
    val location: String? = null,
    val supplier: String? = null,
    @ColumnInfo(name = "last_restocked") @SerializedName("last_restocked") val lastRestocked: String? = null
)

@Entity(tableName = "sales_orders")
data class SalesOrder(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "order_number") @SerializedName("order_number") val orderNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "order_date") @SerializedName("order_date") val orderDate: String,
    @ColumnInfo(name = "expected_delivery_date") @SerializedName("expected_delivery_date") val expectedDeliveryDate: String? = null,
    val status: String, // 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "invoices")
data class Invoice(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "invoice_number") @SerializedName("invoice_number") val invoiceNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "sales_order_id") @SerializedName("sales_order_id") val salesOrderId: String? = null,
    @ColumnInfo(name = "invoice_date") @SerializedName("invoice_date") val invoiceDate: String,
    @ColumnInfo(name = "due_date") @SerializedName("due_date") val dueDate: String,
    val status: String, // 'draft' | 'sent' | 'pending' | 'completed' | 'overdue' | 'cancelled'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    @ColumnInfo(name = "paid_amount") @SerializedName("paid_amount") val paidAmount: Double = 0.0,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "quotations")
data class Quotation(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "quotation_number") @SerializedName("quotation_number") val quotationNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "quotation_date") @SerializedName("quotation_date") val quotationDate: String,
    @ColumnInfo(name = "valid_until") @SerializedName("valid_until") val validUntil: String? = null,
    val status: String, // 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    @ColumnInfo(name = "terms_and_conditions") @SerializedName("terms_and_conditions") val termsAndConditions: String? = null,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "purchase_orders")
data class PurchaseOrder(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "po_number") @SerializedName("po_number") val poNumber: String,
    @ColumnInfo(name = "vendor_id") @SerializedName("vendor_id") val vendorId: String,
    @ColumnInfo(name = "order_date") @SerializedName("order_date") val orderDate: String,
    @ColumnInfo(name = "expected_delivery_date") @SerializedName("expected_delivery_date") val expectedDeliveryDate: String? = null,
    val status: String, // 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
    @ColumnInfo(name = "approval_status") @SerializedName("approval_status") val approvalStatus: String? = null, // 'pending' | 'approved' | 'rejected'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "stock_movements")
data class StockMovement(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    @ColumnInfo(name = "movement_type") @SerializedName("movement_type") val movementType: String, // 'in' | 'out' | 'adjustment'
    val quantity: Int,
    @ColumnInfo(name = "reference_document") @SerializedName("reference_document") val referenceDocument: String? = null,
    val reason: String? = null,
    val date: String,
    @ColumnInfo(name = "user_id") @SerializedName("user_id") val userId: String? = null
)

@Entity(tableName = "financial_transactions")
data class FinancialTransaction(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "transaction_date") @SerializedName("transaction_date") val transactionDate: String,
    val description: String,
    @ColumnInfo(name = "reference_number") @SerializedName("reference_number") val referenceNumber: String,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    val status: String, // 'pending' | 'completed' | 'cancelled'
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null
)

@Entity(tableName = "chart_of_accounts")
data class ChartOfAccount(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "account_code") @SerializedName("account_code") val accountCode: String,
    @ColumnInfo(name = "account_name") @SerializedName("account_name") val accountName: String,
    @ColumnInfo(name = "account_type") @SerializedName("account_type") val accountType: String, // 'asset' | 'liability' | 'equity' | 'income' | 'expense'
    val description: String? = null,
    @ColumnInfo(name = "parent_account_id") @SerializedName("parent_account_id") val parentAccountId: String? = null,
    @ColumnInfo(name = "is_active") @SerializedName("is_active") val isActive: Boolean = true,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null
)

// Line Items for various documents
data class LineItem(
    val id: String? = null,
    @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    @SerializedName("unit_price") val unitPrice: Double,
    val total: Double,
    @SerializedName("tax_rate") val taxRate: Double? = null,
    @SerializedName("tax_amount") val taxAmount: Double? = null,
    val unit: String? = null,
    val category: String? = null
)

// Dashboard Statistics
data class DashboardStats(
    val orders: OrderStats,
    val inventory: InventoryStats,
    val financial: FinancialStats,
    val customers: CustomerStats
)

data class OrderStats(
    @SerializedName("total_orders") val totalOrders: Int,
    @SerializedName("total_revenue") val totalRevenue: Double,
    @SerializedName("orders_due_soon") val ordersDueSoon: Int,
    @SerializedName("pending_orders") val pendingOrders: Int
)


data class FinancialStats(
    @SerializedName("total_receivables") val totalReceivables: Double,
    @SerializedName("total_payables") val totalPayables: Double,
    @SerializedName("monthly_revenue") val monthlyRevenue: Double,
    @SerializedName("monthly_expenses") val monthlyExpenses: Double
)

data class CustomerStats(
    @SerializedName("total_customers") val totalCustomers: Int,
    @SerializedName("active_customers") val activeCustomers: Int,
    @SerializedName("new_customers_this_month") val newCustomersThisMonth: Int
)

// Authentication models
data class User(
    val id: String,
    val name: String,
    val email: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val role: String,
    @SerializedName("company_id") val companyId: String? = null,
    val subscription: Subscription? = null
)

data class Subscription(
    val id: String,
    @SerializedName("plan_name") val planName: String,
    @SerializedName("plan_type") val planType: String,
    val status: String,
    @SerializedName("end_date") val endDate: String,
    @SerializedName("admin_token") val adminToken: String? = null,
    @SerializedName("company_name") val companyName: String? = null
)

data class LoginRequest(
    val email: String,
    val password: String,
    @SerializedName("admin_token") val adminToken: String? = null
)

data class AuthResponse(
    val success: Boolean,
    val token: String? = null,
    val user: User? = null,
    val message: String? = null
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    @SerializedName("confirm_password") val confirmPassword: String,
    @SerializedName("company_name") val companyName: String? = null,
    @SerializedName("plan_id") val planId: String,
    @SerializedName("admin_token") val adminToken: String? = null
)

// API Response wrappers
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: String? = null
)

data class ListResponse<T>(
    val success: Boolean,
    val data: List<T>? = null,
    val total: Int? = null,
    val page: Int? = null,
    val limit: Int? = null,
    val message: String? = null
)

// ===== SALES MODULE ITEM MODELS =====
@Entity(tableName = "sales_order_items")
data class SalesOrderItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "sales_order_id") @SerializedName("sales_order_id") val salesOrderId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    @ColumnInfo(name = "unit_price") @SerializedName("unit_price") val unitPrice: Double,
    val total: Double,
    @ColumnInfo(name = "tax_rate") @SerializedName("tax_rate") val taxRate: Double = 0.0,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double = 0.0,
    val unit: String? = null
)

@Entity(tableName = "quotation_items")
data class QuotationItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "quotation_id") @SerializedName("quotation_id") val quotationId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    @ColumnInfo(name = "unit_price") @SerializedName("unit_price") val unitPrice: Double,
    val total: Double,
    @ColumnInfo(name = "tax_rate") @SerializedName("tax_rate") val taxRate: Double = 0.0,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double = 0.0,
    val unit: String? = null
)

@Entity(tableName = "invoice_items")
data class InvoiceItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "invoice_id") @SerializedName("invoice_id") val invoiceId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    @ColumnInfo(name = "unit_price") @SerializedName("unit_price") val unitPrice: Double,
    val total: Double,
    @ColumnInfo(name = "tax_rate") @SerializedName("tax_rate") val taxRate: Double = 0.0,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double = 0.0,
    val unit: String? = null
)

@Entity(tableName = "delivery_notes")
data class DeliveryNote(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "delivery_number") @SerializedName("delivery_number") val deliveryNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "sales_order_id") @SerializedName("sales_order_id") val salesOrderId: String? = null,
    @ColumnInfo(name = "delivery_date") @SerializedName("delivery_date") val deliveryDate: String,
    @ColumnInfo(name = "delivery_address") @SerializedName("delivery_address") val deliveryAddress: String? = null,
    val status: String, // 'pending' | 'delivered' | 'cancelled'
    @ColumnInfo(name = "delivered_by") @SerializedName("delivered_by") val deliveredBy: String? = null,
    @ColumnInfo(name = "recipient_name") @SerializedName("recipient_name") val recipientName: String? = null,
    @ColumnInfo(name = "recipient_signature") @SerializedName("recipient_signature") val recipientSignature: String? = null,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "delivery_note_items")
data class DeliveryNoteItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "delivery_note_id") @SerializedName("delivery_note_id") val deliveryNoteId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    val unit: String? = null
)

// ===== PURCHASE MODULE ITEM MODELS =====
@Entity(tableName = "purchase_order_items")
data class PurchaseOrderItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "purchase_order_id") @SerializedName("purchase_order_id") val purchaseOrderId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    @ColumnInfo(name = "unit_price") @SerializedName("unit_price") val unitPrice: Double,
    val total: Double,
    @ColumnInfo(name = "received_quantity") @SerializedName("received_quantity") val receivedQuantity: Int = 0,
    val unit: String? = null
)

@Entity(tableName = "purchase_receipts")
data class PurchaseReceipt(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "receipt_number") @SerializedName("receipt_number") val receiptNumber: String,
    @ColumnInfo(name = "purchase_order_id") @SerializedName("purchase_order_id") val purchaseOrderId: String,
    @ColumnInfo(name = "vendor_id") @SerializedName("vendor_id") val vendorId: String,
    @ColumnInfo(name = "receipt_date") @SerializedName("receipt_date") val receiptDate: String,
    val status: String, // 'pending' | 'received' | 'inspected' | 'approved' | 'rejected'
    @ColumnInfo(name = "inspection_notes") @SerializedName("inspection_notes") val inspectionNotes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "purchase_receipt_items")
data class PurchaseReceiptItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "purchase_receipt_id") @SerializedName("purchase_receipt_id") val purchaseReceiptId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    @ColumnInfo(name = "ordered_quantity") @SerializedName("ordered_quantity") val orderedQuantity: Int,
    @ColumnInfo(name = "received_quantity") @SerializedName("received_quantity") val receivedQuantity: Int,
    @ColumnInfo(name = "inspection_status") @SerializedName("inspection_status") val inspectionStatus: String? = null, // 'passed' | 'failed' | 'pending'
    val unit: String? = null
)

@Entity(tableName = "purchase_invoices")
data class PurchaseInvoice(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "invoice_number") @SerializedName("invoice_number") val invoiceNumber: String,
    @ColumnInfo(name = "vendor_invoice_number") @SerializedName("vendor_invoice_number") val vendorInvoiceNumber: String? = null,
    @ColumnInfo(name = "purchase_order_id") @SerializedName("purchase_order_id") val purchaseOrderId: String,
    @ColumnInfo(name = "vendor_id") @SerializedName("vendor_id") val vendorId: String,
    @ColumnInfo(name = "invoice_date") @SerializedName("invoice_date") val invoiceDate: String,
    @ColumnInfo(name = "due_date") @SerializedName("due_date") val dueDate: String,
    val status: String, // 'received' | 'approved' | 'paid' | 'cancelled'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    @ColumnInfo(name = "paid_amount") @SerializedName("paid_amount") val paidAmount: Double = 0.0,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

// ===== ADDITIONAL MISSING MODELS =====

@Entity(tableName = "proforma_invoices")
data class ProformaInvoice(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "proforma_number") @SerializedName("proforma_number") val proformaNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "quotation_id") @SerializedName("quotation_id") val quotationId: String? = null,
    @ColumnInfo(name = "proforma_date") @SerializedName("proforma_date") val proformaDate: String,
    @ColumnInfo(name = "valid_until") @SerializedName("valid_until") val validUntil: String? = null,
    val status: String, // 'draft' | 'sent' | 'confirmed' | 'expired' | 'cancelled'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    @ColumnInfo(name = "terms_and_conditions") @SerializedName("terms_and_conditions") val termsAndConditions: String? = null,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "proforma_invoice_items")
data class ProformaInvoiceItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "proforma_invoice_id") @SerializedName("proforma_invoice_id") val proformaInvoiceId: String,
    @ColumnInfo(name = "item_code") @SerializedName("item_code") val itemCode: String,
    val description: String,
    val quantity: Int,
    @ColumnInfo(name = "unit_price") @SerializedName("unit_price") val unitPrice: Double,
    val total: Double,
    @ColumnInfo(name = "tax_rate") @SerializedName("tax_rate") val taxRate: Double = 0.0,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double = 0.0,
    val unit: String? = null
)

@Entity(tableName = "credit_notes")
data class CreditNote(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "credit_number") @SerializedName("credit_number") val creditNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "invoice_id") @SerializedName("invoice_id") val invoiceId: String? = null,
    @ColumnInfo(name = "credit_date") @SerializedName("credit_date") val creditDate: String,
    val reason: String,
    val status: String, // 'draft' | 'issued' | 'applied' | 'cancelled'
    val subtotal: Double,
    @ColumnInfo(name = "tax_amount") @SerializedName("tax_amount") val taxAmount: Double,
    @ColumnInfo(name = "total_amount") @SerializedName("total_amount") val totalAmount: Double,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "payment_receipts")
data class PaymentReceipt(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "receipt_number") @SerializedName("receipt_number") val receiptNumber: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    @ColumnInfo(name = "invoice_id") @SerializedName("invoice_id") val invoiceId: String? = null,
    @ColumnInfo(name = "payment_date") @SerializedName("payment_date") val paymentDate: String,
    @ColumnInfo(name = "payment_method") @SerializedName("payment_method") val paymentMethod: String, // 'cash' | 'bank' | 'mobile' | 'card'
    @ColumnInfo(name = "bank_name") @SerializedName("bank_name") val bankName: String? = null,
    @ColumnInfo(name = "cheque_number") @SerializedName("cheque_number") val chequeNumber: String? = null,
    @ColumnInfo(name = "cheque_date") @SerializedName("cheque_date") val chequeDate: String? = null,
    @ColumnInfo(name = "amount_received") @SerializedName("amount_received") val amountReceived: Double,
    @ColumnInfo(name = "reference_number") @SerializedName("reference_number") val referenceNumber: String? = null,
    val status: String, // 'pending' | 'confirmed' | 'cancelled'
    val notes: String? = null,
    @ColumnInfo(name = "received_by") @SerializedName("received_by") val receivedBy: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

// ===== WORKFLOW AND DOCUMENT MANAGEMENT MODELS =====

@Entity(tableName = "document_workflows")
data class DocumentWorkflow(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "document_id") @SerializedName("document_id") val documentId: String,
    @ColumnInfo(name = "document_type") @SerializedName("document_type") val documentType: String, // 'quotation' | 'sales_order' | 'invoice' | 'purchase_order'
    @ColumnInfo(name = "current_status") @SerializedName("current_status") val currentStatus: String,
    @ColumnInfo(name = "next_actions") @SerializedName("next_actions") val nextActions: String? = null,
    @ColumnInfo(name = "workflow_stage") @SerializedName("workflow_stage") val workflowStage: String,
    @ColumnInfo(name = "assigned_to") @SerializedName("assigned_to") val assignedTo: String? = null,
    @ColumnInfo(name = "due_date") @SerializedName("due_date") val dueDate: String? = null,
    @ColumnInfo(name = "priority") @SerializedName("priority") val priority: String? = null,
    val notes: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "document_conversions")
data class DocumentConversion(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "source_document_id") @SerializedName("source_document_id") val sourceDocumentId: String,
    @ColumnInfo(name = "source_document_type") @SerializedName("source_document_type") val sourceDocumentType: String,
    @ColumnInfo(name = "target_document_id") @SerializedName("target_document_id") val targetDocumentId: String,
    @ColumnInfo(name = "target_document_type") @SerializedName("target_document_type") val targetDocumentType: String,
    @ColumnInfo(name = "conversion_date") @SerializedName("conversion_date") val conversionDate: String,
    @ColumnInfo(name = "conversion_type") @SerializedName("conversion_type") val conversionType: String? = null,
    @ColumnInfo(name = "converted_by") @SerializedName("converted_by") val convertedBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String? = null,
    val notes: String? = null
)

@Entity(tableName = "document_status_history")
data class DocumentStatusHistory(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "document_id") @SerializedName("document_id") val documentId: String,
    @ColumnInfo(name = "document_type") @SerializedName("document_type") val documentType: String,
    @ColumnInfo(name = "previous_status") @SerializedName("previous_status") val previousStatus: String?,
    @ColumnInfo(name = "new_status") @SerializedName("new_status") val newStatus: String,
    @ColumnInfo(name = "change_reason") @SerializedName("change_reason") val changeReason: String? = null,
    @ColumnInfo(name = "change_date") @SerializedName("change_date") val changeDate: String,
    @ColumnInfo(name = "changed_at") @SerializedName("changed_at") val changedAt: String? = null,
    @ColumnInfo(name = "changed_by") @SerializedName("changed_by") val changedBy: String? = null,
    val reason: String? = null,
    val notes: String? = null
)

@Entity(tableName = "document_templates")
data class DocumentTemplate(
    @PrimaryKey val id: String,
    val name: String,
    @ColumnInfo(name = "document_type") @SerializedName("document_type") val documentType: String,
    @ColumnInfo(name = "template_content") @SerializedName("template_content") val templateContent: String,
    @ColumnInfo(name = "is_default") @SerializedName("is_default") val isDefault: Boolean = false,
    @ColumnInfo(name = "is_active") @SerializedName("is_active") val isActive: Boolean = true,
    val description: String? = null,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "document_attachments")
data class DocumentAttachment(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "document_id") @SerializedName("document_id") val documentId: String,
    @ColumnInfo(name = "document_type") @SerializedName("document_type") val documentType: String,
    @ColumnInfo(name = "file_name") @SerializedName("file_name") val fileName: String,
    @ColumnInfo(name = "file_path") @SerializedName("file_path") val filePath: String,
    @ColumnInfo(name = "file_size") @SerializedName("file_size") val fileSize: Long,
    @ColumnInfo(name = "mime_type") @SerializedName("mime_type") val mimeType: String,
    val description: String? = null,
    @ColumnInfo(name = "uploaded_by") @SerializedName("uploaded_by") val uploadedBy: String? = null,
    @ColumnInfo(name = "uploaded_at") @SerializedName("uploaded_at") val uploadedAt: String
)

// ===== INVENTORY AND WAREHOUSE MODELS =====

@Entity(tableName = "stock_adjustments")
data class StockAdjustment(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "adjustment_number") @SerializedName("adjustment_number") val adjustmentNumber: String,
    @ColumnInfo(name = "adjustment_date") @SerializedName("adjustment_date") val adjustmentDate: String,
    val status: String, // 'draft' | 'approved' | 'rejected'
    val reason: String,
    @ColumnInfo(name = "created_by") @SerializedName("created_by") val createdBy: String,
    @ColumnInfo(name = "approved_by") @SerializedName("approved_by") val approvedBy: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String,
    val notes: String? = null
)

@Entity(tableName = "stock_adjustment_items")
data class StockAdjustmentItem(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "adjustment_id") @SerializedName("adjustment_id") val adjustmentId: String,
    @ColumnInfo(name = "product_id") @SerializedName("product_id") val productId: String,
    @ColumnInfo(name = "current_quantity") @SerializedName("current_quantity") val currentQuantity: Int,
    @ColumnInfo(name = "adjusted_quantity") @SerializedName("adjusted_quantity") val adjustedQuantity: Int,
    @ColumnInfo(name = "difference") @SerializedName("difference") val difference: Int,
    val reason: String
)

@Entity(tableName = "warehouses")
data class Warehouse(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "warehouse_code") @SerializedName("warehouse_code") val warehouseCode: String,
    val name: String,
    val location: String,
    val description: String? = null,
    @ColumnInfo(name = "manager_id") @SerializedName("manager_id") val managerId: String? = null,
    val capacity: Int? = null,
    @ColumnInfo(name = "warehouse_type") @SerializedName("warehouse_type") val warehouseType: String? = null,
    @ColumnInfo(name = "is_active") @SerializedName("is_active") val isActive: Boolean = true,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "product_categories")
data class ProductCategory(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "category_code") @SerializedName("category_code") val categoryCode: String,
    val name: String,
    val description: String? = null,
    @ColumnInfo(name = "parent_category_id") @SerializedName("parent_category_id") val parentCategoryId: String? = null,
    @ColumnInfo(name = "is_active") @SerializedName("is_active") val isActive: Boolean = true,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "stock_alerts")
data class StockAlert(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "product_id") @SerializedName("product_id") val productId: String,
    @ColumnInfo(name = "alert_type") @SerializedName("alert_type") val alertType: String, // 'low_stock' | 'out_of_stock' | 'overstock'
    @ColumnInfo(name = "current_stock") @SerializedName("current_stock") val currentStock: Int,
    @ColumnInfo(name = "threshold") @SerializedName("threshold") val threshold: Int,
    @ColumnInfo(name = "alert_date") @SerializedName("alert_date") val alertDate: String,
    val status: String, // 'active' | 'acknowledged' | 'resolved'
    @ColumnInfo(name = "acknowledged_by") @SerializedName("acknowledged_by") val acknowledgedBy: String? = null,
    @ColumnInfo(name = "acknowledged_at") @SerializedName("acknowledged_at") val acknowledgedAt: String? = null
)

data class InventoryStats(
    @SerializedName("total_products") val totalProducts: Int,
    @SerializedName("total_categories") val totalCategories: Int,
    @SerializedName("total_warehouses") val totalWarehouses: Int,
    @SerializedName("low_stock_items") val lowStockItems: Int,
    @SerializedName("out_of_stock_items") val outOfStockItems: Int,
    @SerializedName("total_inventory_value") val totalInventoryValue: Double
)

// ===== LOGISTICS MODELS =====

@Entity(tableName = "shipments")
data class Shipment(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "order_id") @SerializedName("order_id") val orderId: String,
    @ColumnInfo(name = "customer_id") @SerializedName("customer_id") val customerId: String,
    val priority: String,
    @ColumnInfo(name = "estimated_delivery_date") @SerializedName("estimated_delivery_date") val estimatedDeliveryDate: String,
    val carrier: String,
    @ColumnInfo(name = "shipping_method") @SerializedName("shipping_method") val shippingMethod: String,
    @ColumnInfo(name = "tracking_number") @SerializedName("tracking_number") val trackingNumber: String? = null,
    val status: String,
    val notes: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "vehicles")
data class Vehicle(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "vehicle_number") @SerializedName("vehicle_number") val vehicleNumber: String,
    val make: String,
    val model: String,
    val year: Int,
    val type: String,
    val capacity: Double,
    @ColumnInfo(name = "fuel_type") @SerializedName("fuel_type") val fuelType: String,
    val status: String,
    @ColumnInfo(name = "current_location") @SerializedName("current_location") val currentLocation: String? = null,
    @ColumnInfo(name = "mileage") @SerializedName("mileage") val mileage: Double? = null,
    @ColumnInfo(name = "last_maintenance_date") @SerializedName("last_maintenance_date") val lastMaintenanceDate: String? = null,
    @ColumnInfo(name = "insurance_expiry_date") @SerializedName("insurance_expiry_date") val insuranceExpiryDate: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "drivers")
data class Driver(
    @PrimaryKey val id: String,
    val name: String,
    @ColumnInfo(name = "license_number") @SerializedName("license_number") val licenseNumber: String,
    @ColumnInfo(name = "phone_number") @SerializedName("phone_number") val phoneNumber: String,
    val status: String,
    @ColumnInfo(name = "assigned_vehicle_id") @SerializedName("assigned_vehicle_id") val assignedVehicleId: String? = null,
    @ColumnInfo(name = "created_at") @SerializedName("created_at") val createdAt: String,
    @ColumnInfo(name = "updated_at") @SerializedName("updated_at") val updatedAt: String
)

// ===== LOGISTICS STATISTICS AND DASHBOARD =====

data class LogisticsStats(
    @SerializedName("total_shipments") val totalShipments: Int,
    @SerializedName("pending_deliveries") val pendingDeliveries: Int,
    @SerializedName("completed_deliveries") val completedDeliveries: Int,
    @SerializedName("active_vehicles") val activeVehicles: Int,
    @SerializedName("available_drivers") val availableDrivers: Int,
    @SerializedName("delivery_success_rate") val deliverySuccessRate: Double
)

data class LogisticsDashboardData(
    val stats: LogisticsStats,
    @SerializedName("recent_shipments") val recentShipments: List<Shipment>,
    @SerializedName("urgent_deliveries") val urgentDeliveries: List<Shipment>,
    @SerializedName("vehicle_status") val vehicleStatus: List<Vehicle>,
    @SerializedName("driver_assignments") val driverAssignments: List<Driver>
)

data class DeliveryPerformanceReport(
    @SerializedName("total_deliveries") val totalDeliveries: Int,
    @SerializedName("on_time_deliveries") val onTimeDeliveries: Int,
    @SerializedName("late_deliveries") val lateDeliveries: Int,
    @SerializedName("average_delivery_time") val averageDeliveryTime: Double,
    @SerializedName("performance_by_driver") val performanceByDriver: List<DriverPerformance>
)

data class DriverPerformance(
    @SerializedName("driver_id") val driverId: String,
    @SerializedName("driver_name") val driverName: String,
    @SerializedName("total_deliveries") val totalDeliveries: Int,
    @SerializedName("on_time_deliveries") val onTimeDeliveries: Int,
    @SerializedName("success_rate") val successRate: Double
)

data class VehicleUtilizationReport(
    @SerializedName("total_vehicles") val totalVehicles: Int,
    @SerializedName("active_vehicles") val activeVehicles: Int,
    @SerializedName("utilization_rate") val utilizationRate: Double,
    @SerializedName("vehicle_details") val vehicleDetails: List<VehicleUtilization>
)

data class VehicleUtilization(
    @SerializedName("vehicle_id") val vehicleId: String,
    @SerializedName("vehicle_number") val vehicleNumber: String,
    @SerializedName("total_trips") val totalTrips: Int,
    @SerializedName("total_distance") val totalDistance: Double,
    @SerializedName("utilization_hours") val utilizationHours: Double
)

// ===== ROUTE OPTIMIZATION =====

data class RouteOptimizationRequest(
    @SerializedName("delivery_locations") val deliveryLocations: List<DeliveryLocation>,
    @SerializedName("vehicle_constraints") val vehicleConstraints: VehicleConstraints,
    @SerializedName("optimization_criteria") val optimizationCriteria: String // 'distance' | 'time' | 'cost'
)

data class DeliveryLocation(
    val address: String,
    val latitude: Double,
    val longitude: Double,
    @SerializedName("estimated_duration") val estimatedDuration: Int, // minutes
    val priority: String // 'low' | 'medium' | 'high' | 'urgent'
)

data class VehicleConstraints(
    @SerializedName("max_capacity") val maxCapacity: Double,
    @SerializedName("max_distance") val maxDistance: Double,
    @SerializedName("max_duration") val maxDuration: Int, // minutes
    @SerializedName("fuel_efficiency") val fuelEfficiency: Double
)

data class OptimizedRoute(
    @SerializedName("route_id") val routeId: String,
    @SerializedName("total_distance") val totalDistance: Double,
    @SerializedName("total_duration") val totalDuration: Int,
    @SerializedName("estimated_cost") val estimatedCost: Double,
    val stops: List<RouteStop>
)

data class RouteStop(
    @SerializedName("stop_order") val stopOrder: Int,
    val location: DeliveryLocation,
    @SerializedName("estimated_arrival") val estimatedArrival: String,
    @SerializedName("estimated_departure") val estimatedDeparture: String
)

data class Route(
    @PrimaryKey val id: String,
    @SerializedName("route_name") val routeName: String,
    @SerializedName("vehicle_id") val vehicleId: String,
    @SerializedName("driver_id") val driverId: String,
    val status: String, // 'planned' | 'in_progress' | 'completed' | 'cancelled'
    @SerializedName("total_distance") val totalDistance: Double,
    @SerializedName("estimated_duration") val estimatedDuration: Int,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)
