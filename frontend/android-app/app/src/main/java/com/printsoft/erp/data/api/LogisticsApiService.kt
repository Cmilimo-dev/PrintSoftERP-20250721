package com.printsoft.erp.data.api

import com.printsoft.erp.data.dto.*
import com.printsoft.erp.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface LogisticsApiService {
    
    // Shipment endpoints
    @GET("logistics/shipments")
    suspend fun getShipments(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null,
        @Query("priority") priority: String? = null,
        @Query("customer_id") customerId: String? = null,
        @Query("carrier") carrier: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null
    ): Response<ApiResponse<List<Shipment>>>
    
    @GET("logistics/shipments/{id}")
    suspend fun getShipment(@Path("id") shipmentId: String): Response<ApiResponse<Shipment>>
    
    @POST("logistics/shipments")
    suspend fun createShipment(@Body request: CreateShipmentRequest): Response<ApiResponse<Shipment>>
    
    @PUT("logistics/shipments/{id}")
    suspend fun updateShipment(
        @Path("id") shipmentId: String,
        @Body request: UpdateShipmentRequest
    ): Response<ApiResponse<Shipment>>
    
    @DELETE("logistics/shipments/{id}")
    suspend fun deleteShipment(@Path("id") shipmentId: String): Response<ApiResponse<Unit>>
    
    @GET("logistics/shipments/{id}/track")
    suspend fun trackShipment(@Path("id") shipmentId: String): Response<ApiResponse<TrackingResponse>>
    
    @GET("logistics/shipments/track/{tracking_number}")
    suspend fun trackByNumber(@Path("tracking_number") trackingNumber: String): Response<ApiResponse<TrackingResponse>>
    
    // Delivery Note endpoints
    @GET("logistics/delivery-notes")
    suspend fun getDeliveryNotes(
        @Query("shipment_id") shipmentId: String? = null,
        @Query("driver_id") driverId: String? = null,
        @Query("status") status: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<DeliveryNote>>>
    
    @GET("logistics/delivery-notes/{id}")
    suspend fun getDeliveryNote(@Path("id") deliveryNoteId: String): Response<ApiResponse<DeliveryNote>>
    
    @POST("logistics/delivery-notes")
    suspend fun createDeliveryNote(@Body request: CreateDeliveryNoteRequest): Response<ApiResponse<DeliveryNote>>
    
    @PUT("logistics/delivery-notes/{id}")
    suspend fun updateDeliveryNote(
        @Path("id") deliveryNoteId: String,
        @Body request: UpdateDeliveryNoteRequest
    ): Response<ApiResponse<DeliveryNote>>
    
    @POST("logistics/delivery-notes/{id}/confirm")
    suspend fun confirmDelivery(
        @Path("id") deliveryNoteId: String,
        @Body request: ConfirmDeliveryRequest
    ): Response<ApiResponse<DeliveryNote>>
    
    // Vehicle endpoints
    @GET("logistics/vehicles")
    suspend fun getVehicles(
        @Query("status") status: String? = null,
        @Query("type") type: String? = null,
        @Query("driver_id") driverId: String? = null,
        @Query("available_only") availableOnly: Boolean? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<Vehicle>>>
    
    @GET("logistics/vehicles/{id}")
    suspend fun getVehicle(@Path("id") vehicleId: String): Response<ApiResponse<Vehicle>>
    
    @POST("logistics/vehicles")
    suspend fun createVehicle(@Body request: CreateVehicleRequest): Response<ApiResponse<Vehicle>>
    
    @PUT("logistics/vehicles/{id}")
    suspend fun updateVehicle(
        @Path("id") vehicleId: String,
        @Body request: UpdateVehicleRequest
    ): Response<ApiResponse<Vehicle>>
    
    @DELETE("logistics/vehicles/{id}")
    suspend fun deleteVehicle(@Path("id") vehicleId: String): Response<ApiResponse<Unit>>
    
    @POST("logistics/vehicles/{id}/assign")
    suspend fun assignVehicle(
        @Path("id") vehicleId: String,
        @Body request: AssignVehicleRequest
    ): Response<ApiResponse<Vehicle>>
    
    @POST("logistics/vehicles/{id}/maintenance")
    suspend fun scheduleVehicleMaintenance(
        @Path("id") vehicleId: String,
        @Body request: ScheduleMaintenanceRequest
    ): Response<ApiResponse<Vehicle>>
    
    // Route optimization
    @POST("logistics/routes/optimize")
    suspend fun optimizeRoute(@Body request: RouteOptimizationRequest): Response<ApiResponse<OptimizedRoute>>
    
    @GET("logistics/routes/{id}")
    suspend fun getRoute(@Path("id") routeId: String): Response<ApiResponse<Route>>
    
    // Driver endpoints
    @GET("logistics/drivers")
    suspend fun getDrivers(
        @Query("status") status: String? = null,
        @Query("available_only") availableOnly: Boolean? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<Driver>>>
    
    @GET("logistics/drivers/{id}")
    suspend fun getDriver(@Path("id") driverId: String): Response<ApiResponse<Driver>>
    
    @POST("logistics/drivers")
    suspend fun createDriver(@Body request: CreateDriverRequest): Response<ApiResponse<Driver>>
    
    @PUT("logistics/drivers/{id}")
    suspend fun updateDriver(
        @Path("id") driverId: String,
        @Body request: UpdateDriverRequest
    ): Response<ApiResponse<Driver>>
    
    // Warehouse endpoints
    @GET("logistics/warehouses")
    suspend fun getWarehouses(): Response<ApiResponse<List<Warehouse>>>
    
    @GET("logistics/warehouses/{id}")
    suspend fun getWarehouse(@Path("id") warehouseId: String): Response<ApiResponse<Warehouse>>
    
    @POST("logistics/warehouses")
    suspend fun createWarehouse(@Body request: CreateWarehouseRequest): Response<ApiResponse<Warehouse>>
    
    @PUT("logistics/warehouses/{id}")
    suspend fun updateWarehouse(
        @Path("id") warehouseId: String,
        @Body request: UpdateWarehouseRequest
    ): Response<ApiResponse<Warehouse>>
    
    // Statistics and analytics
    @GET("logistics/stats")
    suspend fun getLogisticsStats(): Response<ApiResponse<LogisticsStats>>
    
    @GET("logistics/dashboard")
    suspend fun getLogisticsDashboard(): Response<ApiResponse<LogisticsDashboardData>>
    
    @GET("logistics/reports/delivery-performance")
    suspend fun getDeliveryPerformanceReport(
        @Query("date_from") dateFrom: String,
        @Query("date_to") dateTo: String
    ): Response<ApiResponse<DeliveryPerformanceReport>>
    
    @GET("logistics/reports/vehicle-utilization")
    suspend fun getVehicleUtilizationReport(
        @Query("date_from") dateFrom: String,
        @Query("date_to") dateTo: String
    ): Response<ApiResponse<VehicleUtilizationReport>>
}
