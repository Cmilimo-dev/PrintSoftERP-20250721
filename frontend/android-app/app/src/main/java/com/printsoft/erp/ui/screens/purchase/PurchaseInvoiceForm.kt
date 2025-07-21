package com.printsoft.erp.ui.screens.purchase

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
import com.printsoft.erp.ui.viewmodel.PurchaseViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PurchaseInvoiceForm(
    invoice: Map<String, Any>?,
    viewModel: PurchaseViewModel,
    onClose: () -> Unit
) {
    var invoiceNumber by remember { mutableStateOf(invoice?.get("invoiceNumber") as? String ?: "") }
    var vendorId by remember { mutableStateOf(invoice?.get("vendorId") as? String ?: "") }
    var purchaseOrderId by remember { mutableStateOf(invoice?.get("purchaseOrderId") as? String ?: "") }
    var invoiceDate by remember { mutableStateOf(invoice?.get("invoiceDate") as? String ?: SimpleDateFormat("yyyy-MM-dd").format(Date())) }
    var dueDate by remember { mutableStateOf(invoice?.get("dueDate") as? String ?: "") }
    var totalAmount by remember { mutableStateOf(invoice?.get("totalAmount") as? Double ?: 0.0) }
    var taxAmount by remember { mutableStateOf(invoice?.get("taxAmount") as? Double ?: 0.0) }
    var notes by remember { mutableStateOf(invoice?.get("notes") as? String ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (invoice == null) "Create Purchase Invoice" else "Edit Purchase Invoice",
            style = MaterialTheme.typography.headlineMedium
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
            value = vendorId,
            onValueChange = { vendorId = it },
            label = { Text("Vendor ID") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = purchaseOrderId,
            onValueChange = { purchaseOrderId = it },
            label = { Text("Purchase Order ID") },
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

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = totalAmount.toString(),
                onValueChange = { totalAmount = it.toDoubleOrNull() ?: 0.0 },
                label = { Text("Total Amount") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )

            TextField(
                value = taxAmount.toString(),
                onValueChange = { taxAmount = it.toDoubleOrNull() ?: 0.0 },
                label = { Text("Tax Amount") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 4
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
                    val newInvoice = mapOf(
                        "id" to (invoice?.get("id") ?: UUID.randomUUID().toString()),
                        "invoiceNumber" to invoiceNumber,
                        "vendorId" to vendorId,
                        "purchaseOrderId" to purchaseOrderId,
                        "invoiceDate" to invoiceDate,
                        "dueDate" to dueDate,
                        "totalAmount" to totalAmount,
                        "taxAmount" to taxAmount,
                        "notes" to notes,
                        "paymentStatus" to "pending"
                    )
                    if (invoice == null) {
                        viewModel.createPurchaseInvoice(newInvoice)
                    } else {
                        viewModel.updatePurchaseInvoice(newInvoice)
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
