package com.printsoft.erp.ui.screens.purchase

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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.printsoft.erp.ui.viewmodel.PurchaseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PurchaseDetailScreen(
    navController: NavHostController,
    purchaseOrderId: String,
    viewModel: PurchaseViewModel = hiltViewModel()
) {
    val purchaseOrder by viewModel.selectedPurchaseOrder.collectAsState()
    val purchaseOrderItems by viewModel.purchaseOrderItems.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(purchaseOrderId) {
        viewModel.loadPurchaseOrderDetails(purchaseOrderId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Purchase Order Details") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Edit purchase order */ }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                    }
                    IconButton(onClick = { /* More options */ }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    // Create receipt or invoice from this purchase order
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Receipt/Invoice")
            }
        }
    ) { paddingValues ->
        if (loading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Purchase Order Header
                item {
                    PurchaseOrderHeader(purchaseOrder)
                }
                
                // Purchase Order Items
                item {
                    Text(
                        text = "Order Items",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                items(purchaseOrderItems) { item ->
                    PurchaseOrderItemCard(item)
                }
                
                // Action Buttons
                item {
                    PurchaseOrderActions(
                        purchaseOrder = purchaseOrder,
                        viewModel = viewModel,
                        navController = navController
                    )
                }
            }
        }
    }
}

@Composable
fun PurchaseOrderHeader(purchaseOrder: Map<String, Any>?) {
    if (purchaseOrder == null) return
    
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
                Column {
                    Text(
                        text = purchaseOrder["orderNumber"] as String,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Vendor: ${purchaseOrder["vendorName"] ?: "Unknown"}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                Badge {
                    Text(purchaseOrder["status"] as String)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Order Date",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = purchaseOrder["orderDate"] as String,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
                Column {
                    Text(
                        text = "Expected Delivery",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = purchaseOrder["expectedDeliveryDate"] as? String ?: "N/A",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Subtotal",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "$${purchaseOrder["subtotal"]}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                Column {
                    Text(
                        text = "Tax",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "$${purchaseOrder["taxAmount"]}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                Column {
                    Text(
                        text = "Total",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "$${purchaseOrder["totalAmount"]}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            purchaseOrder["notes"]?.let { notes ->
                if (notes.toString().isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Notes",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = notes.toString(),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@Composable
fun PurchaseOrderItemCard(item: Map<String, Any>) {
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
                    text = item["productName"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = "$${item["unitPrice"]}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Qty: ${item["quantity"]}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "Total: $${item["totalPrice"]}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }
            
            item["description"]?.let { description ->
                if (description.toString().isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = description.toString(),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

@Composable
fun PurchaseOrderActions(
    purchaseOrder: Map<String, Any>?,
    viewModel: PurchaseViewModel,
    navController: NavHostController
) {
    if (purchaseOrder == null) return
    
    val status = purchaseOrder["status"] as String
    
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Actions",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            when (status) {
                "draft" -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.approvePurchaseOrder(purchaseOrder["id"] as String) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Send to Vendor")
                        }
                        Button(
                            onClick = { viewModel.approvePurchaseOrder(purchaseOrder["id"] as String) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Approve")
                        }
                    }
                }
                "approved", "sent" -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.createReceiptFromPurchaseOrder(purchaseOrder["id"] as String) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Create Receipt")
                        }
                        Button(
                            onClick = { viewModel.createInvoiceFromPurchaseOrder(purchaseOrder["id"] as String) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Create Invoice")
                        }
                    }
                }
                "received" -> {
                    Button(
                        onClick = { viewModel.createInvoiceFromPurchaseOrder(purchaseOrder["id"] as String) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Create Invoice")
                    }
                }
            }
        }
    }
}
