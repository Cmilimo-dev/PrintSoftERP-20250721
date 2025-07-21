package com.printsoft.erp.data.api

import com.printsoft.erp.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ERPApiService {
    
    // Authentication endpoints
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(): Response<ApiResponse<User>>
    
    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<String>>
    
    // Customer endpoints
    @GET("customers")
    suspend fun getCustomers(): Response<ListResponse<Customer>>
    
    @GET("customers/{id}")
    suspend fun getCustomer(@Path("id") id: String): Response<ApiResponse<Customer>>
    
    @POST("customers")
    suspend fun createCustomer(@Body customer: Customer): Response<ApiResponse<Customer>>
    
    @PUT("customers/{id}")
    suspend fun updateCustomer(@Path("id") id: String, @Body customer: Customer): Response<ApiResponse<Customer>>
    
    @DELETE("customers/{id}")
    suspend fun deleteCustomer(@Path("id") id: String): Response<ApiResponse<String>>
    
    // Vendor endpoints
    @GET("vendors")
    suspend fun getVendors(): Response<ListResponse<Vendor>>
    
    @GET("vendors/{id}")
    suspend fun getVendor(@Path("id") id: String): Response<ApiResponse<Vendor>>
    
    @POST("vendors")
    suspend fun createVendor(@Body vendor: Vendor): Response<ApiResponse<Vendor>>
    
    @PUT("vendors/{id}")
    suspend fun updateVendor(@Path("id") id: String, @Body vendor: Vendor): Response<ApiResponse<Vendor>>
    
    @DELETE("vendors/{id}")
    suspend fun deleteVendor(@Path("id") id: String): Response<ApiResponse<String>>
    
    // Product/Inventory endpoints
    @GET("inventory")
    suspend fun getProducts(): Response<ListResponse<Product>>
    
    @GET("inventory/{id}")
    suspend fun getProduct(@Path("id") id: String): Response<ApiResponse<Product>>
    
    @POST("inventory")
    suspend fun createProduct(@Body product: Product): Response<ApiResponse<Product>>
    
    @PUT("inventory/{id}")
    suspend fun updateProduct(@Path("id") id: String, @Body product: Product): Response<ApiResponse<Product>>
    
    @DELETE("inventory/{id}")
    suspend fun deleteProduct(@Path("id") id: String): Response<ApiResponse<String>>
    
    @GET("inventory/dashboard")
    suspend fun getInventoryDashboard(): Response<ApiResponse<InventoryStats>>
    
    @POST("inventory/stock-movement")
    suspend fun createStockMovement(@Body movement: StockMovement): Response<ApiResponse<StockMovement>>
    
    @GET("inventory/movements")
    suspend fun getStockMovements(): Response<ListResponse<StockMovement>>
    
    // Sales Order endpoints
    @GET("orders")
    suspend fun getSalesOrders(): Response<ListResponse<SalesOrder>>
    
    @GET("orders/{id}")
    suspend fun getSalesOrder(@Path("id") id: String): Response<ApiResponse<SalesOrder>>
    
    @POST("orders")
    suspend fun createSalesOrder(@Body order: SalesOrder): Response<ApiResponse<SalesOrder>>
    
    @PUT("orders/{id}")
    suspend fun updateSalesOrder(@Path("id") id: String, @Body order: SalesOrder): Response<ApiResponse<SalesOrder>>
    
    @DELETE("orders/{id}")
    suspend fun deleteSalesOrder(@Path("id") id: String): Response<ApiResponse<String>>
    
    @PUT("orders/{id}/status")
    suspend fun updateOrderStatus(@Path("id") id: String, @Body status: Map<String, String>): Response<ApiResponse<SalesOrder>>
    
    // Invoice endpoints
    @GET("financial/invoices")
    suspend fun getInvoices(): Response<ListResponse<Invoice>>
    
    @GET("financial/invoices/{id}")
    suspend fun getInvoice(@Path("id") id: String): Response<ApiResponse<Invoice>>
    
    @POST("financial/invoices")
    suspend fun createInvoice(@Body invoice: Invoice): Response<ApiResponse<Invoice>>
    
    @PUT("financial/invoices/{id}")
    suspend fun updateInvoice(@Path("id") id: String, @Body invoice: Invoice): Response<ApiResponse<Invoice>>
    
    @DELETE("financial/invoices/{id}")
    suspend fun deleteInvoice(@Path("id") id: String): Response<ApiResponse<String>>
    
    // Quotation endpoints
    @GET("financial/quotations")
    suspend fun getQuotations(): Response<ListResponse<Quotation>>
    
    @GET("financial/quotations/{id}")
    suspend fun getQuotation(@Path("id") id: String): Response<ApiResponse<Quotation>>
    
    @POST("financial/quotations")
    suspend fun createQuotation(@Body quotation: Quotation): Response<ApiResponse<Quotation>>
    
    @PUT("financial/quotations/{id}")
    suspend fun updateQuotation(@Path("id") id: String, @Body quotation: Quotation): Response<ApiResponse<Quotation>>
    
    @DELETE("financial/quotations/{id}")
    suspend fun deleteQuotation(@Path("id") id: String): Response<ApiResponse<String>>
    
    // Purchase Order endpoints
    @GET("purchase-orders")
    suspend fun getPurchaseOrders(): Response<ListResponse<PurchaseOrder>>
    
    @GET("purchase-orders/{id}")
    suspend fun getPurchaseOrder(@Path("id") id: String): Response<ApiResponse<PurchaseOrder>>
    
    @POST("purchase-orders")
    suspend fun createPurchaseOrder(@Body purchaseOrder: PurchaseOrder): Response<ApiResponse<PurchaseOrder>>
    
    @PUT("purchase-orders/{id}")
    suspend fun updatePurchaseOrder(@Path("id") id: String, @Body purchaseOrder: PurchaseOrder): Response<ApiResponse<PurchaseOrder>>
    
    @DELETE("purchase-orders/{id}")
    suspend fun deletePurchaseOrder(@Path("id") id: String): Response<ApiResponse<String>>
    
    // Financial endpoints
    @GET("financial/transactions")
    suspend fun getFinancialTransactions(): Response<ListResponse<FinancialTransaction>>
    
    @GET("financial/chart-of-accounts")
    suspend fun getChartOfAccounts(): Response<ListResponse<ChartOfAccount>>
    
    @POST("financial/chart-of-accounts")
    suspend fun createChartOfAccount(@Body account: ChartOfAccount): Response<ApiResponse<ChartOfAccount>>
    
    @PUT("financial/chart-of-accounts/{id}")
    suspend fun updateChartOfAccount(@Path("id") id: String, @Body account: ChartOfAccount): Response<ApiResponse<ChartOfAccount>>
    
    @DELETE("financial/chart-of-accounts/{id}")
    suspend fun deleteChartOfAccount(@Path("id") id: String): Response<ApiResponse<String>>
    
    // Dashboard endpoints
    @GET("dashboard/stats")
    suspend fun getDashboardStats(): Response<ApiResponse<DashboardStats>>
    
    @GET("dashboard/recent-activities")
    suspend fun getRecentActivities(): Response<ListResponse<Map<String, Any>>>
    
    // Reports endpoints
    @GET("reports/sales")
    suspend fun getSalesReports(@QueryMap filters: Map<String, String>): Response<ApiResponse<Map<String, Any>>>
    
    @GET("reports/inventory")
    suspend fun getInventoryReports(@QueryMap filters: Map<String, String>): Response<ApiResponse<Map<String, Any>>>
    
    @GET("reports/financial")
    suspend fun getFinancialReports(@QueryMap filters: Map<String, String>): Response<ApiResponse<Map<String, Any>>>
    
    // Search endpoints
    @GET("search")
    suspend fun search(@Query("q") query: String, @Query("type") type: String? = null): Response<ListResponse<Map<String, Any>>>
    
    // Number generation endpoints
    @POST("number-generation/{type}")
    suspend fun generateDocumentNumber(@Path("type") type: String): Response<ApiResponse<Map<String, String>>>
}
