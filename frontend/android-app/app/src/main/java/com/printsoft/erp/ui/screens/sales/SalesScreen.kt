package com.printsoft.erp.ui.screens.sales

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.printsoft.erp.ui.viewmodel.SalesViewModel
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalesScreen(
    navController: NavHostController,
    viewModel: SalesViewModel = hiltViewModel()
) {
    val salesOrdersState by viewModel.salesOrders.collectAsState()
    val quotationsState by viewModel.quotations.collectAsState()
    val invoicesState by viewModel.invoices.collectAsState()
    val deliveryNotesState by viewModel.deliveryNotes.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val conversionResult by viewModel.conversionResult.collectAsState()
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Sales Orders", "Quotations", "Invoices", "Delivery Notes")
    
    // Show success/error messages
    LaunchedEffect(conversionResult) {
        conversionResult?.let {
            // Show snackbar or toast
            viewModel.clearConversionResult()
        }
    }
    
    LaunchedEffect(error) {
        error?.let {
            // Show error snackbar
            viewModel.clearError()
        }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    // Handle new sales order creation
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Sales Order")
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
                text = "Sales Management",
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
                    0 -> SalesOrdersList(salesOrdersState, viewModel)
                    1 -> QuotationsList(quotationsState, viewModel)
                    2 -> InvoicesList(invoicesState, viewModel)
                    3 -> DeliveryNotesList(deliveryNotesState, viewModel)
                }
            }
        }
    }
}

@Composable
fun SalesOrdersList(salesOrders: List<Map<String, Any>>, viewModel: SalesViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(salesOrders) { order ->
            SalesOrderCard(order, viewModel)
        }
    }
}

@Composable
fun QuotationsList(quotations: List<Map<String, Any>>, viewModel: SalesViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(quotations) { quotation ->
            QuotationCard(quotation, viewModel)
        }
    }
}

@Composable
fun InvoicesList(invoices: List<Map<String, Any>>, viewModel: SalesViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(invoices) { invoice ->
            InvoiceCard(invoice, viewModel)
        }
    }
}

@Composable
fun DeliveryNotesList(deliveryNotes: List<Map<String, Any>>, viewModel: SalesViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(deliveryNotes) { note ->
            DeliveryNoteCard(note, viewModel)
        }
    }
}

@Composable
fun SalesOrderCard(order: Map<String, Any>, viewModel: SalesViewModel) {
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
                text = "Customer: ${order["customerName"] ?: "Unknown"}",
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
fun QuotationCard(quotation: Map<String, Any>, viewModel: SalesViewModel) {
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
                    text = quotation["quotationNumber"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(quotation["status"] as String)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Customer: ${quotation["customerName"] ?: "Unknown"}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Total: $${quotation["totalAmount"]}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            
            Text(
                text = "Valid Until: ${quotation["validUntil"]}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun InvoiceCard(invoice: Map<String, Any>, viewModel: SalesViewModel) {
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
                    Text(invoice["status"] as String)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Customer: ${invoice["customerName"] ?: "Unknown"}",
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

@Composable
fun DeliveryNoteCard(note: Map<String, Any>, viewModel: SalesViewModel) {
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
                    text = note["deliveryNumber"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(note["status"] as String)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Customer: ${note["customerName"] ?: "Unknown"}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Text(
                text = "Delivered by: ${note["deliveredBy"] ?: "N/A"}",
                style = MaterialTheme.typography.bodySmall
            )
            
            Text(
                text = "Delivery Date: ${note["deliveryDate"]}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
