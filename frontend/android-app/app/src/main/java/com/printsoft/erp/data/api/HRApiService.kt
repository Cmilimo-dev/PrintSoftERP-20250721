package com.printsoft.erp.data.api

import com.printsoft.erp.data.dto.*
import com.printsoft.erp.data.model.*
import com.printsoft.erp.data.models.ApiResponse
import com.printsoft.erp.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface HRApiService {
    
    // Employee endpoints
    @GET("hr/employees")
    suspend fun getEmployees(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("department") department: String? = null,
        @Query("status") status: String? = null
    ): Response<ApiResponse<List<Employee>>>
    
    @GET("hr/employees/{id}")
    suspend fun getEmployee(@Path("id") employeeId: String): Response<ApiResponse<Employee>>
    
    @POST("hr/employees")
    suspend fun createEmployee(@Body request: CreateEmployeeRequest): Response<ApiResponse<Employee>>
    
    @PUT("hr/employees/{id}")
    suspend fun updateEmployee(
        @Path("id") employeeId: String,
        @Body request: UpdateEmployeeRequest
    ): Response<ApiResponse<Employee>>
    
    @DELETE("hr/employees/{id}")
    suspend fun deleteEmployee(@Path("id") employeeId: String): Response<ApiResponse<Unit>>
    
    // Leave request endpoints
    @GET("hr/leave-requests")
    suspend fun getLeaveRequests(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("employee_id") employeeId: String? = null,
        @Query("status") status: String? = null,
        @Query("leave_type") leaveType: String? = null
    ): Response<ApiResponse<List<LeaveRequest>>>
    
    @GET("hr/leave-requests/{id}")
    suspend fun getLeaveRequest(@Path("id") requestId: String): Response<ApiResponse<LeaveRequest>>
    
    @POST("hr/leave-requests")
    suspend fun createLeaveRequest(@Body request: CreateLeaveRequestRequest): Response<ApiResponse<LeaveRequest>>
    
    @PUT("hr/leave-requests/{id}")
    suspend fun updateLeaveRequest(
        @Path("id") requestId: String,
        @Body request: UpdateLeaveRequestRequest
    ): Response<ApiResponse<LeaveRequest>>
    
    @POST("hr/leave-requests/{id}/approve")
    suspend fun approveLeaveRequest(
        @Path("id") requestId: String,
        @Body request: ApproveLeaveRequestRequest
    ): Response<ApiResponse<LeaveRequest>>
    
    // Department endpoints
    @GET("hr/departments")
    suspend fun getDepartments(): Response<ApiResponse<List<Department>>>
    
    @GET("hr/departments/{id}")
    suspend fun getDepartment(@Path("id") departmentId: String): Response<ApiResponse<Department>>
    
    @POST("hr/departments")
    suspend fun createDepartment(@Body request: CreateDepartmentRequest): Response<ApiResponse<Department>>
    
    @PUT("hr/departments/{id}")
    suspend fun updateDepartment(
        @Path("id") departmentId: String,
        @Body request: UpdateDepartmentRequest
    ): Response<ApiResponse<Department>>
    
    @DELETE("hr/departments/{id}")
    suspend fun deleteDepartment(@Path("id") departmentId: String): Response<ApiResponse<Unit>>
    
    // Attendance endpoints
    @GET("hr/attendance")
    suspend fun getAttendanceRecords(
        @Query("employee_id") employeeId: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<AttendanceRecord>>>
    
    @POST("hr/attendance/checkin")
    suspend fun checkIn(@Body request: CheckInRequest): Response<ApiResponse<AttendanceRecord>>
    
    @POST("hr/attendance/checkout")
    suspend fun checkOut(@Body request: CheckOutRequest): Response<ApiResponse<AttendanceRecord>>
    
    // Payroll endpoints
    @GET("hr/payroll")
    suspend fun getPayrollRecords(
        @Query("employee_id") employeeId: String? = null,
        @Query("period") period: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<PayrollRecord>>>
    
    @POST("hr/payroll")
    suspend fun createPayrollRecord(@Body request: CreatePayrollRecordRequest): Response<ApiResponse<PayrollRecord>>
    
    @POST("hr/payroll/process")
    suspend fun processPayroll(@Body request: ProcessPayrollRequest): Response<ApiResponse<List<PayrollRecord>>>
    
    // Performance review endpoints
    @GET("hr/performance-reviews")
    suspend fun getPerformanceReviews(
        @Query("employee_id") employeeId: String? = null,
        @Query("reviewer_id") reviewerId: String? = null,
        @Query("period") period: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<PerformanceReview>>>
    
    @POST("hr/performance-reviews")
    suspend fun createPerformanceReview(@Body request: CreatePerformanceReviewRequest): Response<ApiResponse<PerformanceReview>>
    
    @PUT("hr/performance-reviews/{id}")
    suspend fun updatePerformanceReview(
        @Path("id") reviewId: String,
        @Body request: UpdatePerformanceReviewRequest
    ): Response<ApiResponse<PerformanceReview>>
    
    // Statistics
    @GET("hr/stats")
    suspend fun getHRStats(): Response<ApiResponse<HRStats>>
    
    @GET("hr/dashboard")
    suspend fun getHRDashboard(): Response<ApiResponse<HRDashboardData>>
}
