package com.printsoft.erp.ui.screens.purchase

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.PurchaseViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PurchaseOrderForm(
    purchaseOrder: Map<String, Any>?,
    viewModel: PurchaseViewModel,
    onClose: () -> Unit
) {
    var orderNumber by remember { mutableStateOf(purchaseOrder?.get("orderNumber") as? String ?: "") }
    var vendorId by remember { mutableStateOf(purchaseOrder?.get("vendorId") as? String ?: "") }
    var orderDate by remember { mutableStateOf(purchaseOrder?.get("orderDate") as? String ?: "") }
    var totalAmount by remember { mutableStateOf(purchaseOrder?.get("totalAmount") as? Double ?: 0.0) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (purchaseOrder == null) "Create Purchase Order" else "Edit Purchase Order",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = orderNumber,
            onValueChange = { orderNumber = it },
            label = { Text("Order Number") },
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
            value = orderDate,
            onValueChange = { orderDate = it },
            label = { Text("Order Date") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = totalAmount.toString(),
            onValueChange = { totalAmount = it.toDoubleOrNull() ?: 0.0 },
            label = { Text("Total Amount") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
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
                    val newOrder = mapOf(
                        "id" to (purchaseOrder?.get("id") ?: UUID.randomUUID().toString()),
                        "orderNumber" to orderNumber,
                        "vendorId" to vendorId,
                        "orderDate" to orderDate,
                        "totalAmount" to totalAmount
                    )
                    if (purchaseOrder == null) {
                        viewModel.createPurchaseOrder(newOrder)
                    } else {
                        viewModel.updatePurchaseOrder(newOrder)
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

