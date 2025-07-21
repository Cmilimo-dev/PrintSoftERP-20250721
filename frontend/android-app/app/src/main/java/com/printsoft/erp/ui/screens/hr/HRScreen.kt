package com.printsoft.erp.ui.screens.hr

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.lifecycle.viewmodel.compose.viewModel
import com.printsoft.erp.ui.viewmodel.HRViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HRScreen(navController: NavHostController) {
    val hrViewModel: HRViewModel = viewModel()
    val employees = hrViewModel.employees.collectAsState().value
    val leaveRequests = hrViewModel.leaveRequests.collectAsState().value
    val hrStats = hrViewModel.hrStats.collectAsState().value
    val loading = hrViewModel.loading.collectAsState().value
    
    var selectedTab by remember { mutableStateOf(0) }
    var showAddEmployeeDialog by remember { mutableStateOf(false) }
    var showLeaveRequestDialog by remember { mutableStateOf(false) }
    
    val tabs = listOf("Employees", "Leave Requests", "Attendance", "Payroll", "Performance")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header with stats
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Human Resources",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            IconButton(onClick = { hrViewModel.refreshData() }) {
                Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // HR Statistics Cards
        hrStats?.let { stats ->
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.height(120.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            title = "Total Employees",
                            value = stats.totalEmployees.toString(),
                            icon = Icons.Filled.People,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Active",
                            value = stats.activeEmployees.toString(),
                            icon = Icons.Filled.PersonCheck,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "On Leave",
                            value = stats.employeesOnLeave.toString(),
                            icon = Icons.Filled.EventBusy,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            title = "Pending Requests",
                            value = stats.pendingLeaveRequests.toString(),
                            icon = Icons.Filled.PendingActions,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Departments",
                            value = stats.departmentsCount.toString(),
                            icon = Icons.Filled.Business,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Attendance Rate",
                            value = "${stats.attendanceRate.toInt()}%",
                            icon = Icons.Filled.Schedule,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Tab Row
        ScrollableTabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Content based on selected tab
        Box(modifier = Modifier.weight(1f)) {
            when (selectedTab) {
                0 -> EmployeesContent(
                    employees = employees,
                    onAddEmployee = { showAddEmployeeDialog = true },
                    onEditEmployee = { /* Handle edit */ }
                )
                1 -> LeaveRequestsContent(
                    leaveRequests = leaveRequests,
                    onAddLeaveRequest = { showLeaveRequestDialog = true },
                    onApproveRequest = { hrViewModel.approveLeaveRequest(it, "approved") },
                    onRejectRequest = { hrViewModel.approveLeaveRequest(it, "rejected") }
                )
                2 -> AttendanceContent()
                3 -> PayrollContent()
                4 -> PerformanceContent()
            }

            if (loading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
        }
    }

    // Dialogs
    if (showAddEmployeeDialog) {
        AddEmployeeDialog(
            onDismiss = { showAddEmployeeDialog = false },
            onConfirm = { employee ->
                hrViewModel.createEmployee(employee)
                showAddEmployeeDialog = false
            }
        )
    }

    if (showLeaveRequestDialog) {
        LeaveRequestDialog(
            onDismiss = { showLeaveRequestDialog = false },
            onConfirm = { request ->
                hrViewModel.submitLeaveRequest(request)
                showLeaveRequestDialog = false
            }
        )
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun EmployeesContent(
    employees: List<com.printsoft.erp.data.model.Employee>,
    onAddEmployee: () -> Unit,
    onEditEmployee: (com.printsoft.erp.data.model.Employee) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Employees (${employees.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            FloatingActionButton(
                onClick = onAddEmployee,
                modifier = Modifier.size(48.dp)
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Add Employee")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(employees) { employee ->
                EmployeeCard(
                    employee = employee,
                    onClick = { onEditEmployee(employee) }
                )
            }
        }
    }
}

@Composable
fun EmployeeCard(
    employee: com.printsoft.erp.data.model.Employee,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${employee.firstName} ${employee.lastName}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = employee.position,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = employee.department,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = employee.employeeNumber,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    AssistChip(
                        onClick = { },
                        label = { 
                            Text(
                                employee.status.replaceFirstChar { it.uppercase() },
                                style = MaterialTheme.typography.labelSmall
                            ) 
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = when (employee.status) {
                                "active" -> MaterialTheme.colorScheme.primaryContainer
                                "inactive" -> MaterialTheme.colorScheme.secondaryContainer
                                else -> MaterialTheme.colorScheme.errorContainer
                            }
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun LeaveRequestsContent(
    leaveRequests: List<com.printsoft.erp.data.model.LeaveRequest>,
    onAddLeaveRequest: () -> Unit,
    onApproveRequest: (String) -> Unit,
    onRejectRequest: (String) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Leave Requests (${leaveRequests.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            FloatingActionButton(
                onClick = onAddLeaveRequest,
                modifier = Modifier.size(48.dp)
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Request Leave")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(leaveRequests) { request ->
                LeaveRequestCard(
                    request = request,
                    onApprove = { onApproveRequest(request.id) },
                    onReject = { onRejectRequest(request.id) }
                )
            }
        }
    }
}

@Composable
fun LeaveRequestCard(
    request: com.printsoft.erp.data.model.LeaveRequest,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = request.employeeName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${request.leaveType.replaceFirstChar { it.uppercase() }} Leave",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "${request.startDate} to ${request.endDate}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${request.daysRequested} day(s)",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                
                AssistChip(
                    onClick = { },
                    label = { 
                        Text(
                            request.status.replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.labelSmall
                        ) 
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = when (request.status) {
                            "approved" -> MaterialTheme.colorScheme.primaryContainer
                            "pending" -> MaterialTheme.colorScheme.secondaryContainer
                            else -> MaterialTheme.colorScheme.errorContainer
                        }
                    )
                )
            }
            
            if (request.reason?.isNotEmpty() == true) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Reason: ${request.reason}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (request.status == "pending") {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onReject,
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Filled.Close, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Reject")
                    }
                    
                    Button(onClick = onApprove) {
                        Icon(Icons.Filled.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Approve")
                    }
                }
            }
        }
    }
}

@Composable
fun AttendanceContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.Schedule,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Attendance Management",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "Track employee attendance and work hours",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PayrollContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.AttachMoney,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Payroll Management",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "Manage employee salaries and payments",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PerformanceContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.TrendingUp,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Performance Reviews",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "Conduct and track employee performance",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
