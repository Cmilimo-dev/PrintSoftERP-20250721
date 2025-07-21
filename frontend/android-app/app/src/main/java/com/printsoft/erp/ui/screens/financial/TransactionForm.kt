package com.printsoft.erp.ui.screens.financial

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.FinancialViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TransactionForm(
    transaction: Map<String, Any>?,
    viewModel: FinancialViewModel,
    onClose: () -> Unit
) {
    var referenceNumber by remember { mutableStateOf(transaction?.get("referenceNumber") as? String ?: "") }
    var description by remember { mutableStateOf(transaction?.get("description") as? String ?: "") }
    var transactionDate by remember { mutableStateOf(transaction?.get("transactionDate") as? String ?: SimpleDateFormat("yyyy-MM-dd").format(Date())) }
    var totalAmount by remember { mutableStateOf(transaction?.get("totalAmount") as? Double ?: 0.0) }
    var status by remember { mutableStateOf(transaction?.get("status") as? String ?: "pending") }
    
    val statusTypes = listOf("pending", "completed", "cancelled")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (transaction == null) "Create Transaction" else "Edit Transaction",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = referenceNumber,
            onValueChange = { referenceNumber = it },
            label = { Text("Reference Number") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 4
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = transactionDate,
            onValueChange = { transactionDate = it },
            label = { Text("Transaction Date") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = totalAmount.toString(),
            onValueChange = { totalAmount = it.toDoubleOrNull() ?: 0.0 },
            label = { Text("Total Amount") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )

        Spacer(modifier = Modifier.height(8.dp))

        var expandedStatus by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedStatus,
            onExpandedChange = { expandedStatus = !expandedStatus },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = status,
                onValueChange = { },
                readOnly = true,
                label = { Text("Status") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedStatus)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedStatus,
                onDismissRequest = { expandedStatus = false }
            ) {
                statusTypes.forEach { statusType ->
                    DropdownMenuItem(
                        text = { Text(statusType.capitalize()) },
                        onClick = {
                            status = statusType
                            expandedStatus = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            horizontalArrangement = Arrangement.End,
            modifier = Modifier.fillMaxWidth()
        ) {
            TextButton(onClick = { onClose() }) {
                Icon(Icons.Filled.Close, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Cancel")
            }
            Spacer(modifier = Modifier.width(16.dp))
            Button(
                onClick = {
                    val newTransaction = mapOf(
                        "id" to (transaction?.get("id") ?: UUID.randomUUID().toString()),
                        "referenceNumber" to referenceNumber,
                        "description" to description,
                        "transactionDate" to transactionDate,
                        "totalAmount" to totalAmount,
                        "status" to status
                    )
                    if (transaction == null) {
                        viewModel.createTransaction(newTransaction)
                    } else {
                        viewModel.updateTransaction(newTransaction)
                    }
                    onClose()
                }
            ) {
                Icon(Icons.Filled.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save")
            }
        }
    }
}
