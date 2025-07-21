package com.printsoft.erp.data.api

// Use unified models package to avoid conflicts
import com.printsoft.erp.data.models.Customer
import com.printsoft.erp.data.models.Vendor
import com.printsoft.erp.data.models.Product
import com.printsoft.erp.data.models.SalesOrder
import com.printsoft.erp.data.models.Invoice
import com.printsoft.erp.data.models.Quotation
import com.printsoft.erp.data.models.PurchaseOrder
import com.printsoft.erp.data.models.StockMovement
import com.printsoft.erp.data.models.FinancialTransaction
import com.printsoft.erp.data.models.ChartOfAccount
import com.printsoft.erp.data.models.User
import com.printsoft.erp.data.models.LoginRequest
import com.printsoft.erp.data.models.RegisterRequest
import com.printsoft.erp.data.models.AuthResponse
import com.printsoft.erp.data.models.ApiResponse
import com.printsoft.erp.data.models.ListResponse
import com.printsoft.erp.data.models.DashboardStats
import com.printsoft.erp.data.models.InventoryStats
import com.printsoft.erp.data.models.SalesOrderItem
import com.printsoft.erp.data.models.InvoiceItem
import com.printsoft.erp.data.models.QuotationItem
import com.printsoft.erp.data.models.PurchaseOrderItem
import com.printsoft.erp.data.models.PurchaseReceipt
import com.printsoft.erp.data.models.PurchaseReceiptItem
import com.printsoft.erp.data.models.DeliveryNote
import com.printsoft.erp.data.models.DeliveryNoteItem
import com.printsoft.erp.data.models.ProformaInvoice
import com.printsoft.erp.data.models.ProformaInvoiceItem
import com.printsoft.erp.data.models.CreditNote
import com.printsoft.erp.data.models.PaymentReceipt
import com.printsoft.erp.data.models.DocumentWorkflow
import com.printsoft.erp.data.models.DocumentConversion
import com.printsoft.erp.data.models.DocumentStatusHistory
import com.printsoft.erp.data.models.DocumentTemplate
import com.printsoft.erp.data.models.DocumentAttachment
import retrofit2.Response
import retrofit2.http.*
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface ComprehensiveERPApiService {
    
    // ==================== AUTHENTICATION ====================
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(): Response<ApiResponse<User>>
    
    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<String>>
    
    @POST("auth/refresh")
    suspend fun refreshToken(@Body refreshToken: Map<String, String>): Response<AuthResponse>
    
    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body email: Map<String, String>): Response<ApiResponse<String>>
    
    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: Map<String, String>): Response<ApiResponse<String>>
    
    // ==================== CUSTOMERS ====================
    @GET("customers")
    suspend fun getCustomers(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("search") search: String? = null,
        @Query("type") type: String? = null
    ): Response<ListResponse<Customer>>
    
    @GET("customers/{id}")
    suspend fun getCustomer(@Path("id") id: String): Response<ApiResponse<Customer>>
    
    @POST("customers")
    suspend fun createCustomer(@Body customer: Customer): Response<ApiResponse<Customer>>
    
    @PUT("customers/{id}")
    suspend fun updateCustomer(@Path("id") id: String, @Body customer: Customer): Response<ApiResponse<Customer>>
    
    @DELETE("customers/{id}")
    suspend fun deleteCustomer(@Path("id") id: String): Response<ApiResponse<String>>
    
    @GET("customers/{id}/transactions")
    suspend fun getCustomerTransactions(@Path("id") id: String): Response<ListResponse<FinancialTransaction>>
    
    @GET("customers/{id}/invoices")
    suspend fun getCustomerInvoices(@Path("id") id: String): Response<ListResponse<Invoice>>
    
    @GET("customers/{id}/orders")
    suspend fun getCustomerOrders(@Path("id") id: String): Response<ListResponse<SalesOrder>>
    
    // ==================== VENDORS/SUPPLIERS ====================
    @GET("vendors")
    suspend fun getVendors(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("search") search: String? = null
    ): Response<ListResponse<Vendor>>
    
    @GET("vendors/{id}")
    suspend fun getVendor(@Path("id") id: String): Response<ApiResponse<Vendor>>
    
    @POST("vendors")
    suspend fun createVendor(@Body vendor: Vendor): Response<ApiResponse<Vendor>>
    
    @PUT("vendors/{id}")
    suspend fun updateVendor(@Path("id") id: String, @Body vendor: Vendor): Response<ApiResponse<Vendor>>
    
    @DELETE("vendors/{id}")
    suspend fun deleteVendor(@Path("id") id: String): Response<ApiResponse<String>>
    
    @GET("vendors/{id}/purchase-orders")
    suspend fun getVendorPurchaseOrders(@Path("id") id: String): Response<ListResponse<PurchaseOrder>>
    
    // ==================== PRODUCTS/INVENTORY ====================
    @GET("inventory/products")
    suspend fun getProducts(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("low_stock") lowStock: Boolean? = null
    ): Response<ListResponse<Product>>
    
    @GET("inventory/products/{id}")
    suspend fun getProduct(@Path("id") id: String): Response<ApiResponse<Product>>
    
    @POST("inventory/products")
    suspend fun createProduct(@Body product: Product): Response<ApiResponse<Product>>
    
    @PUT("inventory/products/{id}")
    suspend fun updateProduct(@Path("id") id: String, @Body product: Product): Response<ApiResponse<Product>>
    
    @DELETE("inventory/products/{id}")
    suspend fun deleteProduct(@Path("id") id: String): Response<ApiResponse<String>>
    
    @GET("inventory/categories")
    suspend fun getProductCategories(): Response<ListResponse<String>>
    
    @GET("inventory/low-stock")
    suspend fun getLowStockProducts(): Response<ListResponse<Product>>
    
    @GET("inventory/out-of-stock")
    suspend fun getOutOfStockProducts(): Response<ListResponse<Product>>
    
    @POST("inventory/stock-movements")
    suspend fun createStockMovement(@Body movement: StockMovement): Response<ApiResponse<StockMovement>>
    
    @GET("inventory/stock-movements")
    suspend fun getStockMovements(
        @Query("product_id") productId: String? = null,
        @Query("movement_type") movementType: String? = null
    ): Response<ListResponse<StockMovement>>
    
    @GET("inventory/dashboard")
    suspend fun getInventoryDashboard(): Response<ApiResponse<InventoryStats>>
    
    // ==================== SALES ORDERS ====================
    @GET("sales/orders")
    suspend fun getSalesOrders(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null,
        @Query("customer_id") customerId: String? = null
    ): Response<ListResponse<SalesOrder>>
    
    @GET("sales/orders/{id}")
    suspend fun getSalesOrder(@Path("id") id: String): Response<ApiResponse<SalesOrder>>
    
    @POST("sales/orders")
    suspend fun createSalesOrder(@Body order: SalesOrder): Response<ApiResponse<SalesOrder>>
    
    @PUT("sales/orders/{id}")
    suspend fun updateSalesOrder(@Path("id") id: String, @Body order: SalesOrder): Response<ApiResponse<SalesOrder>>
    
    @DELETE("sales/orders/{id}")
    suspend fun deleteSalesOrder(@Path("id") id: String): Response<ApiResponse<String>>
    
    @PUT("sales/orders/{id}/status")
    suspend fun updateSalesOrderStatus(
        @Path("id") id: String,
        @Body status: Map<String, String>
    ): Response<ApiResponse<SalesOrder>>
    
    @GET("sales/orders/{id}/items")
    suspend fun getSalesOrderItems(@Path("id") id: String): Response<ListResponse<SalesOrderItem>>
    
    @POST("sales/orders/{id}/items")
    suspend fun addSalesOrderItem(@Path("id") id: String, @Body item: SalesOrderItem): Response<ApiResponse<SalesOrderItem>>
    
    @PUT("sales/orders/{id}/items/{itemId}")
    suspend fun updateSalesOrderItem(
        @Path("id") id: String,
        @Path("itemId") itemId: String,
        @Body item: SalesOrderItem
    ): Response<ApiResponse<SalesOrderItem>>
    
    @DELETE("sales/orders/{id}/items/{itemId}")
    suspend fun deleteSalesOrderItem(@Path("id") id: String, @Path("itemId") itemId: String): Response<ApiResponse<String>>
    
    // ==================== QUOTATIONS ====================
    @GET("sales/quotations")
    suspend fun getQuotations(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null,
        @Query("customer_id") customerId: String? = null
    ): Response<ListResponse<Quotation>>
    
    @GET("sales/quotations/{id}")
    suspend fun getQuotation(@Path("id") id: String): Response<ApiResponse<Quotation>>
    
    @POST("sales/quotations")
    suspend fun createQuotation(@Body quotation: Quotation): Response<ApiResponse<Quotation>>
    
    @PUT("sales/quotations/{id}")
    suspend fun updateQuotation(@Path("id") id: String, @Body quotation: Quotation): Response<ApiResponse<Quotation>>
    
    @DELETE("sales/quotations/{id}")
    suspend fun deleteQuotation(@Path("id") id: String): Response<ApiResponse<String>>
    
    @POST("sales/quotations/{id}/convert-to-order")
    suspend fun convertQuotationToSalesOrder(@Path("id") id: String): Response<ApiResponse<SalesOrder>>
    
    @POST("sales/quotations/{id}/send")
    suspend fun sendQuotation(@Path("id") id: String, @Body emailData: Map<String, Any>): Response<ApiResponse<String>>
    
    // ==================== INVOICES ====================
    @GET("financial/invoices")
    suspend fun getInvoices(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null,
        @Query("customer_id") customerId: String? = null
    ): Response<ListResponse<Invoice>>
    
    @GET("financial/invoices/{id}")
    suspend fun getInvoice(@Path("id") id: String): Response<ApiResponse<Invoice>>
    
    @POST("financial/invoices")
    suspend fun createInvoice(@Body invoice: Invoice): Response<ApiResponse<Invoice>>
    
    @PUT("financial/invoices/{id}")
    suspend fun updateInvoice(@Path("id") id: String, @Body invoice: Invoice): Response<ApiResponse<Invoice>>
    
    @DELETE("financial/invoices/{id}")
    suspend fun deleteInvoice(@Path("id") id: String): Response<ApiResponse<String>>
    
    @POST("financial/invoices/{id}/send")
    suspend fun sendInvoice(@Path("id") id: String, @Body emailData: Map<String, Any>): Response<ApiResponse<String>>
    
    @POST("sales/orders/{id}/convert-to-invoice")
    suspend fun convertSalesOrderToInvoice(@Path("id") id: String): Response<ApiResponse<Invoice>>
    
    @GET("financial/invoices/{id}/items")
    suspend fun getInvoiceItems(@Path("id") id: String): Response<ListResponse<InvoiceItem>>
    
    // ==================== PROFORMA INVOICES ====================
    @GET("sales/proforma-invoices")
    suspend fun getProformaInvoices(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null
    ): Response<ListResponse<ProformaInvoice>>
    
    @GET("sales/proforma-invoices/{id}")
    suspend fun getProformaInvoice(@Path("id") id: String): Response<ApiResponse<ProformaInvoice>>
    
    @POST("sales/proforma-invoices")
    suspend fun createProformaInvoice(@Body proformaInvoice: ProformaInvoice): Response<ApiResponse<ProformaInvoice>>
    
    @PUT("sales/proforma-invoices/{id}")
    suspend fun updateProformaInvoice(
        @Path("id") id: String,
        @Body proformaInvoice: ProformaInvoice
    ): Response<ApiResponse<ProformaInvoice>>
    
    @POST("sales/proforma-invoices/{id}/convert-to-invoice")
    suspend fun convertProformaToInvoice(@Path("id") id: String): Response<ApiResponse<Invoice>>
    
    // ==================== DELIVERY NOTES ====================
    @GET("logistics/delivery-notes")
    suspend fun getDeliveryNotes(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null
    ): Response<ListResponse<DeliveryNote>>
    
    @GET("logistics/delivery-notes/{id}")
    suspend fun getDeliveryNote(@Path("id") id: String): Response<ApiResponse<DeliveryNote>>
    
    @POST("logistics/delivery-notes")
    suspend fun createDeliveryNote(@Body deliveryNote: DeliveryNote): Response<ApiResponse<DeliveryNote>>
    
    @PUT("logistics/delivery-notes/{id}")
    suspend fun updateDeliveryNote(
        @Path("id") id: String,
        @Body deliveryNote: DeliveryNote
    ): Response<ApiResponse<DeliveryNote>>
    
    @POST("sales/orders/{id}/create-delivery-note")
    suspend fun createDeliveryNoteFromSalesOrder(@Path("id") id: String): Response<ApiResponse<DeliveryNote>>
    
    @POST("logistics/delivery-notes/{id}/mark-delivered")
    suspend fun markDeliveryNoteAsDelivered(
        @Path("id") id: String,
        @Body deliveryData: Map<String, Any>
    ): Response<ApiResponse<DeliveryNote>>
    
    // ==================== PAYMENT RECEIPTS ====================
    @GET("financial/payment-receipts")
    suspend fun getPaymentReceipts(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("customer_id") customerId: String? = null
    ): Response<ListResponse<PaymentReceipt>>
    
    @GET("financial/payment-receipts/{id}")
    suspend fun getPaymentReceipt(@Path("id") id: String): Response<ApiResponse<PaymentReceipt>>
    
    @POST("financial/payment-receipts")
    suspend fun createPaymentReceipt(@Body paymentReceipt: PaymentReceipt): Response<ApiResponse<PaymentReceipt>>
    
    @PUT("financial/payment-receipts/{id}")
    suspend fun updatePaymentReceipt(
        @Path("id") id: String,
        @Body paymentReceipt: PaymentReceipt
    ): Response<ApiResponse<PaymentReceipt>>
    
    @POST("financial/invoices/{id}/record-payment")
    suspend fun recordInvoicePayment(
        @Path("id") id: String,
        @Body paymentData: Map<String, Any>
    ): Response<ApiResponse<PaymentReceipt>>
    
    // ==================== CREDIT NOTES ====================
    @GET("financial/credit-notes")
    suspend fun getCreditNotes(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("customer_id") customerId: String? = null
    ): Response<ListResponse<CreditNote>>
    
    @GET("financial/credit-notes/{id}")
    suspend fun getCreditNote(@Path("id") id: String): Response<ApiResponse<CreditNote>>
    
    @POST("financial/credit-notes")
    suspend fun createCreditNote(@Body creditNote: CreditNote): Response<ApiResponse<CreditNote>>
    
    @PUT("financial/credit-notes/{id}")
    suspend fun updateCreditNote(
        @Path("id") id: String,
        @Body creditNote: CreditNote
    ): Response<ApiResponse<CreditNote>>
    
    // ==================== PURCHASE ORDERS ====================
    @GET("purchase/orders")
    suspend fun getPurchaseOrders(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("status") status: String? = null,
        @Query("vendor_id") vendorId: String? = null
    ): Response<ListResponse<PurchaseOrder>>
    
    @GET("purchase/orders/{id}")
    suspend fun getPurchaseOrder(@Path("id") id: String): Response<ApiResponse<PurchaseOrder>>
    
    @POST("purchase/orders")
    suspend fun createPurchaseOrder(@Body purchaseOrder: PurchaseOrder): Response<ApiResponse<PurchaseOrder>>
    
    @PUT("purchase/orders/{id}")
    suspend fun updatePurchaseOrder(
        @Path("id") id: String,
        @Body purchaseOrder: PurchaseOrder
    ): Response<ApiResponse<PurchaseOrder>>
    
    @DELETE("purchase/orders/{id}")
    suspend fun deletePurchaseOrder(@Path("id") id: String): Response<ApiResponse<String>>
    
    @PUT("purchase/orders/{id}/status")
    suspend fun updatePurchaseOrderStatus(
        @Path("id") id: String,
        @Body status: Map<String, String>
    ): Response<ApiResponse<PurchaseOrder>>
    
    // ==================== PURCHASE RECEIPTS/GRN ====================
    @GET("purchase/receipts")
    suspend fun getPurchaseReceipts(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("vendor_id") vendorId: String? = null
    ): Response<ListResponse<PurchaseReceipt>>
    
    @GET("purchase/receipts/{id}")
    suspend fun getPurchaseReceipt(@Path("id") id: String): Response<ApiResponse<PurchaseReceipt>>
    
    @POST("purchase/receipts")
    suspend fun createPurchaseReceipt(@Body purchaseReceipt: PurchaseReceipt): Response<ApiResponse<PurchaseReceipt>>
    
    @PUT("purchase/receipts/{id}")
    suspend fun updatePurchaseReceipt(
        @Path("id") id: String,
        @Body purchaseReceipt: PurchaseReceipt
    ): Response<ApiResponse<PurchaseReceipt>>
    
    @POST("purchase/orders/{id}/create-receipt")
    suspend fun createPurchaseReceiptFromOrder(@Path("id") id: String): Response<ApiResponse<PurchaseReceipt>>
    
    // ==================== FINANCIAL TRANSACTIONS ====================
    @GET("financial/transactions")
    suspend fun getFinancialTransactions(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("type") type: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null
    ): Response<ListResponse<FinancialTransaction>>
    
    @GET("financial/transactions/{id}")
    suspend fun getFinancialTransaction(@Path("id") id: String): Response<ApiResponse<FinancialTransaction>>
    
    @POST("financial/transactions")
    suspend fun createFinancialTransaction(@Body transaction: FinancialTransaction): Response<ApiResponse<FinancialTransaction>>
    
    @PUT("financial/transactions/{id}")
    suspend fun updateFinancialTransaction(
        @Path("id") id: String,
        @Body transaction: FinancialTransaction
    ): Response<ApiResponse<FinancialTransaction>>
    
    // ==================== CHART OF ACCOUNTS ====================
    @GET("financial/chart-of-accounts")
    suspend fun getChartOfAccounts(): Response<ListResponse<ChartOfAccount>>
    
    @GET("financial/chart-of-accounts/{id}")
    suspend fun getChartOfAccount(@Path("id") id: String): Response<ApiResponse<ChartOfAccount>>
    
    @POST("financial/chart-of-accounts")
    suspend fun createChartOfAccount(@Body account: ChartOfAccount): Response<ApiResponse<ChartOfAccount>>
    
    @PUT("financial/chart-of-accounts/{id}")
    suspend fun updateChartOfAccount(
        @Path("id") id: String,
        @Body account: ChartOfAccount
    ): Response<ApiResponse<ChartOfAccount>>
    
    @DELETE("financial/chart-of-accounts/{id}")
    suspend fun deleteChartOfAccount(@Path("id") id: String): Response<ApiResponse<String>>
    
    // ==================== DOCUMENT WORKFLOWS ====================
    @GET("workflow/documents")
    suspend fun getDocumentWorkflows(
        @Query("document_type") documentType: String? = null,
        @Query("status") status: String? = null
    ): Response<ListResponse<DocumentWorkflow>>
    
    @GET("workflow/documents/{documentId}")
    suspend fun getDocumentWorkflow(@Path("documentId") documentId: String): Response<ApiResponse<DocumentWorkflow>>
    
    @PUT("workflow/documents/{documentId}")
    suspend fun updateDocumentWorkflow(
        @Path("documentId") documentId: String,
        @Body workflow: DocumentWorkflow
    ): Response<ApiResponse<DocumentWorkflow>>
    
    @POST("workflow/documents/{documentId}/transition")
    suspend fun transitionDocumentStatus(
        @Path("documentId") documentId: String,
        @Body transitionData: Map<String, String>
    ): Response<ApiResponse<DocumentWorkflow>>
    
    @GET("workflow/documents/{documentId}/history")
    suspend fun getDocumentStatusHistory(@Path("documentId") documentId: String): Response<ListResponse<DocumentStatusHistory>>
    
    @GET("workflow/documents/{documentId}/conversions")
    suspend fun getDocumentConversions(@Path("documentId") documentId: String): Response<ListResponse<DocumentConversion>>
    
    // ==================== DOCUMENT TEMPLATES ====================
    @GET("templates")
    suspend fun getDocumentTemplates(
        @Query("document_type") documentType: String? = null
    ): Response<ListResponse<DocumentTemplate>>
    
    @GET("templates/{id}")
    suspend fun getDocumentTemplate(@Path("id") id: String): Response<ApiResponse<DocumentTemplate>>
    
    @POST("templates")
    suspend fun createDocumentTemplate(@Body template: DocumentTemplate): Response<ApiResponse<DocumentTemplate>>
    
    @PUT("templates/{id}")
    suspend fun updateDocumentTemplate(
        @Path("id") id: String,
        @Body template: DocumentTemplate
    ): Response<ApiResponse<DocumentTemplate>>
    
    @DELETE("templates/{id}")
    suspend fun deleteDocumentTemplate(@Path("id") id: String): Response<ApiResponse<String>>
    
    // ==================== DOCUMENT ATTACHMENTS ====================
    @GET("documents/{documentId}/attachments")
    suspend fun getDocumentAttachments(@Path("documentId") documentId: String): Response<ListResponse<DocumentAttachment>>
    
    @Multipart
    @POST("documents/{documentId}/attachments")
    suspend fun uploadDocumentAttachment(
        @Path("documentId") documentId: String,
        @Part file: MultipartBody.Part,
        @Part("description") description: RequestBody? = null
    ): Response<ApiResponse<DocumentAttachment>>
    
    @DELETE("documents/{documentId}/attachments/{attachmentId}")
    suspend fun deleteDocumentAttachment(
        @Path("documentId") documentId: String,
        @Path("attachmentId") attachmentId: String
    ): Response<ApiResponse<String>>
    
    // ==================== DASHBOARD & ANALYTICS ====================
    @GET("dashboard/stats")
    suspend fun getDashboardStats(): Response<ApiResponse<DashboardStats>>
    
    @GET("dashboard/recent-activities")
    suspend fun getRecentActivities(
        @Query("limit") limit: Int? = 10
    ): Response<ListResponse<Map<String, Any>>>
    
    @GET("analytics/sales-summary")
    suspend fun getSalesSummary(
        @Query("period") period: String? = "month",
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null
    ): Response<ApiResponse<Map<String, Any>>>
    
    @GET("analytics/financial-summary")
    suspend fun getFinancialSummary(
        @Query("period") period: String? = "month"
    ): Response<ApiResponse<Map<String, Any>>>
    
    @GET("analytics/inventory-summary")
    suspend fun getInventorySummary(): Response<ApiResponse<Map<String, Any>>>
    
    // ==================== REPORTS ====================
    @GET("reports/sales")
    suspend fun getSalesReports(
        @QueryMap filters: Map<String, String>
    ): Response<ApiResponse<Map<String, Any>>>
    
    @GET("reports/inventory")
    suspend fun getInventoryReports(
        @QueryMap filters: Map<String, String>
    ): Response<ApiResponse<Map<String, Any>>>
    
    @GET("reports/financial")
    suspend fun getFinancialReports(
        @QueryMap filters: Map<String, String>
    ): Response<ApiResponse<Map<String, Any>>>
    
    @GET("reports/customer-statement")
    suspend fun getCustomerStatement(
        @Query("customer_id") customerId: String,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null
    ): Response<ApiResponse<Map<String, Any>>>
    
    // ==================== EXPORT/IMPORT ====================
    @GET("export/data")
    suspend fun exportData(
        @Query("type") type: String,
        @Query("format") format: String = "csv",
        @QueryMap filters: Map<String, String>? = null
    ): Response<ApiResponse<Map<String, String>>>
    
    @Multipart
    @POST("import/data")
    suspend fun importData(
        @Part("type") type: RequestBody,
        @Part file: MultipartBody.Part
    ): Response<ApiResponse<Map<String, Any>>>
    
    // ==================== NUMBER GENERATION ====================
    @POST("number-generation/{type}")
    suspend fun generateDocumentNumber(@Path("type") type: String): Response<ApiResponse<Map<String, String>>>
    
    @GET("number-generation/config")
    suspend fun getNumberGenerationConfig(): Response<ListResponse<Map<String, Any>>>
    
    @PUT("number-generation/config/{type}")
    suspend fun updateNumberGenerationConfig(
        @Path("type") type: String,
        @Body config: Map<String, Any>
    ): Response<ApiResponse<Map<String, Any>>>
    
    // ==================== SEARCH & GLOBAL FUNCTIONS ====================
    @GET("search")
    suspend fun globalSearch(
        @Query("q") query: String,
        @Query("type") type: String? = null,
        @Query("limit") limit: Int? = 20
    ): Response<ListResponse<Map<String, Any>>>
    
    @GET("lookup/customers")
    suspend fun lookupCustomers(@Query("q") query: String): Response<ListResponse<Customer>>
    
    @GET("lookup/vendors")
    suspend fun lookupVendors(@Query("q") query: String): Response<ListResponse<Vendor>>
    
    @GET("lookup/products")
    suspend fun lookupProducts(@Query("q") query: String): Response<ListResponse<Product>>
    
    // ==================== SYSTEM SETTINGS ====================
    @GET("settings/company")
    suspend fun getCompanySettings(): Response<ApiResponse<Map<String, Any>>>
    
    @PUT("settings/company")
    suspend fun updateCompanySettings(@Body settings: Map<String, Any>): Response<ApiResponse<Map<String, Any>>>
    
    @GET("settings/tax")
    suspend fun getTaxSettings(): Response<ApiResponse<Map<String, Any>>>
    
    @PUT("settings/tax")
    suspend fun updateTaxSettings(@Body settings: Map<String, Any>): Response<ApiResponse<Map<String, Any>>>
    
    @GET("settings/document-customization")
    suspend fun getDocumentCustomizationSettings(): Response<ApiResponse<Map<String, Any>>>
    
    @PUT("settings/document-customization")
    suspend fun updateDocumentCustomizationSettings(@Body settings: Map<String, Any>): Response<ApiResponse<Map<String, Any>>>
    
    // ==================== USER MANAGEMENT ====================
    @GET("users")
    suspend fun getUsers(): Response<ListResponse<User>>
    
    @POST("users")
    suspend fun createUser(@Body user: Map<String, Any>): Response<ApiResponse<User>>
    
    @PUT("users/{id}")
    suspend fun updateUser(@Path("id") id: String, @Body user: Map<String, Any>): Response<ApiResponse<User>>
    
    @DELETE("users/{id}")
    suspend fun deleteUser(@Path("id") id: String): Response<ApiResponse<String>>
    
    @GET("users/{id}/permissions")
    suspend fun getUserPermissions(@Path("id") id: String): Response<ListResponse<String>>
    
    @PUT("users/{id}/permissions")
    suspend fun updateUserPermissions(
        @Path("id") id: String,
        @Body permissions: List<String>
    ): Response<ApiResponse<List<String>>>
}
