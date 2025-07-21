package com.printsoft.erp.ui.screens.customers

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.printsoft.erp.ui.viewmodel.CustomersViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomersScreen(
    navController: NavHostController,
    viewModel: CustomersViewModel = hiltViewModel()
) {
    val customersState by viewModel.customers.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("All Customers", "Active", "Inactive")
    
    var showDialog by remember { mutableStateOf(false) }
    var editingCustomer by remember { mutableStateOf<Map<String, Any>?>(null) }
    
    // Show error messages
    LaunchedEffect(error) {
        error?.let {
            // Show error snackbar
            viewModel.clearError()
        }
    }

    // Dialog handling
    if (showDialog) {
        AlertDialog(
            onDismissRequest = { 
                showDialog = false
                editingCustomer = null
            },
            title = { Text("${if (editingCustomer == null) "Create" else "Edit"} Customer") },
            text = {
                CustomerForm(
                    customer = editingCustomer,
                    viewModel = viewModel,
                    onClose = { 
                        showDialog = false
                        editingCustomer = null
                    }
                )
            },
            confirmButton = {},
            dismissButton = {}
        )
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingCustomer = null
                    showDialog = true
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Customer")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                text = "Customer Management",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            if (loading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                CustomersList(customersState, viewModel) { customer ->
                    editingCustomer = customer
                    showDialog = true
                }
            }
        }
    }
}

@Composable
fun CustomersList(
    customers: List<Map<String, Any>>, 
    viewModel: CustomersViewModel,
    onEditCustomer: (Map<String, Any>) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(customers) { customer ->
            CustomerCard(customer, viewModel, onEditCustomer)
        }
    }
}

@Composable
fun CustomerCard(
    customer: Map<String, Any>, 
    viewModel: CustomersViewModel,
    onEditCustomer: (Map<String, Any>) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onEditCustomer(customer) }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = customer["name"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(customer["status"] as? String ?: "Active")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Email: ${customer["email"] as? String ?: "N/A"}",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                text = "Phone: ${customer["phone"] as? String ?: "N/A"}",
                style = MaterialTheme.typography.bodyMedium
            )

            customer["address"]?.let { address ->
                Text(
                    text = "Address: $address",
                    style = MaterialTheme.typography.bodySmall
                )
            }

            customer["customerNumber"]?.let { customerNumber ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Customer #: $customerNumber",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@Composable
fun CustomerRow(customer: Map<String, Any>) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(text = customer["name"] as String, style = MaterialTheme.typography.titleMedium)
            Text(text = customer["email"] as String, style = MaterialTheme.typography.bodySmall)
        }
        Text(text = customer["phone"] as String, style = MaterialTheme.typography.bodyMedium)
    }
}
