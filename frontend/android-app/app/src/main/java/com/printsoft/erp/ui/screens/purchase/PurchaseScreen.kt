package com.printsoft.erp.ui.screens.purchase

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
import com.printsoft.erp.ui.viewmodel.PurchaseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PurchaseScreen(
    navController: NavHostController,
    viewModel: PurchaseViewModel = hiltViewModel()
) {
    val purchaseOrdersState by viewModel.purchaseOrders.collectAsState()
    val vendorsState by viewModel.vendors.collectAsState()
    val purchaseReceiptsState by viewModel.purchaseReceipts.collectAsState()
    val purchaseInvoicesState by viewModel.purchaseInvoices.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Purchase Orders", "Vendors", "Receipts", "Invoices")
    
    var showDialog by remember { mutableStateOf(false) }
    var editingItem by remember { mutableStateOf<Map<String, Any>?>(null) }
    
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
                editingItem = null
            },
            title = { Text("${if (editingItem == null) "Create" else "Edit"} ${tabs[selectedTab].dropLast(1)}") },
            text = {
                when (selectedTab) {
                    0 -> PurchaseOrderForm(
                        purchaseOrder = editingItem,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    1 -> VendorForm(
                        vendor = editingItem,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    2 -> PurchaseReceiptForm(
                        receipt = editingItem,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    3 -> PurchaseInvoiceForm(
                        invoice = editingItem,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                }
            },
            confirmButton = {},
            dismissButton = {}
        )
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingItem = null
                    showDialog = true
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add New")
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
                text = "Purchase Management",
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
                when (selectedTab) {
                    0 -> PurchaseOrdersList(purchaseOrdersState, viewModel)
                    1 -> VendorsList(vendorsState, viewModel)
                    2 -> PurchaseReceiptsList(purchaseReceiptsState, viewModel)
                    3 -> PurchaseInvoicesList(purchaseInvoicesState, viewModel)
                }
            }
        }
    }
}

@Composable
fun PurchaseOrdersList(purchaseOrders: List<Map<String, Any>>, viewModel: PurchaseViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(purchaseOrders) { order ->
            PurchaseOrderCard(order, viewModel)
        }
    }
}

@Composable
fun PurchaseOrderCard(order: Map<String, Any>, viewModel: PurchaseViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = order["orderNumber"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(order["status"] as String)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Vendor: ${order["vendorName"] ?: "Unknown"}",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                text = "Total: $${order["totalAmount"]}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            Text(
                text = "Date: ${order["orderDate"]}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun VendorsList(vendors: List<Map<String, Any>>, viewModel: PurchaseViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(vendors) { vendor ->
            VendorCard(vendor, viewModel)
        }
    }
}

@Composable
fun VendorCard(vendor: Map<String, Any>, viewModel: PurchaseViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = vendor["name"] as String,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Email: ${vendor["email"] ?: "N/A"}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Phone: ${vendor["phone"] ?: "N/A"}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Address: ${vendor["address"] ?: "N/A"}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun PurchaseReceiptsList(receipts: List<Map<String, Any>>, viewModel: PurchaseViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(receipts) { receipt ->
            PurchaseReceiptCard(receipt, viewModel)
        }
    }
}

@Composable
fun PurchaseReceiptCard(receipt: Map<String, Any>, viewModel: PurchaseViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = receipt["receiptNumber"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(receipt["status"] as String)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "PO: ${receipt["purchaseOrderNumber"] ?: "Unknown"}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Received by: ${receipt["receivedBy"] ?: "N/A"}",
                style = MaterialTheme.typography.bodySmall
            )
            
            Text(
                text = "Received Date: ${receipt["receivedDate"]}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun PurchaseInvoicesList(invoices: List<Map<String, Any>>, viewModel: PurchaseViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(invoices) { invoice ->
            PurchaseInvoiceCard(invoice, viewModel)
        }
    }
}

@Composable
fun PurchaseInvoiceCard(invoice: Map<String, Any>, viewModel: PurchaseViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = invoice["invoiceNumber"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(invoice["paymentStatus"] as String)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Vendor: ${invoice["vendorName"] ?: "Unknown"}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Total: $${invoice["totalAmount"]}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            
            Text(
                text = "Due Date: ${invoice["dueDate"]}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

