package com.printsoft.erp.ui.screens.inventory

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.data.model.Warehouse
import com.printsoft.erp.ui.viewmodel.InventoryViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun WarehouseForm(
    warehouse: Warehouse?,
    viewModel: InventoryViewModel,
    onClose: () -> Unit
) {
    var code by remember { mutableStateOf(warehouse?.code ?: "") }
    var name by remember { mutableStateOf(warehouse?.name ?: "") }
    var description by remember { mutableStateOf(warehouse?.description ?: "") }
    var address by remember { mutableStateOf(warehouse?.address ?: "") }
    var city by remember { mutableStateOf(warehouse?.city ?: "") }
    var state by remember { mutableStateOf(warehouse?.state ?: "") }
    var country by remember { mutableStateOf(warehouse?.country ?: "") }
    var postalCode by remember { mutableStateOf(warehouse?.postalCode ?: "") }
    var phone by remember { mutableStateOf(warehouse?.phone ?: "") }
    var email by remember { mutableStateOf(warehouse?.email ?: "") }
    var manager by remember { mutableStateOf(warehouse?.manager ?: "") }
    var capacity by remember { mutableStateOf(warehouse?.capacity ?: "") }
    var warehouseType by remember { mutableStateOf(warehouse?.warehouseType ?: "Standard") }
    var isActive by remember { mutableStateOf(warehouse?.isActive ?: true) }

    val warehouseTypes = listOf("Standard", "Cold Storage", "Hazardous", "Bulk", "Distribution Center", "Cross-Dock")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (warehouse == null) "Create Warehouse" else "Edit Warehouse",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Basic Information
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = code,
                onValueChange = { code = it },
                label = { Text("Warehouse Code") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            TextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Warehouse Name") },
                modifier = Modifier.weight(2f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Warehouse Type
        var expandedType by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedType,
            onExpandedChange = { expandedType = !expandedType },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = warehouseType,
                onValueChange = { },
                readOnly = true,
                label = { Text("Warehouse Type") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedType)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedType,
                onDismissRequest = { expandedType = false }
            ) {
                warehouseTypes.forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type) },
                        onClick = {
                            warehouseType = type
                            expandedType = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = capacity,
            onValueChange = { capacity = it },
            label = { Text("Capacity") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            placeholder = { Text("e.g., 10,000 sq ft, 500 pallets") }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Address Information
        Text(
            text = "Address Information",
            style = MaterialTheme.typography.titleMedium
        )
        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Street Address") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = city,
                onValueChange = { city = it },
                label = { Text("City") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            TextField(
                value = state,
                onValueChange = { state = it },
                label = { Text("State/Province") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = country,
                onValueChange = { country = it },
                label = { Text("Country") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            TextField(
                value = postalCode,
                onValueChange = { postalCode = it },
                label = { Text("Postal Code") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Contact Information
        Text(
            text = "Contact Information",
            style = MaterialTheme.typography.titleMedium
        )
        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = manager,
            onValueChange = { manager = it },
            label = { Text("Manager Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )

            TextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isActive,
                    onCheckedChange = { isActive = it }
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Active")
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
                    val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date())
                    val newWarehouse = Warehouse(
                        id = warehouse?.id ?: UUID.randomUUID().toString(),
                        code = code,
                        name = name,
                        description = description.takeIf { it.isNotEmpty() },
                        address = address.takeIf { it.isNotEmpty() },
                        city = city.takeIf { it.isNotEmpty() },
                        state = state.takeIf { it.isNotEmpty() },
                        country = country.takeIf { it.isNotEmpty() },
                        postalCode = postalCode.takeIf { it.isNotEmpty() },
                        phone = phone.takeIf { it.isNotEmpty() },
                        email = email.takeIf { it.isNotEmpty() },
                        manager = manager.takeIf { it.isNotEmpty() },
                        capacity = capacity.takeIf { it.isNotEmpty() },
                        warehouseType = warehouseType,
                        isActive = isActive,
                        createdAt = warehouse?.createdAt ?: now,
                        updatedAt = now
                    )
                    
                    if (warehouse == null) {
                        viewModel.createWarehouse(newWarehouse)
                    } else {
                        viewModel.updateWarehouse(newWarehouse)
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
