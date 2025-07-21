package com.printsoft.erp.ui.screens.sales

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
import com.printsoft.erp.data.models.SalesOrder
import com.printsoft.erp.ui.viewmodel.SalesViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun SalesOrderForm(
    salesOrder: SalesOrder?,
    viewModel: SalesViewModel,
    onClose: () -> Unit
) {
    var orderNumber by remember { mutableStateOf(salesOrder?.orderNumber ?: "") }
    var customerId by remember { mutableStateOf(salesOrder?.customerId ?: "") }
    var orderDate by remember { mutableStateOf(salesOrder?.orderDate ?: "") }
    var totalAmount by remember { mutableStateOf(salesOrder?.totalAmount ?: 0.0) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (salesOrder == null) "Create Sales Order" else "Edit Sales Order",
            style = MaterialTheme.typography.titleLarge
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
            value = customerId,
            onValueChange = { customerId = it },
            label = { Text("Customer ID") },
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
            singleLine = true,
            keyboardOptions = KeyboardOptions.Default.copy(keyboardType = KeyboardType.Number)
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
                    val newOrder = SalesOrder(
                        id = salesOrder?.id ?: UUID.randomUUID().toString(),
                        orderNumber = orderNumber,
                        customerId = customerId,
                        orderDate = orderDate,
                        expectedDeliveryDate = salesOrder?.expectedDeliveryDate,
                        status = "draft",
                        subtotal = salesOrder?.subtotal ?: 0.0,
                        taxAmount = salesOrder?.taxAmount ?: 0.0,
                        totalAmount = totalAmount,
                        notes = salesOrder?.notes,
                        createdBy = salesOrder?.createdBy,
                        createdAt = salesOrder?.createdAt ?: SimpleDateFormat("yyyy-MM-dd").format(Date()),
                        updatedAt = SimpleDateFormat("yyyy-MM-dd").format(Date())
                    )
                    if (salesOrder == null) {
                        viewModel.createSalesOrder(newOrder)
                    } else {
                        viewModel.updateSalesOrder(newOrder)
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
