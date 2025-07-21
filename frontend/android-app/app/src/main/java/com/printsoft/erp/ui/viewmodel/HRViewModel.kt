package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.printsoft.erp.data.model.*
import com.printsoft.erp.data.dto.*

class HRViewModel : ViewModel() {
    
    private val _employees = MutableStateFlow<List<Employee>>(emptyList())
    val employees: StateFlow<List<Employee>> = _employees.asStateFlow()
    
    private val _leaveRequests = MutableStateFlow<List<LeaveRequest>>(emptyList())
    val leaveRequests: StateFlow<List<LeaveRequest>> = _leaveRequests.asStateFlow()
    
    private val _departments = MutableStateFlow<List<Department>>(emptyList())
    val departments: StateFlow<List<Department>> = _departments.asStateFlow()
    
    private val _hrStats = MutableStateFlow<HRStats?>(null)
    val hrStats: StateFlow<HRStats?> = _hrStats.asStateFlow()
    
    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    init {
        loadData()
    }
    
    fun refreshData() {
        loadData()
    }
    
    private fun loadData() {
        viewModelScope.launch {
            _loading.value = true
            try {
                loadEmployees()
                loadLeaveRequests()
                loadDepartments()
                loadHRStats()
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    private suspend fun loadEmployees() {
        // Mock data - replace with actual API call
        val mockEmployees = listOf(
            Employee(
                id = "1",
                employeeNumber = "EMP001",
                firstName = "John",
                lastName = "Doe",
                email = "john.doe@company.com",
                phone = "555-0123",
                position = "Software Developer",
                department = "IT",
                hireDate = "2023-01-15",
                status = "active",
                salary = 75000.0,
                manager = "Jane Smith",
                emergencyContact = EmergencyContact(
                    name = "Jane Doe",
                    relationship = "Spouse",
                    phone = "555-0456"
                ),
                address = "123 Main St, Anytown, USA",
                dateOfBirth = "1990-05-15",
                createdAt = "2023-01-15T00:00:00Z",
                updatedAt = "2023-01-15T00:00:00Z"
            ),
            Employee(
                id = "2",
                employeeNumber = "EMP002",
                firstName = "Jane",
                lastName = "Smith",
                email = "jane.smith@company.com",
                phone = "555-0789",
                position = "HR Manager",
                department = "HR",
                hireDate = "2022-06-01",
                status = "active",
                salary = 85000.0,
                manager = "CEO",
                emergencyContact = EmergencyContact(
                    name = "John Smith",
                    relationship = "Spouse",
                    phone = "555-0321"
                ),
                address = "456 Oak Ave, Anytown, USA",
                dateOfBirth = "1985-08-22",
                createdAt = "2022-06-01T00:00:00Z",
                updatedAt = "2022-06-01T00:00:00Z"
            )
        )
        _employees.value = mockEmployees
    }
    
    private suspend fun loadLeaveRequests() {
        // Mock data - replace with actual API call
        val mockLeaveRequests = listOf(
            LeaveRequest(
                id = "1",
                employeeId = "1",
                employeeName = "John Doe",
                leaveType = "vacation",
                startDate = "2024-02-01",
                endDate = "2024-02-05",
                daysRequested = 5,
                status = "pending",
                reason = "Family vacation",
                appliedDate = "2024-01-15",
                approvedBy = null,
                approvedDate = null,
                comments = null,
                createdAt = "2024-01-15T00:00:00Z",
                updatedAt = "2024-01-15T00:00:00Z"
            ),
            LeaveRequest(
                id = "2",
                employeeId = "2",
                employeeName = "Jane Smith",
                leaveType = "sick",
                startDate = "2024-01-20",
                endDate = "2024-01-22",
                daysRequested = 3,
                status = "approved",
                reason = "Medical appointment",
                appliedDate = "2024-01-18",
                approvedBy = "HR Director",
                approvedDate = "2024-01-19",
                comments = "Approved for medical reasons",
                createdAt = "2024-01-18T00:00:00Z",
                updatedAt = "2024-01-19T00:00:00Z"
            )
        )
        _leaveRequests.value = mockLeaveRequests
    }
    
    private suspend fun loadDepartments() {
        // Mock data - replace with actual API call
        val mockDepartments = listOf(
            Department(
                id = "1",
                name = "Information Technology",
                description = "Software development and IT support",
                managerId = "1",
                managerName = "John Doe",
                employeeCount = 15,
                budget = 1500000.0,
                createdAt = "2023-01-01T00:00:00Z",
                updatedAt = "2023-01-01T00:00:00Z"
            ),
            Department(
                id = "2",
                name = "Human Resources",
                description = "Employee management and recruitment",
                managerId = "2",
                managerName = "Jane Smith",
                employeeCount = 5,
                budget = 750000.0,
                createdAt = "2023-01-01T00:00:00Z",
                updatedAt = "2023-01-01T00:00:00Z"
            )
        )
        _departments.value = mockDepartments
    }
    
    private suspend fun loadHRStats() {
        // Mock data - replace with actual API call
        val mockStats = HRStats(
            totalEmployees = 50,
            activeEmployees = 48,
            inactiveEmployees = 2,
            employeesOnLeave = 3,
            pendingLeaveRequests = 5,
            departmentsCount = 6,
            attendanceRate = 96.5,
            averageSalary = 72000.0,
            turnoverRate = 8.2,
            newHiresThisMonth = 3
        )
        _hrStats.value = mockStats
    }
    
    fun createEmployee(request: CreateEmployeeRequest) {
        viewModelScope.launch {
            _loading.value = true
            try {
                // TODO: Implement API call
                loadEmployees() // Refresh data
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    fun updateEmployee(employeeId: String, request: UpdateEmployeeRequest) {
        viewModelScope.launch {
            _loading.value = true
            try {
                // TODO: Implement API call
                loadEmployees() // Refresh data
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    fun submitLeaveRequest(request: CreateLeaveRequestRequest) {
        viewModelScope.launch {
            _loading.value = true
            try {
                // TODO: Implement API call
                loadLeaveRequests() // Refresh data
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    fun approveLeaveRequest(requestId: String, status: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                // TODO: Implement API call
                loadLeaveRequests() // Refresh data
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    fun createDepartment(request: CreateDepartmentRequest) {
        viewModelScope.launch {
            _loading.value = true
            try {
                // TODO: Implement API call
                loadDepartments() // Refresh data
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }
    
    fun clearError() {
        _error.value = null
    }
}
