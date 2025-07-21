package com.printsoft.erp.ui.screens.inventory

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
import com.printsoft.erp.data.model.Product
import com.printsoft.erp.data.model.ProductCategory
import com.printsoft.erp.ui.viewmodel.InventoryViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ProductForm(
    product: Product?,
    categories: List<ProductCategory>,
    viewModel: InventoryViewModel,
    onClose: () -> Unit
) {
    var itemCode by remember { mutableStateOf(product?.itemCode ?: "") }
    var name by remember { mutableStateOf(product?.name ?: "") }
    var description by remember { mutableStateOf(product?.description ?: "") }
    var category by remember { mutableStateOf(product?.category ?: "") }
    var unit by remember { mutableStateOf(product?.unit ?: "pcs") }
    var currentStock by remember { mutableStateOf(product?.currentStock ?: 0) }
    var minStock by remember { mutableStateOf(product?.minStock ?: 0) }
    var maxStock by remember { mutableStateOf(product?.maxStock ?: 100) }
    var unitCost by remember { mutableStateOf(product?.unitCost ?: 0.0) }
    var sellPrice by remember { mutableStateOf(product?.sellPrice ?: 0.0) }
    var location by remember { mutableStateOf(product?.location ?: "") }
    var barcode by remember { mutableStateOf(product?.barcode ?: "") }
    var reorderLevel by remember { mutableStateOf(product?.reorderLevel ?: minStock) }
    var isActive by remember { mutableStateOf(product?.isActive ?: true) }
    
    val units = listOf("pcs", "kg", "g", "l", "ml", "m", "cm", "box", "pack")
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (product == null) "Create Product" else "Edit Product",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Basic Information
        TextField(
            value = itemCode,
            onValueChange = { itemCode = it },
            label = { Text("Item Code") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Product Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

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

        // Category dropdown
        var expandedCategory by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedCategory,
            onExpandedChange = { expandedCategory = !expandedCategory },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = category,
                onValueChange = { },
                readOnly = true,
                label = { Text("Category") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedCategory)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedCategory,
                onDismissRequest = { expandedCategory = false }
            ) {
                categories.forEach { cat ->
                    DropdownMenuItem(
                        text = { Text(cat.name) },
                        onClick = {
                            category = cat.name
                            expandedCategory = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Unit dropdown
        var expandedUnit by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedUnit,
            onExpandedChange = { expandedUnit = !expandedUnit },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = unit,
                onValueChange = { },
                readOnly = true,
                label = { Text("Unit") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedUnit)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedUnit,
                onDismissRequest = { expandedUnit = false }
            ) {
                units.forEach { unitOption ->
                    DropdownMenuItem(
                        text = { Text(unitOption) },
                        onClick = {
                            unit = unitOption
                            expandedUnit = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Stock Information
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = currentStock.toString(),
                onValueChange = { currentStock = it.toIntOrNull() ?: 0 },
                label = { Text("Current Stock") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )

            TextField(
                value = minStock.toString(),
                onValueChange = { 
                    minStock = it.toIntOrNull() ?: 0
                    if (reorderLevel == 0) reorderLevel = minStock
                },
                label = { Text("Min Stock") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = maxStock.toString(),
                onValueChange = { maxStock = it.toIntOrNull() ?: 100 },
                label = { Text("Max Stock") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )

            TextField(
                value = reorderLevel.toString(),
                onValueChange = { reorderLevel = it.toIntOrNull() ?: minStock },
                label = { Text("Reorder Level") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Pricing
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextField(
                value = unitCost.toString(),
                onValueChange = { unitCost = it.toDoubleOrNull() ?: 0.0 },
                label = { Text("Unit Cost") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )

            TextField(
                value = sellPrice.toString(),
                onValueChange = { sellPrice = it.toDoubleOrNull() ?: 0.0 },
                label = { Text("Sell Price") },
                modifier = Modifier.weight(1f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Additional fields
        TextField(
            value = location,
            onValueChange = { location = it },
            label = { Text("Location") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = barcode,
            onValueChange = { barcode = it },
            label = { Text("Barcode") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

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
                    val newProduct = Product(
                        id = product?.id ?: UUID.randomUUID().toString(),
                        itemCode = itemCode,
                        name = name,
                        description = description,
                        category = category,
                        unit = unit,
                        currentStock = currentStock,
                        minStock = minStock,
                        maxStock = maxStock,
                        unitCost = unitCost,
                        sellPrice = sellPrice,
                        location = location.takeIf { it.isNotEmpty() },
                        barcode = barcode.takeIf { it.isNotEmpty() },
                        reorderLevel = reorderLevel,
                        isActive = isActive,
                        createdAt = product?.createdAt ?: now,
                        updatedAt = now
                    )
                    
                    if (product == null) {
                        viewModel.createProduct(newProduct)
                    } else {
                        viewModel.updateProduct(newProduct)
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
