package com.printsoft.erp.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "employees")
data class Employee(
    @PrimaryKey val id: String,
    @SerializedName("employee_number") val employeeNumber: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    val phone: String? = null,
    val position: String,
    val department: String,
    val salary: Double? = null,
    @SerializedName("hire_date") val hireDate: String,
    val status: String = "active", // 'active' | 'inactive' | 'terminated'
    @SerializedName("manager_id") val managerId: String? = null,
    @SerializedName("employment_type") val employmentType: String = "full-time", // 'full-time' | 'part-time' | 'contract'
    @SerializedName("work_location") val workLocation: String? = null,
    
    // Personal Information
    @SerializedName("date_of_birth") val dateOfBirth: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    @SerializedName("postal_code") val postalCode: String? = null,
    val nationality: String? = null,
    @SerializedName("marital_status") val maritalStatus: String? = null,
    
    // Emergency Contact
    @SerializedName("emergency_contact_name") val emergencyContactName: String? = null,
    @SerializedName("emergency_contact_phone") val emergencyContactPhone: String? = null,
    @SerializedName("emergency_contact_relationship") val emergencyContactRelationship: String? = null,
    
    // Work Details
    @SerializedName("working_hours_per_week") val workingHoursPerWeek: Int = 40,
    @SerializedName("annual_leave_balance") val annualLeaveBalance: Int = 21,
    @SerializedName("sick_leave_balance") val sickLeaveBalance: Int = 10,
    
    // System Fields
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("created_by") val createdBy: String
)

@Entity(tableName = "leave_requests")
data class LeaveRequest(
    @PrimaryKey val id: String,
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("employee_name") val employeeName: String,
    @SerializedName("leave_type") val leaveType: String, // 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid'
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String,
    @SerializedName("days_requested") val daysRequested: Int,
    val reason: String? = null,
    val status: String = "pending", // 'pending' | 'approved' | 'rejected' | 'cancelled'
    
    // Approval Details
    @SerializedName("approved_by") val approvedBy: String? = null,
    @SerializedName("approved_at") val approvedAt: String? = null,
    @SerializedName("approval_comments") val approvalComments: String? = null,
    
    // Manager Details
    @SerializedName("manager_id") val managerId: String? = null,
    @SerializedName("manager_name") val managerName: String? = null,
    
    // System Fields
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("submitted_at") val submittedAt: String
)

@Entity(tableName = "departments")
data class Department(
    @PrimaryKey val id: String,
    val name: String,
    val description: String? = null,
    @SerializedName("department_head") val departmentHead: String? = null,
    @SerializedName("employee_count") val employeeCount: Int = 0,
    val budget: Double? = null,
    @SerializedName("cost_center") val costCenter: String? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "attendance_records")
data class AttendanceRecord(
    @PrimaryKey val id: String,
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("employee_name") val employeeName: String,
    val date: String,
    @SerializedName("clock_in") val clockIn: String? = null,
    @SerializedName("clock_out") val clockOut: String? = null,
    @SerializedName("break_start") val breakStart: String? = null,
    @SerializedName("break_end") val breakEnd: String? = null,
    @SerializedName("total_hours") val totalHours: Double = 0.0,
    @SerializedName("overtime_hours") val overtimeHours: Double = 0.0,
    val status: String = "present", // 'present' | 'absent' | 'late' | 'half-day' | 'on-leave'
    val notes: String? = null,
    @SerializedName("location_check_in") val locationCheckIn: String? = null,
    @SerializedName("location_check_out") val locationCheckOut: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "payroll_records")
data class PayrollRecord(
    @PrimaryKey val id: String,
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("employee_name") val employeeName: String,
    @SerializedName("pay_period") val payPeriod: String, // 'YYYY-MM' format
    @SerializedName("base_salary") val baseSalary: Double,
    @SerializedName("overtime_pay") val overtimePay: Double = 0.0,
    @SerializedName("bonus_amount") val bonusAmount: Double = 0.0,
    @SerializedName("deductions") val deductions: Double = 0.0,
    @SerializedName("tax_deductions") val taxDeductions: Double = 0.0,
    @SerializedName("net_pay") val netPay: Double,
    @SerializedName("hours_worked") val hoursWorked: Double = 0.0,
    @SerializedName("overtime_hours") val overtimeHours: Double = 0.0,
    val status: String = "draft", // 'draft' | 'calculated' | 'approved' | 'paid'
    @SerializedName("pay_date") val payDate: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "performance_reviews")
data class PerformanceReview(
    @PrimaryKey val id: String,
    @SerializedName("employee_id") val employeeId: String,
    @SerializedName("employee_name") val employeeName: String,
    @SerializedName("reviewer_id") val reviewerId: String,
    @SerializedName("reviewer_name") val reviewerName: String,
    @SerializedName("review_period") val reviewPeriod: String,
    @SerializedName("review_type") val reviewType: String = "annual", // 'annual' | 'mid-year' | 'probation' | 'project'
    
    // Ratings (1-5 scale)
    @SerializedName("performance_rating") val performanceRating: Int? = null,
    @SerializedName("communication_rating") val communicationRating: Int? = null,
    @SerializedName("teamwork_rating") val teamworkRating: Int? = null,
    @SerializedName("leadership_rating") val leadershipRating: Int? = null,
    @SerializedName("overall_rating") val overallRating: Double? = null,
    
    // Comments
    @SerializedName("strengths") val strengths: String? = null,
    @SerializedName("areas_for_improvement") val areasForImprovement: String? = null,
    @SerializedName("goals_next_period") val goalsNextPeriod: String? = null,
    @SerializedName("reviewer_comments") val reviewerComments: String? = null,
    @SerializedName("employee_comments") val employeeComments: String? = null,
    
    val status: String = "draft", // 'draft' | 'submitted' | 'completed' | 'archived'
    @SerializedName("due_date") val dueDate: String? = null,
    @SerializedName("completed_date") val completedDate: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// HR Statistics and Reports
data class HRStats(
    @SerializedName("total_employees") val totalEmployees: Int,
    @SerializedName("active_employees") val activeEmployees: Int,
    @SerializedName("departments_count") val departmentsCount: Int,
    @SerializedName("pending_leave_requests") val pendingLeaveRequests: Int,
    @SerializedName("employees_on_leave") val employeesOnLeave: Int,
    @SerializedName("average_tenure") val averageTenure: Double, // years
    @SerializedName("turnover_rate") val turnoverRate: Double, // percentage
    @SerializedName("total_payroll") val totalPayroll: Double,
    @SerializedName("attendance_rate") val attendanceRate: Double // percentage
)

// DTOs for API communication
data class CreateEmployeeRequest(
    @SerializedName("employee_number") val employeeNumber: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    val phone: String? = null,
    val position: String,
    val department: String,
    val salary: Double? = null,
    @SerializedName("hire_date") val hireDate: String,
    @SerializedName("employment_type") val employmentType: String = "full-time",
    @SerializedName("manager_id") val managerId: String? = null
)

data class UpdateEmployeeRequest(
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val position: String? = null,
    val department: String? = null,
    val salary: Double? = null,
    val status: String? = null,
    @SerializedName("manager_id") val managerId: String? = null
)

data class LeaveRequestSubmission(
    @SerializedName("leave_type") val leaveType: String,
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String,
    val reason: String? = null
)

data class LeaveApprovalRequest(
    val status: String, // 'approved' | 'rejected'
    @SerializedName("approval_comments") val approvalComments: String? = null
)
