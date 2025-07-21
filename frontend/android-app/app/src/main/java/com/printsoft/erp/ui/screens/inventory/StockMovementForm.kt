package com.printsoft.erp.ui.screens.inventory

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.printsoft.erp.data.model.Product
import com.printsoft.erp.data.model.StockMovement
import com.printsoft.erp.data.model.Warehouse
import com.printsoft.erp.ui.viewmodel.InventoryViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun StockMovementForm(
    stockMovement: StockMovement?,
    products: List<Product>,
    warehouses: List<Warehouse>,
    viewModel: InventoryViewModel,
    onClose: () -> Unit
) {
    var productId by remember { mutableStateOf(stockMovement?.productId ?: "") }
    var productName by remember { mutableStateOf(stockMovement?.productName ?: "") }
    var warehouseId by remember { mutableStateOf(stockMovement?.warehouseId ?: "") }
    var warehouseName by remember { mutableStateOf(stockMovement?.warehouseName ?: "") }
    var movementType by remember { mutableStateOf(stockMovement?.movementType ?: "IN") }
    var quantity by remember { mutableStateOf(stockMovement?.quantity ?: 0) }
    var unitCost by remember { mutableStateOf(stockMovement?.unitCost ?: 0.0) }
    var totalCost by remember { mutableStateOf(stockMovement?.totalCost ?: 0.0) }
    var reason by remember { mutableStateOf(stockMovement?.reason ?: "") }
    var referenceNumber by remember { mutableStateOf(stockMovement?.referenceNumber ?: "") }
    var notes by remember { mutableStateOf(stockMovement?.notes ?: "") }
    var movementDate by remember { mutableStateOf(stockMovement?.movementDate ?: SimpleDateFormat("yyyy-MM-dd").format(Date())) }

    val movementTypes = listOf("IN", "OUT", "ADJUSTMENT", "TRANSFER")
    val reasons = listOf(
        "Purchase", "Sale", "Return", "Damage", "Lost", "Found", 
        "Initial Stock", "Stock Adjustment", "Transfer In", "Transfer Out"
    )

    // Auto-calculate total cost when quantity or unit cost changes
    LaunchedEffect(quantity, unitCost) {
        totalCost = quantity * unitCost
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (stockMovement == null) "Create Stock Movement" else "Edit Stock Movement",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Product Selection
        var expandedProduct by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedProduct,
            onExpandedChange = { expandedProduct = !expandedProduct },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = productName,
                onValueChange = { },
                readOnly = true,
                label = { Text("Product") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedProduct)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedProduct,
                onDismissRequest = { expandedProduct = false }
            ) {
                products.forEach { product ->
                    DropdownMenuItem(
                        text = { Text("${product.itemCode} - ${product.name}") },
                        onClick = {
                            productId = product.id
                            productName = "${product.itemCode} - ${product.name}"
                            unitCost = product.unitCost
                            expandedProduct = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Warehouse Selection
        var expandedWarehouse by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedWarehouse,
            onExpandedChange = { expandedWarehouse = !expandedWarehouse },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = warehouseName,
                onValueChange = { },
                readOnly = true,
                label = { Text("Warehouse") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedWarehouse)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedWarehouse,
                onDismissRequest = { expandedWarehouse = false }
            ) {
                warehouses.forEach { warehouse ->
                    DropdownMenuItem(
                        text = { Text(warehouse.name) },
                        onClick = {
                            warehouseId = warehouse.id
                            warehouseName = warehouse.name
                            expandedWarehouse = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Movement Type
        var expandedMovementType by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedMovementType,
            onExpandedChange = { expandedMovementType = !expandedMovementType },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = movementType,
                onValueChange = { },
                readOnly = true,
                label = { Text("Movement Type") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedMovementType)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedMovementType,
                onDismissRequest = { expandedMovementType = false }
            ) {
                movementTypes.forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type) },
                        onClick = {
                            movementType = type
                            expandedMovementType = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Reason
        var expandedReason by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedReason,
            onExpandedChange = { expandedReason = !expandedReason },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = reason,
                onValueChange = { },
                readOnly = true,
                label = { Text("Reason") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedReason)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedReason,
                onDismissRequest = { expandedReason = false }
            ) {
                reasons.forEach { reasonOption ->
                    DropdownMenuItem(
                        text = { Text(reasonOption) },
                        onClick = {
                            reason = reasonOption
                            expandedReason = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Quantity and Cost
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = quantity.toString(),
                onValueChange = { quantity = it.toIntOrNull() ?: 0 },
                label = { Text("Quantity") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )

            TextField(
                value = unitCost.toString(),
                onValueChange = { unitCost = it.toDoubleOrNull() ?: 0.0 },
                label = { Text("Unit Cost") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = totalCost.toString(),
            onValueChange = { },
            label = { Text("Total Cost") },
            modifier = Modifier.fillMaxWidth(),
            readOnly = true,
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = movementDate,
            onValueChange = { movementDate = it },
            label = { Text("Movement Date (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            trailingIcon = {
                Icon(Icons.Filled.DateRange, contentDescription = "Date")
            }
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = referenceNumber,
            onValueChange = { referenceNumber = it },
            label = { Text("Reference Number") },
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
                    val now = SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date())
                    val newStockMovement = StockMovement(
                        id = stockMovement?.id ?: UUID.randomUUID().toString(),
                        productId = productId,
                        productName = productName,
                        warehouseId = warehouseId,
                        warehouseName = warehouseName,
                        movementType = movementType,
                        quantity = quantity,
                        unitCost = unitCost,
                        totalCost = totalCost,
                        movementDate = movementDate,
                        reason = reason,
                        referenceNumber = referenceNumber.takeIf { it.isNotEmpty() },
                        notes = notes.takeIf { it.isNotEmpty() },
                        createdBy = "Current User", // TODO: Get from auth
                        createdAt = stockMovement?.createdAt ?: now,
                        updatedAt = now
                    )
                    
                    if (stockMovement == null) {
                        viewModel.createStockMovement(newStockMovement)
                    } else {
                        viewModel.updateStockMovement(newStockMovement)
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
