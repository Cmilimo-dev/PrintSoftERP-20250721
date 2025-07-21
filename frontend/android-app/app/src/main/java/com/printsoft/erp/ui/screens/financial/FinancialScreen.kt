package com.printsoft.erp.ui.screens.financial

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
import com.printsoft.erp.ui.viewmodel.FinancialViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinancialScreen(
    navController: NavHostController,
    viewModel: FinancialViewModel = hiltViewModel()
) {
    val accounts by viewModel.accountsState.collectAsState()
    val transactions by viewModel.transactionsState.collectAsState()
    val loading by viewModel.loadingState.collectAsState()
    val error by viewModel.error.collectAsState()
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Accounts", "Transactions")
    
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
            title = { Text("${if (editingItem == null) "Create" else "Edit"} ${if (selectedTab == 0) "Account" else "Transaction"}") },
            text = {
                when (selectedTab) {
                    0 -> AccountForm(
                        account = editingItem,
                        viewModel = viewModel,
                        onClose = { 
                            showDialog = false
                            editingItem = null
                        }
                    )
                    1 -> TransactionForm(
                        transaction = editingItem,
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
                text = "Financial Management",
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
                    0 -> AccountsList(accounts, viewModel)
                    1 -> TransactionsList(transactions, viewModel)
                }
            }
        }
    }
}

@Composable
fun AccountsList(accounts: List<Map<String, Any>>, viewModel: FinancialViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(accounts) { account ->
            AccountCard(account, viewModel)
        }
    }
}

@Composable
fun AccountCard(account: Map<String, Any>, viewModel: FinancialViewModel) {
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
                    text = account["accountName"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(account["accountType"] as String)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Account Code: ${account["accountCode"] as String}",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                text = "Balance: $${account["balance"] ?: 0.0}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            account["description"]?.let { description ->
                if (description.toString().isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
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
fun TransactionsList(transactions: List<Map<String, Any>>, viewModel: FinancialViewModel) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(transactions) { transaction ->
            TransactionCard(transaction, viewModel)
        }
    }
}

@Composable
fun TransactionCard(transaction: Map<String, Any>, viewModel: FinancialViewModel) {
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
                    text = transaction["referenceNumber"] as String,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium
                )
                Badge {
                    Text(transaction["status"] as String)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Description: ${transaction["description"] as String}",
                style = MaterialTheme.typography.bodyMedium
            )

            Text(
                text = "Amount: $${transaction["totalAmount"]}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )

            Text(
                text = "Date: ${transaction["transactionDate"]}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun AccountRow(account: Map<String, Any>) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(text = account["accountName"] as String, style = MaterialTheme.typography.titleMedium)
            Text(text = account["accountType"] as String, style = MaterialTheme.typography.bodySmall)
        }
        Text(text = account["balance"].toString(), style = MaterialTheme.typography.bodyMedium)
    }
}
