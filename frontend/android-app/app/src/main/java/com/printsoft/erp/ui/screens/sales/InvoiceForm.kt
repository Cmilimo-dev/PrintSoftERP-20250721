package com.printsoft.erp.ui.screens.sales

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
import com.printsoft.erp.data.model.Invoice
import com.printsoft.erp.ui.viewmodel.SalesViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun InvoiceForm(
    invoice: Invoice?,
    viewModel: SalesViewModel,
    onClose: () -> Unit
) {
    var invoiceNumber by remember { mutableStateOf(invoice?.invoiceNumber ?: "") }
    var customerId by remember { mutableStateOf(invoice?.customerId ?: "") }
    var invoiceDate by remember { mutableStateOf(invoice?.invoiceDate ?: "") }
    var dueDate by remember { mutableStateOf(invoice?.dueDate ?: "") }
    var totalAmount by remember { mutableStateOf(invoice?.totalAmount ?: 0.0) }
    var notes by remember { mutableStateOf(invoice?.notes ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (invoice == null) "Create Invoice" else "Edit Invoice",
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = invoiceNumber,
            onValueChange = { invoiceNumber = it },
            label = { Text("Invoice Number") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = customerId,
            onValueChange = { customerId = it },
            label = { Text("Customer ID") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = invoiceDate,
            onValueChange = { invoiceDate = it },
            label = { Text("Invoice Date") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = dueDate,
            onValueChange = { dueDate = it },
            label = { Text("Due Date") },
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
            keyboardOptions = KeyboardOptions.Default.copy(keyboardType = KeyboardType.Number)
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3
        )

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
                    val newInvoice = Invoice(
                        id = invoice?.id ?: UUID.randomUUID().toString(),
                        invoiceNumber = invoiceNumber,
                        customerId = customerId,
                        salesOrderId = invoice?.salesOrderId,
                        invoiceDate = invoiceDate,
                        dueDate = dueDate,
                        status = "draft",
                        subtotal = invoice?.subtotal ?: 0.0,
                        taxAmount = invoice?.taxAmount ?: 0.0,
                        totalAmount = totalAmount,
                        paidAmount = invoice?.paidAmount ?: 0.0,
                        notes = notes.takeIf { it.isNotEmpty() },
                        createdBy = invoice?.createdBy,
                        createdAt = invoice?.createdAt ?: SimpleDateFormat("yyyy-MM-dd").format(Date()),
                        updatedAt = SimpleDateFormat("yyyy-MM-dd").format(Date())
                    )
                    if (invoice == null) {
                        viewModel.createInvoice(newInvoice)
                    } else {
                        viewModel.updateInvoice(newInvoice)
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

