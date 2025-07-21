package com.printsoft.erp.ui.screens.sales

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.printsoft.erp.data.models.DeliveryNote
import com.printsoft.erp.ui.viewmodel.SalesViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DeliveryNoteForm(
    deliveryNote: DeliveryNote?,
    viewModel: SalesViewModel,
    onClose: () -> Unit
) {
    var deliveryNumber by remember { mutableStateOf(deliveryNote?.deliveryNumber ?: "") }
    var salesOrderId by remember { mutableStateOf(deliveryNote?.salesOrderId ?: "") }
    var customerId by remember { mutableStateOf(deliveryNote?.customerId ?: "") }
    var deliveryDate by remember { mutableStateOf(deliveryNote?.deliveryDate ?: "") }
    var deliveryAddress by remember { mutableStateOf(deliveryNote?.deliveryAddress ?: "") }
    var deliveredBy by remember { mutableStateOf(deliveryNote?.deliveredBy ?: "") }
    var recipientName by remember { mutableStateOf(deliveryNote?.recipientName ?: "") }
    var notes by remember { mutableStateOf(deliveryNote?.notes ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (deliveryNote == null) "Create Delivery Note" else "Edit Delivery Note",
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = deliveryNumber,
            onValueChange = { deliveryNumber = it },
            label = { Text("Delivery Number") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = salesOrderId,
            onValueChange = { salesOrderId = it },
            label = { Text("Sales Order ID") },
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
            value = deliveryDate,
            onValueChange = { deliveryDate = it },
            label = { Text("Delivery Date") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = deliveryAddress,
            onValueChange = { deliveryAddress = it },
            label = { Text("Delivery Address") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = deliveredBy,
            onValueChange = { deliveredBy = it },
            label = { Text("Delivered By") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = recipientName,
            onValueChange = { recipientName = it },
            label = { Text("Recipient Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
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
                    val newDeliveryNote = DeliveryNote(
                        id = deliveryNote?.id ?: UUID.randomUUID().toString(),
                        deliveryNumber = deliveryNumber,
                        salesOrderId = salesOrderId,
                        customerId = customerId,
                        deliveryDate = deliveryDate,
                        deliveryAddress = deliveryAddress.takeIf { it.isNotEmpty() },
                        status = "pending",
                        deliveredBy = deliveredBy.takeIf { it.isNotEmpty() },
                        recipientName = recipientName.takeIf { it.isNotEmpty() },
                        recipientSignature = deliveryNote?.recipientSignature,
                        notes = notes.takeIf { it.isNotEmpty() },
                        createdBy = deliveryNote?.createdBy,
                        createdAt = deliveryNote?.createdAt ?: SimpleDateFormat("yyyy-MM-dd").format(Date()),
                        updatedAt = SimpleDateFormat("yyyy-MM-dd").format(Date())
                    )
                    if (deliveryNote == null) {
                        viewModel.createDeliveryNote(newDeliveryNote)
                    } else {
                        viewModel.updateDeliveryNote(newDeliveryNote)
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
