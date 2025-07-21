package com.printsoft.erp.data.models

import com.google.gson.annotations.SerializedName

// ===== HR MODULE DTOs =====
data class CreateLeaveRequestRequest(
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("leave_type") val leaveType: String,
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String,
    val reason: String? = null
)

data class UpdateLeaveRequestRequest(
    @SerializedName("leave_type") val leaveType: String? = null,
    @SerializedName("start_date") val startDate: String? = null,
    @SerializedName("end_date") val endDate: String? = null,
    val reason: String? = null
)

data class ApproveLeaveRequestRequest(
    val approved: Boolean,
    val comments: String? = null,
    @SerializedName("approved_by") val approvedBy: String
)

data class UpdateDepartmentRequest(
    val name: String,
    val description: String? = null,
    @SerializedName("manager_id") val managerId: String? = null
)

data class CheckInRequest(
    @SerializedName("employee_id") val employeeId: String,
    val location: String? = null,
    val notes: String? = null
)

data class CheckOutRequest(
    @SerializedName("employee_id") val employeeId: String,
    val location: String? = null,
    val notes: String? = null
)

data class CreatePayrollRecordRequest(
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("pay_period_start") val payPeriodStart: String,
    @SerializedName("pay_period_end") val payPeriodEnd: String,
    @SerializedName("gross_salary") val grossSalary: Double,
    val deductions: Double = 0.0,
    val bonuses: Double = 0.0
)

data class ProcessPayrollRequest(
    @SerializedName("pay_period") val payPeriod: String,
    @SerializedName("employee_ids") val employeeIds: List<String>? = null
)

data class CreatePerformanceReviewRequest(
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("reviewer_id") val reviewerId: String,
    @SerializedName("review_period") val reviewPeriod: String,
    val goals: String? = null,
    val comments: String? = null
)

data class UpdatePerformanceReviewRequest(
    val rating: Int? = null,
    val goals: String? = null,
    val comments: String? = null,
    val status: String? = null
)

data class HRDashboardData(
    @SerializedName("total_employees") val totalEmployees: Int,
    @SerializedName("present_today") val presentToday: Int,
    @SerializedName("pending_leave_requests") val pendingLeaveRequests: Int,
    @SerializedName("upcoming_reviews") val upcomingReviews: Int,
    @SerializedName("monthly_payroll") val monthlyPayroll: Double
)

// ===== LOGISTICS MODULE DTOs =====
data class ConfirmDeliveryRequest(
    @SerializedName("delivery_date") val deliveryDate: String,
    @SerializedName("received_by") val receivedBy: String,
    val signature: String? = null,
    val notes: String? = null
)

data class AssignVehicleRequest(
    @SerializedName("vehicle_id") val vehicleId: String,
    @SerializedName("driver_id") val driverId: String,
    @SerializedName("assigned_date") val assignedDate: String
)

data class ScheduleMaintenanceRequest(
    @SerializedName("vehicle_id") val vehicleId: String,
    @SerializedName("maintenance_type") val maintenanceType: String,
    @SerializedName("scheduled_date") val scheduledDate: String,
    val description: String? = null,
    @SerializedName("estimated_cost") val estimatedCost: Double? = null
)

data class CreateDriverRequest(
    val name: String,
    val email: String? = null,
    val phone: String,
    @SerializedName("license_number") val licenseNumber: String,
    @SerializedName("license_expiry") val licenseExpiry: String? = null
)

data class UpdateDriverRequest(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    @SerializedName("license_number") val licenseNumber: String? = null,
    @SerializedName("license_expiry") val licenseExpiry: String? = null,
    val status: String? = null
)

data class CreateWarehouseRequest(
    val name: String,
    val address: String,
    val capacity: Double? = null,
    @SerializedName("warehouse_type") val warehouseType: String? = null,
    val manager: String? = null
)

data class UpdateWarehouseRequest(
    val name: String? = null,
    val address: String? = null,
    val capacity: Double? = null,
    @SerializedName("warehouse_type") val warehouseType: String? = null,
    val manager: String? = null
)

// ===== MESSAGING MODULE DTOs =====
data class UploadAttachmentRequest(
    val filename: String,
    @SerializedName("content_type") val contentType: String,
    val size: Long,
    val data: String // base64 encoded
)

data class MessagingDashboardData(
    @SerializedName("total_messages") val totalMessages: Int,
    @SerializedName("unread_messages") val unreadMessages: Int,
    @SerializedName("sent_messages") val sentMessages: Int,
    @SerializedName("draft_messages") val draftMessages: Int
)

data class MessagingSettings(
    @SerializedName("email_notifications") val emailNotifications: Boolean,
    @SerializedName("push_notifications") val pushNotifications: Boolean,
    @SerializedName("auto_archive_days") val autoArchiveDays: Int,
    @SerializedName("signature") val signature: String? = null
)

data class UpdateMessagingSettingsRequest(
    @SerializedName("email_notifications") val emailNotifications: Boolean? = null,
    @SerializedName("push_notifications") val pushNotifications: Boolean? = null,
    @SerializedName("auto_archive_days") val autoArchiveDays: Int? = null,
    @SerializedName("signature") val signature: String? = null
)
