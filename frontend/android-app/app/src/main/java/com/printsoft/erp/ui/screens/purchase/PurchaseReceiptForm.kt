package com.printsoft.erp.ui.screens.purchase

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.PurchaseViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PurchaseReceiptForm(
    receipt: Map<String, Any>?,
    viewModel: PurchaseViewModel,
    onClose: () -> Unit
) {
    var receiptNumber by remember { mutableStateOf(receipt?.get("receiptNumber") as? String ?: "") }
    var purchaseOrderId by remember { mutableStateOf(receipt?.get("purchaseOrderId") as? String ?: "") }
    var receivedBy by remember { mutableStateOf(receipt?.get("receivedBy") as? String ?: "") }
    var receivedDate by remember { mutableStateOf(receipt?.get("receivedDate") as? String ?: SimpleDateFormat("yyyy-MM-dd").format(Date())) }
    var notes by remember { mutableStateOf(receipt?.get("notes") as? String ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (receipt == null) "Create Purchase Receipt" else "Edit Purchase Receipt",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = receiptNumber,
            onValueChange = { receiptNumber = it },
            label = { Text("Receipt Number") },
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
            value = receivedBy,
            onValueChange = { receivedBy = it },
            label = { Text("Received By") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = receivedDate,
            onValueChange = { receivedDate = it },
            label = { Text("Received Date") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

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
                    val newReceipt = mapOf(
                        "id" to (receipt?.get("id") ?: UUID.randomUUID().toString()),
                        "receiptNumber" to receiptNumber,
                        "purchaseOrderId" to purchaseOrderId,
                        "receivedBy" to receivedBy,
                        "receivedDate" to receivedDate,
                        "notes" to notes,
                        "status" to "received"
                    )
                    if (receipt == null) {
                        viewModel.createPurchaseReceipt(newReceipt)
                    } else {
                        viewModel.updatePurchaseReceipt(newReceipt)
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
