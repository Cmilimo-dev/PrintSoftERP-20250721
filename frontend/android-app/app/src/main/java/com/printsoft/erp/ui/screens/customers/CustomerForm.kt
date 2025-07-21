package com.printsoft.erp.ui.screens.customers

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.CustomersViewModel
import java.util.*

@Composable
fun CustomerForm(
    customer: Map<String, Any>?,
    viewModel: CustomersViewModel,
    onClose: () -> Unit
) {
    var name by remember { mutableStateOf(customer?.get("name") as? String ?: "") }
    var email by remember { mutableStateOf(customer?.get("email") as? String ?: "") }
    var phone by remember { mutableStateOf(customer?.get("phone") as? String ?: "") }
    var address by remember { mutableStateOf(customer?.get("address") as? String ?: "") }
    var customerNumber by remember { mutableStateOf(customer?.get("customerNumber") as? String ?: UUID.randomUUID().toString()) }
    var status by remember { mutableStateOf(customer?.get("status") as? String ?: "Active") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (customer == null) "Create Customer" else "Edit Customer",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Customer Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Phone") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Address") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = customerNumber,
            onValueChange = { customerNumber = it },
            label = { Text("Customer Number") },
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
                    val newCustomer = mapOf(
                        "id" to (customer?.get("id") ?: UUID.randomUUID().toString()),
                        "name" to name,
                        "email" to email,
                        "phone" to phone,
                        "address" to address,
                        "customerNumber" to customerNumber,
                        "status" to status
                    )
                    if (customer == null) {
                        viewModel.createCustomer(newCustomer)
                    } else {
                        viewModel.updateCustomer(newCustomer)
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
