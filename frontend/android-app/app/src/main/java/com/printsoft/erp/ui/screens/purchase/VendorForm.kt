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
import java.util.*

@Composable
fun VendorForm(
    vendor: Map<String, Any>?,
    viewModel: PurchaseViewModel,
    onClose: () -> Unit
) {
    var name by remember { mutableStateOf(vendor?.get("name") as? String ?: "") }
    var email by remember { mutableStateOf(vendor?.get("email") as? String ?: "") }
    var phone by remember { mutableStateOf(vendor?.get("phone") as? String ?: "") }
    var address by remember { mutableStateOf(vendor?.get("address") as? String ?: "") }
    var taxId by remember { mutableStateOf(vendor?.get("taxId") as? String ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (vendor == null) "Create Vendor" else "Edit Vendor",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Vendor Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Phone") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
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
            value = taxId,
            onValueChange = { taxId = it },
            label = { Text("Tax ID") },
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
                    val newVendor = mapOf(
                        "id" to (vendor?.get("id") ?: UUID.randomUUID().toString()),
                        "name" to name,
                        "email" to email,
                        "phone" to phone,
                        "address" to address,
                        "taxId" to taxId
                    )
                    if (vendor == null) {
                        viewModel.createVendor(newVendor)
                    } else {
                        viewModel.updateVendor(newVendor)
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
